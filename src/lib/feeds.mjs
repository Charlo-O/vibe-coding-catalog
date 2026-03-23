import { cleanText } from "./utils.mjs";

function decodeXml(value) {
  return cleanText(
    value
      ?.replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&apos;/g, "'")
  );
}

function extractBlocks(xml, tagName) {
  const regex = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)</${tagName}>`, "gi");
  const blocks = [];
  let match;
  while ((match = regex.exec(xml))) {
    blocks.push(match[1]);
  }
  return blocks;
}

function extractTag(block, tagName) {
  const regex = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)</${tagName}>`, "i");
  const match = block.match(regex);
  return decodeXml(match?.[1] ?? "");
}

function extractAtomLink(block) {
  const match = block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
  return match?.[1] ?? "";
}

export function parseFeed(xml, type = "rss") {
  const itemTag = type === "atom" ? "entry" : "item";
  const blocks = extractBlocks(xml, itemTag);

  return blocks.map((block) => {
    const isAtom = type === "atom";
    return {
      title: extractTag(block, "title"),
      link: isAtom ? extractAtomLink(block) : extractTag(block, "link"),
      description: extractTag(block, isAtom ? "summary" : "description") || extractTag(block, "content"),
      published_at: extractTag(block, isAtom ? "updated" : "pubDate")
    };
  });
}
