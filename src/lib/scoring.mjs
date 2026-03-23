import {
  AUTO_PUBLISH_SCORE,
  CLASSIFICATION_RULES,
  GENERIC_DOMAINS,
  LAUNCH_PATTERNS,
  NEGATIVE_PATTERNS,
  POSITIVE_PATTERNS,
  TOPICS_HINTS
} from "./constants.mjs";
import {
  extractDomain,
  extractRepoIdentity,
  normalizeName,
  normalizeUrl,
  slugify,
  truncate,
  unique
} from "./utils.mjs";

const GENERIC_DOMAIN_SET = new Set(GENERIC_DOMAINS);
const TARGET_CATEGORIES = new Set(["AI IDE", "Coding Agent", "App Builder", "Website Builder", "Code Assistant"]);

function matchPatterns(text, patterns) {
  const reasons = [];
  let score = 0;

  for (const item of patterns) {
    if (item.pattern.test(text)) {
      score += item.score;
      reasons.push(item.label);
    }
  }

  return { score, reasons };
}

function classify(text) {
  return unique(
    CLASSIFICATION_RULES.filter((rule) => rule.pattern.test(text)).map((rule) => rule.label)
  );
}

function deriveName(candidate) {
  if (candidate.name) {
    return candidate.name.trim();
  }

  if (candidate.domain) {
    return candidate.domain.split(".")[0];
  }

  return "untitled";
}

function scoreGithub(candidate, reasons) {
  let score = 0;

  if (candidate.stars >= 500) {
    score += 18;
    reasons.push("GitHub stars >= 500");
  } else if (candidate.stars >= 100) {
    score += 10;
    reasons.push("GitHub stars >= 100");
  } else if (candidate.stars >= 30) {
    score += 4;
    reasons.push("GitHub stars >= 30");
  }

  if (candidate.forks >= 20) {
    score += 4;
    reasons.push("GitHub forks >= 20");
  }

  if (candidate.homepage && candidate.domain && !GENERIC_DOMAIN_SET.has(candidate.domain)) {
    score += 8;
    reasons.push("repository has external homepage");
  }

  if (candidate.archived) {
    score -= 25;
    reasons.push("repository is archived");
  }

  if (candidate.updated_at) {
    const updated = new Date(candidate.updated_at);
    const days = (Date.now() - updated.getTime()) / 86_400_000;
    if (days <= 30) {
      score += 12;
      reasons.push("updated in the last 30 days");
    } else if (days <= 90) {
      score += 6;
      reasons.push("updated in the last 90 days");
    } else if (days > 365) {
      score -= 10;
      reasons.push("stale for over a year");
    }
  }

  const topics = candidate.topics ?? [];
  const topicHits = topics.filter((topic) => TOPICS_HINTS.includes(topic.toLowerCase()));
  if (topicHits.length) {
    score += Math.min(10, topicHits.length * 3);
    reasons.push(`matching GitHub topics: ${topicHits.join(", ")}`);
  }

  if (candidate.positiveScore >= 20 && candidate.stars >= 100) {
    score += 6;
    reasons.push("strong topical match with GitHub adoption");
  }

  return score;
}

function scoreHn(candidate, reasons) {
  let score = 0;
  if (candidate.hnScore >= 50) {
    score += 14;
    reasons.push("HN score >= 50");
  } else if (candidate.hnScore >= 20) {
    score += 8;
    reasons.push("HN score >= 20");
  }

  if (candidate.comments >= 20) {
    score += 6;
    reasons.push("HN comments >= 20");
  }

  if (/^show hn:/i.test(candidate.name ?? "")) {
    score += 8;
    reasons.push("Show HN launch");
  }

  if (candidate.domain && !GENERIC_DOMAIN_SET.has(candidate.domain)) {
    score += 6;
    reasons.push("HN post links to a product site");
  }

  return score;
}

function scoreRss(candidate, reasons) {
  let score = 0;
  if (candidate.domain) {
    score += 4;
    reasons.push("RSS entry has direct domain");
  }

  if (candidate.published_at) {
    const published = new Date(candidate.published_at);
    const days = (Date.now() - published.getTime()) / 86_400_000;
    if (days <= 45) {
      score += 6;
      reasons.push("recent RSS mention");
    }
  }

  return score;
}

