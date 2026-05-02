import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getAddress } from "viem";

import {
  createMarketplaceTestContext,
  deployMarketplace,
  readBuyerPurchases,
  readListing,
} from "./helpers.js";

describe("ArtMarketplace / buyArt", async function () {
  const { ignition, viem, publicClient, seller, buyer, other } = await createMarketplaceTestContext();

  it("transfers ETH to seller, records buyer purchase, increments salesCount, emits ArtSold", async function () {
    const mp = await deployMarketplace(ignition);
    await mp.write.registerProfile(["alice", "uri"], { account: seller.account });
    await mp.write.uploadArt(
      ["Painting", "Desc", "wm_uri", "full_uri", [], 1000n],
      { account: seller.account },
    );

    const sellerBalanceBefore = await publicClient.getBalance({
      address: seller.account.address,
    });

    await viem.assertions.emitWithArgs(
      mp.write.buyArt([0n], { account: buyer.account, value: 1000n }),
      mp,
      "ArtSold",
      [0n, getAddress(buyer.account.address), getAddress(seller.account.address), 1000n],
    );

    const sellerBalanceAfter = await publicClient.getBalance({
      address: seller.account.address,
    });
    assert.ok(
      sellerBalanceAfter > sellerBalanceBefore,
      "seller balance should increase by the sale price",
    );

    const listing = await readListing(mp, 0n);
    assert.equal(listing.salesCount, 1n);

    const purchases = await readBuyerPurchases(mp, buyer.account.address);
    assert.equal(purchases.length, 1);
    assert.equal(purchases[0], 0n);

    assert.equal(
      await mp.read.hasPurchased([0n, buyer.account.address]),
      true,
    );
  });

  it("reverts on incorrect payment", async function () {
    const mp = await deployMarketplace(ignition);
    await mp.write.registerProfile(["alice", "uri"], { account: seller.account });
    await mp.write.uploadArt(["Painting", "Desc", "wm_uri", "full_uri", [], 1000n], {
      account: seller.account,
    });

    await assert.rejects(
      mp.write.buyArt([0n], { account: buyer.account, value: 500n }),
    );
  });

  it("reverts on inactive listing", async function () {
    const mp = await deployMarketplace(ignition);
    await mp.write.registerProfile(["alice", "uri"], { account: seller.account });
    await mp.write.uploadArt(["Painting", "Desc", "wm_uri", "full_uri", [], 1000n], {
      account: seller.account,
    });
    await mp.write.deactivateListing([0n], { account: seller.account });

    await assert.rejects(
      mp.write.buyArt([0n], { account: buyer.account, value: 1000n }),
    );
  });

  it("reverts on self-purchase", async function () {
    const mp = await deployMarketplace(ignition);
    await mp.write.registerProfile(["alice", "uri"], { account: seller.account });
    await mp.write.uploadArt(["Painting", "Desc", "wm_uri", "full_uri", [], 1000n], {
      account: seller.account,
    });

    await assert.rejects(
      mp.write.buyArt([0n], { account: seller.account, value: 1000n }),
    );
  });

  it("reverts on duplicate purchase by the same buyer", async function () {
    const mp = await deployMarketplace(ignition);
    await mp.write.registerProfile(["alice", "uri"], { account: seller.account });
    await mp.write.uploadArt(["Painting", "Desc", "wm_uri", "full_uri", [], 1000n], {
      account: seller.account,
    });

    await mp.write.buyArt([0n], { account: buyer.account, value: 1000n });

    await assert.rejects(
      mp.write.buyArt([0n], { account: buyer.account, value: 1000n }),
    );
  });

  it("reverts when the buyer is another account after purchase", async function () {
    const mp = await deployMarketplace(ignition);
    await mp.write.registerProfile(["alice", "uri"], { account: seller.account });
    await mp.write.uploadArt(["Painting", "Desc", "wm_uri", "full_uri", [], 1000n], {
      account: seller.account,
    });

    await mp.write.buyArt([0n], { account: buyer.account, value: 1000n });

    // A different account should be able to purchase as well; assert sale recorded
    await viem.assertions.emitWithArgs(
      mp.write.buyArt([0n], { account: other.account, value: 1000n }),
      mp,
      "ArtSold",
      [0n, getAddress(other.account.address), getAddress(seller.account.address), 1000n],
    );

    const listing = await readListing(mp, 0n);
    assert.equal(listing.salesCount, 2n);

    const purchasesOther = await readBuyerPurchases(mp, other.account.address);
    assert.equal(purchasesOther.length, 1);
    assert.equal(purchasesOther[0], 0n);

    assert.equal(
      await mp.read.hasPurchased([0n, other.account.address]),
      true,
    );
  });
});
