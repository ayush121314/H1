// Define game-related types
export type Winner = 'player1' | 'player2' | 'draw' | null;
export type GameState = 'waiting' | 'betting' | 'bet_announced' | 'escrow_locked' | 'playing' | 'completed';

// Define player wallet info type
export interface PlayerWalletInfo {
  address: string;
  balance: number;
}

// Define game props type for sharing between components
export interface GameProps {
  gameState: GameState;
  player1Wallet: PlayerWalletInfo | null;
  player2Wallet: PlayerWalletInfo | null;
  player1Bet: number;
  player2Bet: number;
  player1EscrowLocked: boolean;
  player2EscrowLocked: boolean;
  escrowLocked: boolean;
  finalBetAmount: number;
  winner: Winner;
}

// Define escrow related types
export interface EscrowProps {
  escrowAddress: string | null;
  escrowStatus: number;
  escrowBalance: number;
  useSimulationMode: boolean;
} 