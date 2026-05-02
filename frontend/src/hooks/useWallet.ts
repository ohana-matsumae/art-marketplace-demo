import { useAccount, useConnect, useDisconnect } from "wagmi";

export function useWallet() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  const connectWallet = () => {
    const connector =
      connectors.find((c) => c.id === "injected") ??
      connectors.find((c) => c.name.toLowerCase().includes("injected")) ??
      connectors[0];

    if (!connector) return;
    connect({ connector });
  };

  return { address, isConnected, chainId, isConnecting, connectWallet, disconnect };
}
