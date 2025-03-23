# KnightChain: Intelligent Agents on Aptos Blockchain

## Overview

KnightChain is a blockchain-enabled chess gaming platform built on the Aptos blockchain that incorporates intelligent agents for in-game asset management, play-to-earn optimization, and facilitation of cross-game economies. The platform leverages Move smart contracts for secure escrow services and transparent gameplay verification while using AI agents that serve dual roles as both players and market makers within the ecosystem.

-----------------------------------------------------------------------------------------

## Key Features

- **Blockchain-based Chess Gameplay**: Play chess with financial stakes secured by smart contracts on Aptos
- **Escrow System**: Secure betting mechanism using Move language
- **Intelligent Agents**:
  - **ChessAIAgent**: Manages betting, market-making, and asset management
  - **ChessGameAgent**: Connects gameplay with blockchain infrastructure
  - **ChessTrainingAgent**: Provides training and analysis for skill improvement
- **Wallet Integration**: Supports Petra and other Aptos-compatible wallets to support transactions

-----------------------------------------------------------------------------------------

## Technical Architecture

### Smart Contracts

The platform is built on Move smart contracts:

**`chess_escrow.move`**: Manages the escrow system for chess game stakes, including:
   - Player deposits and withdrawals
   - Game status management (pending, funded, playing, completed)
   - Winner verification and prize distribution
   - Dispute resolution mechanisms


### Intelligent Agent System

The intelligent agent ecosystem consists of three primary agent types:

1. **ChessAIAgent (`src/agent/ChessAIAgent.ts`)**:
   - Manages betting pools
   - Acts as a market maker for the gaming economy
   - Verifies game outcomes
   - Handles token transfers and cross-game asset movement

2. **ChessGameAgent (`src/agent/ChessGameAgent.ts`)**:
   - Bridges between game UI and blockchain interactions
   - Manages game creation, betting, and completion flow
   - Coordinates with blockchain for transaction verification

3. **ChessTrainingAgent (`src/agent/ChessTrainingAgent.ts`)**:
   - Provides move suggestions based on difficulty level
   - Analyzes player moves for improvement
   - Offers strategic tips customized to player skill level
   - Adapts difficulty based on player performance


-----------------------------------------------------------------------------------------

## Getting Started

### Prerequisites

