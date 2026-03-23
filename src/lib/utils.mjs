import { createHash } from "node:crypto";

export function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function normalizeName(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\b(ai|app|tool|tools|software|official)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeUrl(rawUrl) {
  if (!rawUrl) {
    return null;
  }

  try {
    const url = new URL(rawUrl);
    url.hash = "";
    if (url.pathname !== "/") {
      url.pathname = url.pathname.replace(/\/+$/, "");
    }
    const ignoredParams = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
    for (const key of ignoredParams) {
      url.searchParams.delete(key);
    }
    return url.toString();
  } catch {
    return null;
  }
}

export function extractDomain(rawUrl) {
  const normalized = normalizeUrl(rawUrl);
  if (!normalized) {
    return null;
  }

  try {
    const { hostname } = new URL(normalized);
    return hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function extractRepoIdentity(rawUrl) {
  const normalized = normalizeUrl(rawUrl);
  if (!normalized) {
    return null;
  }

  try {
    const url = new URL(normalized);
    const parts = url.pathname.split("/").filter(Boolean);
    if (url.hostname.replace(/^www\./, "") !== "github.com" || parts.length < 2) {
      return null;
    }
    return `${parts[0]}/${parts[1]}`;
  } catch {
    return null;
  }
}

export function cleanText(value) {
  return String(value ?? "")
    .replace(/<!\[CDATA\[(.*?)\]\]>/gis, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function stableId(...parts) {
  return createHash("sha1").update(parts.filter(Boolean).join("::")).digest("hex").slice(0, 12);
}

export function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function chunk(values, size) {
  const output = [];
  for (let index = 0; index < values.length; index += size) {
    output.push(values.slice(index, index + size));
  }
  return output;
}

export function dateToIso(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export function truncate(value, length = 220) {
  if (!value || value.length <= length) {
    return value;
  }
  return `${value.slice(0, length - 1).trim()}…`;
}
