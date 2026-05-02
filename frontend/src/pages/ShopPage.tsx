import { useParams, Link } from "react-router-dom";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, ArrowLeft, Plus, Loader } from "lucide-react";
import Navbar from "../components/Navbar";
import UploadModal from "../components/UploadModal";
import BuySuccessModal from "../components/BuySuccessModal";
import ArtCard from "../components/ArtCard";
import { useSellerListings } from "../hooks/useListings";
import { useProfile } from "../hooks/useProfile";
import { useWallet } from "../hooks/useWallet";
import { useBuyArt } from "../hooks/useBuyArt";
import styles from "./ProfilePage.module.css";

const CONTRACT_ADDRESS = import.meta.env
  .VITE_CONTRACT_ADDRESS as `0x${string}`;

// CONTRACT_ADDRESS kept for future use
void CONTRACT_ADDRESS;

interface ShopPageProps {
  /** When true, shows this wallet's own shop (manage-shop route). */
  isOwner?: boolean;
}

const PAGE_SIZE = 12;

const ShopPage: React.FC<ShopPageProps> = ({ isOwner: isOwnerProp }) => {
  const { sellerAddress: urlAddress } = useParams<{ sellerAddress?: string }>();
  const { address: walletAddress } = useWallet();

  // When on /manage-shop, show the connected wallet's shop.
  const sellerAddress = isOwnerProp
    ? walletAddress
    : (urlAddress as `0x${string}` | undefined);

  const isOwner =
    isOwnerProp ||
    (!!walletAddress &&
      !!sellerAddress &&
      walletAddress.toLowerCase() === sellerAddress.toLowerCase());

  const [uploadOpen, setUploadOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { listings, isLoading } = useSellerListings(sellerAddress);
  const { profile } = useProfile(sellerAddress);
  const { buy, isPending: isBuying, pendingId, error: buyError, clearError: clearBuyError, isSuccess: buySuccess, successListingId, clearSuccess } = useBuyArt();

  const totalPages = Math.ceil(listings.length / PAGE_SIZE);
  const paginated = listings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const handleBuy = (listingId: bigint) => {
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) return;
    void buy(listingId, listing.priceWei);
  };

  const displayName =
    profile?.username ||
    (sellerAddress
      ? sellerAddress.slice(0, 6) + "…" + sellerAddress.slice(-4)
      : "…");

  // Banner: most-sold listing's watermarked image
  const bannerListing =
    listings.length > 0
      ? listings.reduce((best, l) =>
          l.salesCount > best.salesCount ? l : best,
        )
      : null;

  if (isOwnerProp && !walletAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Navbar />
        <p className="text-[#888] mt-16">Connect your wallet to manage your shop.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="pt-16">
        {bannerListing ? (
          <div className="relative h-60 md:h-80 overflow-hidden">
            <motion.img
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7 }}
              src={bannerListing.imageURIWatermarked}
              alt="Cover Art"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-linear-to-b from-black/90 via-black/80 to-black/95" />
            <Link
              to="/"
              className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-full text-sm hover:bg-white/10 transition-colors bg-black/50 text-gray-300 backdrop-blur"
            >
              <ArrowLeft size={14} /> Explore
            </Link>
          </div>
        ) : (
          <div className="relative h-60 md:h-80 bg-[#111]">
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
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={`relative shrink-0 ${styles.shopProfilePhotoContainer}`}
          >
            {profile?.avatarURI ? (
              <img
                src={profile.avatarURI}
                alt={displayName}
                className={`w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover ${styles.shopProfileAvatarDisplay}`}
              />
            ) : (
              <div
                className="w-24 h-24 md:w-28 md:h-28 rounded-2xl flex items-center justify-center text-2xl font-bold"
                style={{ background: "#1a1a1a", color: "#e8c547" }}
              >
                {sellerAddress ? sellerAddress.slice(2, 4).toUpperCase() : "?"}
              </div>
            )}
            {profile && (
              <div
                className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center ${styles.verifiedBadgeBg ?? ""}`}
                style={{ background: "#0a0a0a" }}
              >
                <BadgeCheck size={20} style={{ color: "#e8c547" }} />
              </div>
            )}
          </motion.div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white">{displayName}</h1>
            <p className={`text-xs font-mono mt-1 ${styles.username ?? "text-[#666]"}`}>
              {sellerAddress}
            </p>
          </div>

          {isOwner && (
            <div className="flex gap-2 shrink-0">
              <motion.button
                whileHover={{ scale: 1.08, boxShadow: "0 0 16px 0 #e8c547" }}
                whileTap={{ scale: 0.96 }}
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

        <div className="flex items-center justify-between py-6">
          <h2 className="text-lg font-semibold text-gray-100">
            Artworks
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({listings.length})
            </span>
          </h2>
        </div>

        {buyError && (
          <div className="flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 mb-4 bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{buyError}</p>
            <button onClick={clearBuyError} className="text-red-400 hover:opacity-70 text-xs shrink-0">Dismiss</button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader size={24} className="animate-spin text-[#e8c547]" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>No artworks listed yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-16">
              {paginated.map((listing, i) => (
                <ArtCard
                  key={listing.id.toString()}
                  listing={listing}
                  index={i}
                  onBuy={isOwner ? undefined : handleBuy}
                  isBuyPending={isBuying && pendingId === listing.id}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2 pb-8">
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
                    className={`px-3 py-1 rounded ${
                      page === idx + 1
                        ? "bg-[#e8c547] text-black"
                        : "bg-[#232323] text-[#aaa] hover:bg-[#e8c547] hover:text-black"
                    } transition`}
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

        {isOwner && (
          <UploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} />
        )}
        <BuySuccessModal
          isOpen={buySuccess}
          listingId={successListingId}
          onClose={clearSuccess}
        />
      </div>
    </div>
  );
};

export default ShopPage;

