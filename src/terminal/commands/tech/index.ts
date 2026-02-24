import type { CommandResult } from "../types.js";
import { backendLines } from "./backend.js";
import { buildLines } from "./build.js";
import { databaseLines, messagingLines } from "./data.js";
import { testingLines } from "./testing.js";
import { platformLines } from "./platform.js";
import { observabilityLines, securityLines, workToolsLines } from "./ops.js";

export const tech = (): CommandResult => ({
  lines: [
    { text: "── Tech & Tools ──────────────────────────", tone: "section" },
    { text: "" },
    ...backendLines,
    ...buildLines,
    ...databaseLines,
    ...messagingLines,
    ...testingLines,
    ...platformLines,
    ...observabilityLines,
    ...securityLines,
    ...workToolsLines,
  ],
});

