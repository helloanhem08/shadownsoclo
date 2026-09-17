export type Policy = "PROXY" | "DIRECT" | "REJECT" | string;

export type Rule = { raw: string; match: string; policy: Policy };
export type Rewrite = { pattern: string; action: string };
export type HeaderRule = { raw: string };

export type ParsedConf = {
  rules: Rule[];
  rewrites: Rewrite[];
  headers: HeaderRule[];
  hosts: string[];
  updateUrl: string;
  mitm: boolean;
};

export const DEMO_CONF = `[General]
update-url = https://example.invalid/sahdownsoclo

[Rule]
AND,((DOMAIN-SUFFIX,googlevideo.com),(PROTOCOL,UDP)),REJECT
AND,((DOMAIN,youtubei.googleapis.com),(PROTOCOL,UDP)),REJECT
DOMAIN-SUFFIX,apple.com,DIRECT
DOMAIN-SUFFIX,icloud.com,DIRECT
DOMAIN-KEYWORD,adservice,REJECT
FINAL,PROXY

[URL Rewrite]
^https?:\\/\\/(www|s)\\.youtube\\.com\\/(pagead|ptracking) _ reject-200
^https?:\\/\\/s\\.youtube\\.com\\/api\\/stats\\/qoe\\?adcontext _ reject-200

[Header Rewrite]
http-request ^https?://api.example.com header-del x-debug

[MITM]
enable = true
hostname = %APPEND%, *.googlevideo.com, youtubei.googleapis.com, www.youtube.com, s.youtube.com, sub.store
`;

export function parseConf(text: string, prevMitm = false, prevUrl = ""): ParsedConf {
  const lines = text.replace(/\r/g, "").split("\n");
  let section = "";
  const rules: Rule[] = [];
  const rewrites: Rewrite[] = [];
  const headers: HeaderRule[] = [];
  const hosts: string[] = [];
  let updateUrl = prevUrl;
  let mitm = prevMitm;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || line.startsWith("#!")) continue;
    if (line.startsWith("[") && line.endsWith("]")) {
      section = line.slice(1, -1).toUpperCase();
      continue;
    }
    if (section === "GENERAL") {
      const m = line.match(/^update-url\s*=\s*(.+)/i);
      if (m) updateUrl = m[1].trim();
    }
    if (section === "RULE") {
      const parts = line.split(",");
      const policy = parts[parts.length - 1] || "PROXY";
      rules.push({ raw: line, match: parts.slice(0, -1).join(",") || line, policy });
    }
    if (section === "URL REWRITE") {
      const bits = line.split(/\s+/);
      rewrites.push({ pattern: bits[0], action: bits.slice(1).join(" ") || "rewrite" });
    }
    if (section === "HEADER REWRITE") {
      headers.push({ raw: line });
    }
    if (section === "MITM") {
      if (/^enable\s*=\s*true/i.test(line)) mitm = true;
      if (/^hostname\s*=/i.test(line)) {
        line
          .split("=")[1]
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s && s !== "%APPEND%" && !s.startsWith("ca-") && s.length < 180)
          .forEach((h) => hosts.push(h));
      }
    }
  }

  return {
    rules,
    rewrites,
    headers,
    hosts: [...new Set(hosts)],
    updateUrl,
    mitm,
  };
}

export function exportConf(p: ParsedConf & { mitm: boolean }): string {
  return `[General]
update-url = ${p.updateUrl || ""}

[Rule]
${p.rules.map((r) => r.raw).join("\n")}

[URL Rewrite]
${p.rewrites.map((r) => `${r.pattern} ${r.action}`).join("\n")}

[Header Rewrite]
${p.headers.map((h) => h.raw).join("\n")}

[MITM]
enable = ${p.mitm}
hostname = %APPEND%, ${p.hosts.join(", ")}
`;
}
