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
      return { message: 'Please connect both player wallets to start the game', status: 'warning' };
    }

    if (!player1Wallet || !player2Wallet) {
      return { 
        message: `Waiting for ${!player1Wallet ? 'Player 1' : 'Player 2'} to connect wallet`, 
        status: 'waiting' 
      };
    }

    switch (gameState) {
      case 'waiting':
        return { 
          message: 'Waiting for players to announce their bets', 
          status: 'waiting' 
        };
      case 'betting':
        if (player1Bet > 0 && player2Bet > 0) {
          const minimumBet = Math.min(player1Bet, player2Bet);
          return { 
            message: `Both players have announced bets - Minimum bet: ${minimumBet} APT. This is the amount that will be locked in escrow.`, 
            status: 'info' 
          };
        } else if (player1Bet > 0) {
          return { 
            message: `Player 1 bet: ${player1Bet} APT. Waiting for Player 2 to announce bet.`, 
            status: 'waiting' 
          };
        } else if (player2Bet > 0) {
          return { 
            message: `Player 2 bet: ${player2Bet} APT. Waiting for Player 1 to announce bet.`, 
            status: 'waiting' 
          };
        }
        return { 
          message: 'Waiting for players to announce their bets', 
          status: 'waiting' 
        };
      case 'bet_announced':
        return { 
          message: 'Both players have announced bets. Lock the escrow to start the game.', 
          status: 'info' 
        };
      case 'escrow_locked':
        return { 
          message: 'Escrow locked. Game will start shortly.', 
          status: 'success' 
        };
      case 'playing':
        return { 
          message: `Game in progress. Total pot: ${finalBetAmount} APT`, 
          status: 'info' 
        };
      case 'completed':
        if (winner === 'draw') {
          return { 
            message: 'Game ended in a draw! Both players receive their bets back.', 
            status: 'info' 
          };
        } else if (winner === 'player1') {
          return { 
            message: `Player 1 wins ${finalBetAmount} APT!`, 
            status: 'success' 
          };
        } else if (winner === 'player2') {
          return { 
            message: `Player 2 wins ${finalBetAmount} APT!`, 
            status: 'success' 
          };
        }
        return { 
          message: 'Game completed.', 
          status: 'info' 
        };
      default:
        return { 
          message: 'Unknown game state', 
          status: 'error' 
        };
    }
  };

  const getEscrowStatus = () => {
    if (gameState === 'waiting' || gameState === 'completed') {
      return null;
    }

    const minimumBet = player1Bet > 0 && player2Bet > 0 ? Math.min(player1Bet, player2Bet) : 0;

    return (
      <div className="glass-card mb-4 px-6 py-5 overflow-hidden relative">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-gradient-to-br from-dark-700 to-dark-600 opacity-10" />
        <h3 className="text-xl font-semibold mb-4 text-blue-gradient">Escrow Status</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-card px-4 py-3 bg-dark-800/70">
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 rounded-full bg-primary-500 mr-2"></div>
              <span className="font-medium text-lg text-gray-300">Player 1</span>
            </div>
            <div className="flex items-center mb-1">
              <span className="font-medium text-gray-400">Status:</span>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-sm ${player1EscrowLocked ? 'bg-accent-900/20 text-accent-400' : 'bg-dark-700 text-gray-400'}`}>
                {player1EscrowLocked ? '✅ Locked' : '🔓 Unlocked'}
              </span>
            </div>
            <p className="flex justify-between">
              <span className="font-medium text-gray-400">Bet:</span>
              <span className="font-mono text-primary-400">{player1Bet} APT</span>
            </p>
          </div>
          
          <div className="glass-card px-4 py-3 bg-dark-800/70">
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 rounded-full bg-secondary-500 mr-2"></div>
              <span className="font-medium text-lg text-gray-300">Player 2</span>
            </div>
            <div className="flex items-center mb-1">
              <span className="font-medium text-gray-400">Status:</span>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-sm ${player2EscrowLocked ? 'bg-accent-900/20 text-accent-400' : 'bg-dark-700 text-gray-400'}`}>
                {player2EscrowLocked ? '✅ Locked' : '🔓 Unlocked'}
              </span>
            </div>
            <p className="flex justify-between">
              <span className="font-medium text-gray-400">Bet:</span>
              <span className="font-mono text-primary-400">{player2Bet} APT</span>
            </p>
          </div>
        </div>
        
        {minimumBet > 0 && (
          <div className="mt-4 p-4 glass-card bg-primary-900/10 border border-primary-800/30">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-primary-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-primary-300 font-medium">
                Minimum bet: <span className="font-mono">{minimumBet} APT</span>
              </p>
            </div>
            <p className="text-sm font-normal mt-1 text-primary-400/70 pl-7">
              Each player will lock {minimumBet} APT in escrow, for a total pot of {minimumBet * 2} APT
            </p>
          </div>
        )}
        
        {(player1EscrowLocked || player2EscrowLocked) && (
          <div className="mt-4">
            <p className={`text-sm ${player1EscrowLocked && player2EscrowLocked ? 'text-accent-400' : 'text-primary-400'}`}>
              {player1EscrowLocked && player2EscrowLocked 
                ? '✅ Both players have locked their escrow. Game is ready to start.'
                : player1EscrowLocked 
                  ? '⏳ Waiting for Player 2 to lock escrow...'
                  : '⏳ Waiting for Player 1 to lock escrow...'}
            </p>
          </div>
        )}
        
        {escrowLocked && (
          <div className="mt-4 p-4 glass-card bg-accent-900/10 border border-accent-800/30">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-accent-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-accent-300 font-medium">
                Escrow locked! Final amount: <span className="font-mono">{finalBetAmount} APT</span>
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const status = getGameStatus();

  return (
    <div className="game-dashboard relative overflow-hidden">
      <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br from-primary-900/30 to-primary-800/20 opacity-20" />
      <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-gradient-to-tr from-dark-700 to-dark-800 opacity-20" />
      
      <div className="relative">
        <h2 className="text-2xl font-bold mb-4 text-gradient">Game Status</h2>
        <div className="flex items-center mb-6">
          <div className={`status-${status.status}`}>
            {status.status === 'success' ? '✅' : 
             status.status === 'error' ? '❌' : 
             status.status === 'warning' ? '⚠️' : 
             status.status === 'info' ? 'ℹ️' : '⏳'}
            {' '}{status.status.charAt(0).toUpperCase() + status.status.slice(1)}
          </div>
          <p className="ml-3 text-lg text-gray-300">{status.message}</p>
        </div>
        
        {getEscrowStatus()}
      </div>
    </div>
  );
} 