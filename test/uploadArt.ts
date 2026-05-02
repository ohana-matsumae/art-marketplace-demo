import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getAddress } from "viem";

import {
  createMarketplaceTestContext,
  deployMarketplace,
  readListing,
} from "./helpers.js";

describe("ArtMarketplace / uploadArt", async function () {
  const { ignition, viem, seller } = await createMarketplaceTestContext();

  it("reverts when caller has no profile", async function () {
    const mp = await deployMarketplace(ignition);

    await assert.rejects(
      mp.write.uploadArt(
        [
          "Painting",
          "Desc",
          "https://wm.example/1.jpg",
          "https://full.example/1.jpg",
          [],
          100n,
        ],
        { account: seller.account },
      ),
    );
  });

  it("reverts when priceWei is 0", async function () {
    const mp = await deployMarketplace(ignition);
    await mp.write.registerProfile(["alice", "uri"], { account: seller.account });

    await assert.rejects(
      mp.write.uploadArt(
        [
          "Painting",
          "Desc",
          "https://wm.example/1.jpg",
          "https://full.example/1.jpg",
          [],
          0n,
        ],
        { account: seller.account },
      ),
    );
  });

  it("stores listing and emits ArtUploaded", async function () {
    const mp = await deployMarketplace(ignition);
    await mp.write.registerProfile(["alice", "uri"], { account: seller.account });

    await viem.assertions.emitWithArgs(
      mp.write.uploadArt(
        [
          "Painting",
          "A nice painting",
          "https://wm.example/1.jpg",
          "https://full.example/1.jpg",
          [],
          500n,
        ],
        { account: seller.account },
      ),
      mp,
      "ArtUploaded",
      [0n, getAddress(seller.account.address), 500n],
    );

    const listing = await readListing(mp, 0n);
    assert.equal(listing.title, "Painting");
    assert.equal(listing.description, "A nice painting");
    assert.equal(listing.imageURIWatermarked, "https://wm.example/1.jpg");
    assert.equal(listing.priceWei, 500n);
    assert.equal(listing.isActive, true);
    assert.equal(listing.salesCount, 0n);
    assert.equal(listing.seller.toLowerCase(), seller.account.address.toLowerCase());

    assert.equal(await mp.read.listingCount(), 1n);
  });

  it("reverts when imageURIWatermarked is empty", async function () {
    const mp = await deployMarketplace(ignition);
    await mp.write.registerProfile(["alice", "uri"], { account: seller.account });

    await assert.rejects(
      mp.write.uploadArt(["Art", "Desc", "", "https://full.example/1.jpg", [], 100n], {
        account: seller.account,
      }),
    );
  });

  it("reverts when imageURIFull is empty", async function () {
    const mp = await deployMarketplace(ignition);
    await mp.write.registerProfile(["alice", "uri"], { account: seller.account });

    await assert.rejects(
      mp.write.uploadArt(["Art", "Desc", "https://wm.example/1.jpg", "", [], 100n], {
        account: seller.account,
      }),
    );
  });

  it("stores assetCount = 0 when no additional assets provided", async function () {
    const mp = await deployMarketplace(ignition);
    await mp.write.registerProfile(["alice", "uri"], { account: seller.account });
    await mp.write.uploadArt(["Art", "Desc", "wm", "full", [], 100n], { account: seller.account });

    const listing = await readListing(mp, 0n);
    assert.equal(listing.assetCount, 0n);
  });

  it("stores correct assetCount with additional assets", async function () {
    const mp = await deployMarketplace(ignition);
    await mp.write.registerProfile(["alice", "uri"], { account: seller.account });
    await mp.write.uploadArt(
      ["Art", "Desc", "wm", "full", ["https://assets.example/source.psd", "https://assets.example/palette.ase"], 100n],
      { account: seller.account },
    );

    const listing = await readListing(mp, 0n);
    assert.equal(listing.assetCount, 2n);
  });
});
