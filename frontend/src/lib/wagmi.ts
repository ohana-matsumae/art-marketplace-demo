import { createConfig, fallback, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

const chainId = Number(import.meta.env.VITE_CHAIN_ID ?? 11155111);
const rpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL as string | undefined;
const backendUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;
const proxyRpcUrl = backendUrl
  ? `${backendUrl.replace(/\/$/, "")}/rpc`
  : undefined;

// Only Sepolia is supported. Additional chains can be added here later.
if (chainId !== sepolia.id) {
  console.warn(
    `VITE_CHAIN_ID (${chainId}) does not match Sepolia (${sepolia.id}). Defaulting to Sepolia.`,
  );
}

const fallbackRpcUrls = [
  "https://ethereum-sepolia-rpc.publicnode.com",
  "https://rpc.sepolia.org",
  sepolia.rpcUrls.default.http[0],
].filter((url): url is string => !!url);

if (!rpcUrl) {
  console.warn(
    "VITE_SEPOLIA_RPC_URL is not set. Using fallback public Sepolia RPC endpoints.",
  );
}

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: fallback([
      ...(proxyRpcUrl ? [http(proxyRpcUrl)] : []),
      ...(rpcUrl ? [http(rpcUrl)] : []),
      ...fallbackRpcUrls.map((url) => http(url)),
    ]),
  },
});
