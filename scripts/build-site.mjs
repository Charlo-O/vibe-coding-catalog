import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { slugify } from "../src/lib/utils.mjs";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, process.env.CATALOG_OUTPUT_DIR ?? "dist");
const TOOLS_DIR = path.join(OUTPUT_DIR, "tools");
const GENERATED_DIR = path.join(ROOT, "data", "generated");
const BASE_URL = process.env.CATALOG_BASE_URL?.replace(/\/+$/, "") ?? "http://localhost:4321";
const BASE_PATH = new URL(`${BASE_URL}/`).pathname.replace(/\/+$/, "") || "";

function withBasePath(value) {
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `${BASE_PATH}${normalized}` || normalized;
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toISOString().slice(0, 10);
}

function pageShell({ title, description, body, canonicalPath }) {
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
    <link rel="stylesheet" href="${escapeHtml(withBasePath("/styles.css"))}">
  </head>
  <body>
    <div class="shell">
      ${body}
    </div>
  </body>
</html>`;
}

function indexPage(catalog) {
  const cards = catalog.items
    .map((item) => {
      const slug = slugify(item.slug || item.name);
      const categories = (item.categories ?? []).map((value) => `<span class="tag">${escapeHtml(value)}</span>`).join("");
      return `<article class="card">
        <div class="card-top">
          <div>
            <h2><a href="${escapeHtml(withBasePath(`/tools/${slug}.html`))}">${escapeHtml(item.name)}</a></h2>
            <p class="muted">${escapeHtml(item.domain ?? item.source)}</p>
          </div>
          <strong class="score">${item.score}</strong>
        </div>
        <p>${escapeHtml(item.summary || item.description || "No summary yet.")}</p>
        <div class="meta">
          ${categories}
        </div>
        <div class="links">
          ${item.homepage ? `<a href="${escapeHtml(item.homepage)}" target="_blank" rel="noreferrer">官网</a>` : ""}
          ${item.repo_url ? `<a href="${escapeHtml(item.repo_url)}" target="_blank" rel="noreferrer">GitHub</a>` : ""}
          ${item.source_url ? `<a href="${escapeHtml(item.source_url)}" target="_blank" rel="noreferrer">来源</a>` : ""}
        </div>
      </article>`;
    })
    .join("\n");

  const body = `<header class="hero">
    <p class="eyebrow">Vibe Coding Catalog</p>
    <h1>自动收录 Vibe Coding 软件</h1>
    <p class="lead">这个目录站由定时采集脚本自动生成，当前只自动发布评分达到阈值的产品。前端是纯静态页面，适合低成本部署到 CDN。</p>
    <div class="hero-stats">
      <div><span>${catalog.items.length}</span><small>已发布产品</small></div>
      <div><span>${catalog.generated_at.slice(0, 10)}</span><small>最近构建日期</small></div>
      <div><span>GitHub / HN / RSS</span><small>自动来源</small></div>
    </div>
  </header>
  <main class="grid">${cards || '<p class="empty">当前没有达到自动发布阈值的产品。</p>'}</main>`;

  return pageShell({
    title: "Vibe Coding 软件目录",
    description: "自动发现和收录 vibe coding 软件的轻量目录站。",
    canonicalPath: "/",
    body
  });
}

function detailPage(item) {
  const categories = (item.categories ?? []).map((value) => `<span class="tag">${escapeHtml(value)}</span>`).join("");
  const reasons = (item.reasons ?? []).map((value) => `<li>${escapeHtml(value)}</li>`).join("");
  const sources = (item.sources ?? [])
    .map(
      (source) => `<li><strong>${escapeHtml(source.source)}</strong> · <a href="${escapeHtml(source.source_url)}" target="_blank" rel="noreferrer">查看来源</a></li>`
    )
    .join("");
  const body = `<nav><a href="${escapeHtml(withBasePath("/"))}">返回目录</a></nav>
  <article class="detail">
    <p class="eyebrow">${escapeHtml(item.domain ?? item.source)}</p>
    <h1>${escapeHtml(item.name)}</h1>
    <p class="lead">${escapeHtml(item.description || item.summary || "No description yet.")}</p>
    <div class="hero-stats">
      <div><span>${item.score}</span><small>自动评分</small></div>
      <div><span>${escapeHtml(formatDate(item.published_at || item.discovered_at))}</span><small>最近时间</small></div>
      <div><span>${escapeHtml((item.sources ?? []).map((s) => s.source).join(", "))}</span><small>发现来源</small></div>
    </div>
    <div class="meta">${categories}</div>
    <div class="links">
      ${item.homepage ? `<a href="${escapeHtml(item.homepage)}" target="_blank" rel="noreferrer">打开官网</a>` : ""}
      ${item.repo_url ? `<a href="${escapeHtml(item.repo_url)}" target="_blank" rel="noreferrer">查看仓库</a>` : ""}
      ${item.source_url ? `<a href="${escapeHtml(item.source_url)}" target="_blank" rel="noreferrer">原始来源</a>` : ""}
    </div>
    <section>
      <h2>自动判定理由</h2>
      <ul>${reasons}</ul>
    </section>
    <section>
      <h2>来源轨迹</h2>
      <ul>${sources}</ul>
    </section>
  </article>`;

  return pageShell({
    title: `${item.name} | Vibe Coding Catalog`,
    description: item.summary || item.description || item.name,
    canonicalPath: `/tools/${slugify(item.slug || item.name)}.html`,
    body
  });
}

function sitemap(catalog) {
  const urls = [
    `${BASE_URL}/`,
    ...catalog.items.map((item) => `${BASE_URL}/tools/${slugify(item.slug || item.name)}.html`)
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${escapeHtml(url)}</loc></url>`).join("\n")}
</urlset>
`;
}

async function main() {
  const catalogText = await readFile(path.join(GENERATED_DIR, "catalog.json"), "utf8");
  const catalog = JSON.parse(catalogText);

  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(TOOLS_DIR, { recursive: true });

  const styles = await readFile(path.join(ROOT, "public", "styles.css"), "utf8");
  await writeFile(path.join(OUTPUT_DIR, "styles.css"), styles, "utf8");
  await writeFile(path.join(OUTPUT_DIR, "index.html"), `${indexPage(catalog)}\n`, "utf8");
  await writeFile(path.join(OUTPUT_DIR, "catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  await writeFile(path.join(OUTPUT_DIR, "sitemap.xml"), sitemap(catalog), "utf8");

  for (const item of catalog.items) {
    const filePath = path.join(TOOLS_DIR, `${slugify(item.slug || item.name)}.html`);
    await writeFile(filePath, `${detailPage(item)}\n`, "utf8");
  }

  console.log(`built ${catalog.items.length} published items into ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
