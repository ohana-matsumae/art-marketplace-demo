import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createMarketplaceTestContext, deployMarketplace, readListing } from "./helpers.js";

describe("ArtMarketplace / deactivateListing", async function () {
  const { ignition, viem, seller, buyer } = await createMarketplaceTestContext();

  it("marks listing inactive", async function () {
    const mp = await deployMarketplace(ignition);
    await mp.write.registerProfile(["alice", "uri"], { account: seller.account });
    await mp.write.uploadArt(["Painting", "Desc", "wm_uri", "full_uri", [], 1000n], {
      account: seller.account,
    });

    await mp.write.deactivateListing([0n], { account: seller.account });

    const listing = await readListing(mp, 0n);
    assert.equal(listing.isActive, false);
  });

  it("reverts for non-owner", async function () {
    const mp = await deployMarketplace(ignition);
    await mp.write.registerProfile(["alice", "uri"], { account: seller.account });
    await mp.write.uploadArt(["Painting", "Desc", "wm_uri", "full_uri", [], 1000n], {
      account: seller.account,
    });

    await assert.rejects(
      mp.write.deactivateListing([0n], { account: buyer.account }),
    );
  });
});
