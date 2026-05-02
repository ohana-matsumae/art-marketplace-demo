export function requireAuth(req, res, next) {
    if (!req.session.walletAddress) {
        res.status(401).json({ error: "Not authenticated" });
        return;
    }
    next();
}
