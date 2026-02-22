/**
 * Build-time script: generates src/terminal/headers.ts
 * Run with: node scripts/generate-headers.mjs
 */
import figlet from "figlet";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const FONT = "Small";
const BORDER = "//////////////////////////////////////////////////////////";

// Only the welcome banner needs an ASCII header now
const art = figlet.textSync("MLZ.NO", { font: FONT });
const escaped = art.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
const bordered = `${BORDER}\n\n${escaped}\n${BORDER}`;

const output = `// AUTO-GENERATED — do not edit by hand.
// Re-generate with: node scripts/generate-headers.mjs

export const WELCOME_HEADER = \`${bordered}\`;
`;

const outPath = resolve(__dirname, "../src/terminal/headers.ts");
writeFileSync(outPath, output, "utf8");
console.log(`✓ Written ${outPath}`);

