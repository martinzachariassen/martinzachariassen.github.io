import type { CommandResult } from "./types.js";

function dur(from: Date, to: Date = new Date()): string {
  const months =
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth());
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m}mo`;
  if (m === 0) return `${y}yr`;
  return `${y}yr ${m}mo`;
}

export const experience = (): CommandResult => ({
  lines: [
    { text: "── Experience ────────────────────────────", tone: "section" },
    { text: "" },
    { text: "Back-End Developer", tone: "accent indent" },
    { text: `Storebrand · 05/2025–Present · Oslo`, tone: "indent" },
    { text: `${dur(new Date(2025, 4))}`, tone: "indent dim" },
    { text: "" },
    { text: "─────────────────────────────────────────", tone: "section" },
    { text: "" },
    { text: "Back-End Developer", tone: "accent indent" },
    { text: "BLDNG.ai AS · 04/2021–05/2025 · Oslo", tone: "indent" },
    { text: `fmr. Telenor Smarte Bygg · ${dur(new Date(2021, 3), new Date(2025, 4))}`, tone: "indent dim" },
    { text: "" },
    { text: "─────────────────────────────────────────", tone: "section" },
    { text: "" },
    { text: "Full Stack Developer", tone: "accent indent" },
    { text: "Telenor · 01/2021–04/2021 · Oslo", tone: "indent" },
    { text: `${dur(new Date(2021, 0), new Date(2021, 3))}`, tone: "indent dim" },
    { text: "" },
    { text: "─────────────────────────────────────────", tone: "section" },
    { text: "" },
    { text: "Consultant – Full Stack Developer", tone: "accent indent" },
    { text: "Netlight · 03/2019–12/2020 · Oslo", tone: "indent" },
    { text: `${dur(new Date(2019, 2), new Date(2020, 11))}`, tone: "indent dim" },
    { text: "" },
    { text: "─────────────────────────────────────────", tone: "section" },
    { text: "" },
    { text: "Full Stack Developer", tone: "accent indent" },
    { text: "Schjærven · 11/2017–02/2019 · Oslo", tone: "indent" },
    { text: `${dur(new Date(2017, 10), new Date(2019, 1))}`, tone: "indent dim" },
    { text: "" },
    { text: "─────────────────────────────────────────", tone: "section" },
    { text: "" },
    { text: "Full Stack Developer", tone: "accent indent" },
    { text: "M7Dev · 12/2016–11/2017 · Bergen", tone: "indent" },
    { text: `${dur(new Date(2016, 11), new Date(2017, 10))}`, tone: "indent dim" },
    { text: "" },
    { text: "→ 9 yrs · Type 'focus' for focus areas.", tone: "dim" },
  ],
});
