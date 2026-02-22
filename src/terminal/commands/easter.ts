import type { CommandResult } from "./types.js";

export const coffee = (): CommandResult => ({
  lines: [
    { text: "      ( (",     tone: "warn"   },
    { text: "       ) )",    tone: "warn"   },
    { text: "    .______.",  tone: "accent" },
    { text: "    |      |]", tone: "accent" },
    { text: "    \\      /", tone: "accent" },
    { text: "     `----'",   tone: "accent" },
    { text: "" },
    { text: "  Essential dependency installed.", tone: "ok"  },
    { text: "  Productivity += 100.",            tone: "dim" },
  ],
});

// rm and hack are intercepted with staggered animations in Terminal.tsx
// when easter eggs are enabled. These are fallbacks for when they are off.
export const rm = (args: string[] = []): CommandResult => ({
  lines: [{ text: `rm: ${args.join(" ") || "missing operand"}`, tone: "err" }],
});

export const hack = (): CommandResult => ({
  lines: [{ text: "hack: permission denied.", tone: "err" }],
});

export const matrix = (args: string[] = []): CommandResult => {
  const v = args[0]?.toLowerCase();
  if (v === "off")
    return { lines: [{ text: "(matrix) off" }], effects: [{ type: "MATRIX" as const, mode: "off" as const }] };
  if (v === "on")
    return { lines: [{ text: "(matrix) on" }], effects: [{ type: "MATRIX" as const, mode: "on" as const }] };
  return {
    lines: [{ text: "(matrix) toggled" }],
    effects: [{ type: "MATRIX" as const, mode: "toggle" as const }],
  };
};

export const secrets = (args: string[] = []): CommandResult => {
  const v = args[0]?.toLowerCase();
  if (v !== "on" && v !== "off") return { lines: [{ text: "Usage: secrets on|off" }] };
  return {
    lines: [{ text: v === "on" ? "Easter eggs enabled." : "Easter eggs disabled." }],
    effects: [{ type: "EASTER" as const, enabled: v === "on" }],
  };
};

