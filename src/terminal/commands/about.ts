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

export const focus = (): CommandResult => ({
  lines: [
    { text: "── Areas of Focus ────────────────────────", tone: "section" },
    { text: "" },
    {
      text: "",
      parts: [
        { text: "▸ ", tone: "cyan" },
        { text: "Observability / SRE", tone: "accent" },
      ],
    },
    { text: "  Building monitoring and alerting for stable ops", tone: "indent" },
    { text: "  and fast debugging. Working systematically", tone: "indent" },
    { text: "  towards operational goals over time.", tone: "indent" },
    { text: "" },
    {
      text: "",
      parts: [
        { text: "▸ ", tone: "cyan" },
        { text: "Performance & Scaling", tone: "accent" },
      ],
    },
    { text: "  Measuring and improving performance by finding", tone: "indent" },
    { text: "  and removing bottlenecks in APIs, databases,", tone: "indent" },
    { text: "  and integrations.", tone: "indent" },
    { text: "" },
    {
      text: "",
      parts: [
        { text: "▸ ", tone: "cyan" },
        { text: "Event-Driven Integration & Contracts", tone: "accent" },
      ],
    },
    { text: "  Designing stable, versioned interfaces — ensuring", tone: "indent" },
    { text: "  processes tolerate failures and retries without", tone: "indent" },
    { text: "  double-processing, and that flow is fully", tone: "indent" },
    { text: "  traceable in production.", tone: "indent" },
    { text: "" },
    {
      text: "",
      parts: [
        { text: "▸ ", tone: "cyan" },
        { text: "Automation / Developer Workflow", tone: "accent" },
      ],
    },
    { text: "  Automating build, test, and deploy.", tone: "indent" },
    { text: "  Standardising workflows to reduce manual steps.", tone: "indent" },
    { text: "" },
  ],
});

