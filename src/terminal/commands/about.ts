import type { CommandResult } from "./types.js";

export const about = (): CommandResult => ({
  lines: [
    { text: "── About ─────────────────────────────────", tone: "section" },
    { text: "" },
    { text: "Back-end developer  ·  9 years of experience", tone: "accent" },
    { text: "" },
    {
      text: "",
      parts: [
        { text: "▸ ", tone: "cyan" },
        { text: "What I do", tone: "accent" },
      ],
    },
    { text: "  Architecture, integrations, and production services", tone: "indent" },
    { text: "  with high stability requirements. API and integration", tone: "indent" },
    { text: "  development — event-driven and scheduled jobs.", tone: "indent" },
    { text: "  Clear, versioned contracts, predictable error handling,", tone: "indent" },
    { text: "  and full traceability in production.", tone: "indent" },
    { text: "" },
    {
      text: "",
      parts: [
        { text: "▸ ", tone: "cyan" },
        { text: "End-to-end ownership", tone: "accent" },
      ],
    },
    { text: "  Design → scoping → implementation → rollout → ops.", tone: "indent" },
    { text: "  Automation and improvement of development and", tone: "indent" },
    { text: "  delivery workflows, including operational responsibility", tone: "indent" },
    { text: "  for micro-services in prod with logging, metrics,", tone: "indent" },
    { text: "  and alerting.", tone: "indent" },
    { text: "" },
    {
      text: "",
      parts: [
        { text: "▸ ", tone: "cyan" },
        { text: "Teams", tone: "accent" },
      ],
    },
    { text: "  Agile, clear communication, continuous learning,", tone: "indent" },
    { text: "  shared goals. Experienced collaborating across", tone: "indent" },
    { text: "  disciplines and stakeholders.", tone: "indent" },
    { text: "" },
    { text: "→ Type 'focus' to see focus areas.", tone: "dim" },
  ],
});
