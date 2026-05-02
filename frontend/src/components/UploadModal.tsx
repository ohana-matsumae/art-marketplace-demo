import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  ImagePlus,
  Tag,
  DollarSign,
  Type,
  FileText,
  Calendar,
} from "lucide-react";
import styles from "./UploadModal.module.css";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [tags, setTags] = useState("");
  const [date, setDate] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  });
  const [step, setStep] = useState<"upload" | "details">("upload");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setStep("details");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleClose = () => {
    setPreview(null);
    setTitle("");
    setDescription("");
    setPrice("");
    setTags("");
    setDate(new Date().toISOString().slice(0, 10));
    setStep("upload");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: "#111111",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              className={`flex items-center justify-between px-6 py-4 ${styles.modalHeader}`}
            >
              <div>
                <h2 className={`font-semibold text-lg ${styles.modalTitle}`}>
                  Upload Artwork
                </h2>
                <p className={`text-xs mt-0.5 ${styles.modalSubtitle}`}>
                  {step === "upload"
                    ? "Choose your file to get started"
                    : "Add details to your artwork"}
                </p>
              </div>
              <motion.button
                onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/8 transition-colors text-[#888]"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                animate={{
                  scale: [1, 1.08, 1],
                  boxShadow: [
                    "0 0 0 0 rgba(232,197,71,0.5)",
                    "0 0 0 8px rgba(232,197,71,0.15)",
                    "0 0 0 0 rgba(232,197,71,0.5)",
                  ],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.2,
                  ease: "easeInOut",
                }}
                aria-label="Close upload modal"
                title="Close upload modal"
              >
                <X size={18} />
              </motion.button>
            </div>

            <div className="flex gap-0 px-6 pt-4">
              {["Upload", "Details"].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  {i > 0 && (
                    <div
                      className={`w-8 h-px mx-2 ${step === "details" && i === 1 ? styles.stepDividerActive : styles.stepDivider}`}
                    />
                  )}
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        (i === 0 &&
                          (step === "upload" || step === "details")) ||
                        (i === 1 && step === "details")
                          ? styles.stepCircleActive
                          : styles.stepCircle
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span
                      className={`text-xs ${step === (i === 0 ? "upload" : "details") ? styles.stepLabelActive : styles.stepLabel}`}
                    >
                      {s}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Steps indicator */}
            {/* (Removed duplicate steps indicator with inline styles) */}

            <div className="p-6">
              {step === "upload" ? (
                /* Drop zone */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-4 rounded-xl py-16 cursor-pointer transition-all duration-200 ${dragOver ? styles.dropZoneActive : styles.dropZone}`}
                  aria-label="Artwork file drop zone"
                >
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center ${styles.dropIcon}`}
                  >
                    <ImagePlus size={28} style={{ color: "#e8c547" }} />
                  </div>
                  <div className="text-center">
                    <p className={`font-medium ${styles.dropText}`}>
                      Drop your artwork here
                    </p>
                    <p className={`text-sm mt-1 ${styles.dropSubText}`}>
                      or click to browse files
                    </p>
                    <p className={`text-xs mt-3 ${styles.dropHint}`}>
                      PNG, JPG, GIF, SVG, MP4 up to 100MB
                    </p>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                    }}
                    title="Select artwork file"
                    placeholder="Select artwork file"
                    aria-label="Select artwork file"
                  />
                </motion.div>
              ) : (
                /* Details form */
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col gap-5"
                >
                  <div className="flex gap-4">
                    {/* Preview thumb */}
                    {preview && (
                      <div className="shrink-0 w-28 h-28 rounded-xl overflow-hidden relative">
                        <img
                          src={preview}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => {
                            setPreview(null);
                            setStep("upload");
                          }}
                          className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs ${styles.previewRemoveBtn}`}
                          title="Remove preview"
                          aria-label="Remove preview"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    )}
                    <div className="flex-1 flex flex-col gap-3">
                      {/* Title */}
                      <div className="relative">
                        <Type
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2"
                          style={{ color: "#555" }}
                        />
                        <input
                          type="text"
                          placeholder="Artwork title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className={`w-full rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none ${styles.inputField}`}
                          aria-label="Artwork title"
                        />
                      </div>
                      {/* Price */}
                      <div className="relative">
                        <DollarSign
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2"
                          style={{ color: "#555" }}
                        />
                        <input
                          type="number"
                          placeholder="Price in USD (e.g. 100)"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className={`w-full rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none ${styles.inputField}`}
                          aria-label="Price in USD"
                        />
                      </div>
                      {/* Date Created */}
                      <div className="relative">
                        <Calendar
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2"
                          style={{ color: "#e8c547" }}
                        />
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className={`w-full rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none ${styles.inputField} ${styles.dateInput}`}
                          aria-label="Date created"
                          title="Date created"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="relative">
                    <FileText
                      size={14}
                      className="absolute left-3 top-3.5"
                      style={{ color: "#555" }}
                    />
                    <textarea
                      placeholder="Describe your artwork…"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className={`w-full rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none resize-none ${styles.textareaField}`}
                      aria-label="Artwork description"
                    />
                  </div>

                  {/* Tags */}
                  <div className="relative">
                    <Tag
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: "#555" }}
                    />
                    <input
                      type="text"
                      placeholder="Tags, comma separated (e.g. surreal, neon)"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className={`w-full rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none ${styles.inputField}`}
                      aria-label="Artwork tags"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => setStep("upload")}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-white/5 ${styles.backBtn}`}
                      type="button"
                    >
                      Back
                    </button>
                    <motion.button
                      type="submit"
                      className="flex-2 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.96 }}
                      animate={{
                        scale: [1, 1.08, 1],
                        boxShadow: [
                          "0 0 0 0 rgba(232,197,71,0.5)",
                          "0 0 0 8px rgba(232,197,71,0.15)",
                          "0 0 0 0 rgba(232,197,71,0.5)",
                        ],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 2.2,
                        ease: "easeInOut",
                      }}
                      onClick={handleClose}
                      style={{
                        background: "linear-gradient(135deg, #e8c547, #f0a030)",
                        color: "#000",
                      }}
                    >
                      <Upload size={16} /> List Artwork
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
