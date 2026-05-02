import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createMarketplaceTestContext,
  deployMarketplace,
  readAdditionalAssets,
  readBuyerPurchases,
  readSellerListings,
} from "./helpers.js";

describe("ArtMarketplace / read methods", async function () {
  const { ignition, viem, publicClient, seller, buyer, other } = await createMarketplaceTestContext();

  it("getFullImageURI reverts for non-buyer (default caller)", async function () {
    const mp = await deployMarketplace(ignition);
    await mp.write.registerProfile(["alice", "uri"], { account: seller.account });
    await mp.write.uploadArt(
      ["Painting", "Desc", "wm_uri", "https://full.example/1.jpg", [], 1000n],
      { account: seller.account },
    );

    await assert.rejects(mp.read.getFullImageURI([0n]));
  });

  it("getFullImageURI returns full URI after purchase", async function () {
    const mp = await deployMarketplace(ignition);
    await mp.write.registerProfile(["alice", "uri"], { account: seller.account });
    await mp.write.uploadArt(
      ["Painting", "Desc", "wm_uri", "https://full.example/1.jpg", [], 1000n],
      { account: seller.account },
    );

    await mp.write.buyArt([0n], { account: buyer.account, value: 1000n });

    const fullURI = await mp.read.getFullImageURI([0n], { account: buyer.account });
    assert.equal(fullURI, "https://full.example/1.jpg");
  });

  it("getSellerListings returns all listing IDs for a seller", async function () {
    const mp = await deployMarketplace(ignition);
    await mp.write.registerProfile(["alice", "uri"], { account: seller.account });
    await mp.write.uploadArt(["Art A", "Desc", "wm", "full", [], 100n], { account: seller.account });
    await mp.write.uploadArt(["Art B", "Desc", "wm", "full", [], 200n], { account: seller.account });

    const ids = await readSellerListings(mp, seller.account.address);
    assert.equal(ids.length, 2);
    assert.equal(ids[0], 0n);
    assert.equal(ids[1], 1n);
  });

  it("getBuyerPurchases returns all listing IDs purchased by a buyer", async function () {
    const mp = await deployMarketplace(ignition);
    await mp.write.registerProfile(["alice", "uri"], { account: seller.account });
    await mp.write.uploadArt(["Art A", "Desc", "wm", "full", [], 100n], { account: seller.account });
    await mp.write.uploadArt(["Art B", "Desc", "wm", "full", [], 200n], { account: seller.account });

    await mp.write.buyArt([0n], { account: buyer.account, value: 100n });
    await mp.write.buyArt([1n], { account: buyer.account, value: 200n });

    const purchases = await readBuyerPurchases(mp, buyer.account.address);
    assert.equal(purchases.length, 2);
    assert.equal(purchases[0], 0n);
    assert.equal(purchases[1], 1n);
  });

  it("getMostSoldArtId returns the listing with the highest salesCount", async function () {
    const mp = await deployMarketplace(ignition);
    await mp.write.registerProfile(["alice", "uri"], { account: seller.account });
    await mp.write.uploadArt(["Art A", "Desc", "wm", "full", [], 100n], { account: seller.account });
    await mp.write.uploadArt(["Art B", "Desc", "wm", "full", [], 100n], { account: seller.account });

    await mp.write.buyArt([1n], { account: buyer.account, value: 100n });
    await mp.write.buyArt([1n], { account: other.account, value: 100n });
    await mp.write.buyArt([0n], { account: other.account, value: 100n });

    const bestId = await mp.read.getMostSoldArtId([seller.account.address]);
    assert.equal(bestId, 1n);
  });

  it("getMostSoldArtId reverts when seller has no listings", async function () {
    const mp = await deployMarketplace(ignition);

    await assert.rejects(mp.read.getMostSoldArtId([seller.account.address]));
  });

  it("getAdditionalAssets reverts for non-buyer", async function () {
    const mp = await deployMarketplace(ignition);
    await mp.write.registerProfile(["alice", "uri"], { account: seller.account });
    await mp.write.uploadArt(
      ["Art", "Desc", "wm", "full", ["https://assets.example/source.psd"], 100n],
      { account: seller.account },
    );

    await assert.rejects(mp.read.getAdditionalAssets([0n]));
  });

  it("getAdditionalAssets returns all asset URIs after purchase", async function () {
    const mp = await deployMarketplace(ignition);
    await mp.write.registerProfile(["alice", "uri"], { account: seller.account });
    await mp.write.uploadArt(
      [
        "Art",
        "Desc",
        "wm",
        "full",
        [
          "https://assets.example/source.psd",
          "https://assets.example/palette.ase",
          "https://assets.example/export.png",
        ],
        100n,
      ],
      { account: seller.account },
    );

    await mp.write.buyArt([0n], { account: buyer.account, value: 100n });

    const assets = await readAdditionalAssets(mp, 0n, buyer.account);
    assert.equal(assets.length, 3);
    assert.equal(assets[0], "https://assets.example/source.psd");
    assert.equal(assets[1], "https://assets.example/palette.ase");
    assert.equal(assets[2], "https://assets.example/export.png");
  });

  it("getAdditionalAssets returns empty array when no extras were uploaded", async function () {
    const mp = await deployMarketplace(ignition);
    await mp.write.registerProfile(["alice", "uri"], { account: seller.account });
    await mp.write.uploadArt(["Art", "Desc", "wm", "full", [], 100n], { account: seller.account });
    await mp.write.buyArt([0n], { account: buyer.account, value: 100n });

    const assets = await readAdditionalAssets(mp, 0n, buyer.account);
    assert.equal(assets.length, 0);
  });
});
