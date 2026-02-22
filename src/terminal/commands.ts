import { normalizeInput } from "./parseCommand.js";

export interface OutputLine {
  text: string;
  tone?: string;
}

// Side-effects that commands can request from the UI layer
export type MatrixEffect = { type: "MATRIX"; mode: "on" | "off" | "toggle" };
export type EasterEffect = { type: "EASTER"; enabled: boolean };
export type CommandEffect = MatrixEffect | EasterEffect;

export interface CommandResult {
  lines: OutputLine[];
  effects?: CommandEffect[];
}

type CommandHandler = (args: string[]) => CommandResult;

function linesFromStrings(arr: string[], tone?: string): OutputLine[] {
  return arr.map((text) => ({ text, tone }));
}

export interface CommandRegistry {
  has(cmd: string): boolean;
  run(cmd: string, args: string[]): CommandResult;
  normalizeInput(s: string): string;
}

export function createCommandRegistry(): CommandRegistry {
  const handlers = new Map<string, CommandHandler>();

  handlers.set("help", (args: string[] = []) => {
    const wantsSecret = args.some(
      (a) => a.toLowerCase() === "--secret" || a.toLowerCase() === "secret"
    );

    const base = [
      "Available commands:",
      "  help        - show this list",
      "  about       - who I am",
      "  skills      - areas of focus & interests",
      "  contact     - how to reach me",
      "  links       - GitHub / LinkedIn / etc",
      "  clear       - clear the screen",
    ];

    if (!wantsSecret) {
      base.push("", "Tip: try  help --secret");
      return { lines: linesFromStrings(base) };
    }

    const secret = [
      "",
      "Secret-ish stuff:",
      "  matrix      - a short rain of characters",
      "  secrets off - disable easter eggs",
      "  secrets on  - enable easter eggs",
      "",
      "Also: try the classic Konami code while focused here.",
    ];

    return { lines: linesFromStrings(base.concat(secret)) };
  });

  handlers.set("about", () => ({
    lines: [
      { text: "── About ─────────────────────────────────────────────", tone: "section" },
      { text: "" },
      { text: "Back-end developer with 9 years of experience, focused on" },
      { text: "architecture, integrations and production-critical services." },
      { text: "" },
      { text: "I build and maintain APIs (internal and external) and event-/" },
      { text: "queue-based workflows — both streaming and batch processing." },
      { text: "I emphasise robust contracts, idempotency, error handling" },
      { text: "and traceability." },
      { text: "" },
      { text: "I take end-to-end ownership of deliveries: from technical" },
      { text: "design through implementation to operational follow-up." },
      { text: "DevOps is part of the job — CI/CD, Kubernetes, and running" },
      { text: "micro-services in production with a focus on operability" },
      { text: "and observability." },
      { text: "" },
      { text: "I thrive in agile teams with clear communication, continuous" },
      { text: "learning and shared goals, and I'm used to close collaboration" },
      { text: "across disciplines and stakeholders." },
      { text: "" },
      { text: "→  Type 'skills' to see areas of focus.", tone: "dim" },
    ],
  }));

  handlers.set("skills", () => ({
    lines: [
      { text: "── Skills & Interests ────────────────────────────────", tone: "section" },
      { text: "" },
      { text: "  Observability / SRE", tone: "accent" },
      { text: "  Building metrics, tracing and alerts for fast debugging." },
      { text: "  Working towards systematic SLI/SLO practices." },
      { text: "" },
      { text: "  Performance & Scaling", tone: "accent" },
      { text: "  Profiling CPU/memory/IO/latency, running load & soak tests," },
      { text: "  and optimising bottlenecks via caching, indexing and" },
      { text: "  queue/batch strategies." },
      { text: "" },
      { text: "  Event-Driven Integration & Contracts", tone: "accent" },
      { text: "  Event-driven workflows with robust contracts (schema/" },
      { text: "  versioning), designed for idempotency, retries, DLQ" },
      { text: "  and end-to-end traceability." },
      { text: "" },
      { text: "  Data Modelling & System Design", tone: "accent" },
      { text: "  Modelling data and integrations with clear concepts," },
      { text: "  clean interfaces and stable API contracts that tolerate" },
      { text: "  change and stay traceable in production." },
      { text: "" },
      { text: "  Automation / Developer Productivity", tone: "accent" },
      { text: "  Automating build, test and deploy (local + CI), writing" },
      { text: "  small tools/scripts and standardising workflows to reduce" },
      { text: "  friction and increase delivery speed without losing quality." },
      { text: "" },
    ],
  }));

  handlers.set("contact", () => ({
    lines: [
      { text: "── Contact ───────────────────────────────────────────", tone: "section" },
      { text: "" },
      { text: "  Email     zachariassen@hey.com" },
      { text: "  Location  Norway" },
      { text: "" },
    ],
  }));

  handlers.set("links", () => ({
    lines: [
      { text: "── Links ─────────────────────────────────────────────", tone: "section" },
      { text: "" },
      { text: "  GitHub    https://github.com/martinzachariassen" },
      { text: "  LinkedIn  https://www.linkedin.com/in/martinzachariassen" },
      { text: "  Homepage  https://mlz.no" },
      { text: "" },
    ],
  }));

  handlers.set("matrix", (args: string[] = []) => {
    const v = args[0]?.toLowerCase();
    if (v === "off")
      return { lines: [{ text: "(matrix) off" }], effects: [{ type: "MATRIX" as const, mode: "off" as const }] };
    if (v === "on")
      return { lines: [{ text: "(matrix) on" }], effects: [{ type: "MATRIX" as const, mode: "on" as const }] };
    return {
      lines: [{ text: "(matrix) toggled" }],
      effects: [{ type: "MATRIX" as const, mode: "toggle" as const }],
    };
  });

  handlers.set("secrets", (args: string[] = []) => {
    const v = args[0]?.toLowerCase();
    if (v !== "on" && v !== "off") return { lines: [{ text: "Usage: secrets on|off" }] };
    return {
      lines: [{ text: v === "on" ? "Easter eggs enabled." : "Easter eggs disabled." }],
      effects: [{ type: "EASTER" as const, enabled: v === "on" }],
    };
  });

  return {
    has(cmd: string): boolean {
      return handlers.has(cmd);
    },
    run(cmd: string, args: string[]): CommandResult {
      const h = handlers.get(cmd);
      if (!h) return { lines: [] };
      return h(args);
    },
    normalizeInput,
  };
}
