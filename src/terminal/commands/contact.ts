import type { CommandResult } from "./types.js";

export const contact = (): CommandResult => ({
  lines: [
    { text: "── Contact ───────────────────────────────", tone: "section" },
    { text: "" },
    { text: "Email     zachariassen@hey.com", tone: "indent" },
    { text: "Location  Norway", tone: "indent" },
    { text: "" },
  ],
});

export const links = (): CommandResult => ({
  lines: [
    { text: "── Links ─────────────────────────────────", tone: "section" },
    { text: "" },
    { text: "GitHub    → https://github.com/martinzachariassen",           tone: "indent" },
    { text: "LinkedIn  → https://www.linkedin.com/in/martinzachariassen", tone: "indent" },
    { text: "Homepage  → https://mlz.no",                                  tone: "indent" },
    { text: "" },
    { text: "(links are clickable)", tone: "indent dim" },
    { text: "" },
  ],
});

export const openLink = (args: string[] = []): CommandResult => {
  const target = args[0]?.toLowerCase();
  const targets: Record<string, { url: string; label: string }> = {
    github:   { url: "https://github.com/martinzachariassen",           label: "GitHub"   },
    linkedin: { url: "https://www.linkedin.com/in/martinzachariassen",  label: "LinkedIn" },
    homepage: { url: "https://mlz.no",                                   label: "mlz.no"  },
  };

  if (!target || !targets[target]) {
    return {
      lines: [
        { text: "Usage: open <target>", tone: "warn" },
        { text: "" },
        { text: "  Targets:  github  ·  linkedin  ·  homepage", tone: "dim" },
      ],
    };
  }

  const { url, label } = targets[target];
  window.open(url, "_blank", "noopener,noreferrer");
  return {
    lines: [
      { text: `Opening ${label}...`, tone: "ok" },
      { text: url, tone: "dim" },
    ],
  };
};

