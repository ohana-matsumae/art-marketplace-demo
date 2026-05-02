import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ArtMarketplaceModule", (m) => {
  const artMarketplace = m.contract("ArtMarketplace");

  return { artMarketplace };
});
