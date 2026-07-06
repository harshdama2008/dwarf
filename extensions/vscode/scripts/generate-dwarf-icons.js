const path = require("path");
const sharp = require(
  path.join(__dirname, "..", "..", "..", "core", "node_modules", "sharp"),
);

const svg = `
<svg width="512" height="512" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="14" fill="#000000"/>
  <circle cx="40" cy="26" r="7" fill="#FFFFFF"/>
  <path d="M 30 22 L 50 22 L 40 6 Z" fill="#FFFFFF"/>
  <g stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <line x1="40" y1="34" x2="38" y2="58"/>
    <path d="M 38 58 L 28 74 L 22 90"/>
    <path d="M 38 58 L 48 72 L 54 90"/>
    <path d="M 40 34 L 30 46 L 24 56"/>
    <path d="M 40 34 L 52 38 L 58 32"/>
    <line x1="56" y1="34" x2="72" y2="14"/>
    <path d="M 48 2 L 72 14 L 95 8" stroke-width="4"/>
  </g>
</svg>
`;

const targets = [
  { file: "media/icon.png", size: 128 },
  { file: "media/sidebar-icon.png", size: 512 },
];

(async () => {
  for (const { file, size } of targets) {
    const outPath = path.join(__dirname, "..", file);
    await sharp(Buffer.from(svg)).resize(size, size).png().toFile(outPath);
    console.log(`wrote ${file} (${size}x${size})`);
  }
})();
