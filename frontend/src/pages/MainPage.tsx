import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Clock, Sparkles, SlidersHorizontal } from "lucide-react";
import Navbar from "../components/Navbar";
import ArtCard from "../components/ArtCard";
import UploadModal from "../components/UploadModal";
import { MOCK_ARTWORKS, CATEGORIES } from "../data/mockData";
import styles from "./MainPage.module.css";

const SORT_OPTIONS = [
  { label: "Trending", icon: TrendingUp },
  { label: "Latest", icon: Clock },
  { label: "Featured", icon: Sparkles },
];

export default function MainPage() {
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Trending");
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const filtered = MOCK_ARTWORKS.filter((art) => {
    const matchCat =
      category === "All" ||
      art.tags.some((t) => t.toLowerCase() === category.toLowerCase());
    const matchSearch =
      !search ||
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      art.seller.displayName.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "Latest") return a.isNew ? -1 : 1;
    if (sort === "Featured") return a.isFeatured ? -1 : 1;
    return b.likes - a.likes;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  return (
    <div className={`min-h-screen ${styles.bgDark}`}>
      <Navbar onSearch={setSearch} />

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
            {[
              { label: "Artworks", value: "12K+" },
              { label: "Artists", value: "3.4K+" },
              { label: "Users", value: "10K+" },
            ].map(({ label, value }) => (
              <div key={label} className="text-center md:text-right">
                <p className={`text-2xl font-bold ${styles.statValue}`}>
                  {value}
                </p>
                <p className={`text-xs ${styles.statLabel}`}>{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm transition-all font-medium ${category === cat ? styles.categoryActive : styles.categoryInactive}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className={styles.grayTextLight} />
            <div className="flex gap-1">
              {SORT_OPTIONS.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => setSort(label)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${sort === label ? styles.sortActive : styles.sortInactive}`}
                >
                  <Icon size={12} /> {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        {sorted.length === 0 ? (
          <div className={`text-center py-20 ${styles.grayTextLighter}`}>
            <p className="text-lg">No artworks found</p>
            <p className="text-sm mt-2">Try a different search or category</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {paginated.map((art, i) => (
                <ArtCard key={art.id} art={art} index={i} bought={false} />
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
      </div>

      <UploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
}
