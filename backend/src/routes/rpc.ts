import { Router } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../config.js";

const router = Router();

const rpcLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "RPC proxy rate limit exceeded" },
});

const ALLOWED_PREFIXES = ["eth_", "net_", "web3_"];

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: number | string | null;
  method?: string;
  params?: unknown;
};

function isValidRequest(req: JsonRpcRequest): req is Required<Pick<JsonRpcRequest, "method">> & JsonRpcRequest {
  const method = req?.method;
  return (
    typeof req === "object" &&
    req !== null &&
    typeof method === "string" &&
    ALLOWED_PREFIXES.some((prefix) => method.startsWith(prefix))
  );
}

router.post("/", rpcLimiter, async (req, res) => {
  if (!env.RPC_URL) {
    res.status(500).json({ error: "RPC_URL is not configured on backend" });
    return;
  }

  const body = req.body as JsonRpcRequest | JsonRpcRequest[];
  const requests = Array.isArray(body) ? body : [body];

  if (requests.length === 0 || !requests.every(isValidRequest)) {
    res.status(400).json({
      error: "Invalid JSON-RPC payload or method not allowed",
      allowedPrefixes: ALLOWED_PREFIXES,
    });
    return;
  }

  try {
    const upstream = await fetch(env.RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader("Content-Type", "application/json");
    res.send(text);
  } catch {
    res.status(502).json({ error: "Failed to reach upstream RPC" });
  }
});

export default router;
