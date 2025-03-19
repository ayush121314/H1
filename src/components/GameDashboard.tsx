import React from 'react';

interface Wallet {
  address: string;
  balance: number;
}

type Winner = 'player1' | 'player2' | 'draw' | null;
type GameState = 'waiting' | 'betting' | 'bet_announced' | 'escrow_locked' | 'playing' | 'completed';

interface GameDashboardProps {
  gameState: GameState;
  player1Wallet: Wallet | null;
  player2Wallet: Wallet | null;
  player1Bet: number;
  player2Bet: number;
  player1EscrowLocked?: boolean;
  player2EscrowLocked?: boolean;
  escrowLocked: boolean;
  finalBetAmount: number;
  winner: Winner;
}

export function GameDashboard({
  gameState,
  player1Wallet,
  player2Wallet,
  player1Bet,
  player2Bet,
  player1EscrowLocked = false,
  player2EscrowLocked = false,
  escrowLocked,
  finalBetAmount,
  winner
}: GameDashboardProps) {
  const getGameStatus = () => {
    if (!player1Wallet && !player2Wallet) {
      return 'Please connect both player wallets to start the game';
    }

    if (!player1Wallet || !player2Wallet) {
      return `Waiting for ${!player1Wallet ? 'Player 1' : 'Player 2'} to connect wallet`;
    }

    switch (gameState) {
      case 'waiting':
        return 'Waiting for players to announce their bets';
      case 'betting':
        if (player1Bet > 0 && player2Bet > 0) {
          const minimumBet = Math.min(player1Bet, player2Bet);
          return `Both players have announced bets - Minimum bet: ${minimumBet} APT. This is the amount that will be locked in escrow.`;
        } else if (player1Bet > 0) {
          return `Player 1 bet: ${player1Bet} APT. Waiting for Player 2 to announce bet.`;
        } else if (player2Bet > 0) {
          return `Player 2 bet: ${player2Bet} APT. Waiting for Player 1 to announce bet.`;
        }
        return 'Waiting for players to announce their bets';
      case 'bet_announced':
        return 'Both players have announced bets. Lock the escrow to start the game.';
      case 'escrow_locked':
        return 'Escrow locked. Game will start shortly.';
      case 'playing':
        return `Game in progress. Total pot: ${finalBetAmount} APT`;
      case 'completed':
        if (winner === 'draw') {
          return 'Game ended in a draw! Both players receive their bets back.';
        } else if (winner === 'player1') {
          return `Player 1 wins ${finalBetAmount} APT!`;
        } else if (winner === 'player2') {
          return `Player 2 wins ${finalBetAmount} APT!`;
        }
        return 'Game completed.';
      default:
        return 'Unknown game state';
    }
  };

  const getEscrowStatus = () => {
    if (gameState === 'waiting' || gameState === 'completed') {
      return null;
    }

    const minimumBet = player1Bet > 0 && player2Bet > 0 ? Math.min(player1Bet, player2Bet) : 0;

    return (
      <div className="mb-4 p-3 border rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Escrow Status</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p><span className="font-medium">Player 1:</span> {player1EscrowLocked ? '✅ Locked' : '🔓 Unlocked'}</p>
            <p><span className="font-medium">Announced Bet:</span> {player1Bet} APT</p>
          </div>
          <div>
            <p><span className="font-medium">Player 2:</span> {player2EscrowLocked ? '✅ Locked' : '🔓 Unlocked'}</p>
            <p><span className="font-medium">Announced Bet:</span> {player2Bet} APT</p>
          </div>
        </div>
        
        {minimumBet > 0 && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800 font-medium">
              Minimum bet: {minimumBet} APT
              <span className="block text-sm font-normal mt-1">
                Each player will lock {minimumBet} APT in escrow, for a total pot of {minimumBet * 2} APT
              </span>
            </p>
          </div>
        )}
        
        {(player1EscrowLocked || player2EscrowLocked) && (
          <div className="mt-2">
            <p className="text-sm">
              {player1EscrowLocked && player2EscrowLocked 
                ? '✅ Both players have locked their escrow. Game is ready to start.'
                : player1EscrowLocked 
                  ? '⏳ Waiting for Player 2 to lock escrow...'
                  : '⏳ Waiting for Player 1 to lock escrow...'}
            </p>
          </div>
        )}
        {escrowLocked && (
          <div className="mt-2 p-2 bg-green-100 rounded">
            <p className="text-green-700">✅ Escrow locked! Final amount: {finalBetAmount} APT</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mb-6 p-4 border rounded bg-blue-50">
      <h2 className="text-xl font-bold mb-2">Game Status</h2>
      <p className="mb-4">{getGameStatus()}</p>
      {getEscrowStatus()}
    </div>
  );
} 