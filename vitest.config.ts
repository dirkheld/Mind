import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
// Tests must never inherit the live Supabase connection from .env.
config({ path: ".env.test", override: true });
config();
if (process.env.DATABASE_URL && !["localhost", "127.0.0.1", "[::1]"].includes(new URL(process.env.DATABASE_URL).hostname)) {
  throw new Error("Tests require a local DATABASE_URL in .env.test; remote databases are blocked.");
}
export default defineConfig({ resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)), "server-only": fileURLToPath(new URL("./tests/server-only.ts", import.meta.url)) } }, test: { environment: "node", fileParallelism: false } });
