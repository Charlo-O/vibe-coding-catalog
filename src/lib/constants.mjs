export const POSITIVE_PATTERNS = [
  { pattern: /\bvibe coding\b/i, score: 8, label: "mentions vibe coding" },
  { pattern: /\bai\s+code(?:\s+editor|\s+assistant|\s+completion)?\b/i, score: 24, label: "mentions AI code tooling" },
  { pattern: /\bcoding\s+agent\b/i, score: 24, label: "mentions coding agent" },
  { pattern: /\bcode\s+agent\b/i, score: 20, label: "mentions code agent" },
  { pattern: /\bai\s+ide\b/i, score: 24, label: "mentions AI IDE" },
  { pattern: /\bcode\s+assistant\b/i, score: 18, label: "mentions code assistant" },
  { pattern: /\bcoding\s+assistant\b/i, score: 18, label: "mentions coding assistant" },
  { pattern: /\bcode\s+review\b/i, score: 16, label: "mentions code review" },
  { pattern: /\bpair\s+programmer\b/i, score: 16, label: "mentions pair programmer" },
  { pattern: /\bagentic\b/i, score: 12, label: "mentions agentic workflow" },
  { pattern: /\bautonomous\s+(?:developer|engineer)\b/i, score: 18, label: "mentions autonomous developer" },
  { pattern: /\bbrowser\s+agent\b/i, score: 14, label: "mentions browser agent" },
  { pattern: /\bdeveloper\s+agent\b/i, score: 18, label: "mentions developer agent" },
  { pattern: /\bsoftware\s+engineer(?:ing)?\s+agent\b/i, score: 18, label: "mentions software engineering agent" },
  { pattern: /\bapp\s+builder\b/i, score: 18, label: "mentions app builder" },
  { pattern: /\bapp\s+generator\b/i, score: 18, label: "mentions app generator" },
  { pattern: /\bwebsite\s+builder\b/i, score: 16, label: "mentions website builder" },
  { pattern: /\bwebsite\s+generator\b/i, score: 16, label: "mentions website generator" },
  { pattern: /\bsite\s+builder\b/i, score: 12, label: "mentions site builder" },
  { pattern: /\bcode\s+editor\b/i, score: 16, label: "mentions code editor" },
  { pattern: /\bautocomplete\b/i, score: 10, label: "mentions autocomplete" },
  { pattern: /\bcopilot\b/i, score: 14, label: "mentions copilot" },
  { pattern: /\bclaude\s+code\b/i, score: 16, label: "mentions Claude Code" },
  { pattern: /\bcodex\b/i, score: 12, label: "mentions Codex" },
  { pattern: /\bopenhands\b/i, score: 16, label: "mentions OpenHands" },
  { pattern: /\bvscode\s+extension\b/i, score: 10, label: "mentions VS Code extension" },
  { pattern: /\bgenerate\s+(?:apps?|websites?|components?)\b/i, score: 18, label: "mentions app generation" },
  { pattern: /\bbuild\s+(?:apps?|websites?|software)\s+with\s+ai\b/i, score: 22, label: "mentions AI-built software" },
  { pattern: /\bdeveloper(?:\s+tools?)?\b/i, score: 6, label: "mentions developer tooling" },
  { pattern: /\bopen\s+source\b/i, score: 8, label: "mentions open source" },
  { pattern: /\bterminal(?:-first)?\s+agent\b/i, score: 14, label: "mentions terminal agent" }
];

export const NEGATIVE_PATTERNS = [
  { pattern: /\bawesome(?:-| )list\b/i, score: -35, label: "looks like an awesome list" },
  { pattern: /\btutorial\b/i, score: -24, label: "looks like a tutorial" },
  { pattern: /\bnewsletter\b/i, score: -18, label: "looks like a newsletter" },
  { pattern: /\bjob\b/i, score: -22, label: "looks like a job post" },
  { pattern: /\bcourse\b/i, score: -24, label: "looks like a course" },
  { pattern: /\bboilerplate\b/i, score: -18, label: "looks like a template or boilerplate" },
  { pattern: /\btemplate\b/i, score: -12, label: "looks like a template" },
  { pattern: /\bdemo\b/i, score: -10, label: "looks like a demo" },
  { pattern: /\bexample\b/i, score: -10, label: "looks like an example" },
  { pattern: /\bprompt(?:s|\s+list)?\b/i, score: -8, label: "looks prompt-focused instead of product-focused" },
  { pattern: /\bcollection\b/i, score: -8, label: "looks like a generic collection" },
  { pattern: /\bcurated\b/i, score: -8, label: "looks curated content instead of a product" },
  { pattern: /\bbenchmark\b/i, score: -10, label: "looks like a benchmark" }
];

