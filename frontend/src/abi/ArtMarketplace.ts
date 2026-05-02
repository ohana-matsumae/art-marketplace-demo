export const ArtMarketplaceABI = [
  { type: "error", name: "AlreadyPurchased", inputs: [] },
  { type: "error", name: "IncorrectPayment", inputs: [] },
  { type: "error", name: "InvalidPrice", inputs: [] },
  { type: "error", name: "ListingNotActive", inputs: [] },
  { type: "error", name: "MissingImage", inputs: [] },
  { type: "error", name: "NoListings", inputs: [] },
  { type: "error", name: "NotBuyer", inputs: [] },
  { type: "error", name: "NotRegistered", inputs: [] },
  { type: "error", name: "NotSeller", inputs: [] },
  { type: "error", name: "SelfPurchase", inputs: [] },
  { type: "error", name: "TransferFailed", inputs: [] },
  {
    type: "event",
    name: "ArtSold",
    anonymous: false,
    inputs: [
      { indexed: true, name: "listingId", type: "uint256" },
      { indexed: true, name: "buyer", type: "address" },
      { indexed: true, name: "seller", type: "address" },
      { indexed: false, name: "priceWei", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "ArtUploaded",
    anonymous: false,
    inputs: [
      { indexed: true, name: "listingId", type: "uint256" },
      { indexed: true, name: "seller", type: "address" },
      { indexed: false, name: "priceWei", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "ProfileRegistered",
    anonymous: false,
    inputs: [
      { indexed: true, name: "seller", type: "address" },
      { indexed: false, name: "username", type: "string" },
    ],
  },
  {
    type: "function",
    name: "buyArt",
    stateMutability: "payable",
    inputs: [{ name: "listingId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "deactivateListing",
    stateMutability: "nonpayable",
    inputs: [{ name: "listingId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "getAdditionalAssets",
    stateMutability: "view",
    inputs: [{ name: "listingId", type: "uint256" }],
    outputs: [{ name: "", type: "string[]" }],
  },
  {
    type: "function",
    name: "getBuyerPurchases",
    stateMutability: "view",
    inputs: [{ name: "buyer", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "getFullImageURI",
    stateMutability: "view",
    inputs: [{ name: "listingId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function",
    name: "getListing",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "seller", type: "address" },
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "imageURIWatermarked", type: "string" },
          { name: "priceWei", type: "uint256" },
          { name: "isActive", type: "bool" },
          { name: "salesCount", type: "uint256" },
          { name: "assetCount", type: "uint256" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getMostSoldArtId",
    stateMutability: "view",
    inputs: [{ name: "seller", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getSellerListings",
    stateMutability: "view",
    inputs: [{ name: "seller", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
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
  {
    type: "function",
    name: "listingCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "profiles",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [
      { name: "username", type: "string" },
      { name: "avatarURI", type: "string" },
      { name: "isRegistered", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "registerProfile",
    stateMutability: "nonpayable",
    inputs: [
      { name: "username", type: "string" },
      { name: "avatarURI", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "uploadArt",
    stateMutability: "nonpayable",
    inputs: [
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "imageURIWatermarked", type: "string" },
      { name: "imageURIFull", type: "string" },
      { name: "additionalAssetURIs", type: "string[]" },
      { name: "priceWei", type: "uint256" },
    ],
    outputs: [{ name: "listingId", type: "uint256" }],
  },
] as const;

export type OnChainListing = {
  id: bigint;
  seller: `0x${string}`;
  title: string;
  description: string;
  imageURIWatermarked: string;
  priceWei: bigint;
  isActive: boolean;
  salesCount: bigint;
  assetCount: bigint;
};

export type OnChainProfile = {
  username: string;
  avatarURI: string;
  isRegistered: boolean;
};
