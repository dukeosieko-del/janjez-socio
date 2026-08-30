const fs = require("fs");
const path = require("path");

const cleanedDir = "/tmp/cleaned";
for (const f of fs.readdirSync(cleanedDir).filter((x) => x.endsWith(".csv"))) {
  const lines = fs.readFileSync(path.join(cleanedDir, f), "utf8").split("\n");
  console.log("\n===== " + f + " (lines:" + lines.length + ") =====");
  for (let i = 0; i < 3 && i < lines.length; i++) {
    console.log("L" + i + ": " + lines[i].slice(0, 300));
  }
}

console.log("\n\n===== sandbox process json (proc_1788105952326) =====");
const p = "/tmp/sandbox-internal/processes/proc_1788105952326_56q2la.json";
const j = JSON.parse(fs.readFileSync(p, "utf8"));
console.log("keys:", Object.keys(j));
console.log(JSON.stringify(j, null, 2).slice(0, 3000));
