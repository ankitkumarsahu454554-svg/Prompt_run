import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const docPath = path.join(rootDir, "docs", "SPEC_TRACEABILITY.md");

if (!fs.existsSync(docPath)) {
  console.error(`ERROR: Traceability document not found at ${docPath}`);
  process.exit(1);
}

const content = fs.readFileSync(docPath, "utf8");

// Match backtick content that looks like file paths (e.g. src/..., tests/..., e2e/..., docs/..., scripts/..., tailwind.config.ts, next.config.ts)
const pathRegex = /`([a-zA-Z0-9_\-\./\\]+\.[a-zA-Z0-9]+)`/g;
const matchedPaths = new Set();

let match;
while ((match = pathRegex.exec(content)) !== null) {
  const candidate = match[1].trim();
  // Filter out non-file tokens like npm commands or version strings
  if (
    candidate.startsWith("src/") ||
    candidate.startsWith("tests/") ||
    candidate.startsWith("e2e/") ||
    candidate.startsWith("docs/") ||
    candidate.startsWith("scripts/") ||
    candidate.endsWith(".ts") ||
    candidate.endsWith(".tsx") ||
    candidate.endsWith(".mjs") ||
    candidate.endsWith(".md") ||
    candidate.endsWith(".json") ||
    candidate.endsWith(".css")
  ) {
    matchedPaths.add(candidate.replace(/^\.\//, ""));
  }
}

console.log(`Verifying ${matchedPaths.size} referenced files from docs/SPEC_TRACEABILITY.md...`);

const missing = [];
for (const relPath of matchedPaths) {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) {
    missing.push(relPath);
  }
}

if (missing.length > 0) {
  console.error(`FAILED: ${missing.length} referenced files are missing on disk:`);
  for (const m of missing) {
    console.error(`  - ${m}`);
  }
  process.exit(1);
}

console.log(`SUCCESS: All ${matchedPaths.size} traceability file paths exist on disk!`);
process.exit(0);