export const KEYWORD_QUERIES = [
  {
    label: "Vibe Coding",
    categories: ["Coding Agent", "Code Assistant"],
    query: '"vibe coding" fork:false archived:false stars:>1',
    sort: "updated",
    pages: 2,
    perPage: 25
  },
  {
    label: "AI IDE",
    categories: ["AI IDE"],
    query: '"ai ide" fork:false archived:false stars:>2',
    sort: "updated",
    pages: 2,
    perPage: 25
  },
  {
    label: "AI Code Editor",
    categories: ["AI IDE"],
    query: '"ai code editor" fork:false archived:false stars:>2',
    sort: "updated",
    pages: 2,
    perPage: 25
  },
  {
    label: "Coding Agent",
    categories: ["Coding Agent"],
    query: '"coding agent" fork:false archived:false stars:>2',
    sort: "updated",
    pages: 2,
    perPage: 25
  },
  {
    label: "Code Agent",
    categories: ["Coding Agent"],
    query: '"code agent" fork:false archived:false stars:>2',
    sort: "updated",
    pages: 2,
    perPage: 25
  },
  {
    label: "Code Assistant",
    categories: ["Code Assistant"],
    query: '"code assistant" fork:false archived:false stars:>2',
    sort: "updated",
    pages: 2,
    perPage: 25
  },
  {
    label: "Code Review AI",
    categories: ["Code Assistant"],
    query: '"code review" ai fork:false archived:false stars:>2',
    sort: "updated",
    pages: 2,
    perPage: 25
  },
  {
    label: "Claude Code",
    categories: ["Coding Agent", "Code Assistant"],
    query: '"claude code" fork:false archived:false stars:>2',
    sort: "updated",
    pages: 2,
    perPage: 25
  },
  {
    label: "Codex Tooling",
    categories: ["Code Assistant"],
    query: 'codex "code" fork:false archived:false stars:>2',
    sort: "updated",
    pages: 2,
    perPage: 25
  },
  {
    label: "OpenHands",
    categories: ["Coding Agent"],
    query: 'openhands fork:false archived:false stars:>2',
    sort: "stars",
    pages: 2,
    perPage: 25
  },
  {
    label: "App Builder",
    categories: ["App Builder"],
    query: '"app builder" ai fork:false archived:false stars:>2',
    sort: "updated",
    pages: 2,
    perPage: 25
  },
  {
    label: "App Generator",
    categories: ["App Builder"],
    query: '"app generator" ai fork:false archived:false stars:>2',
    sort: "updated",
    pages: 2,
    perPage: 25
  },
  {
    label: "Website Generator",
    categories: ["Website Builder"],
    query: '"website generator" ai fork:false archived:false stars:>2',
    sort: "updated",
    pages: 2,
    perPage: 25
  },
  {
    label: "Website Builder",
    categories: ["Website Builder"],
    query: '"website builder" ai fork:false archived:false stars:>2',
    sort: "updated",
    pages: 2,
    perPage: 25
  },
  {
    label: "Browser Agent",
    categories: ["Coding Agent"],
    query: '"browser agent" code fork:false archived:false stars:>2',
    sort: "updated",
    pages: 2,
    perPage: 25
  },
  {
    label: "Developer Tools AI",
    categories: ["Code Assistant"],
    query: '"developer tools" ai fork:false archived:false stars:>2',
    sort: "updated",
    pages: 2,
    perPage: 25
  },
  {
    label: "Topic AI IDE",
    categories: ["AI IDE"],
    query: "topic:ai-ide fork:false archived:false stars:>2",
    sort: "stars",
    pages: 1,
    perPage: 25
  },
  {
    label: "Topic Copilot",
    categories: ["Code Assistant"],
    query: "topic:copilot fork:false archived:false stars:>2",
    sort: "stars",
    pages: 2,
    perPage: 25
  },
  {
    label: "Topic Vibe Coding",
    categories: ["Coding Agent", "Code Assistant"],
    query: "topic:vibe-coding fork:false archived:false",
    sort: "stars",
    pages: 1,
    perPage: 25
  },
  {
    label: "Topic AI Coding",
    categories: ["Coding Agent", "Code Assistant"],
    query: "topic:ai-coding fork:false archived:false stars:>2",
    sort: "stars",
    pages: 1,
    perPage: 25
  }
];

export const CLASSIFICATION_RULES = [
  { label: "AI IDE", pattern: /\b(ai ide|code editor|coding ide|developer ide)\b/i },
  { label: "Coding Agent", pattern: /\b(coding agent|code agent|developer agent|agentic coding)\b/i },
  { label: "App Builder", pattern: /\b(app builder|app generator|build apps?)\b/i },
  { label: "Website Builder", pattern: /\b(website builder|website generator|site builder)\b/i },
  { label: "Code Assistant", pattern: /\b(code assistant|coding assistant|autocomplete|copilot|code review|pair programmer)\b/i }
];

export const TOPICS_HINTS = [
  "ai",
  "code-editor",
  "developer-tools",
  "agent",
  "llm",
  "copilot",
  "productivity"
];

export const AUTO_PUBLISH_SCORE = 80;
export const EXPANDED_PUBLISH_SCORE = 24;
export const TARGET_PUBLISHED_ITEMS = 100;
export const GENERIC_DOMAINS = ["github.com", "news.ycombinator.com"];
export const LAUNCH_PATTERNS = /\b(introducing|launch(?:ed)?|release(?:d)?|announc(?:e|ing)|new)\b/i;
export const HARD_EXCLUSION_LABELS = new Set([
  "looks like an awesome list",
  "looks like a tutorial",
  "looks like a course",
  "looks like a template or boilerplate",
  "looks like a template",
  "looks like a generic collection",
  "looks curated content instead of a product",
  "looks like a benchmark"
]);
