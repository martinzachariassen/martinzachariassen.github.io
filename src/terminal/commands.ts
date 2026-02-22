import { normalizeInput } from "./parseCommand.js";
import { pickDeterministic } from "./text.js";

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
      "  8ball <q>   - ask the terminal",
      "  matrix      - a short rain of characters",
      "  fortune     - a tiny fortune",
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

  handlers.set("fortune", () => {
    const fortunes = [
      "Fortune: Your next refactor will be small and satisfying.",
      "Fortune: The bug is in the assumptions.",
      "Fortune: Green tests, calm mind.",
      "Fortune: Make state explicit; future you will smile.",
      "Fortune: Delete code. (After you write the test.)",
      "Fortune: Ship it. Then observe it.",
    ];
    return { lines: [{ text: fortunes[Math.floor(Math.random() * fortunes.length)] }] };
  });

  handlers.set("8ball", (args: string[] = []) => {
    const q = args.join(" ").trim();
    if (!q) return { lines: [{ text: "Usage: 8ball <your question>" }] };

    const answers = [
      "It is certain.",
      "It is decidedly so.",
      "Without a doubt.",
      "Yes — definitely.",
      "You may rely on it.",
      "As I see it, yes.",
      "Most likely.",
      "Outlook good.",
      "Yes.",
      "Signs point to yes.",
      "Reply hazy, try again.",
      "Ask again later.",
      "Better not tell you now.",
      "Cannot predict now.",
      "Concentrate and ask again.",
      "Don't count on it.",
      "My reply is no.",
      "My sources say no.",
      "Outlook not so good.",
      "Very doubtful.",
    ];

    const a = pickDeterministic(answers, `8ball:${q}`);
    return { lines: [{ text: `Q: ${q}` }, { text: `A: ${a}` }] };
  });

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

