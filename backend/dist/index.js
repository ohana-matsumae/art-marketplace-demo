import { env } from "./config.js";
import express from "express";
import session from "express-session";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ensureDirs, PUBLIC_DIR } from "./store/fileStore.js";
import authRouter from "./routes/auth.js";
import uploadRouter from "./routes/upload.js";
import assetsRouter from "./routes/assets.js";
import rpcRouter from "./routes/rpc.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { PORT, SESSION_SECRET, FRONTEND_URL } = env;
// Ensure upload directories exist before handling any request.
await ensureDirs();
const app = express();
// Trust reverse proxy headers (Cloudflare, nginx)
app.set("trust proxy", 1);
// CORS — allow the frontend origin with credentials (session cookies)
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
}));
app.use(express.json());
// Global rate limiter — generous cap; tighter limits exist per route
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
}));
// Session middleware
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
}));
// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/auth", authRouter);
app.use("/upload", uploadRouter);
app.use("/assets", assetsRouter);
app.use("/rpc", rpcRouter);
// Public watermarked previews — served statically, no auth required.
// Files land here via processImage() in watermark.ts.
app.use("/public", rateLimit({ windowMs: 60 * 1000, max: 120 }), express.static(PUBLIC_DIR, {
    dotfiles: "deny",
    index: false,
    // Instruct CDN/browser to cache public previews for up to 1 day
    setHeaders(res) {
        res.setHeader("Cache-Control", "public, max-age=86400, immutable");
    },
}));
// ── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
    res.json({ ok: true });
});
app.listen(PORT, () => {
    console.log(`Art Marketplace backend listening on port ${PORT}`);
});
