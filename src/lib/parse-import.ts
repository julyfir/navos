export interface ParsedSite {
  url: string;
  title: string;
}

export function parseImportText(raw: string): ParsedSite[] {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const result: ParsedSite[] = [];

  for (const line of lines) {
    let url = line;
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      continue;
    }
    if (parsed.hostname.includes(".")) {
      const key = parsed.hostname;
      if (!seen.has(key)) {
        seen.add(key);
        const title = parsed.hostname.replace(/^www\./, "");
        result.push({ url: parsed.toString(), title });
      }
    }
  }
  return result;
}