export function scoreCandidate(input) {
  const name = deriveName(input);
  const homepage = normalizeUrl(input.homepage ?? input.url ?? input.source_url);
  const repoUrl = normalizeUrl(input.repo_url);
  const sourceUrl = normalizeUrl(input.source_url ?? input.url ?? repoUrl);
  const domain = extractDomain(homepage ?? repoUrl ?? sourceUrl);
  const repoIdentity = extractRepoIdentity(repoUrl ?? homepage ?? sourceUrl);
  const text = [name, input.summary, input.description, ...(input.topics ?? []), ...(input.tags ?? [])]
    .filter(Boolean)
    .join(" ");

  const positive = matchPatterns(text, POSITIVE_PATTERNS);
  const negative = matchPatterns(text, NEGATIVE_PATTERNS);
  const reasons = [...positive.reasons, ...negative.reasons];
  let score = 18 + positive.score + negative.score;

  switch (input.source) {
    case "github":
      score += scoreGithub({ ...input, homepage, domain, positiveScore: positive.score }, reasons);
      break;
    case "hackernews":
      score += scoreHn({ ...input, domain }, reasons);
      break;
    case "rss":
      score += scoreRss({ ...input, domain }, reasons);
      break;
    default:
      break;
  }

  if (domain && !GENERIC_DOMAIN_SET.has(domain)) {
    score += 6;
    reasons.push("has canonical domain");
  }

  const categories = classify(text);
  const targetCategoryCount = categories.filter((category) => TARGET_CATEGORIES.has(category)).length;
  if (targetCategoryCount) {
    score += Math.min(8, targetCategoryCount * 4);
    reasons.push(`classified as ${categories.join(", ")}`);
  }

  if (positive.score < 14 && targetCategoryCount === 0) {
    score -= 28;
    reasons.push("missing strong vibe coding signal");
  }

  if (input.source === "rss" && !LAUNCH_PATTERNS.test(text) && positive.score < 18) {
    score -= 12;
    reasons.push("RSS entry does not look like a product launch");
  }

  if (input.source === "hackernews" && targetCategoryCount === 0 && positive.score < 18) {
    score -= 14;
    reasons.push("HN post does not look like coding software");
  }

  if (!homepage && !repoUrl) {
    score -= 15;
    reasons.push("missing homepage and repo URL");
  }

  const boundedScore = Math.max(0, Math.min(100, score));
  const normalizedName = normalizeName(name);
  const slugBase = slugify(name || domain || normalizedName || "tool");
  const published = boundedScore >= AUTO_PUBLISH_SCORE;

  return {
    ...input,
    id: input.id,
    slug: input.slug ?? slugBase,
    name,
    normalized_name: normalizedName,
    homepage,
    repo_url: repoUrl,
    source_url: sourceUrl,
    domain,
    repo_identity: repoIdentity,
    summary: truncate(input.summary ?? input.description ?? ""),
    description: truncate(input.description ?? input.summary ?? "", 320),
    categories,
    score: boundedScore,
    reasons: unique(reasons),
    published
  };
}

export function mergeCandidates(items) {
  const merged = new Map();

  for (const item of items) {
    const key =
      (item.domain && !GENERIC_DOMAIN_SET.has(item.domain) && `domain:${item.domain}`) ||
      (item.repo_identity && `repo:${item.repo_identity}`) ||
      (item.source === "hackernews" && item.source_url && `hn:${item.source_url}`) ||
      (item.normalized_name && `name:${item.normalized_name}`) ||
      `slug:${item.slug}`;
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, {
        ...item,
        aliases: unique([item.name]),
        sources: [
          {
            source: item.source,
            source_url: item.source_url,
            score: item.score
          }
        ]
      });
      continue;
    }

    const winner = existing.score >= item.score ? existing : item;
    const mergedItem = {
      ...winner,
      aliases: unique([...(existing.aliases ?? []), existing.name, item.name]),
      categories: unique([...(existing.categories ?? []), ...(item.categories ?? [])]),
      reasons: unique([...(existing.reasons ?? []), ...(item.reasons ?? [])]),
      tags: unique([...(existing.tags ?? []), ...(item.tags ?? [])]),
      topics: unique([...(existing.topics ?? []), ...(item.topics ?? [])]),
      sources: [
        ...(existing.sources ?? []),
        {
          source: item.source,
          source_url: item.source_url,
          score: item.score
        }
      ]
    };

    if (!mergedItem.homepage) {
      mergedItem.homepage = existing.homepage ?? item.homepage ?? null;
    }

    if (!mergedItem.repo_url) {
      mergedItem.repo_url = existing.repo_url ?? item.repo_url ?? null;
    }

    mergedItem.score = Math.max(existing.score, item.score);
    mergedItem.published = mergedItem.score >= AUTO_PUBLISH_SCORE;
    merged.set(key, mergedItem);
  }

  return [...merged.values()]
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name));
}
