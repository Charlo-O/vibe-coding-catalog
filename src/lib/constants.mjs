export const POSITIVE_PATTERNS = [
  { pattern: /\bvibe coding\b/i, score: 8, label: "mentions vibe coding" },
  { pattern: /\bai\s+code(?:\s+editor|\s+assistant|\s+completion)?\b/i, score: 24, label: "mentions AI code tooling" },
  { pattern: /\bcoding\s+agent\b/i, score: 24, label: "mentions coding agent" },
  { pattern: /\bcode\s+agent\b/i, score: 20, label: "mentions code agent" },
  { pattern: /\bai\s+ide\b/i, score: 24, label: "mentions AI IDE" },
  { pattern: /\bcode\s+assistant\b/i, score: 18, label: "mentions code assistant" },
  { pattern: /\bcode\s+review\b/i, score: 16, label: "mentions code review" },
  { pattern: /\bapp\s+builder\b/i, score: 18, label: "mentions app builder" },
  { pattern: /\bwebsite\s+builder\b/i, score: 16, label: "mentions website builder" },
  { pattern: /\bwebsite\s+generator\b/i, score: 16, label: "mentions website generator" },
  { pattern: /\bsite\s+builder\b/i, score: 12, label: "mentions site builder" },
  { pattern: /\bcode\s+editor\b/i, score: 16, label: "mentions code editor" },
  { pattern: /\bautocomplete\b/i, score: 10, label: "mentions autocomplete" },
  { pattern: /\bcopilot\b/i, score: 14, label: "mentions copilot" },
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
  '"vibe coding"',
  '"ai ide"',
  '"coding agent"',
  '"code agent"',
  '"ai code editor"',
  '"app builder" ai',
  '"website generator" ai',
  '"developer tools" ai coding'
];

export const CLASSIFICATION_RULES = [
  { label: "AI IDE", pattern: /\b(ai ide|code editor|coding ide|developer ide)\b/i },
  { label: "Coding Agent", pattern: /\b(coding agent|code agent|developer agent|agentic coding)\b/i },
  { label: "App Builder", pattern: /\b(app builder|app generator|build apps?)\b/i },
  { label: "Website Builder", pattern: /\b(website builder|website generator|site builder)\b/i },
  { label: "Code Assistant", pattern: /\b(code assistant|coding assistant|autocomplete|copilot|code review)\b/i }
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
export const GENERIC_DOMAINS = ["github.com", "news.ycombinator.com"];
export const LAUNCH_PATTERNS = /\b(introducing|launch(?:ed)?|release(?:d)?|announc(?:e|ing)|new)\b/i;
