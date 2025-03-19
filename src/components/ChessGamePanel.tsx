import React from 'react';
import { Chessboard } from 'react-chessboard';
import { GameState, Winner } from '../types/game';

interface ChessGamePanelProps {
  game: any; // Chess.js instance
  gameState: GameState;
  currentPlayer: 'white' | 'black';
  winner: Winner;
  finalBetAmount: number;
  player1Wallet: any;
  player2Wallet: any;
  player1Bet: number;
  player2Bet: number;
  onDrop: (sourceSquare: string, targetSquare: string) => boolean;
  onAnnounceUnifiedBet: () => void;
  onStartNewGame: () => void;
  onForfeit: () => void;
  onPlayer1BetChange?: (amount: number) => void;
  onPlayer2BetChange?: (amount: number) => void;
}

const ChessGamePanel: React.FC<ChessGamePanelProps> = ({
  game,
  gameState,
  currentPlayer,
  winner,
  finalBetAmount,
  player1Wallet,
  player2Wallet,
  player1Bet,
  player2Bet,
  onDrop,
  onAnnounceUnifiedBet,
  onStartNewGame,
  onForfeit,
  onPlayer1BetChange,
  onPlayer2BetChange
}) => {
  // Handle bet changes with fallbacks if handlers aren't provided
  const handlePlayer1BetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    if (onPlayer1BetChange) {
      onPlayer1BetChange(value);
    }
  };

  const handlePlayer2BetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    if (onPlayer2BetChange) {
      onPlayer2BetChange(value);
    }
  };

  // Get status type and message for styling
  const getStatusType = () => {
    if (gameState === 'completed') {
      return winner === 'draw' ? 'info' : 'success';
    } else if (gameState === 'playing') {
      return 'info';
    } else if (gameState === 'betting') {
      return 'warning';
    }
    return 'waiting';
  };

  const getStatusMessage = () => {
    if (gameState === 'waiting') return 'Waiting for players to connect and place bets';
    if (gameState === 'betting') return 'Waiting for players to lock their escrow';
    if (gameState === 'playing') return `${currentPlayer === 'white' ? 'White' : 'Black'}'s turn to move`;
    if (gameState === 'completed') {
      return winner === 'draw' 
        ? 'Game ended in a draw' 
        : `${winner === 'player1' ? 'Player 1 (White)' : 'Player 2 (Black)'} won!`;
    }
    return 'Unknown game state';
  };

  const statusType = getStatusType();
  const statusMessage = getStatusMessage();

  return (
    <div className="panel bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -left-20 -top-20 w-40 h-40 rounded-full bg-primary-900/20 opacity-30 blur-xl" />
      <div className="absolute -right-20 -bottom-20 w-40 h-40 rounded-full bg-dark-800/30 opacity-30 blur-xl" />
      
      <div className="relative">
        <div className="mb-6">
          <div className="glass-card p-4 bg-gradient-to-r from-dark-800 to-dark-900">
            <div className="flex items-center mb-2">
              <div className={`w-2 h-2 rounded-full ${
                statusType === 'success' ? 'bg-accent-500' : 
                statusType === 'info' ? 'bg-primary-500' : 
                statusType === 'warning' ? 'bg-warning-500' : 'bg-dark-500'
              } mr-2`}></div>
              <h3 className="text-lg font-semibold text-gradient">Game Status</h3>
            </div>
            <div className="flex items-center pl-4">
              <span className={`status-${statusType}`}>
                {statusType === 'success' ? '✅' : 
                 statusType === 'warning' ? '⚠️' : 
                 statusType === 'info' ? 'ℹ️' : '⏳'}
                {' '}{statusType.charAt(0).toUpperCase() + statusType.slice(1)}
              </span>
              <p className="ml-2 text-gray-300">{statusMessage}</p>
            </div>
          </div>
        </div>

        {/* Unified Betting Interface - Show when both wallets are connected and in waiting state */}
        {gameState === 'waiting' && player1Wallet && player2Wallet && (
          <div className="mb-6 glass-card p-6 bg-gradient-to-br from-warning-900/20 to-warning-800/10 border border-warning-800/30">
            <h3 className="text-xl font-bold text-center mb-4 text-gradient">Announce Bets</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="glass-card p-4 bg-dark-800/80">
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mr-2"></div>
                  <p className="font-medium text-gray-300">Player 1 Bet</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={player1Bet}
                    onChange={handlePlayer1BetChange}
                    className="input-field w-full text-center"
                    placeholder="Enter amount"
                  />
                  <span className="ml-2 font-mono text-gray-400">APT</span>
                </div>
              </div>
              <div className="glass-card p-4 bg-dark-800/80">
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 rounded-full bg-secondary-500 mr-2"></div>
                  <p className="font-medium text-gray-300">Player 2 Bet</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={player2Bet}
                    onChange={handlePlayer2BetChange}
                    className="input-field w-full text-center"
                    placeholder="Enter amount"
                  />
                  <span className="ml-2 font-mono text-gray-400">APT</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={onAnnounceUnifiedBet}
              disabled={!player1Wallet || !player2Wallet || player1Bet <= 0 || player2Bet <= 0}
              className="btn-accent w-full py-3 px-4 text-lg font-medium flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Announce Bets & Calculate Minimum
            </button>
            <p className="text-xs text-center text-gray-400 mt-2">
              This will calculate the minimum bet amount from both players
            </p>
          </div>
        )}

        <div className="mb-6">
          <div className="chess-board bg-dark-800">
            <Chessboard
              position={game.fen()}
              onPieceDrop={onDrop}
              boardOrientation="white"
              customBoardStyle={{
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5)',
                borderRadius: '0.5rem',
                overflow: 'hidden'
              }}
              customDarkSquareStyle={{ backgroundColor: '#1e293b' }} // secondary-800
              customLightSquareStyle={{ backgroundColor: '#334155' }} // secondary-700
            />
          </div>
        </div>

        {gameState === 'playing' && (
          <div className="glass-card p-4 text-center mb-4 bg-primary-900/20">
            <div className="flex flex-col sm:flex-row items-center justify-center mb-4">
              <div className="flex items-center mr-6">
                <div className={`w-3 h-3 rounded-full ${currentPlayer === 'white' ? 'bg-primary-500' : 'bg-secondary-500'} mr-2`}></div>
                <p className="text-lg font-medium text-gray-300">
                  Current Player: <span className="text-gradient">{currentPlayer === 'white' ? 'White (Player 1)' : 'Black (Player 2)'}</span>
                </p>
              </div>
              <div className="flex items-center mt-2 sm:mt-0">
                <svg className="w-5 h-5 text-accent-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium text-gray-300">
                  Total Pool: <span className="font-mono text-accent-400">{finalBetAmount} APT</span>
                </p>
              </div>
            </div>
            <button 
              className="btn-danger flex items-center mx-auto"
              onClick={onForfeit}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Forfeit Game
            </button>
          </div>
        )}

        {gameState === 'completed' && (
          <div className="glass-card p-6 text-center mt-6 bg-gradient-to-br from-accent-900/20 to-primary-900/20 border border-accent-800/30">
            <h3 className="text-2xl font-bold mb-4 text-gradient">
              {winner === 'draw' ? 'Game Ended in a Draw' : `${winner === 'player1' ? 'Player 1' : 'Player 2'} Wins!`}
            </h3>
            <div className="mb-6 glass-card p-4 bg-dark-800/80">
              <p className="text-lg text-gray-300">
                {winner === 'draw' 
                  ? 'Both players receive their bets back' 
                  : `${winner === 'player1' ? 'Player 1' : 'Player 2'} receives`}
                {winner !== 'draw' && <span className="font-mono text-accent-400 font-medium ml-2">{finalBetAmount} APT</span>}
              </p>
            </div>
            <button
              className="btn-primary flex items-center mx-auto"
              onClick={onStartNewGame}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Start New Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChessGamePanel; 