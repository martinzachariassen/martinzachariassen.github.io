/**
 * Generates all favicon sizes from public/favicon.png
 * Run with: node scripts/generate-favicons.mjs
 */
import sharp from "sharp";
import { writeFileSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const src = resolve(root, "public/favicon.png");
const out = (name) => resolve(root, "public", name);

const sizes = [
  { name: "favicon-16x16.png",   size: 16  },
  { name: "favicon-32x32.png",   size: 32  },
  { name: "favicon-48x48.png",   size: 48  },
  { name: "apple-touch-icon.png",size: 180 },
  { name: "icon-192.png",        size: 192 },
  { name: "icon-512.png",        size: 512 },
];

for (const { name, size } of sizes) {
  await sharp(src).resize(size, size).png({ compressionLevel: 9 }).toFile(out(name));
  console.log(`✓  ${name}  (${size}×${size})`);
}

// Generate favicon.ico (multi-size: 16, 32, 48) using raw ICO format
// Build a minimal ICO from the 16x16 and 32x32 PNGs
// Simple approach: write an ICO file with both sizes embedded
async function buildIco(sizes) {
  const images = await Promise.all(
    sizes.map(async (s) => {
      const buf = await sharp(src).resize(s, s).png().toBuffer();
      return { size: s, buf };
    })
  );

  const count = images.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = headerSize + dirEntrySize * count;

  let offset = dirSize;
  const entries = images.map(({ size, buf }) => {
    const entry = { size, buf, offset };
    offset += buf.length;
    return entry;
  });

  const totalSize = offset;
  const ico = Buffer.alloc(totalSize);

  // ICO header
  ico.writeUInt16LE(0, 0);      // reserved
  ico.writeUInt16LE(1, 2);      // type: ICO
  ico.writeUInt16LE(count, 4);  // image count

  // Directory entries
  entries.forEach(({ size, buf, offset }, i) => {
    const base = headerSize + i * dirEntrySize;
    ico.writeUInt8(size === 256 ? 0 : size, base);      // width
    ico.writeUInt8(size === 256 ? 0 : size, base + 1);  // height
    ico.writeUInt8(0, base + 2);   // colour count
    ico.writeUInt8(0, base + 3);   // reserved
    ico.writeUInt16LE(1, base + 4); // colour planes
    ico.writeUInt16LE(32, base + 6); // bits per pixel
    ico.writeUInt32LE(buf.length, base + 8);  // image size
    ico.writeUInt32LE(offset, base + 12);     // offset
    buf.copy(ico, offset);
  });

  return ico;
}

const icoBuffer = await buildIco([16, 32, 48]);
writeFileSync(out("favicon.ico"), icoBuffer);
console.log("✓  favicon.ico  (16×16, 32×32, 48×48)");

console.log("\nDone — all favicons written to public/");

