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
    { text: "  Architecture, integrations, and production", tone: "indent" },
    { text: "  services with high stability requirements.", tone: "indent" },
    { text: "" },
    {
      text: "",
      parts: [
        { text: "▸ ", tone: "cyan" },
        { text: "How I work", tone: "accent" },
      ],
    },
    { text: "  APIs and integrations — event-driven and", tone: "indent" },
    { text: "  scheduled batch jobs. Versioned contracts,", tone: "indent" },
    { text: "  predictable error handling, traceability.", tone: "indent" },
    { text: "" },
    {
      text: "",
      parts: [
        { text: "▸ ", tone: "cyan" },
        { text: "End-to-end ownership", tone: "accent" },
      ],
    },
    { text: "  Design → scoping → implementation →", tone: "indent" },
    { text: "  rollout → ops. Micro-services in prod", tone: "indent" },
    { text: "  with logging, metrics, and alerting.", tone: "indent" },
    { text: "" },
    {
      text: "",
      parts: [
        { text: "▸ ", tone: "cyan" },
        { text: "Teams", tone: "accent" },
      ],
    },
    { text: "  Agile, clear communication,", tone: "indent" },
    { text: "  continuous learning, shared goals.", tone: "indent" },
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
    { text: "  Monitoring and alerting for stable ops and", tone: "indent" },
    { text: "  fast debugging. Working systematically", tone: "indent" },
    { text: "  towards SLIs and SLOs over time.", tone: "indent" },
    { text: "" },
    {
      text: "",
      parts: [
        { text: "▸ ", tone: "cyan" },
        { text: "Performance & Scaling", tone: "accent" },
      ],
    },
    { text: "  Measuring and improving performance by", tone: "indent" },
    { text: "  finding and removing bottlenecks in APIs,", tone: "indent" },
    { text: "  databases, and integrations.", tone: "indent" },
    { text: "" },
    {
      text: "",
      parts: [
        { text: "▸ ", tone: "cyan" },
        { text: "Event-Driven Integration & Contracts", tone: "accent" },
      ],
    },
    { text: "  Stable, versioned interfaces — tolerant of", tone: "indent" },
    { text: "  failures and retries without double-processing,", tone: "indent" },
    { text: "  and fully traceable in production.", tone: "indent" },
    { text: "" },
    {
      text: "",
      parts: [
        { text: "▸ ", tone: "cyan" },
        { text: "Automation / Developer Workflow", tone: "accent" },
      ],
    },
    { text: "  Automating build, test, and deploy.", tone: "indent" },
    { text: "  Standardising workflows to cut manual steps.", tone: "indent" },
    { text: "" },
  ],
});

