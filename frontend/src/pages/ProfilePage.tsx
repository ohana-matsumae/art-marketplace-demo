import React, { useState } from "react";

function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#181818] rounded-2xl p-6 w-full max-w-md relative shadow-lg">
        <button
          className="absolute top-3 right-3 text-[#aaa] hover:text-[#e8c547] text-xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
import { motion } from "framer-motion";
import { BadgeCheck, Heart, Settings, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import ArtCard from "../components/ArtCard";

import styles from "./ProfilePage.module.css";
import { CURRENT_USER, MOCK_ARTWORKS, CATEGORIES } from "../data/mockData";

function ProfilePage() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [bio, setBio] = useState(CURRENT_USER.bio || "");
  const [showModal, setShowModal] = useState(false);
  const [bioInput, setBioInput] = useState(bio);
  const handleSaveBio = () => {
    setBio(bioInput.trim());
    setShowModal(false);
  };

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  return (
    <div className={`min-h-screen ${styles.profilePageBg}`}>
      <Navbar />

      <div className="pt-16">
        <div className="relative h-48 md:h-64 overflow-hidden">
          <img
            src={CURRENT_USER.coverImage}
            alt="cover"
            className="w-full h-full object-cover"
          />
          <div
            className={`absolute inset-0 ${styles.profilePageCoverGradient}`}
          />
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
            <img
              src={CURRENT_USER.avatar}
              alt={CURRENT_USER.displayName}
              className={`w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover ${styles.profilePageAvatar}`}
            />
            {CURRENT_USER.isVerified && (
              <div
                className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center ${styles.profilePageVerified}`}
              >
                <BadgeCheck size={20} style={{ color: "#e8c547" }} />
              </div>
            )}
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1
                className={`text-2xl font-bold ${styles.profilePageDisplayName}`}
              >
                {CURRENT_USER.displayName}
              </h1>
              <span className={`text-sm ${styles.profilePageUsername}`}>
                @{CURRENT_USER.username}
              </span>
            </div>
            <div className="flex items-center mt-2 gap-1 max-w-lg">
              {bio ? (
                <p className={`text-sm flex-1 ${styles.profilePageBio}`}>
                  {bio}
                </p>
              ) : (
                <p className="text-sm flex-1 italic text-[#888]">
                  No author description yet.
                </p>
              )}
              <button
                className="ml-2 p-1 rounded-full hover:bg-[#232323] transition-colors border border-transparent hover:border-[#e8c547]"
                title={bio ? "Edit description" : "Tell about yourself"}
                onClick={() => {
                  setBioInput(bio);
                  setShowModal(true);
                }}
                aria-label={bio ? "Edit description" : "Tell about yourself"}
              >
                <Pencil size={16} className="text-[#e8c547]" />
              </button>
            </div>

            <Modal open={showModal} onClose={() => setShowModal(false)}>
              <h3 className="text-lg font-semibold mb-2 text-[#e8c547]">
                {bio
                  ? "Edit your author description"
                  : "Tell about yourself as an author"}
              </h3>
              <textarea
                className="w-full min-h-20 rounded-lg p-2 bg-[#232323] text-[#f5f5f5] border border-[#444] focus:border-[#e8c547] outline-none resize-none mb-4"
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                maxLength={300}
                placeholder="Describe yourself as an author..."
              />
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-1.5 rounded-full text-sm font-medium bg-[#232323] text-[#aaa] hover:bg-[#333] border border-[#444]"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-1.5 rounded-full text-sm font-medium bg-[#e8c547] text-black hover:bg-[#f0a030] border border-[#e8c547]"
                  onClick={handleSaveBio}
                  disabled={!bioInput.trim()}
                >
                  Save
                </button>
              </div>
            </Modal>
            <p className={`mt-1.5 text-xs ${styles.profilePageJoined}`}>
              Member since {CURRENT_USER.joinedDate}
            </p>
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

        {/* Art Bought Title and Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-5">
          <h2 className={`text-xl font-semibold ${styles.profilePageArtTitle}`}>
            Art Bought
          </h2>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat ? "bg-[#e8c547] text-black" : "bg-[#232323] text-[#aaa] hover:bg-[#333]"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Art grid (filtered by category) with pagination */}
        <div className="pb-16">
          {(() => {
            const boughtArt = MOCK_ARTWORKS.filter(
              (a) => a.seller.id !== CURRENT_USER.id,
            );
            const filtered =
              activeCategory === "All"
                ? boughtArt
                : boughtArt.filter((a) =>
                    a.tags
                      .map((t) => t.toLowerCase())
                      .includes(activeCategory.toLowerCase()),
                  );
            const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
            const paginated = filtered.slice(
              (page - 1) * PAGE_SIZE,
              page * PAGE_SIZE,
            );
            const handlePageChange = (newPage: number) => {
              if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
            };
            if (filtered.length === 0) {
              return (
                <div className={`text-center py-16 ${styles.profilePageNoArt}`}>
                  <Heart size={32} className="mx-auto mb-3 opacity-40" />
                  <p>No artworks here yet</p>
                </div>
              );
            }
            return (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {paginated.map((art, i) => (
                    <ArtCard key={art.id} art={art} index={i} bought />
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
            );
          })()}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
