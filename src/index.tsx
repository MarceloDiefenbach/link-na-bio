import { serve } from "bun";
import fs from "fs";
import path from "path";
import index from "./index.html";

process.env.TZ = 'America/Sao_Paulo';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Minimal .env loader (sync). Parses KEY=VALUE lines, ignores comments, preserves existing env.
function loadEnvFiles() {
  const cwd = process.cwd();
  const candidates: Array<{ file: string; override: boolean }> = [
    {
      file: path.join(cwd, `.env.${process.env.NODE_ENV || ""}`).replace(/\.$/, ""),
      override: false,
    },
    { file: path.join(cwd, ".env"), override: true },
  ];
  for (const { file, override } of candidates) {
    try {
      if (!fs.existsSync(file)) continue;
      const text = fs.readFileSync(file, "utf8");
      for (const line of text.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq <= 0) continue;
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (override || process.env[key] == null) process.env[key] = val;
      }
    } catch {}
  }
}

// Load env before importing config-dependent modules
loadEnvFiles();

// Defer imports that depend on env to ensure they see populated process.env
const [{ ensureSchema }, { buildRoutes }] = await Promise.all([
  import("./server/db"),
  import("./server/routes"),
]);

(async () => {
  try {
    const ok = await ensureSchema();
    if (ok) console.log("✅ DB schema ready");
    else console.warn("⚠️  DB not configured.");
  } catch (e) {
    console.error("DB init error:", e);
  }
})();

// Ensure server listens on all interfaces and uses PORT if provided
const port = Number(process.env.PORT || 3000);
const host = "0.0.0.0";
const server = serve({
  routes: buildRoutes(index),
  port,
  hostname: host,
});

console.log(`🚀 Server running at ${server.url}`);
console.log(`ℹ️  Bind: ${host}:${port} | NODE_ENV=${process.env.NODE_ENV}`);
console.log(
  `ℹ️  DB: host=${process.env.MYSQL_HOST} db=${process.env.MYSQL_DATABASE} user=${process.env.MYSQL_USER}`
);

const webhookUrl =
  "http://encarte-api-n8nwithpostgres-y6rzem-47b2af-177-153-20-134.traefik.me/webhook/enviar";

async function sendPeriodicMessage() {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone: "51991543108", message: "oi" }),
    });

    if (!response.ok) {
      console.error("Failed to send message:", await response.text());
    }
  } catch (err) {
    console.error("Error sending message:", err);
  }
}

// sendPeriodicMessage();
// setInterval(sendPeriodicMessage, 30_000);
