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

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="mb-4">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <h3 className="text-lg font-semibold text-blue-800">Game Status</h3>
          <p className="text-blue-700">
            {gameState === 'waiting' && 'Waiting for players to connect and place bets'}
            {gameState === 'betting' && 'Waiting for players to lock their escrow'}
            {gameState === 'playing' && `${currentPlayer === 'white' ? 'White' : 'Black'}'s turn to move`}
            {gameState === 'completed' && (winner === 'draw' 
              ? 'Game ended in a draw' 
              : `${winner === 'player1' ? 'Player 1 (White)' : 'Player 2 (Black)'} won!`)}
          </p>
        </div>
      </div>

      {/* Unified Betting Interface - Show when both wallets are connected and in waiting state */}
      {gameState === 'waiting' && player1Wallet && player2Wallet && (
        <div className="mb-6 p-4 border border-yellow-200 bg-yellow-50 rounded">
          <h3 className="text-lg font-bold text-center mb-3">Announce Bets</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="font-medium text-center mb-1">Player 1 Bet</p>
              <div className="flex items-center justify-center">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={player1Bet}
                  onChange={handlePlayer1BetChange}
                  className="p-2 border rounded w-full text-center"
                  placeholder="Enter amount"
                />
                <span className="ml-2">APT</span>
              </div>
            </div>
            <div>
              <p className="font-medium text-center mb-1">Player 2 Bet</p>
              <div className="flex items-center justify-center">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={player2Bet}
                  onChange={handlePlayer2BetChange}
                  className="p-2 border rounded w-full text-center"
                  placeholder="Enter amount"
                />
                <span className="ml-2">APT</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={onAnnounceUnifiedBet}
            disabled={!player1Wallet || !player2Wallet || player1Bet <= 0 || player2Bet <= 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-bold text-lg"
          >
            Announce Bets & Calculate Minimum
          </button>
          <p className="text-xs text-center text-gray-600 mt-2">
            This will calculate the minimum bet amount from both players
          </p>
        </div>
      )}

      <div className="mb-4 aspect-square max-w-md mx-auto">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          boardOrientation="white"
        />
      </div>

      {gameState === 'playing' && (
        <div className="text-center">
          <p className="mb-2 text-lg font-semibold">
            Current Player: {currentPlayer === 'white' ? 'White (Player 1)' : 'Black (Player 2)'}
          </p>
          <p className="mb-4 text-gray-600">
            Total Pool: {finalBetAmount} APT
          </p>
          <button 
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-2"
            onClick={onForfeit}
          >
            Forfeit
          </button>
        </div>
      )}

      {gameState === 'completed' && (
        <div className="text-center mt-4">
          <h3 className="text-xl font-bold mb-2">
            {winner === 'draw' ? 'Game Ended in a Draw' : `${winner === 'player1' ? 'Player 1' : 'Player 2'} Wins!`}
          </h3>
          <p className="mb-4">
            {winner === 'draw' 
              ? 'Both players receive their bets back' 
              : `${winner === 'player1' ? 'Player 1' : 'Player 2'} receives ${finalBetAmount} APT`}
          </p>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            onClick={onStartNewGame}
          >
            Start New Game
          </button>
        </div>
      )}
    </div>
  );
};

export default ChessGamePanel; 