import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { AUTO_PUBLISH_SCORE, KEYWORD_QUERIES } from "../src/lib/constants.mjs";
import { parseFeed } from "../src/lib/feeds.mjs";
import { mergeCandidates, scoreCandidate } from "../src/lib/scoring.mjs";
import { chunk, cleanText, dateToIso, stableId, unique } from "../src/lib/utils.mjs";

const ROOT = process.cwd();
const CONFIG_DIR = path.join(ROOT, "config");
const GENERATED_DIR = path.join(ROOT, "data", "generated");

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText} for ${url}`);
  }
  return response.json();
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText} for ${url}`);
  }
  return response.text();
}

function githubHeaders() {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "vibe-coding-catalog"
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

async function collectGithub() {
  const items = [];
  for (const query of KEYWORD_QUERIES) {
    const searchUrl = new URL("https://api.github.com/search/repositories");
    searchUrl.searchParams.set("q", `${query} in:name,description,readme`);
    searchUrl.searchParams.set("sort", "updated");
    searchUrl.searchParams.set("order", "desc");
    searchUrl.searchParams.set("per_page", "10");

    try {
      const payload = await fetchJson(searchUrl, { headers: githubHeaders() });
      for (const repo of payload.items ?? []) {
        const homepage = repo.homepage?.trim() ? repo.homepage.trim() : null;
        items.push({
          id: stableId("github", repo.full_name),
          source: "github",
          name: repo.name,
          summary: cleanText(repo.description ?? ""),
          description: cleanText(repo.description ?? ""),
          url: homepage || repo.html_url,
          homepage,
          repo_url: repo.html_url,
          source_url: repo.html_url,
          stars: repo.stargazers_count ?? 0,
          forks: repo.forks_count ?? 0,
          topics: repo.topics ?? [],
          archived: repo.archived ?? false,
          updated_at: repo.updated_at,
          tags: unique([repo.language, ...(repo.topics ?? [])]),
          discovered_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.warn(`[github] ${query}: ${error.message}`);
    }
  }

  return items;
}

async function collectHackerNews() {
  const baseUrl = "https://hacker-news.firebaseio.com/v0";
  const [showIds, newIds] = await Promise.all([
    fetchJson(`${baseUrl}/showstories.json`),
    fetchJson(`${baseUrl}/newstories.json`)
  ]);

  const ids = unique([...(showIds ?? []).slice(0, 40), ...(newIds ?? []).slice(0, 40)]).slice(0, 60);
  const items = [];

  for (const batch of chunk(ids, 12)) {
    const responses = await Promise.all(
      batch.map(async (id) => {
        try {
          return await fetchJson(`${baseUrl}/item/${id}.json`);
        } catch (error) {
          console.warn(`[hackernews] item ${id}: ${error.message}`);
          return null;
        }
      })
    );

    for (const story of responses) {
      if (!story || !story.title) {
        continue;
      }

      items.push({
        id: stableId("hn", String(story.id)),
        source: "hackernews",
        name: cleanText(story.title),
        summary: cleanText(story.text ?? ""),
        description: cleanText(story.text ?? ""),
        url: story.url ?? `https://news.ycombinator.com/item?id=${story.id}`,
        homepage: story.url ?? null,
        source_url: `https://news.ycombinator.com/item?id=${story.id}`,
        hnScore: story.score ?? 0,
        comments: story.descendants ?? 0,
        published_at: dateToIso((story.time ?? 0) * 1000),
        tags: ["hacker-news"],
        discovered_at: new Date().toISOString()
      });
    }
  }

  return items;
}

async function collectFeeds() {
  const configText = await readFile(path.join(CONFIG_DIR, "feeds.json"), "utf8");
  const feeds = JSON.parse(configText);
  const items = [];

  for (const feed of feeds) {
    try {
      const xml = await fetchText(feed.url, {
        headers: {
          "User-Agent": "vibe-coding-catalog"
        }
      });
      const parsed = parseFeed(xml, feed.type);

      for (const entry of parsed.slice(0, 12)) {
        items.push({
          id: stableId("rss", feed.name, entry.link),
          source: "rss",
          name: entry.title,
          summary: cleanText(entry.description),
          description: cleanText(entry.description),
          url: entry.link,
          homepage: entry.link,
          source_url: entry.link,
          published_at: dateToIso(entry.published_at),
          tags: [feed.name.toLowerCase()],
          feed: feed.name,
          discovered_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.warn(`[rss] ${feed.name}: ${error.message}`);
    }
  }

  return items;
}

function enrichCatalog(items) {
  const scored = items.map(scoreCandidate);
  const merged = mergeCandidates(scored);
  const published = merged.filter((item) => item.published);
  return { scored, merged, published };
}

async function writeJson(fileName, value) {
  await mkdir(GENERATED_DIR, { recursive: true });
  await writeFile(path.join(GENERATED_DIR, fileName), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function main() {
  const startedAt = new Date().toISOString();

  const [githubItems, hackerNewsItems, feedItems] = await Promise.all([
    collectGithub(),
    collectHackerNews(),
    collectFeeds()
  ]);

  const raw = {
    generated_at: startedAt,
    sources: {
      github: githubItems.length,
      hackernews: hackerNewsItems.length,
      rss: feedItems.length
    },
    items: [...githubItems, ...hackerNewsItems, ...feedItems]
  };

  const { scored, merged, published } = enrichCatalog(raw.items);
  const stats = {
    generated_at: startedAt,
    auto_publish_score: AUTO_PUBLISH_SCORE,
    raw_candidates: raw.items.length,
    deduped_candidates: merged.length,
    published_candidates: published.length,
    sources: raw.sources
  };

  await writeJson("raw.json", raw);
  await writeJson("candidates.json", { generated_at: startedAt, items: scored });
  await writeJson("catalog.json", { generated_at: startedAt, items: published });
  await writeJson("stats.json", stats);

  console.log(JSON.stringify(stats, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
