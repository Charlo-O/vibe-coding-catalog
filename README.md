# Vibe Coding Catalog

一个低成本、低消耗的静态目录站，自动发现和收录 `vibe coding` 相关软件。

## 特性

- 静态站输出，无常驻后端
- 自动发现来源：
  - GitHub Search API
  - Hacker News API
  - 可配置 RSS/Atom Feed
- 规则打分和自动发布阈值
- 域名和名称双重去重
- 生成机器可读的 JSON 目录和静态详情页

## 快速开始

```bash
npm run pipeline
```

运行完成后：

- 采集结果在 `data/generated/`
- 静态站产物在 `dist/`
- GitHub Pages 产物可通过设置 `CATALOG_OUTPUT_DIR=docs` 输出到 `docs/`

## 环境变量

- `GITHUB_TOKEN`：可选。配置后 GitHub API 配额更高。
- `CATALOG_BASE_URL`：可选。用于生成站点 canonical URL 和 sitemap，例如 `https://example.com`。

## 目录

- `scripts/discover.mjs`：自动采集、评分、去重、发布
- `scripts/build-site.mjs`：静态站构建
- `src/lib/`：规则和通用逻辑
- `config/feeds.json`：RSS/Atom feed 配置

## 自动发现逻辑

系统会从多个来源抓取候选条目，然后：

1. 规范化名称、URL、域名
2. 根据正向/负向关键词打分
3. 按来源特征加权
4. 去重并合并来源
5. 将 `score >= 80` 的项目自动发布到目录站

## 建议运行方式

- 本地测试：手动运行 `npm run pipeline`
- GitHub Pages：将 `CATALOG_BASE_URL` 设为你的 Pages 地址，并将 `CATALOG_OUTPUT_DIR` 设为 `docs`
