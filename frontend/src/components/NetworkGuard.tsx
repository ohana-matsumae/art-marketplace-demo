import { useSwitchChain } from "wagmi";
import { sepolia } from "wagmi/chains";
import { useWallet } from "../hooks/useWallet";

const TARGET_CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID ?? sepolia.id);

interface NetworkGuardProps {
  children: React.ReactNode;
}

export default function NetworkGuard({ children }: NetworkGuardProps) {
  const { isConnected, chainId } = useWallet();
  const { switchChain, isPending } = useSwitchChain();

  if (isConnected && chainId !== TARGET_CHAIN_ID) {
    return (
      <>
        {children}
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div
            className="w-full max-w-sm rounded-2xl p-8 text-center shadow-2xl"
            style={{
              background: "#111",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
              style={{ background: "rgba(232,197,71,0.12)" }}
            >
              ⚠
            </div>
            <h2 className="text-lg font-semibold text-[#f5f5f5] mb-2">
              Wrong Network
            </h2>
            <p className="text-sm text-[#888] mb-6">
              This app requires the{" "}
              <span className="text-[#e8c547] font-medium">Sepolia</span>{" "}
              testnet. Please switch networks to continue.
            </p>
            <button
              onClick={() => switchChain({ chainId: TARGET_CHAIN_ID })}
              disabled={isPending}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #e8c547, #f0a030)",
                color: "#000",
              }}
            >
              {isPending ? "Switching…" : "Switch to Sepolia"}
            </button>
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
}
