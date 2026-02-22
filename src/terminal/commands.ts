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
      "  help        - show commands",
      "  about       - who I am",
      "  stack       - what I work with",
      "  projects    - highlights",
      "  contact     - how to reach me",
      "  links       - GitHub/LinkedIn/etc",
      "  clear       - clear screen",
    ];

    if (!wantsSecret) {
      base.push("", "Tip: help --secret");
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
    lines: linesFromStrings([
      "Hi! I'm Martin - a driven developer and architect.",
      "",
      "I like building systems that actually work in practice.",
      "Focus: scalability, robustness, and sustainable solutions over time.",
      "",
      "I thrive at the intersection of engineering, operations, and architecture -",
      "from design to production debugging.",
      "",
      "Keywords: clear priorities, transparency, and continuous learning.",
      "",
      "Type 'stack' or 'projects'.",
    ]),
  }));

  handlers.set("stack", () => ({
    lines: linesFromStrings([
      "Strengths / focus areas:",
      "  - System design: distributed solutions, integrations, domain systems",
      "  - Ops & DevOps: secure + automated deployments, stability, reliability",
      "  - Observability: logs, metrics, and insight in distributed applications",
      "  - Async systems: messaging flows, error handling, resilient processing",
      "  - Performance: optimizing process flow and memory usage",
      "",
      "Working style:",
      "  - End-to-end ownership of technical direction (perf, security, stability)",
      "  - Pragmatic: simplify where it matters, be explicit about boundaries",
    ]),
  }));

  handlers.set("projects", (args: string[] = []) => {
    if (args[0]?.toLowerCase() === "invoice") {
      return {
        lines: [
          { text: "Invoice pipeline details:", tone: "accent" },
          ...linesFromStrings([
            "  - Ingest XML/PDF -> immutable blob storage",
            "  - Reconcile PDFs to invoices",
            "  - Validate + transform to standard formats",
            "  - Dispatch with windows/caps + receipts tracking",
          ]),
        ],
      };
    }

    return {
      lines: linesFromStrings([
        "Highlights (typical deliveries):",
        "  - Integrations across domain systems and critical business flows",
        "  - Secure, automated processes for deploy, operations, and monitoring",
        "  - Robust error handling in asynchronous messaging systems",
        "  - Performance improvements: flow, resource usage, memory management",
        "  - Better observability for faster debugging and deeper insight",
        "",
        "Details: type 'projects invoice'.",
      ]),
    };
  });

  handlers.set("contact", () => ({
    lines: linesFromStrings([
      "Contact:",
      "  email: zachariassen@hey.com",
      "  location: Norway",
      "",
    ]),
  }));

  handlers.set("links", () => ({
    lines: linesFromStrings([
      "Links:",
      "  GitHub:   https://github.com/martinzachariassen",
      "  LinkedIn: https://www.linkedin.com/in/martinzachariassen",
      "  Homepage: https://mlz.no (this site)",
    ]),
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

