import { useReadContract } from "wagmi";
import { ArtMarketplaceABI, type OnChainProfile } from "../abi/ArtMarketplace";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;

/** Reads a seller profile from the contract. Returns null if not registered. */
export function useProfile(address?: `0x${string}`) {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ArtMarketplaceABI,
    functionName: "profiles",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // profiles() returns a tuple [username, avatarURI, isRegistered]
  const tuple = data as [string, string, boolean] | undefined;
  const profile: OnChainProfile | null =
    tuple && tuple[2] ? { username: tuple[0], avatarURI: tuple[1], isRegistered: true } : null;

  return { profile, isLoading, refetch };
}
