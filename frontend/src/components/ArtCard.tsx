import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatEther } from "viem";
import type { OnChainListing } from "../abi/ArtMarketplace";

function ZoomModal({
  open,
  imgSrc,
  onClose,
}: {
  open: boolean;
  imgSrc: string | null;
  onClose: () => void;
}) {
  if (!open || !imgSrc) return null;
  return (
    <div className="zoom-modal-overlay" onClick={onClose}>
      <div className="zoom-modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={imgSrc} alt="Zoomed artwork" className="zoom-modal-image" />
        <button className="zoom-modal-close" onClick={onClose}>
          &times;
        </button>
      </div>
    </div>
  );
}

interface ArtCardProps {
  listing: OnChainListing;
  /** Full-quality image URI revealed after purchase. Pass only for bought items. */
  fullImageURI?: string;
  index?: number;
  onBuy?: (listingId: bigint) => void;
  isBuyPending?: boolean;
}

export default function ArtCard({
  listing,
  fullImageURI,
  index = 0,
  onBuy,
  isBuyPending = false,
}: ArtCardProps) {
  const navigate = useNavigate();
  const [zoomOpen, setZoomOpen] = useState(false);

  const bought = !!fullImageURI;
  const displayImage = bought ? fullImageURI : listing.imageURIWatermarked;
  const sellerShort =
    listing.seller.slice(0, 6) + "…" + listing.seller.slice(-4);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.06 }}
        whileHover={{ y: -4 }}
        className="group relative rounded-2xl overflow-hidden flex flex-col cursor-pointer bg-[#111111] border border-[rgba(255,255,255,0.06)]"
        onClick={() => navigate(`/shop/${listing.seller}`)}
      >
        <div className="relative overflow-hidden group aspect-3/4">
          <img
            src={displayImage}
            alt={listing.title}
            className={
              bought
                ? "w-full h-full object-cover cursor-zoom-in"
                : "w-full h-full object-cover select-none pointer-events-none"
            }
            draggable={false}
            onClick={
              bought
                ? (e) => {
                    e.stopPropagation();
                    setZoomOpen(true);
                  }
                : undefined
            }
            tabIndex={bought ? 0 : -1}
          />
          {!bought && (
            <>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <span className="font-bold text-2xl tracking-wider text-white/20 drop-shadow-lg select-none">
                  PREVIEW
                </span>
              </div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-3 bg-linear-to-t from-black/60 to-transparent">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onBuy?.(listing.id);
                  }}
                  disabled={isBuyPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-linear-to-tr from-[#e8c547] to-[#f0a030] text-black disabled:opacity-70"
                >
                  {isBuyPending ? (
                    <Loader size={14} className="animate-spin" />
                  ) : (
                    <ShoppingCart size={14} />
                  )}
                  {isBuyPending ? "Buying…" : "Buy"}
                </motion.button>
              </div>
            </>
          )}
        </div>
        <div className="p-4 flex flex-col gap-2">
          <h3 className="font-semibold text-sm leading-snug text-[#f5f5f5]">
            {listing.title}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer text-xs text-[#888] font-mono"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/shop/${listing.seller}`);
              }}
            >
              {sellerShort}
            </span>
          </div>
          {listing.description && (
            <p className="text-xs text-[#aaa] line-clamp-2">{listing.description}</p>
          )}
          <div className="flex items-center mt-1">
            <div>
              <p className="text-xs text-[#666]">Price</p>
              <p className="font-bold text-sm text-[#e8c547]">
                {formatEther(listing.priceWei)} ETH
              </p>
            </div>
            {listing.assetCount > 0n && (
              <span className="ml-auto text-xs text-[#666]">
                +{listing.assetCount.toString()} file
                {listing.assetCount > 1n ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </motion.div>
      {bought && (
        <ZoomModal
          open={zoomOpen}
          imgSrc={displayImage}
          onClose={() => setZoomOpen(false)}
        />
      )}
    </>
  );
}
