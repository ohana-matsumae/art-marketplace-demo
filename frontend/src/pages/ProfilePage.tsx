import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Heart, Loader, Download } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import ArtCard from "../components/ArtCard";
import BuySuccessModal from "../components/BuySuccessModal";
import { useWallet } from "../hooks/useWallet";
import { useProfile } from "../hooks/useProfile";
import { useBuyerPurchases } from "../hooks/useListings";
import styles from "./ProfilePage.module.css";

function ProfilePage() {
  const [downloadListingId, setDownloadListingId] = useState<bigint | null>(null);
  const { address, isConnected, connectWallet } = useWallet();
  const { profile, isLoading: profileLoading } = useProfile(address);
  const { listings: boughtListings, isLoading: purchasesLoading } =
    useBuyerPurchases(address);

  const isLoading = profileLoading || purchasesLoading;

  if (!isConnected) {
    return (
      <div className={`min-h-screen ${styles.profilePageBg}`}>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <p className="text-[#888] text-base">Connect your wallet to view your profile.</p>
          <button
            onClick={connectWallet}
            className="px-6 py-3 rounded-full text-sm font-semibold"
            style={{
              background: "linear-gradient(135deg, #e8c547, #f0a030)",
              color: "#000",
            }}
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  const displayName = profile?.username || (address ? address.slice(0, 10) + "…" : "");
  const avatarURI = profile?.avatarURI || null;

  return (
    <div className={`min-h-screen ${styles.profilePageBg}`}>
      <Navbar />

      <div className="pt-16">
        {/* Cover placeholder */}
        <div className="relative h-48 md:h-64 overflow-hidden bg-[#111]">
          <div className={`absolute inset-0 ${styles.profilePageCoverGradient}`} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <div
          className={`relative -mt-16 flex flex-col sm:flex-row items-start sm:items-end gap-4 pb-6 ${styles.profilePageHeader}`}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="relative shrink-0"
          >
            {avatarURI ? (
              <img
                src={avatarURI}
                alt={displayName}
                className={`w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover ${styles.profilePageAvatar}`}
              />
            ) : (
              <div
                className={`w-24 h-24 md:w-28 md:h-28 rounded-2xl flex items-center justify-center text-3xl font-bold ${styles.profilePageAvatar}`}
                style={{ background: "#1a1a1a", color: "#e8c547" }}
              >
                {address ? address.slice(2, 4).toUpperCase() : "?"}
              </div>
            )}
          </motion.div>

          <div className="flex-1 min-w-0">
            <h1 className={`text-2xl font-bold ${styles.profilePageDisplayName}`}>
              {displayName}
            </h1>
            <p className={`text-xs font-mono mt-1 ${styles.profilePageUsername}`}>
              {address}
            </p>
            {!profile && !profileLoading && (
              <p className="text-xs text-[#888] mt-1 italic">
                No on-chain profile yet. Visit Manage Shop to register.
              </p>
            )}
          </div>

          <div className="flex gap-2 shrink-0">
            <Link to="/manage-shop">
              <motion.button
                whileHover={{ scale: 1.08, boxShadow: "0 0 16px 0 #e8c547" }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 350, damping: 18 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold"
                style={{
                  background: "linear-gradient(135deg, #e8c547, #f0a030)",
                  color: "#000",
                }}
              >
                <Settings size={14} /> Manage Shop
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Art Bought */}
        <div className="py-5">
          <h2 className={`text-xl font-semibold mb-6 ${styles.profilePageArtTitle}`}>
            Art Bought
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader size={24} className="animate-spin text-[#e8c547]" />
            </div>
          ) : boughtListings.length === 0 ? (
            <div className={`text-center py-16 ${styles.profilePageNoArt}`}>
              <Heart size={32} className="mx-auto mb-3 opacity-40" />
              <p>No artworks purchased yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-16">
              {boughtListings.map((listing, i) => (
                <div key={listing.id.toString()} className="flex flex-col gap-2">
                  <ArtCard
                    listing={listing}
                    // Full image URI is fetched separately per-listing when needed;
                    // passing imageURIWatermarked as placeholder keeps the grid
                    // rendering without additional per-card RPC calls.
                    fullImageURI={listing.imageURIWatermarked}
                    index={i}
                  />
                  <button
                    type="button"
                    onClick={() => setDownloadListingId(listing.id)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90"
                    style={{
                      background: "rgba(232, 197, 71, 0.12)",
                      border: "1px solid rgba(232, 197, 71, 0.24)",
                      color: "#e8c547",
                    }}
                  >
                    <Download size={13} />
                    Re-download files
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BuySuccessModal
        isOpen={downloadListingId !== null}
        listingId={downloadListingId}
        onClose={() => setDownloadListingId(null)}
        heading="Your purchased files"
        message="Download your full-quality artwork and source files again any time."
      />
    </div>
  );
}

export default ProfilePage;
