import { useParams, Link } from "react-router-dom";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, ArrowLeft, Plus } from "lucide-react";
import Navbar from "../components/Navbar";
import UploadModal from "../components/UploadModal";
import { MOCK_ARTWORKS, CURRENT_USER } from "../data/mockData";
import ArtCard from "../components/ArtCard";
import styles from "./ProfilePage.module.css";

interface ShopPageProps {
  sellerId?: string;
}

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
    <div
      className="fixed inset-0 z-1000 bg-black/70 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative bg-[#181818] rounded-3xl p-6 shadow-2xl max-w-[90vw] max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imgSrc}
          alt="Zoomed artwork"
          className="max-w-[70vw] max-h-[70vh] rounded-xl shadow-lg"
        />
        <button
          className="absolute top-2 right-4 text-3xl text-white hover:text-yellow-400 transition-colors bg-transparent border-none cursor-pointer"
          onClick={onClose}
        >
          &times;
        </button>
      </div>
    </div>
  );
}

const ShopPage: React.FC<ShopPageProps> = (props) => {
  const { sellerId: urlSellerId } = useParams<{ sellerId?: string }>();
  const sellerId = props.sellerId || urlSellerId;
  const [uploadOpen, setUploadOpen] = useState(false);

  const [page, setPage] = useState<number>(1);
  const PAGE_SIZE = 12;
  const artworks = sellerId
    ? MOCK_ARTWORKS.filter((a) => a.seller.id === sellerId)
    : MOCK_ARTWORKS;
  const totalPages = Math.ceil(artworks.length / PAGE_SIZE);
  const paginated = artworks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const seller = sellerId ? artworks[0]?.seller : null;
  const isOwner = seller && seller.id === CURRENT_USER.id;

  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);

  if (sellerId && !seller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Navbar />
        <div className="text-center mt-16">
          <p className="text-lg text-gray-500">Shop not found</p>
          <Link to="/" className="mt-4 inline-block text-sm text-yellow-400">
            ← Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="pt-16">
        {/* Most sold art as cover photo */}
        {seller && artworks.length > 0 ? (
          <div className="relative h-60 md:h-80 overflow-hidden">
            <motion.img
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7 }}
              src={
                artworks.reduce(
                  (max, a) =>
                    a.seller.totalSales > max.seller.totalSales ? a : max,
                  artworks[0],
                ).image
              }
              alt="Cover Art"
              className="w-full h-full object-cover object-center"
            />
            {/* Strong dark overlay for text readability */}
            <div className="absolute inset-0 bg-linear-to-b from-black/90 via-black/80 to-black/95"></div>
            <Link
              to="/"
              className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-full text-sm hover:bg-white/10 transition-colors bg-black/50 text-gray-300 backdrop-blur"
            >
              <ArrowLeft size={14} /> Explore
            </Link>
          </div>
        ) : (
          <div className="relative h-60 md:h-80 overflow-hidden bg-gray-200">
            <Link
              to="/"
              className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-full text-sm hover:bg-white/10 transition-colors bg-black/50 text-gray-300 backdrop-blur"
            >
              <ArrowLeft size={14} /> Explore
            </Link>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="relative flex flex-col sm:flex-row items-start sm:items-end gap-6 pb-8 border-b border-white/10">
          {seller && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={`relative shrink-0 ${styles.shopProfilePhotoContainer}`}
            >
              <img
                src={seller.avatar}
                alt={seller.displayName}
                className={`w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover ${styles.profileAvatar} ${styles.shopProfileAvatarDisplay}`}
              />
              {seller.isVerified && (
                <div
                  className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center ${styles.verifiedBadgeBg}`}
                >
                  <BadgeCheck size={20} style={{ color: "#e8c547" }} />
                </div>
              )}
            </motion.div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl font-bold text-white">
                {seller?.displayName}
              </h1>
              <span className={`text-sm ${styles.username}`}>
                @{seller?.username}
              </span>
            </div>
            <p className={`mt-2 text-sm max-w-lg ${styles.bio}`}>
              {seller?.bio}
            </p>
            <p className={`mt-1.5 text-xs ${styles.memberSince}`}>
              Member since {seller?.joinedDate}
            </p>
          </div>
          {/* Upload Art button right-aligned */}
          {isOwner && (
            <div className="flex gap-2 shrink-0 mt-4 sm:mt-0">
              <motion.button
                whileHover={{ scale: 1.08, boxShadow: "0 0 16px 0 #e8c547" }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 350, damping: 18 }}
                onClick={() => setUploadOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #e8c547, #f0a030)",
                  color: "#000",
                }}
              >
                <Plus size={16} /> Upload Art
              </motion.button>
            </div>
          )}
        </div>

        {/* Section title */}
        <div className="flex items-center justify-between py-6">
          <h2 className="text-lg font-semibold text-gray-100">
            Artworks
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({artworks.length})
            </span>
          </h2>
        </div>

        {/* Art grid with management controls for owner and pagination */}
        {artworks.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>This artist hasn't listed any works yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-16">
              {paginated.map((art, i) => (
                <ArtCard key={art.id} art={art} index={i} bought={!!isOwner} />
              ))}
            </div>
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <button
                  className="px-3 py-1 rounded bg-[#232323] text-[#aaa] hover:bg-[#e8c547] hover:text-black transition"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, idx) => (
                  <button
                    key={idx + 1}
                    className={`px-3 py-1 rounded ${page === idx + 1 ? "bg-[#e8c547] text-black" : "bg-[#232323] text-[#aaa] hover:bg-[#e8c547] hover:text-black"} transition`}
                    onClick={() => handlePageChange(idx + 1)}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  className="px-3 py-1 rounded bg-[#232323] text-[#aaa] hover:bg-[#e8c547] hover:text-black transition"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        <ZoomModal
          open={zoomedIndex !== null}
          imgSrc={zoomedIndex !== null ? artworks[zoomedIndex].image : null}
          onClose={() => setZoomedIndex(null)}
        />
        {isOwner && (
          <UploadModal
            isOpen={uploadOpen}
            onClose={() => setUploadOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ShopPage;
