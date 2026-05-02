/**
 * Loads the root-level .env file (one directory above backend/) and
 * re-exports the validated env vars used across the backend.
 *
 * Import this module FIRST in any file that needs env vars so that
 * process.env is populated before other top-level code runs.
 */
import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
// backend/src/ -> backend/ -> repo root
const rootEnvPath = resolve(__dirname, "../..", ".env");
config({ path: rootEnvPath });
function required(name) {
    const val = process.env[name];
    if (!val)
        throw new Error(`${name} env var is required`);
    return val;
}
export const env = {
    PORT: Number(process.env.BACKEND_PORT ?? 3001),
    SESSION_SECRET: required("SESSION_SECRET"),
    FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:5173",
    BACKEND_URL: process.env.BACKEND_URL ??
        `http://localhost:${process.env.BACKEND_PORT ?? 3001}`,
    CONTRACT_ADDRESS: required("VITE_CONTRACT_ADDRESS"),
    RPC_URL: process.env.VITE_SEPOLIA_RPC_URL ?? process.env.SEPOLIA_RPC_URL ?? "",
    UPLOADS_DIR: process.env.UPLOADS_DIR,
};
