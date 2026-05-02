import { network } from "hardhat";
import type { Address } from "viem";

import ArtMarketplaceModule from "../ignition/modules/ArtMarketplace.js";

export type Profile = readonly [string, string, boolean];

export type Listing = {
  title: string;
  description: string;
  imageURIWatermarked: string;
  imageURIFull: string;
  additionalAssets: readonly string[];
  priceWei: bigint;
  isActive: boolean;
  salesCount: bigint;
  seller: string;
  assetCount: bigint;
};

type Viem = Awaited<ReturnType<typeof network.create>>["viem"];
export type Marketplace = Awaited<ReturnType<Viem["deployContract"]>>;
export type PublicClient = Awaited<ReturnType<Viem["getPublicClient"]>>;
type Ignition = Awaited<ReturnType<typeof network.create>>["ignition"];

export async function createMarketplaceTestContext() {
  const { ignition, viem } = await network.create();
  const publicClient = await viem.getPublicClient();
  const [, seller, buyer, other] = await viem.getWalletClients();

  return {
    ignition,
    viem,
    publicClient,
    seller,
    buyer,
    other,
  };
}

export async function deployMarketplace(ignition: Ignition): Promise<Marketplace> {
  const { artMarketplace } = await ignition.deploy(ArtMarketplaceModule);
  return artMarketplace;
}

export async function readListing(mp: Marketplace, listingId: bigint) {
  return (await mp.read.getListing([listingId])) as Listing;
}

export async function readSellerListings(
  mp: Marketplace,
  sellerAddress: Address,
) {
  return (await mp.read.getSellerListings([sellerAddress])) as bigint[];
}

export async function readBuyerPurchases(
  mp: Marketplace,
  buyerAddress: Address,
) {
  return (await mp.read.getBuyerPurchases([buyerAddress])) as bigint[];
}

export async function readAdditionalAssets(
  mp: Marketplace,
  listingId: bigint,
  buyerAccount: unknown,
) {
  return (await mp.read.getAdditionalAssets([listingId], { account: buyerAccount })) as string[];
}
