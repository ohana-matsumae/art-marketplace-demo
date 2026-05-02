import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Clock } from "lucide-react";
import Navbar from "../components/Navbar";
import ArtCard from "../components/ArtCard";
import UploadModal from "../components/UploadModal";
import BuySuccessModal from "../components/BuySuccessModal";
import { useListings } from "../hooks/useListings";
import { useWallet } from "../hooks/useWallet";
import { useBuyArt } from "../hooks/useBuyArt";
import styles from "./MainPage.module.css";

const SORT_OPTIONS = [
  { label: "Trending", icon: TrendingUp },
  { label: "Latest", icon: Clock },
];

const PAGE_SIZE = 12;

export default function MainPage() {
  const [sort, setSort] = useState("Trending");
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { listings, listingCount, isLoading } = useListings();
  const { isConnected } = useWallet();
  const { buy, isPending: isBuying, pendingId, error: buyError, clearError: clearBuyError, isSuccess: buySuccess, successListingId, clearSuccess } = useBuyArt();

  const handleBuy = (listingId: bigint) => {
    if (!isConnected) return;
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) return;
    void buy(listingId, listing.priceWei);
  };

  const filtered = listings.filter(
    (l) =>
      !search ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.seller.toLowerCase().includes(search.toLowerCase()),
  );

  const sorted = [...filtered].sort((a, b) =>
    sort === "Latest"
      ? Number(b.id - a.id)
      : Number(b.salesCount - a.salesCount),
  );

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  return (
    <div className={`min-h-screen ${styles.bgDark}`}>
      <Navbar onSearch={setSearch} />

      {/* Hero */}
      <div className={`relative overflow-hidden pt-16 ${styles.heroMinHeight}`}>
        <div className={`absolute inset-0 ${styles.heroGradient}`} />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute rounded-full ${styles.blobGold}`}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className={`absolute rounded-full ${styles.blobPurple}`}
        />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-xs font-semibold uppercase tracking-widest mb-3 ${styles.goldText}`}
            >
              Digital Art Marketplace
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className={`text-4xl md:text-5xl font-bold leading-tight ${styles.whiteText}`}
            >
              Explore
              <br />
              <span className={styles.goldText}>Digital Art</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26 }}
              className={`mt-4 text-base max-w-md ${styles.grayText}`}
            >
              Discover and collect extraordinary digital artworks from talented
              creators worldwide.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex md:flex-col gap-4 md:gap-6"
          >
            <div className="text-center md:text-right">
              <p className={`text-2xl font-bold ${styles.statValue}`}>
                {isLoading ? "…" : listingCount.toString()}
              </p>
              <p className={`text-xs ${styles.statLabel}`}>Artworks</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sort + Upload */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-1">
            {SORT_OPTIONS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => setSort(label)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                  sort === label ? styles.sortActive : styles.sortInactive
                }`}
              >
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>
          {isConnected && (
            <button
              onClick={() => setUploadOpen(true)}
              className="px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                background: "linear-gradient(135deg, #e8c547, #f0a030)",
                color: "#000",
              }}
            >
              + Upload Art
            </button>
          )}
        </div>
      </div>

      {/* Buy error banner */}
      {buyError && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-2 mb-2">
          <div className="flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{buyError}</p>
            <button onClick={clearBuyError} className="text-red-400 hover:opacity-70 text-xs shrink-0">Dismiss</button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        {isLoading ? (
          <div className={`text-center py-20 ${styles.grayTextLighter}`}>
            <p>Loading artworks…</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className={`text-center py-20 ${styles.grayTextLighter}`}>
            <p className="text-lg">No artworks found</p>
            {search && (
              <p className="text-sm mt-2">Try a different search</p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {paginated.map((listing, i) => (
                <ArtCard
                  key={listing.id.toString()}
                  listing={listing}
                  index={i}
                  onBuy={handleBuy}
                  isBuyPending={isBuying && pendingId === listing.id}
                />
              ))}
            </div>

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
      </div>

      <UploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} />
          <BuySuccessModal
            isOpen={buySuccess}
            listingId={successListingId}
            onClose={clearSuccess}
          />
    </div>
  );
}
