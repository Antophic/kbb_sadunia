const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "frontend", "dist");
const extensions = new Set([".css", ".js"]);
const minBytes = 1024;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (!extensions.has(path.extname(entry.name))) continue;
    const stat = fs.statSync(fullPath);
    if (stat.size < minBytes) continue;

    const gzPath = `${fullPath}.gz`;
    const source = fs.readFileSync(fullPath);
    const zipped = zlib.gzipSync(source, { level: 9 });
    fs.writeFileSync(gzPath, zipped);
  }
}

if (fs.existsSync(distDir)) {
  walk(distDir);
}
