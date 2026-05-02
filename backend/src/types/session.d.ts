// Augments express-session's SessionData so all request handlers share typed session fields.
import "express-session";

declare module "express-session" {
  interface SessionData {
    /** Lowercased hex address of the authenticated wallet. */
    walletAddress?: string;
    /** One-time nonce sent to the client for signing. */
    nonce?: string;
    /** Unix ms timestamp when the nonce was issued (for expiry checks). */
    nonceIssuedAt?: number;
  }
}
