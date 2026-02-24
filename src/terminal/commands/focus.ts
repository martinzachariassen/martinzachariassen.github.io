import type { CommandResult } from "./types.js";

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

