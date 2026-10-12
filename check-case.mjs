// Finds relative imports whose letter case does not match the real file name.
// These work on Windows but crash on Linux servers (Render, Vercel).
// Run from the project root:  node check-case.mjs
import fs from "fs";
import path from "path";

const ROOTS = ["backend", "frontend-admin/src", "frontend-user/src"];
const SKIP = new Set(["node_modules", ".git", "dist", "build"]);
const EXTS = ["", ".js", ".jsx", ".mjs", ".json", "/index.js", "/index.jsx"];

const walk = (dir, out = []) => {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(js|jsx|mjs)$/.test(e.name)) out.push(p);
  }
  return out;
};

// true only when every part of the path exists with EXACTLY this spelling
const existsExact = (target) => {
  const parts = path.normalize(target).split(path.sep).filter(Boolean);
  let cur = path.isAbsolute(target) ? path.sep : ".";
  for (const part of parts) {
    if (part === ".") continue;
    let names;
    try { names = fs.readdirSync(cur); } catch { return false; }
    if (!names.includes(part)) return false;
    cur = path.join(cur, part);
  }
  return fs.statSync(cur).isFile();
};

const importRe = /(?:import|export)[^'"]*?from\s*['"](\.{1,2}\/[^'"]+)['"]|import\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)|import\s+['"](\.{1,2}\/[^'"]+)['"]/g;
let bad = 0;
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const src = fs.readFileSync(file, "utf8");
    for (const m of src.matchAll(importRe)) {
      const spec = m[1] || m[2] || m[3];
      if (/\.(css|svg|png|jpe?g|webp|gif)$/.test(spec)) continue;
      const target = path.join(path.dirname(file), spec);
      if (!EXTS.some((ext) => existsExact(target + ext))) {
        bad++;
        console.log(`WRONG CASE OR MISSING: ${file}\n   imports "${spec}"`);
      }
    }
  }
}
console.log(bad ? `\n${bad} problem(s) found.` : "\nAll imports match their file names exactly. Safe for Linux.");
process.exit(bad ? 1 : 0);
