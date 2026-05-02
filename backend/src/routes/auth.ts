import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { recoverMessageAddress } from "viem";

const router = Router();

const NONCE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function buildSignMessage(nonce: string): string {
  return `Sign in to Art Marketplace\n\nNonce: ${nonce}`;
}

/**
 * GET /auth/nonce
 * Issue a fresh nonce that the client must include when signing.
 */
router.get("/nonce", (req, res) => {
  const nonce = uuidv4();
  req.session.nonce = nonce;
  req.session.nonceIssuedAt = Date.now();
  res.json({ nonce, message: buildSignMessage(nonce) });
});

/**
 * POST /auth/verify
 * Body: { signature: "0x..." }
 *
 * The client signs the exact message returned by GET /auth/nonce and
 * sends back the hex signature. We recover the signer address using viem
 * and set it in the session.
 */
router.post("/verify", async (req, res) => {
  const { signature } = req.body as { signature?: string };

  if (!signature || !signature.startsWith("0x")) {
    res.status(400).json({ error: "signature (0x hex string) required" });
    return;
  }

  const { nonce, nonceIssuedAt } = req.session;
  if (!nonce || !nonceIssuedAt) {
    res.status(400).json({ error: "No active nonce — call GET /auth/nonce first" });
    return;
  }
  if (Date.now() - nonceIssuedAt > NONCE_TTL_MS) {
    req.session.nonce = undefined;
    req.session.nonceIssuedAt = undefined;
    res.status(400).json({ error: "Nonce expired — request a new one" });
    return;
  }

  try {
    const address = await recoverMessageAddress({
      message: buildSignMessage(nonce),
      signature: signature as `0x${string}`,
    });

    // Consume nonce so it can't be reused
    req.session.nonce = undefined;
    req.session.nonceIssuedAt = undefined;
    req.session.walletAddress = address.toLowerCase();

    res.json({ address: req.session.walletAddress });
  } catch {
    res.status(401).json({ error: "Invalid signature" });
  }
});

/**
 * GET /auth/me
 * Returns the currently authenticated wallet address.
 */
router.get("/me", (req, res) => {
  if (!req.session.walletAddress) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({ address: req.session.walletAddress });
});

/**
 * DELETE /auth/logout
 */
router.delete("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

export default router;
