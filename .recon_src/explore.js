const fs = require("fs");
const path = require("path");

const cleanedDir = "/tmp/cleaned";
const sandboxDir = "/tmp/sandbox-internal";

console.log("=== cleaned dir exists:", fs.existsSync(cleanedDir));
if (fs.existsSync(cleanedDir)) {
  console.log("files:", fs.readdirSync(cleanedDir));
  const man = JSON.parse(fs.readFileSync(path.join(cleanedDir, "manifest.json"), "utf8"));
  console.log("=== manifest ===");
  console.log(JSON.stringify(man, null, 2).slice(0, 4000));
}

console.log("\n=== sandbox-internal tree ===");
function walk(d, depth = 0) {
  if (!fs.existsSync(d)) return;
  for (const e of fs.readdirSync(d)) {
    const p = path.join(d, e);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, depth + 1);
    else console.log(p, st.size);
  }
}
walk(sandboxDir);
