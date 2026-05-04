# Art Marketplace

A decentralized art marketplace platform that enables artists to register, list their work, and sell directly to collectors on the Ethereum blockchain. The platform combines on-chain smart contracts with a traditional web interface, featuring watermarked preview images and gated access to high-quality digital assets.

## Team Members & Roles

- https://github.com/ohana-matsumae : Tech Lead | DevOps
- https://github.com/LoisAlonsagayGit : Frontend, UI
- https://github.com/raynieee : QA & Docs
- https://github.com/ShawnBarza : Smart Contracts Engineer

## Live Frontend URL
<img width="1917" height="945" alt="Screenshot 2026-05-04 214434" src="https://github.com/user-attachments/assets/9a0d8eb3-ceb7-47f3-9094-f254b7cabc83" />

### Theme | Marketplace + Social & Community

https://artm.shinosawa-laboratories.dev/

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Testing](#testing)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)

## Overview

Art Marketplace is a full-stack decentralized application built on Ethereum that revolutionizes how digital artists sell their work. The platform provides:

- Secure on-chain artist profiles and artwork listings
- ETH-based transactions with direct seller payments
- Watermarked preview images for public discovery
- Gated access to full-quality assets for verified buyers
- Session-based authentication for secure transactions
- Docker-based deployment for easy setup

## Architecture

### System Overview

The application follows a three-tier architecture:

```
User Browser (React Frontend)
    |
    ├─> Wallet Connection (MetaMask/WalletConnect)
    |
    v
Backend API (Express.js)
    |
    ├─> Session Management
    ├─> File Upload & Watermarking
    ├─> Authentication Middleware
    |
    v
Smart Contracts (Solidity)
    |
    ├─> SellerProfile Management
    ├─> ArtListing Storage
    ├─> Purchase Verification
    ├─> ETH Transfers
    |
    v
Ethereum Blockchain (Sepolia Testnet)
```

### Component Breakdown

**Smart Contract Layer (ArtMarketplace.sol)**
- Manages seller profiles with username and avatar
- Stores immutable art listings with metadata
- Tracks purchases for access control
- Handles ETH payments directly from buyers to sellers
- Stores public watermarked image URIs
- Maintains private mappings for buyer-gated full-quality assets

**Backend Service (Express.js)**
- RESTful API for frontend interactions
- Session-based authentication using Web3 wallet signatures
- File upload handling and watermark generation using Sharp
- Rate limiting and CORS protection
- Direct RPC calls to blockchain for state verification

**Frontend Application (React + Vite)**
- Responsive UI built with React and TailwindCSS
- Wallet integration via wagmi and viem
- Real-time data fetching with React Query
- Multi-page routing (marketplace, profile, shop)
- Form handling for art uploads and purchases

## Features

**For Sellers**
- Create and manage artist profiles on-chain
- Upload artwork with automatic watermarking
- List multiple digital asset files per artwork
- View sales history and earnings
- Manage listing active/inactive status

**For Buyers**
- Browse watermarked artwork previews
- Connect wallet for secure purchases
- Access full-quality assets after purchase
- View purchase history
- Discover artists and collections

**For Developers**
- Modular Ignition deployment modules
- Comprehensive test suite with both Solidity and Node.js tests
- Environment variable configuration for multi-network support
- Docker-based local development environment
- TypeScript throughout for type safety

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Blockchain | Solidity | 0.8.28 |
| L1 Client | viem | 2.48.x |
| Contract Mgmt | Hardhat 3 | 3.4.x |
| Deployment | Ignition | 3.1.x |
| Backend | Express.js | 5.1.x |
| Backend Lang | TypeScript | 5.8.x |
| Frontend | React | 19.2.x |
| Frontend Build | Vite | 8.0.x |
| Styling | TailwindCSS | 4.2.x |
| Wallet | wagmi | 3.6.x |
| Testing | Node.js test | native |
| Database | File-based JSON | - |
| Container | Docker | latest |

## Prerequisites

Before getting started, ensure you have:

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: For version control
- **Wallet**: MetaMask or compatible Web3 wallet with testnet ETH
- **Docker** (optional): For containerized deployment
- **Docker Compose** (optional): For multi-service orchestration

### Obtaining Testnet ETH

For deployment to Sepolia testnet:
1. Visit [Sepolia Faucet](https://www.sepoliafaucet.io/)
2. Connect your wallet
3. Request testnet ETH (you'll need approximately 0.1 ETH for deployment and testing)

## Getting Started

### 1. Clone the Repository

```bash
git clone git@ohana.github.com:ohana-matsumae/art-marketplace-demo.git
cd art-marketplace-demo
```

### 2. Install Dependencies

This project uses npm workspaces. Install all dependencies from the root:

```bash
npm install
```

This installs dependencies for:
- Root project (Hardhat, tools)
- Backend workspace
- Frontend workspace

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with the following variables:

```env
# Sepolia Network Configuration
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
SEPOLIA_PRIVATE_KEY=your_private_key_here

# Backend Configuration
BACKEND_PORT=3001
NODE_ENV=development

# Frontend Configuration
VITE_BACKEND_URL=http://localhost:3001
VITE_NETWORK_CHAIN_ID=11155111
```

**Important**: Never commit `.env` to version control. The `.gitignore` should already exclude it.

### 4. Compile Smart Contracts

```bash
npm run compile
```

This compiles Solidity contracts in `contracts/` and generates TypeScript bindings in `frontend/src/abi/` and `backend/src/abi/`.

### 5. Development Setup

#### Option A: Local Development (Recommended for Development)

**Terminal 1 - Start Backend API:**
```bash
npm run backend:dev
```
Backend runs at `http://localhost:3001`

**Terminal 2 - Start Frontend Development Server:**
```bash
npm run frontend:dev
```
Frontend runs at `http://localhost:5173`

#### Option B: Docker Development (Recommended for Production Testing)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Backend Documentation: http://localhost:3001/api

See [DOCKER.md](DOCKER.md) for detailed Docker instructions.

### 6. Access the Application

1. Open http://localhost:5173 in your browser
2. Connect your wallet (MetaMask or compatible)
3. Switch to Sepolia testnet
4. Start using the marketplace

## Deployment

### Deploy Smart Contract to Sepolia Testnet

#### Prerequisites

1. Ensure you have Sepolia testnet ETH in your wallet (for gas fees)
2. Set `SEPOLIA_RPC_URL` and `SEPOLIA_PRIVATE_KEY` in `.env`
3. Compile contracts: `npm run compile`

#### Deployment Steps

**Step 1: Verify Configuration**
```bash
# Check that Sepolia network is configured correctly
cat hardhat.config.ts
```

**Step 2: Deploy Using Ignition**
```bash
npm run deploy
```

This runs the Ignition module defined in `ignition/modules/ArtMarketplace.ts` and deploys to Sepolia.

**Step 3: Capture Deployment Output**

After successful deployment, Hardhat Ignition creates:
- `ignition/deployments/chain-11155111/deployed_addresses.json` - Contains your contract address
- `ignition/deployments/chain-11155111/journal.jsonl` - Transaction journal

**Step 4: Update Contract Address**

```bash
# Get your deployed contract address
cat ignition/deployments/chain-11155111/deployed_addresses.json
```

Update your `.env`:
```env
VITE_CONTRACT_ADDRESS=0x... # From deployed_addresses.json
```

**Step 5: Verify Deployment**

Open Sepolia Etherscan and search for your contract address:
```
https://sepolia.etherscan.io/address/0x...
```

You should see:
- Contract creation transaction
- Contract code verification option
- Read/Write contract functions

#### Deployment Checklist

- [ ] Sufficient Sepolia ETH for gas (0.1 ETH recommended)
- [ ] Private key properly stored in `.env`
- [ ] Contracts compiled successfully
- [ ] Ignition module syntax is valid
- [ ] Contract address updated in frontend config
- [ ] Verified deployment on Etherscan

### Deploy Application Services

#### Using Docker Compose (Recommended)

```bash
# Build images
docker-compose build

# Start services in background
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

#### Manual Deployment

**Build Backend:**
```bash
npm run backend:build
cd backend
npm run start
```

**Build Frontend:**
```bash
npm run frontend:build

# Serve build output with any HTTP server
npx http-server frontend/dist
```

## Testing

### Run All Tests

```bash
npm run test
```

### Run Specific Test Suites

```bash
# Solidity contract tests
npm run test:solidity

# Node.js integration tests
npm run test:nodejs
```

### Test Structure

- **Solidity Tests** (`test/*.ts`): Test smart contract functions directly
  - `registerProfile.ts` - Artist profile registration
  - `uploadArt.ts` - Artwork listing creation
  - `buyArt.ts` - Purchase transactions
  - `deactivateListing.ts` - Listing status management
  - `readMethods.ts` - Query operations

- **Integration Tests**: End-to-end scenarios with wallet interactions

### Writing New Tests

Tests use Node.js native `test` runner with viem for contract interactions:

```typescript
import { test } from "node:test";
import { expect } from "chai";
import { getContractAt } from "hardhat-viem";

test("should register a seller profile", async () => {
  const contract = await getContractAt("ArtMarketplace");
  const tx = await contract.write.registerProfile([
    "ArtistName",
    "https://example.com/avatar.jpg"
  ]);
  expect(tx).toBeDefined();
});
```

## Configuration

### Environment Variables Reference

```env
# Network Configuration
SEPOLIA_RPC_URL              # RPC endpoint for Sepolia testnet
SEPOLIA_PRIVATE_KEY          # Private key for deployment (64 hex chars)

# Backend
BACKEND_PORT                 # Express server port (default: 3001)
NODE_ENV                     # development|production
CORS_ORIGIN                  # Frontend URL for CORS

# Frontend
VITE_BACKEND_URL             # Backend API base URL
VITE_NETWORK_CHAIN_ID        # Sepolia chain ID (11155111)
VITE_CONTRACT_ADDRESS        # Deployed contract address
```

### Network Configuration

The project is configured for Sepolia testnet. To switch networks:

1. Update `hardhat.config.ts` with new network RPC and accounts
2. Modify `VITE_NETWORK_CHAIN_ID` in frontend `.env`
3. Redeploy contract to new network
4. Update contract address in frontend config

## API Documentation

### Backend REST API

Base URL: `http://localhost:3001/api`

#### Authentication Endpoints

**POST /auth/nonce**
- Get a nonce for signing
- Response: `{ nonce: string }`

**POST /auth/verify**
- Verify wallet signature and establish session
- Body: `{ address: string, signature: string }`
- Response: `{ sessionId: string, user: { address: string } }`

#### Artwork Endpoints

**POST /assets/upload**
- Upload artwork with watermarking
- Requires authentication
- Form data: `image`, `title`, `description`, `price`
- Response: `{ listingId: number, imageURI: string }`

**GET /assets/listings**
- Get all public listings
- Response: `[ { id, title, seller, price, imageURIWatermarked }, ... ]`

**GET /assets/listings/:id/full-image**
- Get full-quality image (requires purchase verification)
- Response: `{ imageURI: string }`

#### User Endpoints

**GET /rpc/*path**
- Direct RPC proxy to blockchain
- Enables frontend to query contract state
- Example: `GET /rpc/view-profile/0x...`

## Project Structure

```
art-marketplace-demo/
├── contracts/
│   └── ArtMarketplace.sol          # Main smart contract
├── backend/
│   ├── src/
│   │   ├── index.ts                # Express server entry point
│   │   ├── config.ts               # Configuration loader
│   │   ├── abi/
│   │   │   └── artMarketplace.ts   # Contract ABI (generated)
│   │   ├── routes/
│   │   │   ├── auth.ts             # Authentication endpoints
│   │   │   ├── assets.ts           # Artwork endpoints
│   │   │   ├── upload.ts           # Upload handler
│   │   │   └── rpc.ts              # RPC proxy
│   │   ├── services/
│   │   │   ├── chain.ts            # Blockchain interactions
│   │   │   └── watermark.ts        # Image watermarking
│   │   ├── middleware/
│   │   │   └── requireAuth.ts      # Auth middleware
│   │   ├── store/
│   │   │   └── fileStore.ts        # File storage management
│   │   └── types/
│   │       └── session.d.ts        # Type definitions
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── main.tsx                # React entry point
│   │   ├── App.tsx                 # Main component
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Navigation bar
│   │   │   ├── ArtCard.tsx         # Artwork display card
│   │   │   ├── UploadModal.tsx     # Upload form
│   │   │   ├── BuySuccessModal.tsx # Purchase confirmation
│   │   │   └── NetworkGuard.tsx    # Chain validation
│   │   ├── pages/
│   │   │   ├── MainPage.tsx        # Homepage/marketplace
│   │   │   ├── ShopPage.tsx        # Shopping interface
│   │   │   └── ProfilePage.tsx     # User profile
│   │   ├── hooks/
│   │   │   ├── useWallet.ts        # Wallet management
│   │   │   ├── useBuyArt.ts        # Purchase logic
│   │   │   ├── useListings.ts      # Load listings
│   │   │   ├── useProfile.ts       # Artist profiles
│   │   │   └── useBackendAuth.ts   # Backend auth
│   │   ├── lib/
│   │   │   ├── backend.ts          # API client
│   │   │   └── wagmi.ts            # Wagmi config
│   │   └── abi/
│   │       └── ArtMarketplace.ts   # Contract ABI (generated)
│   └── Dockerfile
├── ignition/
│   ├── modules/
│   │   └── ArtMarketplace.ts       # Deployment module
│   └── deployments/
│       └── chain-11155111/         # Deployment artifacts
├── test/
│   ├── registerProfile.ts
│   ├── uploadArt.ts
│   ├── buyArt.ts
│   ├── deactivateListing.ts
│   └── readMethods.ts
├── hardhat.config.ts               # Hardhat configuration
├── package.json                    # Root dependencies
├── docker-compose.yml              # Docker orchestration
├── .env.example                    # Environment template
└── README.md                       # This file
```

## Development Workflow

### Adding a New Feature

1. **Update Smart Contract** (`contracts/ArtMarketplace.sol`)
   - Add state variables, events, or functions
   - Run `npm run compile` to generate ABIs

2. **Update Backend** (`backend/src/`)
   - Add API routes in `routes/`
   - Add business logic in `services/`
   - Update middleware if needed

3. **Update Frontend** (`frontend/src/`)
   - Add custom hooks if needed
   - Add components for UI
   - Update pages to integrate new feature

4. **Write Tests** (`test/`)
   - Add tests for contract changes
   - Verify integration with backend

5. **Test Locally**
   - Run tests: `npm run test`
   - Start dev servers and manual test
   - Test in Docker: `docker-compose up`

### Code Standards

- Use TypeScript for all source files
- Follow existing naming conventions (camelCase for functions/variables, PascalCase for contracts/components)
- Format code with prettier (if configured)
- Write JSDoc comments for public functions

## Troubleshooting

**Cannot connect to wallet**
- Ensure MetaMask is installed and unlocked
- Check that you're on Sepolia testnet (Chain ID: 11155111)
- Try refreshing the page

**Transaction failures**
- Verify sufficient Sepolia ETH balance (check gas estimations)
- Ensure contract address in `.env` matches deployed contract
- Check that your wallet is not rate-limited

**Backend API errors**
- Verify backend is running: `npm run backend:dev`
- Check RPC URL is correct and accessible
- Ensure all environment variables are set

**Docker issues**
- Rebuild images: `docker-compose build --no-cache`
- Check Docker daemon is running
- Review logs: `docker-compose logs backend`

## Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Viem Documentation](https://viem.sh/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Sepolia Testnet Explorer](https://sepolia.etherscan.io/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

## License

ISC
