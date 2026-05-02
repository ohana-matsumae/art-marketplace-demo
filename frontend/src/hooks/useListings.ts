import { useReadContract, useReadContracts } from "wagmi";
import { ArtMarketplaceABI, type OnChainListing } from "../abi/ArtMarketplace";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;

/** Fetches all active listings from the contract. */
export function useListings() {
  const { data: count, isLoading: countLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ArtMarketplaceABI,
    functionName: "listingCount",
  });

  const listingCount = count !== undefined ? Number(count) : 0;

  const contracts = Array.from({ length: listingCount }, (_, i) => ({
    address: CONTRACT_ADDRESS,
    abi: ArtMarketplaceABI,
    functionName: "getListing" as const,
    args: [BigInt(i)] as const,
  }));

  const { data: results, isLoading: listingsLoading } = useReadContracts({
    contracts,
    query: { enabled: listingCount > 0 },
  });

  const listings = (results ?? [])
    .map((r) => r.result as OnChainListing | undefined)
    .filter((l): l is OnChainListing => !!l && l.isActive);

  return {
    listings,
    listingCount,
    isLoading: countLoading || (listingCount > 0 && listingsLoading),
  };
}

/** Fetches all listing IDs purchased by a buyer, then resolves the full listing objects. */
export function useBuyerPurchases(buyer?: `0x${string}`) {
  const { data: purchaseIds, isLoading: idsLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ArtMarketplaceABI,
    functionName: "getBuyerPurchases",
    args: buyer ? [buyer] : undefined,
    query: { enabled: !!buyer },
  });

  const ids = (purchaseIds as bigint[] | undefined) ?? [];

  const contracts = ids.map((id) => ({
    address: CONTRACT_ADDRESS,
    abi: ArtMarketplaceABI,
    functionName: "getListing" as const,
    args: [id] as const,
  }));

  const { data: results, isLoading: listingsLoading } = useReadContracts({
    contracts,
    query: { enabled: ids.length > 0 },
  });

  const listings = (results ?? [])
    .map((r) => r.result as OnChainListing | undefined)
    .filter((l): l is OnChainListing => !!l);

  return {
    listings,
    isLoading: idsLoading || (ids.length > 0 && listingsLoading),
  };
}

/** Fetches all listing IDs uploaded by a seller, then resolves the full listing objects. */
export function useSellerListings(seller?: `0x${string}`) {
  const { data: sellerIds, isLoading: idsLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ArtMarketplaceABI,
    functionName: "getSellerListings",
    args: seller ? [seller] : undefined,
    query: { enabled: !!seller },
  });

  const ids = (sellerIds as bigint[] | undefined) ?? [];

  const contracts = ids.map((id) => ({
    address: CONTRACT_ADDRESS,
    abi: ArtMarketplaceABI,
    functionName: "getListing" as const,
    args: [id] as const,
  }));

  const { data: results, isLoading: listingsLoading } = useReadContracts({
    contracts,
    query: { enabled: ids.length > 0 },
  });

  const listings = (results ?? [])
    .map((r) => r.result as OnChainListing | undefined)
    .filter((l): l is OnChainListing => !!l);

  return {
    listings,
    isLoading: idsLoading || (ids.length > 0 && listingsLoading),
  };
}
