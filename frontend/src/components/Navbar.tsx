import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, Store, LogOut, Menu, X, Sparkles } from "lucide-react";
import { CURRENT_USER } from "../data/mockData";
import styles from "./Navbar.module.css";

interface NavbarProps {
  onSearch?: (query: string) => void;
}

import { useLocation } from "react-router-dom";

export default function Navbar({ onSearch }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchVal);
  };

  const isProfilePage = location.pathname === "/profile";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 px-4 md:px-10 flex items-center justify-between ${styles.bgNavbar}`}
    >
      <Link to="/" className="flex items-center gap-2 shrink-0 mr-4 md:mr-8">
        <div
          className={
            "w-8 h-8 rounded-lg flex items-center justify-center " +
            styles.logoBg
          }
        >
          <Sparkles size={16} color="#000" />
        </div>
        <span
          className={
            "font-semibold text-base tracking-tight hidden sm:block " +
            styles.logoText
          }
        >
          ILG Marketplace
        </span>
      </Link>

      <>
        <div className="flex-1 flex justify-center">
          <form
            onSubmit={handleSearch}
            className="hidden md:flex w-full max-w-lg items-center gap-2"
          >
            <div className="relative flex-1">
              <Search
                size={15}
                className={
                  "absolute left-3 top-1/2 -translate-y-1/2 " +
                  styles.searchIcon
                }
              />
              <input
                type="text"
                placeholder="Search art, artists, styles…"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className={
                  "w-full rounded-full py-2 pl-9 pr-4 text-sm outline-none " +
                  styles.searchInput
                }
              />
            </div>
          </form>
        </div>
        <div className="flex items-center gap-2 md:gap-4 pr-1 md:pr-2 justify-end">
          {isProfilePage ? (
            <motion.button
              whileHover={{ scale: 1.08, boxShadow: "0 0 16px 0 #e8c547" }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 350, damping: 18 }}
              className="px-5 py-2 rounded-full bg-[#e8c547] text-black font-semibold hover:bg-[#f0a030] transition"
              style={{ minWidth: 160 }}
            >
              Connect your wallet
            </motion.button>
          ) : (
            <div className="relative">
              <motion.button
                onClick={() => setDropdownOpen((p) => !p)}
                className="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 transition-all"
                whileHover={{
                  scale: 1.13,
                  boxShadow: "0 4px 24px 0 rgba(232,197,71,0.18)",
                }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 350, damping: 18 }}
              >
                <img
                  src={CURRENT_USER.avatar}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span
                  className={
                    "hidden sm:block text-sm font-medium " + styles.logoText
                  }
                >
                  {CURRENT_USER.displayName}
                </span>
              </motion.button>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={
                      "absolute right-0 top-12 w-52 rounded-xl overflow-hidden shadow-2xl py-1 " +
                      styles.dropdownBg
                    }
                  >
                    <div
                      className={"px-4 py-3 border-b " + styles.dropdownBorder}
                    >
                      <p className={"text-sm font-medium " + styles.dropdownText}>
                        {CURRENT_USER.displayName}
                      </p>
                      <p className={"text-xs mt-0.5 " + styles.dropdownSubText}>
                        @{CURRENT_USER.username}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className={
                        "flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors " +
                        styles.menuProfile
                      }
                    >
                      <User size={15} /> My Profile
                    </Link>
                    <Link
                      to="/manage-shop"
                      onClick={() => setDropdownOpen(false)}
                      className={
                        "flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors " +
                        styles.menuProfile
                      }
                    >
                      <Store size={15} /> Manage Shop
                    </Link>
                    <button
                      className={
                        "w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors " +
                        styles.menuSignOut
                      }
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          <button
            className="ml-1 md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/5"
            onClick={() => setMenuOpen((p) => !p)}
          >
            {menuOpen ? (
              <X size={18} style={{ color: "#a0a0a0" }} />
            ) : (
              <Menu size={18} style={{ color: "#a0a0a0" }} />
            )}
          </button>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={
                "absolute top-16 left-0 right-0 overflow-hidden " +
                styles.menuMobileBg
              }
            >
              <div className="px-4 py-3 flex flex-col gap-3">
                <form
                  onSubmit={handleSearch}
                  className="flex items-center gap-2"
                >
                  <div className="relative flex-1">
                    <Search
                      size={15}
                      className={
                        "absolute left-3 top-1/2 -translate-y-1/2 " +
                        styles.searchIcon
                      }
                    />
                    <input
                      type="text"
                      placeholder="Search…"
                      value={searchVal}
                      onChange={(e) => setSearchVal(e.target.value)}
                      className={
                        "w-full rounded-full py-2 pl-9 pr-4 text-sm outline-none " +
                        styles.searchInput
                      }
                    />
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    </nav>
  );
}
