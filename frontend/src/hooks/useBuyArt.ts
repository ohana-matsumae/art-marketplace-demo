import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { encodeFunctionData } from "viem";
import { ArtMarketplaceABI } from "../abi/ArtMarketplace";
import { normalizeErrorMessage } from "../lib/backend";

const CONTRACT_ADDRESS = import.meta.env
  .VITE_CONTRACT_ADDRESS as `0x${string}`;

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

export function useBuyArt() {
  const { writeContractAsync } = useWriteContract();
  const [isPending, setIsPending] = useState(false);
  const [pendingId, setPendingId] = useState<bigint | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [boughtListingId, setBoughtListingId] = useState<bigint | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({
    hash: txHash ?? undefined,
  });

  const isSuccess = isTxConfirmed && boughtListingId !== null;
  const successListingId = isSuccess ? boughtListingId : null;

  const clearError = () => setError(null);

  const clearSuccess = () => {
    setTxHash(null);
    setBoughtListingId(null);
  };

  const buy = async (listingId: bigint, priceWei: bigint) => {
    setError(null);
    clearSuccess();
    setIsPending(true);
    setPendingId(listingId);
    setBoughtListingId(null);

    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ArtMarketplaceABI,
        functionName: "buyArt",
        args: [listingId],
        value: priceWei,
      });
      setBoughtListingId(listingId);
      setTxHash(hash);
    } catch (err: unknown) {
      const msg = normalizeErrorMessage(err);

      if (msg.includes("Failed to fetch")) {
        // Fallback: send via raw wallet provider to bypass viem transport
        const ethereum = (
          window as Window & { ethereum?: EthereumProvider }
        ).ethereum;

        if (!ethereum?.request) {
          setError("Wallet not available");
          return;
        }

        try {
          const data = encodeFunctionData({
            abi: ArtMarketplaceABI,
            functionName: "buyArt",
            args: [listingId],
          });

          const accounts = (await ethereum.request({
            method: "eth_requestAccounts",
          })) as string[];

          const result = await ethereum.request({
            method: "eth_sendTransaction",
            params: [
              {
                from: accounts[0],
                to: CONTRACT_ADDRESS,
                data,
                value: `0x${priceWei.toString(16)}`,
              },
            ],
          });

          if (typeof result === "string" && result.startsWith("0x")) {
            setBoughtListingId(listingId);
            setTxHash(result as `0x${string}`);
          }
        } catch (walletErr: unknown) {
          const walletMsg = normalizeErrorMessage(walletErr);
          setError(
            walletMsg.includes("User rejected")
              ? "Transaction rejected."
              : `Buy failed: ${walletMsg}`,
          );
        }
        return;
      }

      setError(
        msg.includes("User rejected") ? "Transaction rejected." : msg,
      );
    } finally {
      setIsPending(false);
      setPendingId(null);
    }
  };

  return { buy, isPending, pendingId, txHash, error, clearError, isSuccess, successListingId, clearSuccess };
}