- Node.js (v16+)
- Petra Wallet or compatible Aptos wallet

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ayush121314/KnightChain
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`


-----------------------------------------------------------------------------------------

## User Guide

### Playing a Game with Stakes

1. Connect your wallet using the wallet connection button
2. Select an opponent (or play against an AI agent)
3. Set your stake amount in APT
4. Confirm the transaction to deposit funds into escrow
5. Play the chess game
6. Upon game completion, the winner's funds are automatically distributed

### Training Mode

1. Navigate to Training Mode in the application
2. Select your desired difficulty level (Beginner to Expert)
3. Play against the AI, receiving real-time feedback and suggestions
4. Review game analysis after completion to improve your skills


-----------------------------------------------------------------------------------------

## Architecture Diagram

```
+------------------+     +------------------+     +--------------------+
| React Chess UI   | <-> | Agent System     | <-> | Aptos Blockchain   |
| - Game Interface |     | - ChessAIAgent   |     | - Move Contracts   |
| - Wallet Connect |     | - ChessGameAgent |     | - Token Transfer   |
| - Bet Management |     | - TrainingAgent  |     | - Balance Updation |
+------------------+     +------------------+     +--------------------+
```

-----------------------------------------------------------------------------------------

## Development

### Project Structure

```
KnightChain/
├── .git/                      # Git repository
├── .next/                     # Next.js build output
├── chess_escrow/              # Move smart contract module
│   ├── .gitignore             # Git ignore file for contract directory
│   ├── Move.toml              # Move package configuration
│   
│
├── node_modules/              # NPM dependencies
├── public/                    # Static assets
│   └── coming_soon.jpg        # Coming soon image
│
├── src/                       # Source code
│   ├── agent/                 # AI agent implementation
│   │   ├── AIAgentService.ts  # AI agent service interface
│   │   ├── ChessAIAgent.ts    # Manages betting & market making
│   │   ├── ChessGameAgent.ts  # Handles gameplay-blockchain bridge
│   │   ├── ChessTrainingAgent.ts  # Chess training assistant
│   │   └── TrainingAgentService.ts # Training service
│   │
│   ├── components/            # React components
│   │   ├── AIAgentPanel.tsx   # AI agent interface
│   │   ├── AIVsPersonMode.tsx # AI vs. Person gameplay mode
│   │   ├── BettingInterface.tsx # Betting interface
│   │   ├── ChessGamePanel.tsx # Chess board and controls
│   │   ├── DebugPanel.tsx     # Debug information panel
│   │   ├── ErrorBoundary.tsx  # Error handling component
│   │   ├── EscrowPanel.tsx    # Escrow management interface
│   │   ├── GameDashboard.tsx  # Main game dashboard
│   │   ├── GamePage.tsx       # Game page component
│   │   ├── Layout.tsx         # Layout component
│   │   ├── LoadingComponent.tsx # Loading indicator
│   │   ├── PlayerPanel.tsx    # Player information panel
│   │   └── TrainingPanel.tsx  # Training mode interface
│   │
│   ├── contracts/             # Contract TypeScript interfaces
│   │   ├── ChessEscrowContract.ts # Chess escrow contract interface
│   │   ├── EscrowContractAdapter.ts # Adapter for escrow contract
│   │   └── chess_escrow.move  # Move contract 
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAIPlayer.ts     # Hook for AI player functionality
│   │   ├── useBetting.ts      # Hook for betting functionality
│   │   ├── useChessGame.ts    # Hook for chess game state
│   │   ├── useEscrow.ts       # Hook for escrow functionality
│   │   └── useWalletConnection.ts # Hook for wallet connection
│   │
│   ├── pages/                 # Next.js pages
│   │   ├── _app.tsx           # App component
│   │   ├── _error.tsx         # Error page
│   │   ├── coming-soon.tsx    # Coming soon page
│   │   └── index.tsx          # Main application page
│   │
│   │
│   ├── styles/                # CSS styles
│   │   └── globals.css        # Global CSS styles
│   │
│   ├── types/                 # TypeScript type definitions
│   │   └── game.ts            # Game-related type definitions
│   │
│   └── utils/                 # Utility functions
│       ├── blockchain.ts      # Blockchain utilities
│       └── transactions.ts    # Transaction handlers
│
├── .gitignore                 # Git ignore file
├── index.html                 # HTML entry point
├── index.tsx                  # Top-level React component
├── Move.toml                  # Move package configuration
├── next-env.d.ts              # Next.js TypeScript declarations
├── next.config.js             # Next.js configuration
├── package-lock.json          # NPM lock file
├── package.json               # NPM package configuration
├── postcss.config.js          # PostCSS configuration
├── README.md                  # Project documentation
├── styles.css                 # CSS styles (root level)
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── tsconfig.tsbuildinfo       # TypeScript build information
```

-----------------------------------------------------------------------------------------

## Roadmap

- **Multi-Game Support**: Extend agents to manage assets across multiple game types
- **Tournament System**: Automated tournaments with tiered prizes
- **Enhanced AI Agents**: Machine learning-based agents that learn from gameplay
- **Decentralized Governance**: Community control over platform parameters
- **Cross-Chain Integration**: Support for assets from multiple blockchains

-----------------------------------------------------------------------------------------

## Security Considerations


- All player funds are secured through smart contracts during gameplay
- Agents operate with limited permissions and cannot withdraw funds without authorization

-----------------------------------------------------------------------------------------

## License

This project is not supposed to be copied by anyone for any official/non-official purposes apart from the contributors without prior information to the Repo creator.

-----------------------------------------------------------------------------------------

## Contact

For questions or support, please open an issue on GitHub.
