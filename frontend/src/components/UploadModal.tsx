import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  ImagePlus,
  DollarSign,
  Type,
  FileText,
  Trash2,
  Loader,
} from "lucide-react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { decodeEventLog, encodeFunctionData, parseEther } from "viem";
import { ArtMarketplaceABI } from "../abi/ArtMarketplace";
import { useWallet } from "../hooks/useWallet";
import { useBackendAuth } from "../hooks/useBackendAuth";
import { useProfile } from "../hooks/useProfile";
import {
  BACKEND_URL,
  getErrorMessage,
  normalizeErrorMessage,
} from "../lib/backend";
import styles from "./UploadModal.module.css";

const CONTRACT_ADDRESS = import.meta.env
  .VITE_CONTRACT_ADDRESS as `0x${string}`;

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type UploadResponse = {
  uploadToken: string;
  publicURI: string;
  fullURI: string;
  assetURIs: string[];
};

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

type ProviderError = {
  code?: number;
  message?: string;
};

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [step, setStep] = useState<"upload" | "details">("upload");

  // Step 1 - local files uploaded to backend
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [assetFiles, setAssetFiles] = useState<File[]>([]);
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const registrationLockRef = useRef(false);
  const [registrationRetryCount, setRegistrationRetryCount] = useState(0);
  const [registeredListingId, setRegisteredListingId] = useState<string | null>(
    null,
  );

  // Step 2 - metadata + on-chain listing
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceEth, setPriceEth] = useState("");
  const [username, setUsername] = useState("");
  const [avatarURI, setAvatarURI] = useState("");

  const { writeContractAsync, isPending } = useWriteContract();
  const {
    writeContractAsync: writeProfileAsync,
    isPending: isRegisterProfilePending,
  } = useWriteContract();
  const [profileTxHash, setProfileTxHash] = useState<
    `0x${string}` | undefined
  >();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<string | null>(null);
  const { isConnected, address } = useWallet();
  const { ensureAuthenticated, isAuthenticating } = useBackendAuth();
  const { profile, refetch: refetchProfile } = useProfile(address);

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isTxConfirmed,
  } = useWaitForTransactionReceipt({ hash: txHash });

  const {
    isLoading: isProfileConfirming,
    isSuccess: isProfileConfirmed,
  } = useWaitForTransactionReceipt({ hash: profileTxHash });

  const resetState = () => {
    setStep("upload");
    setImageFile(null);
    setAssetFiles([]);
    setUploadData(null);
    setTitle("");
    setDescription("");
    setPriceEth("");
    setUsername("");
    setAvatarURI("");
    setTxHash(undefined);
    setProfileTxHash(undefined);
    setError(null);
    setIsUploading(false);
    setIsRegistering(false);
    registrationLockRef.current = false;
    setRegistrationRetryCount(0);
    setRegisteredListingId(null);
  };

  const handleClose = () => {
    if (isPending || isConfirming || isUploading || isRegistering) return;
    resetState();
    onClose();
  };

  const removeAssetFile = (idxToRemove: number) => {
    setAssetFiles((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const sendViaWallet = async (
    functionName: "registerProfile" | "uploadArt",
    args:
      | readonly [string, string]
      | readonly [string, string, string, string, readonly string[], bigint],
  ): Promise<`0x${string}`> => {
    const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;
    if (!ethereum?.request || !address) {
      throw new Error("Wallet provider unavailable");
    }

    const data =
      functionName === "registerProfile"
        ? encodeFunctionData({
            abi: ArtMarketplaceABI,
            functionName,
            args: args as readonly [string, string],
          })
        : encodeFunctionData({
            abi: ArtMarketplaceABI,
            functionName,
            args: args as readonly [
              string,
              string,
              string,
              string,
              readonly string[],
              bigint,
            ],
          });

    const txHash = await ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: address,
          to: CONTRACT_ADDRESS,
          data,
        },
      ],
    });

    if (typeof txHash !== "string" || !txHash.startsWith("0x")) {
      throw new Error("Wallet did not return a transaction hash");
    }

    return txHash as `0x${string}`;
  };

  const ensureWalletSepoliaRpc = async () => {
    const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;
    if (!ethereum?.request) return;

    const chainIdHex = "0xaa36a7";
    const rpcUrls = [
      `${BACKEND_URL.replace(/\/$/, "")}/rpc`,
      import.meta.env.VITE_SEPOLIA_RPC_URL as string | undefined,
      "https://ethereum-sepolia-rpc.publicnode.com",
      "https://rpc.sepolia.org",
    ].filter((url): url is string => !!url);

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
      return;
    } catch (err: unknown) {
      const providerError = err as ProviderError;
      // 4902 = chain not added in wallet yet
      if (providerError.code !== 4902) {
        throw err;
      }
    }

    await ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: chainIdHex,
          chainName: "Sepolia",
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls,
          blockExplorerUrls: ["https://sepolia.etherscan.io"],
        },
      ],
    });

    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
  };

  const handleUploadToBackend = async () => {
    setError(null);

    if (!isConnected) {
      setError("Connect wallet first.");
      return;
    }
    if (!imageFile) {
      setError("Main image is required.");
      return;
    }

    setIsUploading(true);
    try {
      await ensureAuthenticated();

      const formData = new FormData();
      formData.append("image", imageFile);
      for (const asset of assetFiles) {
        formData.append("assets", asset);
      }

      const response = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data = (await response.json()) as UploadResponse;
      setUploadData(data);
      setStep("details");
    } catch (err: unknown) {
      setError(normalizeErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    if (!profile?.isRegistered) {
      setError("Register your seller profile before uploading art.");
      return;
    }

    if (!uploadData) {
      setError("Upload files first.");
      return;
    }

    try {
      await ensureWalletSepoliaRpc();

      const args = [
        title.trim(),
        description.trim(),
        uploadData.publicURI,
        uploadData.fullURI,
        uploadData.assetURIs,
        parseEther(priceEth || "0"),
      ] as const;

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ArtMarketplaceABI,
        functionName: "uploadArt",
        args,
      });
      setTxHash(hash);
    } catch (err: unknown) {
      const msg = normalizeErrorMessage(err);
      if (msg.includes("Failed to fetch")) {
        try {
          const hash = await sendViaWallet("uploadArt", [
            title.trim(),
            description.trim(),
            uploadData.publicURI,
            uploadData.fullURI,
            uploadData.assetURIs,
            parseEther(priceEth || "0"),
          ] as const);
          setTxHash(hash);
          return;
        } catch (walletErr: unknown) {
          const walletMsg = normalizeErrorMessage(walletErr);
          setError(
            walletMsg.includes("User rejected")
              ? "Transaction rejected."
              : `Wallet RPC failed: ${walletMsg}`,
          );
          return;
        }
      }

      setError(
        msg.includes("User rejected")
          ? "Transaction rejected."
            : msg,
      );
    }
  };

  const handleRegisterProfile = async () => {
    setError(null);
    if (!isConnected || !address) {
      setError("Connect wallet first.");
      return;
    }

    const trimmed = username.trim();
    if (!trimmed) {
      setError("Username is required to register a seller profile.");
      return;
    }

    try {
      await ensureWalletSepoliaRpc();

      const args = [trimmed, avatarURI.trim()] as const;

      const hash = await writeProfileAsync({
        address: CONTRACT_ADDRESS,
        abi: ArtMarketplaceABI,
        functionName: "registerProfile",
        args,
      });
      // Don't refetch immediately — wait for on-chain confirmation via useEffect below
      setProfileTxHash(hash);
    } catch (err: unknown) {
      const msg = normalizeErrorMessage(err);
      if (msg.includes("Failed to fetch")) {
        try {
          const walletHash = await sendViaWallet("registerProfile", [trimmed, avatarURI.trim()] as const);
          // Don't refetch immediately — profile tx hash tracked separately
          setProfileTxHash(walletHash);
          return;
        } catch (walletErr: unknown) {
          const walletMsg = normalizeErrorMessage(walletErr);
          setError(
            walletMsg.includes("User rejected")
              ? "Transaction rejected."
              : `Wallet RPC failed: ${walletMsg}`,
          );
          return;
        }
      }

      setError(
        msg.includes("User rejected")
          ? "Transaction rejected."
            : msg,
      );
    }
  };

  // Refetch profile after the registerProfile tx confirms on-chain
  useEffect(() => {
    if (isProfileConfirmed) {
      void refetchProfile();
    }
  }, [isProfileConfirmed, refetchProfile]);

  useEffect(() => {
    // Use a ref as the mutex so setting it doesn't trigger a re-render (and
    // therefore doesn't re-run this effect and cancel ongoing async work).
    if (
      !receipt ||
      !uploadData ||
      registeredListingId ||
      registrationLockRef.current
    ) {
      return;
    }

    registrationLockRef.current = true;
    let cancelled = false;

    const registerListing = async () => {
      setIsRegistering(true);
      try {
        let listingId: bigint | null = null;

        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: ArtMarketplaceABI,
              data: log.data,
              topics: log.topics,
            });

            if (decoded.eventName === "ArtUploaded") {
              listingId = decoded.args.listingId as bigint;
              break;
            }
          } catch {
            // Ignore unrelated logs and decode failures.
          }
        }

        if (listingId === null) {
          throw new Error("Could not determine listing ID from transaction logs");
        }

        await ensureAuthenticated();

        const response = await fetch(
          `${BACKEND_URL}/upload/${uploadData.uploadToken}/register`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ listingId: listingId.toString() }),
          },
        );

        if (!response.ok) {
          throw new Error(await getErrorMessage(response));
        }

        if (!cancelled) {
          setRegisteredListingId(listingId.toString());
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(normalizeErrorMessage(err));
          // Release lock so the user can retry
          registrationLockRef.current = false;
        }
      } finally {
        if (!cancelled) {
          setIsRegistering(false);
        }
      }
    };

    void registerListing();

    return () => {
      cancelled = true;
    };
  }, [
    ensureAuthenticated,
    receipt,
    registeredListingId,
    uploadData,
    registrationRetryCount,
  ]);

  const canProceed = !!imageFile && !isUploading;
  const canSubmit =
    !!uploadData &&
    title.trim() !== "" &&
    Number(priceEth) > 0 &&
    !isPending &&
    !isConfirming &&
    !isTxConfirmed &&
    !isRegistering;

  const isSuccess = isTxConfirmed && !!registeredListingId;

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
            {/* Header */}
            <div
              className={`flex items-center justify-between px-6 py-4 ${styles.modalHeader}`}
            >
              <div>
                <h2 className={`font-semibold text-lg ${styles.modalTitle}`}>
                  Upload Artwork
                </h2>
                <p className={`text-xs mt-0.5 ${styles.modalSubtitle}`}>
                  {step === "upload"
                    ? "Upload files to secure backend storage"
                    : "Add details and set a price"}
                </p>
              </div>
              <motion.button
                onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/8 transition-colors text-[#888]"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                aria-label="Close upload modal"
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* Steps indicator */}
            <div className="flex gap-0 px-6 pt-4">
              {["Images", "Details"].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  {i > 0 && (
                    <div
                      className={`w-8 h-px mx-2 ${
                        step === "details" && i === 1
                          ? styles.stepDividerActive
                          : styles.stepDivider
                      }`}
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
                      className={`text-xs ${
                        step === (i === 0 ? "upload" : "details")
                          ? styles.stepLabelActive
                          : styles.stepLabel
                      }`}
                    >
                      {s}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6">
              {isSuccess ? (
                <div className="text-center py-10">
                  <p className="text-4xl mb-4">✨</p>
                  <p className="text-lg font-semibold text-[#f5f5f5] mb-2">
                    Artwork listed!
                  </p>
                  <p className="text-sm text-[#888] mb-6">
                    Your artwork is now live on the marketplace.
                  </p>
                  <button
                    onClick={handleClose}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold"
                    style={{
                      background: "linear-gradient(135deg, #e8c547, #f0a030)",
                      color: "#000",
                    }}
                  >
                    Done
                  </button>
                </div>
              ) : step === "upload" ? (
                /* Step 1 - file upload */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col gap-5"
                >
                  <div
                    className={`flex flex-col items-center justify-center gap-4 rounded-xl py-10 ${styles.dropZone}`}
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center ${styles.dropIcon}`}
                    >
                      <ImagePlus size={26} style={{ color: "#e8c547" }} />
                    </div>
                    <p className={`text-sm font-medium ${styles.dropText}`}>
                      Select your artwork files
                    </p>
                    <p className={`text-xs ${styles.dropHint}`}>
                      Your preview image is watermarked automatically; originals
                      and extras are buyer-gated.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs text-[#888] mb-1 block">
                        Main artwork image{" "}
                        <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          setImageFile(file);
                        }}
                        className={`w-full rounded-xl py-2.5 px-4 text-sm outline-none ${styles.inputField}`}
                        aria-label="Main artwork image"
                      />
                      {imageFile && (
                        <p className="text-xs text-[#888] mt-1">{imageFile.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-[#888] mb-1 block">
                        Additional source files (optional)
                      </label>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files ?? []);
                          setAssetFiles(files);
                        }}
                        className={`w-full rounded-xl py-2.5 px-4 text-sm outline-none ${styles.inputField}`}
                        aria-label="Additional source files"
                      />
                    </div>

                    {assetFiles.length > 0 && (
                      <div className="flex flex-col gap-2">
                        {assetFiles.map((file, i) => (
                          <div
                            key={`${file.name}-${i}`}
                            className="flex items-center gap-2"
                          >
                            <p className="flex-1 text-xs text-[#888] truncate">
                              {file.name}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeAssetFile(i)}
                              className="w-8 h-8 flex items-center justify-center rounded-xl text-[#888] hover:text-red-400 transition-colors"
                              style={{
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.08)",
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {error && (
                    <p className="text-xs text-red-400 rounded-lg px-3 py-2 bg-red-400/10">
                      {error}
                    </p>
                  )}

                  <button
                    onClick={handleUploadToBackend}
                    disabled={!canProceed}
                    className="py-3 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-40"
                    style={{
                      background: "linear-gradient(135deg, #e8c547, #f0a030)",
                      color: "#000",
                    }}
                  >
                    {isUploading || isAuthenticating
                      ? "Uploading…"
                      : "Upload Files"}
                  </button>
                </motion.div>
              ) : (
                /* Step 2 - listing details */
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col gap-5"
                >
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-[#bbb]">
                      Uploaded preview and protected original are ready.
                    </p>
                    <p className="text-xs text-[#777] mt-1">
                      Extra files: {uploadData?.assetURIs.length ?? 0}
                    </p>
                  </div>

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
                      placeholder="Price in ETH (e.g. 0.05)"
                      step="0.001"
                      min="0"
                      value={priceEth}
                      onChange={(e) => setPriceEth(e.target.value)}
                      className={`w-full rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none ${styles.inputField}`}
                      aria-label="Price in ETH"
                    />
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

                  {error && (
                    <p className="text-xs text-red-400 rounded-lg px-3 py-2 bg-red-400/10">
                      {error}
                    </p>
                  )}

                  {isRegistering && (
                    <p className="text-xs text-[#d9b44b] rounded-lg px-3 py-2 bg-[#d9b44b]/10 flex items-center gap-2">
                      <Loader size={12} className="animate-spin" />
                      Finalizing listing access…
                    </p>
                  )}

                  {isTxConfirmed && !registeredListingId && !isRegistering && (
                    <button
                      type="button"
                      onClick={() => {
                        registrationLockRef.current = false;
                        setError(null);
                        setRegistrationRetryCount((c) => c + 1);
                      }}
                      className="text-xs text-[#e8c547] hover:opacity-80 transition-opacity self-start"
                    >
                      Retry finalizing listing access
                    </button>
                  )}

                  {!profile?.isRegistered && (
                    <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 flex flex-col gap-3">
                      <p className="text-xs text-amber-200">
                        Seller profile required before listing art.
                      </p>
                      <input
                        type="text"
                        placeholder="Seller username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={`w-full rounded-xl py-2.5 px-4 text-sm outline-none ${styles.inputField}`}
                      />
                      <input
                        type="url"
                        placeholder="Avatar URL (optional)"
                        value={avatarURI}
                        onChange={(e) => setAvatarURI(e.target.value)}
                        className={`w-full rounded-xl py-2.5 px-4 text-sm outline-none ${styles.inputField}`}
                      />
                      <button
                        type="button"
                        onClick={handleRegisterProfile}
                        disabled={isRegisterProfilePending || isProfileConfirming}
                        className="self-start px-4 py-2 rounded-lg text-xs font-semibold transition-opacity disabled:opacity-50 flex items-center gap-1.5"
                        style={{
                          background: "linear-gradient(135deg, #e8c547, #f0a030)",
                          color: "#000",
                        }}
                      >
                        {isRegisterProfilePending ? (
                          <><Loader size={12} className="animate-spin" /> Waiting for wallet…</>
                        ) : isProfileConfirming ? (
                          <><Loader size={12} className="animate-spin" /> Confirming…</>
                        ) : (
                          "Register Seller Profile"
                        )}
                      </button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 mt-1">
                    <button
                      onClick={() => setStep("upload")}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-white/5 ${styles.backBtn}`}
                      type="button"
                      disabled={isPending || isConfirming || isRegistering}
                    >
                      Back
                    </button>
                    <motion.button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      className="flex-2 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                      whileHover={canSubmit ? { scale: 1.03 } : {}}
                      whileTap={canSubmit ? { scale: 0.97 } : {}}
                      style={{
                        background: "linear-gradient(135deg, #e8c547, #f0a030)",
                        color: "#000",
                        flex: 2,
                      }}
                    >
                      <Upload size={16} />
                      {isConfirming
                        ? "Confirming…"
                        : isRegistering
                          ? "Finalizing…"
                        : isPending
                          ? "Waiting…"
                          : "List Artwork"}
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
