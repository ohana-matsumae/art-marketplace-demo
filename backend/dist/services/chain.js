import { createPublicClient, http, getAddress } from "viem";
import { sepolia } from "viem/chains";
import { ArtMarketplaceABI } from "../abi/artMarketplace.js";
import { env } from "../config.js";
// Lazy singleton so the client is created only when first needed,
// guaranteeing env vars are loaded before the constructor runs.
let _client = null;
function getClient() {
    if (!_client) {
        _client = createPublicClient({
            chain: sepolia,
            transport: http(env.RPC_URL),
        });
    }
    return _client;
}
/**
 * Returns true if `buyer` has purchased listing `listingId` on-chain.
 * Returns false on any RPC error to fail safely (access denied).
 */
export async function hasPurchased(listingId, buyer) {
    try {
        return (await getClient().readContract({
            address: env.CONTRACT_ADDRESS,
            abi: ArtMarketplaceABI,
            functionName: "hasPurchased",
            args: [listingId, getAddress(buyer)],
        }));
    }
    catch {
        return false;
    }
}
