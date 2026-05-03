# Art Marketplace Demo

A minimal decentralized marketplace for digital art built with Solidity, Hardhat Ignition, and a React + Wagmi frontend. Sellers register on-chain profiles and upload watermarked previews and buyer-gated full assets; buyers purchase listings with ETH and gain access to full-resolution images and additional downloadable assets.

**Theme:** Marketplace + Social & Community

## Project structure

- `contracts/` — Solidity smart contract: `ArtMarketplace.sol`.
- `ignition/` — Hardhat Ignition deployment modules (e.g., `ignition/modules/ArtMarketplace.ts`).
- `test/` — Integration tests demonstrating contract behavior.
- `frontend/` — React + Vite frontend implementing wallet connect, browsing, buying, profile, and upload UI.
- `scripts/` — Utility scripts for interacting with the local test environment.

## Prerequisites

- Node.js 18+ and npm/yarn
- Git
- A MetaMask wallet for frontend interactions (Sepolia testnet in this project)

## Setup

1. Install repository dependencies:

```bash
cd art-marketplace-demo
npm install
```

2. (Optional) Create a `.env` file with any required environment variables, e.g. RPC URLs or private keys used by Hardhat. See `hardhat.config.ts` for referenced variables like `SEPOLIA_RPC_URL` and `SEPOLIA_PRIVATE_KEY`.

## Running locally

1. Start the frontend dev server:

```bash
cd frontend
npm install
npm run dev
```

Open the app in your browser (default Vite URL printed in terminal). Connect MetaMask and switch to the Sepolia testnet if prompted.

2. Running tests (contract integration tests):

```bash
# from project root
npx hardhat test
```

(Tests use Hardhat Ignition to spin up a local network and deploy the contract.)

## User Flows Implemented

- Wallet connect and network guard (Sepolia).
- Browse marketplace listings (watermarked previews).
- View seller shop and profile.
- Register an on-chain seller profile (via upload modal).
- Upload art (files uploaded to backend, then `uploadArt` called on-chain).
- Buy art (sends ETH, records purchase, emits events).
- Access full artwork and additional assets after purchase (download via backend).
- View purchased artworks and re-download files from the profile page.

## Team Members

- Tech Lead: Alvin Glenn Besa
- Smart Contracts Engineer: Shawn Timothy Ike Barza
- Frontend / UI: Lois Kirsten Alonsagay
- QA & Docs: Raine Christine Perez

## Notes

- Contract logic and tests live in `contracts/` and `test/` respectively; frontend contract calls use the ABI in `frontend/src/abi/ArtMarketplace.ts` and the contract address configured via `VITE_CONTRACT_ADDRESS`.
- The app expects a backend for file uploads and authenticated downloads (see `frontend/src/lib/backend`).
