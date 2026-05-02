import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import MainPage from "./pages/MainPage";
import ProfilePage from "./pages/ProfilePage";
import ShopPage from "./pages/ShopPage";
import NetworkGuard from "./components/NetworkGuard";

export default function App() {
  return (
    <NetworkGuard>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/manage-shop" element={<ShopPage isOwner />} />
          <Route path="/shop/:sellerAddress" element={<ShopPage />} />
        </Routes>
      </AnimatePresence>
    </NetworkGuard>
  );
}
