import React, { useEffect, useState } from 'react';
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
  suggestedMove?: { from: string; to: string; promotion?: string } | null;
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
  onPlayer2BetChange,
  suggestedMove = null
}) => {
  // State for custom arrows to show suggested moves
  const [customArrows, setCustomArrows] = useState<any[]>([]);

  // Update arrows when a suggested move is received
  useEffect(() => {
    if (suggestedMove) {
      // Arrow format: [from square, to square, { color (optional) }]
      setCustomArrows([[
        suggestedMove.from, 
        suggestedMove.to, 
        { color: 'rgba(124, 58, 237, 0.8)', width: 8 }
      ]]);
      
      // Log the suggested move for troubleshooting
      console.log('ChessGamePanel - Rendering suggested move arrow:', suggestedMove);
    } else {
      setCustomArrows([]);
    }
  }, [suggestedMove]);

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
    if (gameState === 'playing') {
      if (suggestedMove) {
        return `${currentPlayer === 'white' ? 'White' : 'Black'}'s turn. Suggested move: ${suggestedMove.from} → ${suggestedMove.to}`;
      }
      return `${currentPlayer === 'white' ? 'White' : 'Black'}'s turn to move`;
    }
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
    <div className="panel bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-0 relative overflow-hidden">
      {/* Game status bar */}
      <div className="p-2 bg-dark-800/80">
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            statusType === 'success' ? 'bg-accent-500' : 
            statusType === 'info' ? 'bg-primary-500' : 
            statusType === 'warning' ? 'bg-warning-500' : 'bg-dark-500'
          }`}></div>
          <span className="text-sm text-gray-300">{statusMessage}</span>
          {suggestedMove && (
            <span className="ml-auto text-xs text-purple-400">Suggested move shown</span>
          )}
        </div>
      </div>
      
      {/* Main chess board - make it larger for the P2P layout */}
      <div className="chess-board-p2p">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          boardOrientation="white"
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
          }}
          customDarkSquareStyle={{ backgroundColor: '#1e293b' }} // secondary-800
          customLightSquareStyle={{ backgroundColor: '#334155' }} // secondary-600
          customDropSquareStyle={{ boxShadow: 'inset 0 0 1px 4px rgba(14, 165, 233, 0.5)' }} // primary-500
          boardWidth={window.innerWidth > 1280 ? 600 : window.innerWidth > 768 ? 500 : 350}
          customArrows={customArrows}
          arePremovesAllowed={false}
        />
      </div>

      {/* Unified Betting Interface - Show when both wallets are connected and in waiting state */}
      {gameState === 'waiting' && player1Wallet && player2Wallet && (
        <div className="betting-controls p-3 bg-dark-800/80">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="glass-card p-2 bg-dark-800/80">
              <div className="flex items-center mb-1">
                <div className="w-2 h-2 rounded-full bg-primary-500 mr-1"></div>
                <p className="text-xs font-medium text-gray-300">P1 Bet</p>
              </div>
              <div className="flex items-center">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={player1Bet}
                  onChange={handlePlayer1BetChange}
                  className="input-field w-full text-center text-sm py-1"
                  placeholder="Enter"
                />
                <span className="ml-1 font-mono text-xs text-gray-400">APT</span>
              </div>
            </div>
            <div className="glass-card p-2 bg-dark-800/80">
              <div className="flex items-center mb-1">
                <div className="w-2 h-2 rounded-full bg-secondary-500 mr-1"></div>
                <p className="text-xs font-medium text-gray-300">P2 Bet</p>
              </div>
              <div className="flex items-center">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={player2Bet}
                  onChange={handlePlayer2BetChange}
                  className="input-field w-full text-center text-sm py-1"
                  placeholder="Enter"
                />
                <span className="ml-1 font-mono text-xs text-gray-400">APT</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={onAnnounceUnifiedBet}
            disabled={!player1Wallet || !player2Wallet || player1Bet <= 0 || player2Bet <= 0}
            className="btn-accent w-full py-2 text-sm font-medium flex items-center justify-center"
          >
            Announce Bets & Calculate Minimum
          </button>
        </div>
      )}

      {/* Game control buttons (hidden in waiting state) */}
      {gameState !== 'waiting' && (
        <div className="game-controls p-3 border-t border-dark-700 flex justify-between">
          <button
            onClick={onStartNewGame}
            className="btn-primary text-sm py-1.5 px-3"
            disabled={gameState !== 'completed'}
          >
            New Game
          </button>
          
          {gameState === 'playing' && (
            <button
              onClick={onForfeit}
              className="btn-danger text-sm py-1.5 px-3"
            >
              Forfeit
            </button>
          )}
          
          {gameState === 'completed' && winner && (
            <div className="flex items-center">
              <span className="text-xs text-gray-400 mr-2">Winner:</span>
              <span className={`text-sm font-medium ${winner === 'player1' ? 'text-primary-400' : winner === 'player2' ? 'text-secondary-400' : 'text-gray-400'}`}>
                {winner === 'player1' ? 'Player 1' : winner === 'player2' ? 'Player 2' : 'Draw'}
              </span>
              <span className="ml-2 text-xs text-accent-400">
                {winner !== 'draw' && `+${finalBetAmount} APT`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChessGamePanel; 