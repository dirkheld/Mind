import { config } from "dotenv";
import { spawnSync } from "node:child_process";

// Administrative credentials are loaded only by this short-lived CLI process.
const local = process.argv.includes("--local");
config({ path: local ? ".env.test" : ".env.migrations", override: local });
config();
const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) throw new Error("DIRECT_URL is required for migrations.");
if (local && !["localhost", "127.0.0.1", "[::1]"].includes(new URL(url).hostname)) {
  throw new Error("Local migrations require a loopback database host.");
}
const result = spawnSync(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"], {
  env: { ...process.env, DATABASE_URL: url, DIRECT_URL: url },
  stdio: "inherit",
});
process.exit(result.status ?? 1);
