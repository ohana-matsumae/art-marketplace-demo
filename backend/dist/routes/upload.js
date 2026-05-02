import { Router } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "../middleware/requireAuth.js";
import { processImage, storeAsset } from "../services/watermark.js";
import { saveEntry, getEntry, registerListing } from "../store/fileStore.js";
const router = Router();
// Sellers can upload at most 20 times per hour.
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Upload rate limit exceeded — try again later" },
});
const ALLOWED_IMAGE_MIMES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);
const ALLOWED_ASSET_MIMES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/vnd.adobe.photoshop",
    "application/octet-stream", // PSD files often arrive as this
    "application/zip",
    "application/x-zip-compressed",
]);
const MAX_IMAGE_BYTES = 30 * 1024 * 1024; // 30 MB
const MAX_ASSET_BYTES = 200 * 1024 * 1024; // 200 MB
// Single multer instance — validation is done per field below.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        files: 11, // 1 image + up to 10 assets
        fileSize: MAX_ASSET_BYTES,
    },
});
const fieldsMiddleware = upload.fields([
    { name: "image", maxCount: 1 },
    { name: "assets", maxCount: 10 },
]);
/** Wrap multer's callback-based middleware into a promise. */
function runMulter(req, res) {
    return new Promise((resolve, reject) => {
        fieldsMiddleware(req, res, (err) => (err ? reject(err) : resolve()));
    });
}
/**
 * POST /upload
 * Multipart form fields:
 *   image   (required)  — primary artwork image
 *   assets  (optional)  — additional source files (PSD, ASE, PNG, ZIP, …)
 *
 * Response:
 *   uploadToken  — UUID to pass to POST /upload/:token/register after the tx
 *   publicURI    — URL of the watermarked preview (always public)
 *   fullURI      — URL of the full-quality image (buyer-gated)
 *   assetURIs    — URLs of additional files (buyer-gated)
 */
router.post("/", requireAuth, uploadLimiter, async (req, res) => {
    try {
        await runMulter(req, res);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
        return;
    }
    const files = req.files;
    const imageFile = files?.["image"]?.[0];
    if (!imageFile) {
        res.status(400).json({ error: "image field is required" });
        return;
    }
    if (!ALLOWED_IMAGE_MIMES.has(imageFile.mimetype)) {
        res.status(400).json({ error: `Unsupported image type: ${imageFile.mimetype}` });
        return;
    }
    if (imageFile.size > MAX_IMAGE_BYTES) {
        res.status(400).json({ error: "Image exceeds 30 MB limit" });
        return;
    }
    const backendUrl = process.env.BACKEND_URL ?? `http://localhost:${process.env.BACKEND_PORT ?? 3001}`;
    const sellerAddress = req.session.walletAddress;
    const uploadToken = uuidv4();
    // Process primary image — creates watermarked preview + stores original
    let publicFile;
    let privateFile;
    try {
        ({ publicFile, privateFile } = await processImage(imageFile.buffer, imageFile.originalname));
    }
    catch (err) {
        res.status(422).json({ error: `Failed to process image: ${err.message}` });
        return;
    }
    // Store additional assets
    const assetFiles = [];
    const rawAssets = files?.["assets"] ?? [];
    for (const asset of rawAssets) {
        if (!ALLOWED_ASSET_MIMES.has(asset.mimetype)) {
            res.status(400).json({ error: `Unsupported asset type: ${asset.mimetype}` });
            return;
        }
        assetFiles.push(await storeAsset(asset.buffer, asset.originalname));
    }
    await saveEntry({
        uploadToken,
        sellerAddress,
        publicFile,
        privateFile,
        assetFiles,
        createdAt: Date.now(),
    });
    res.status(201).json({
        uploadToken,
        publicURI: `${backendUrl}/public/${publicFile}`,
        fullURI: `${backendUrl}/assets/${uploadToken}/full`,
        assetURIs: assetFiles.map((_, i) => `${backendUrl}/assets/${uploadToken}/extra/${i}`),
    });
});
/**
 * POST /upload/:token/register
 * After the on-chain `uploadArt` tx confirms, the seller calls this endpoint
 * to bind the upload token to the resulting listing ID so gated-access checks
 * know which listing to query.
 *
 * Body: { listingId: "42" }  (decimal string)
 */
router.post("/:token/register", requireAuth, async (req, res) => {
    const token = req.params["token"];
    const { listingId } = req.body;
    if (typeof listingId !== "string" || !/^\d+$/.test(listingId)) {
        res.status(400).json({ error: "listingId must be a decimal string" });
        return;
    }
    const entry = await getEntry(token);
    if (!entry) {
        res.status(404).json({ error: "Upload token not found" });
        return;
    }
    if (entry.sellerAddress !== req.session.walletAddress) {
        res.status(403).json({ error: "Forbidden" });
        return;
    }
    if (entry.listingId) {
        res.status(409).json({ error: "Token is already registered to a listing" });
        return;
    }
    const ok = await registerListing(token, listingId);
    res.json({ ok });
});
export default router;
