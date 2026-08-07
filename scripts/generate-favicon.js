/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const src = path.join(process.cwd(), "public", "janjez-logo.png");
const outDir = path.join(process.cwd(), "public");

const sizes = [
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "favicon-48x48.png", size: 48 },
  { name: "apple-icon-180x180.png", size: 180 },
];

async function generate() {
  const meta = await sharp(src).metadata();
  console.log("Source:", meta.width, "x", meta.height);

  for (const s of sizes) {
    const dest = path.join(outDir, s.name);
    
    // Crop the source to the largest square centered
    const cropSize = Math.min(meta.width, meta.height);
    const image = sharp(src)
      .extract({
        left: Math.floor((meta.width - cropSize) / 2),
        top: Math.floor((meta.height - cropSize) / 2),
        width: cropSize,
        height: cropSize,
      })
      .resize(s.size, s.size, { fit: "cover", kernel: "lanczos3" })
      .png()
      .toFile(dest);

    await image;
    console.log("Generated:", s.name, "@", s.size, "x", s.size);
  }

  // Also create a favicon.ico placeholder (32x32 is fine for modern browsers)
  const icoPath = path.join(outDir, "favicon.ico");
  await sharp(src)
    .extract({
      left: Math.floor((meta.width - Math.min(meta.width, meta.height)) / 2),
      top: Math.floor((meta.height - Math.min(meta.width, meta.height)) / 2),
      width: Math.min(meta.width, meta.height),
      height: Math.min(meta.width, meta.height),
    })
    .resize(32, 32, { fit: "cover", kernel: "lanczos3" })
    .png()
    .toFile(icoPath);
  console.log("Generated: favicon.ico @ 32x32 (PNG fallback)");
}

generate().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
