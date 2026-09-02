const fs = require("fs");
const path = require("path");

function loadEnvFile(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.substring(0, eqIdx).trim();
    let value = trimmed.substring(eqIdx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value;
  }
  return env;
}

const dotEnv = loadEnvFile(path.join(__dirname, ".env"));

module.exports = {
  apps: [{
    name: "janjez-app",
    script: "npm",
    args: "start",
    instances: 1,
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
      HOST: "0.0.0.0",
      ...dotEnv,
    },
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    error_file: "/var/log/pm2/janjez-app-error.log",
    out_file: "/var/log/pm2/janjez-app-out.log",
    combine_logs: true,
    max_restarts: 5,
    min_uptime: "30s",
  }],
};
