export type TextPart = { type: "text"; value: string } | { type: "link"; value: string };

function escapeHtml(s: string): string {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export function linkifyToParts(text: string): TextPart[] {
  const re = /(https?:\/\/[^\s]+)/g;
  const out: TextPart[] = [];

  const safe = String(text ?? "");
  let lastIndex = 0;
  for (const match of safe.matchAll(re)) {
    const idx = match.index ?? 0;
    if (idx > lastIndex) {
      out.push({ type: "text", value: escapeHtml(safe.slice(lastIndex, idx)) });
    }
    out.push({ type: "link", value: match[0] });
    lastIndex = idx + match[0].length;
  }
  if (lastIndex < safe.length) {
    out.push({ type: "text", value: escapeHtml(safe.slice(lastIndex)) });
  }

  return out;
}

export function hashString(s: string): number {
  // small deterministic hash (not crypto)
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pickDeterministic<T>(list: T[], seedStr: string): T {
  const idx = hashString(seedStr) % list.length;
  return list[idx];
}

