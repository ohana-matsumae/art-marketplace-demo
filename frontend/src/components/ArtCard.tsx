import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ArtPiece } from "../data/mockData";
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
  art: ArtPiece;
  index?: number;
  bought?: boolean;
}

export default function ArtCard({
  art,
  index = 0,
  bought = false,
}: ArtCardProps) {
  const navigate = useNavigate();

  const [zoomOpen, setZoomOpen] = useState(false);
  const datePosted = "April 2026";
  const description =
    "This is a sample description for the artwork. Replace with real description if available.";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.06 }}
        whileHover={{ y: -4 }}
        className="group relative rounded-2xl overflow-hidden flex flex-col cursor-pointer bg-[#111111] border border-[rgba(255,255,255,0.06)]"
        onClick={() => navigate(`/shop/${art.seller.id}`)}
      >
        <div className="relative overflow-hidden group aspect-3/4">
          <img
            src={art.image}
            alt={art.title}
            className={
              bought
                ? "w-full h-full object-cover cursor-zoom-in"
                : "w-full h-full object-cover blur-[2px] grayscale brightness-80 select-none pointer-events-none"
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
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-linear-to-tr from-[#e8c547] to-[#f0a030] text-black"
                >
                  <ShoppingCart size={14} /> Buy
                </motion.button>
              </div>
            </>
          )}
        </div>
        <div className="p-4 flex flex-col gap-2">
          <h3 className="font-semibold text-sm leading-snug text-[#f5f5f5]">
            {art.title}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/shop/${art.seller.id}`);
              }}
            >
              <img
                src={art.seller.avatar}
                alt={art.seller.displayName}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="text-xs text-[#888]">
                {art.seller.displayName}
              </span>
            </span>
            <span className="text-xs ml-2 text-[#666]">{datePosted}</span>
          </div>
          <p className="text-xs text-[#aaa]">{description}</p>
          <div className="flex items-center mt-1">
            <div>
              <p className="text-xs text-[#666]">Price</p>
              <p className="font-bold text-sm text-[#e8c547]">
                ${art.price} USD
              </p>
            </div>
          </div>
        </div>
      </motion.div>
      {bought && (
        <ZoomModal
          open={zoomOpen}
          imgSrc={art.image}
          onClose={() => setZoomOpen(false)}
        />
      )}
    </>
  );
}
