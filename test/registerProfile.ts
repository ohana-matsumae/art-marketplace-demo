import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getAddress } from "viem";

import {
  createMarketplaceTestContext,
  deployMarketplace,
  type Profile,
} from "./helpers.js";

describe("ArtMarketplace / registerProfile", async function () {
  const { ignition, viem, seller } = await createMarketplaceTestContext();

  it("stores profile and emits ProfileRegistered", async function () {
    const mp = await deployMarketplace(ignition);

    await viem.assertions.emitWithArgs(
      mp.write.registerProfile(["alice", "https://avatar.example/alice.png"], {
        account: seller.account,
      }),
      mp,
      "ProfileRegistered",
      [getAddress(seller.account.address), "alice"],
    );

    const profile = (await mp.read.profiles([seller.account.address])) as Profile;
    assert.equal(profile[0], "alice");
    assert.equal(profile[1], "https://avatar.example/alice.png");
    assert.equal(profile[2], true);
  });

  it("can update an existing profile", async function () {
    const mp = await deployMarketplace(ignition);

    await mp.write.registerProfile(["alice", "https://avatar.example/v1.png"], {
      account: seller.account,
    });
    await mp.write.registerProfile(
      ["alice_v2", "https://avatar.example/v2.png"],
      { account: seller.account },
    );

    const profile = (await mp.read.profiles([seller.account.address])) as Profile;
    assert.equal(profile[0], "alice_v2");
    assert.equal(profile[1], "https://avatar.example/v2.png");
  });
});
