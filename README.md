# Bot Hunter: Elite Neuro-Tactical Combat

> Fast-paced cyberpunk 2D arcade shooter built on Ethereum L2 (Base) with sub-second block confirmations, on-chain high score proof-of-play, and Base Builder Code attribution.

---

## Overview

**Bot Hunter** drops players into a rogue AI training simulation where rogue automaton squads have breached security perimeter sub-grids. Take command of an agile combat operative vessel, maneuver through hostile fire, neutralize escalating waves of specialized combat bots, and immortalize your high scores directly on the Base blockchain.

---

## Core Gameplay & Features

### 1. High-Octane Wave Defense
- **Dynamic Wave Progression**: Hostile drones spawn in escalating waves with increasing density, aggression, and speed multipliers.
- **Dynamic Score Multipliers**: String together rapid eliminations to scale your combo meter and maximize score yields.
- **Tactical Shields & Hull Integrity**: Manage shield regeneration and survive tactical crossfire in bullet-hell style combat arenas.

### 2. Hostile Drone Classes
- **Rogue Stalker (Basic)**: Agile assault drones that track your position and deploy steady plasma bursts.
- **Heavy Titan (Tank)**: Armored behemoths equipped with reinforced armor plating and destructive heavy fire volleys.
- **Viper Interceptor (Swarm)**: High-velocity micro-drones designed to flank, harass, and box in operative movement.

### 3. Cross-Platform Responsive Controls
- **Desktop (Keyboard & Mouse)**:
  - **Move**: `W`, `A`, `S`, `D` or Arrow Keys
  - **Aim**: Mouse Cursor (360° omnidirectional precision)
  - **Fire**: Left Mouse Click or `Spacebar`
- **Mobile & Touch Devices**:
  - **Left Virtual Joystick**: Omni-directional fluid movement and evasion.
  - **Right Virtual Joystick**: 360° targeting reticle with dynamic autofire engagement.

---

## Base & On-Chain Architecture

Bot Hunter is engineered for optimal L2 performance on **Base Mainnet** and **Base Sepolia**:

- **200ms Canonical Blocks (Base Denim Ready)**: Real-time transaction confirmations utilizing canonical block heads for near-instant on-chain receipts without deprecated pending state polling.
- **ERC-8021 Builder Code Attribution**: Integrates standardized calldata suffix attribution (`bc_9b19fklw`) to recognize ecosystem contributions across all on-chain interactions.
- **Canonical Multicall3 High-Score Logging**: Executes verifiable score recordings through the canonical Multicall3 contract (`0xcA11bde05977b3631167028862bE2a173976CA11`), ensuring protocol compliance across standard and smart contract wallets.
- **EIP-5792 Smart Wallet Capabilities**: Automated capability negotiation detecting atomic batching, paymaster sponsorship, and data suffix support for modern account abstraction wallets (e.g. Coinbase Smart Wallet).
- **Model Context Protocol (MCP) Integration**: Built-in MCP endpoint accessible at `/api/mcp` providing programmatic query and action tools for Base network status, wallet balances, and game stats.

---

## Tech Stack

- **Client**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion
- **Web3 / Blockchain**: Wagmi v3, Viem v2, Coinbase Wallet SDK, Injected Web3 Connectors
- **Server**: Node.js, Express, tsx, Model Context Protocol (MCP) SDK
- **Network Targets**: Base (Chain ID: `8453`), Base Sepolia (Chain ID: `84532`)

---

## Getting Started

### Prerequisites

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher
- A Web3 wallet supporting Base (e.g., Coinbase Wallet, MetaMask, Rabby) with Base ETH for on-chain score recording.

### Installation

1. **Clone the repository and install dependencies**:
   ```bash
   git clone <repository-url>
   cd bot-hunter
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```
   The local game will launch at `http://localhost:3000`.

3. **Production Build**:
   ```bash
   npm run build
   npm run start
   ```

---

## Game Loop & Rules

| Milestone | Objective | Strategy |
| :--- | :--- | :--- |
| **Early Wave (1–3)** | Establish perimeter control | Clear basic stalkers while conserving shield charge. |
| **Mid Wave (4–7)** | Prioritize heavy armor targets | Kite swarm units into open space; burn down Titan shielding first. |
| **Late Wave (8+)** | Bullet Hell survival | Maintain non-stop evasive movement and leverage combo multipliers. |
| **Game Over** | On-Chain Attestation | Connect wallet and sign a proof-of-score transaction verified on Base. |

---

## License

MIT License. Designed and engineered for the Base ecosystem.
