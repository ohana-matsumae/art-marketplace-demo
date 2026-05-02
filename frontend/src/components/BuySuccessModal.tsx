import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Loader, CheckCircle } from "lucide-react";
import { BACKEND_URL } from "../lib/backend";
import { useBackendAuth } from "../hooks/useBackendAuth";

interface BuySuccessModalProps {
  isOpen: boolean;
  listingId: bigint | null;
  onClose: () => void;
  heading?: string;
  message?: string;
}

type ListingAssets = {
  token: string;
  assetCount: number;
  fullFileName: string;
  assetFileNames: string[];
};

async function triggerDownload(url: string, filename: string): Promise<void> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Download failed — try again.");

  const blob = await res.blob();
  const objUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objUrl);
}

export default function BuySuccessModal({
  isOpen,
  listingId,
  onClose,
  heading = "Purchase confirmed!",
  message =
    "Congratulations! You now own this artwork. Download your files below - they're available any time from your profile.",
}: BuySuccessModalProps) {
  const { ensureAuthenticated, isAuthenticating } = useBackendAuth();
  const [assets, setAssets] = useState<ListingAssets | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen || listingId === null) return;

    let cancelled = false;

    const loadAssets = async () => {
      setIsFetching(true);
      setFetchError(null);
      setAssets(null);

      try {
        await ensureAuthenticated();

        const res = await fetch(
          `${BACKEND_URL}/assets/listing/${listingId.toString()}`,
          {
            credentials: "include",
          },
        );

        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(body.error ?? "Could not load download links.");
        }

        const data = (await res.json()) as ListingAssets;
        if (!cancelled) setAssets(data);
      } catch (err: unknown) {
        if (!cancelled) {
          setFetchError(
            err instanceof Error ? err.message : "Could not load download links.",
          );
        }
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    };

    void loadAssets();

    return () => {
      cancelled = true;
    };
  }, [ensureAuthenticated, isOpen, listingId]);

  const handleDownload = async (index: number) => {
    if (!assets || listingId === null) return;
    const isMain = index === -1;
    const url = isMain
      ? `${BACKEND_URL}/assets/${assets.token}/full`
      : `${BACKEND_URL}/assets/${assets.token}/extra/${index}`;
    const filename = isMain
      ? assets.fullFileName
      : assets.assetFileNames[index] ?? `asset-${index + 1}.bin`;

    setDownloadingIndex(index);
    try {
      await ensureAuthenticated();
      await triggerDownload(url, filename);
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : "Download failed.");
    } finally {
      setDownloadingIndex(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: "#111111",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-[#e8c547]" />
                <h2 className="font-semibold text-base text-[#f5f5f5]">
                  {heading}
                </h2>
              </div>
              <motion.button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/8 transition-colors text-[#888]"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                aria-label="Close"
              >
                <X size={18} />
              </motion.button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <p className="text-sm text-[#bbb]">
                {message}
              </p>

              {isFetching && (
                <div className="flex items-center gap-2 text-sm text-[#888]">
                  <Loader size={14} className="animate-spin" />
                  {isAuthenticating
                    ? "Checking wallet session…"
                    : "Loading download links…"}
                </div>
              )}

              {fetchError && (
                <p className="text-xs text-red-400 rounded-lg px-3 py-2 bg-red-400/10">
                  {fetchError}
                </p>
              )}

              {assets && (
                <div className="flex flex-col gap-2">
                  {/* Full-quality main image */}
                  <button
                    onClick={() => void handleDownload(-1)}
                    disabled={downloadingIndex !== null || isAuthenticating}
                    className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all disabled:opacity-60"
                    style={{
                      background: "rgba(232,197,71,0.08)",
                      border: "1px solid rgba(232,197,71,0.2)",
                      color: "#e8c547",
                    }}
                  >
                    <span>Full-quality artwork</span>
                    {downloadingIndex === -1 ? (
                      <Loader size={14} className="animate-spin" />
                    ) : (
                      <Download size={14} />
                    )}
                  </button>

                  {/* Extra source files */}
                  {Array.from({ length: assets.assetCount }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => void handleDownload(i)}
                      disabled={downloadingIndex !== null || isAuthenticating}
                      className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all disabled:opacity-60"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#ccc",
                      }}
                    >
                      <span>Source file {i + 1}</span>
                      {downloadingIndex === i ? (
                        <Loader size={14} className="animate-spin" />
                      ) : (
                        <Download size={14} />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={onClose}
                className="mt-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{
                  background: "linear-gradient(135deg, #e8c547, #f0a030)",
                  color: "#000",
                }}
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
