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

### Blockchain Integration

The platform bridges to blockchain through two primary interfaces:

1. **Aptos Integration (`src/utils/transactions.ts`)**:
   - Direct interaction with Aptos blockchain
   - Handles APT token transfers
   - Manages Petra wallet integration

2. **Contract Management (`src/utils/blockchain.ts`)**:
   - Smart contract interaction layer
   - Game creation, betting, and reward distribution
   - Transaction management and verification

-----------------------------------------------------------------------------------------

## Getting Started

### Prerequisites

- Node.js (v16+)
- Aptos CLI (for contract deployment)
- Petra Wallet or compatible Aptos wallet

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd chess-gamefi
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

### Smart Contract Deployment

1. Configure your Move.toml with your account address:
   ```toml
   [addresses]
   chess_escrow = "YOUR_APTOS_ADDRESS"  // the one who is going to act as an escrow
   ```

2. Compile and deploy the contract:
   ```bash
   aptos move compile
   aptos move publish
   ```

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

### Market Participation

1. View available betting pools in the Market tab
2. Place bets on ongoing games or fund an escrow as a market maker
3. Monitor your portfolio across various games

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
│
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
├── Move.toml
│
├── public/
│   └── assets/                # Static assets like images, icons, etc.
│
├── src/
│   ├── agent/                 # Intelligent agents
│   │   ├── ChessAIAgent.ts
│   │   ├── ChessGameAgent.ts
│   │   └── ChessTrainingAgent.ts
│   │
│   ├── components/            # React components
│   │   ├── GameBoard.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   │
│   ├── pages/                 # Next.js pages
│   │   ├── index.tsx
│   │   ├── game.tsx
│   │   └── profile.tsx
│   │
│   ├── styles/                # CSS and styling
│   │   └── globals.css
│   │
│   ├── utils/                 # Utility functions
│   │   ├── transactions.ts
│   │   └── blockchain.ts
│   │
│   ├── hooks/                 # Custom React hooks
│   │   └── useWallet.ts
│   │
│   └── context/               # React context for global state
│       └── AppContext.tsx
│
├── chess_escrow/              # Move smart contracts
│   └── chess_escrow.move
│
└── tests/                     # Test files
    ├── agent/
    ├── components/
    ├── pages/
    └── utils/
```

### Extending the Platform

To add new features to the platform:

1. **New Agent Types**: Create new agent classes in `src/agent/` following the existing patterns
2. **Additional Game Types**: Extend the escrow contract to support different game types
3. **Cross-Game Features**: Implement new methods in ChessAIAgent for managing assets across games
4. **NFTs Based Reward System**: Apart from bet wins, award NFTs to the winners as a proof of their victory

-----------------------------------------------------------------------------------------

## Roadmap

- **Multi-Game Support**: Extend agents to manage assets across multiple game types
- **Tournament System**: Automated tournaments with tiered prizes
- **Enhanced AI Agents**: Machine learning-based agents that learn from gameplay
- **Decentralized Governance**: Community control over platform parameters
- **Cross-Chain Integration**: Support for assets from multiple blockchains

-----------------------------------------------------------------------------------------

## Security Considerations

- The escrow contract includes timeout and dispute resolution mechanisms
- All player funds are secured through smart contracts during gameplay
- Agents operate with limited permissions and cannot withdraw funds without authorization

-----------------------------------------------------------------------------------------

## License

This project is not supposed to be copied by anyone for any official/non-official purposes apart from the contributors without prior information to the Repo creator.

-----------------------------------------------------------------------------------------

## Contact

For questions or support, please open an issue on GitHub.
