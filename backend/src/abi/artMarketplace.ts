// Minimal ABI — only what the backend needs to verify purchases on-chain.
export const ArtMarketplaceABI = [
  {
    type: "function",
    name: "hasPurchased",
    stateMutability: "view",
    inputs: [
      { name: "listingId", type: "uint256" },
      { name: "buyer", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;
