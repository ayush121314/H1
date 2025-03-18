import React from 'react';

// Define same GameState type as in index.tsx
type GameState = 'waiting' | 'betting' | 'playing' | 'completed';

interface GameDashboardProps {
  gameState: GameState;
  startNewGame: () => void;
  game: any;
  currentTurn?: 'white' | 'black';
  player1Wallet?: any;
  player2Wallet?: any;
}

const GameDashboard: React.FC<GameDashboardProps> = ({ 
  gameState, 
  startNewGame, 
  game,
  currentTurn = 'white',
  player1Wallet,
  player2Wallet
}) => {
  const getGameStatus = () => {
    if (gameState === 'waiting' || gameState === 'betting') {
      if (!player1Wallet && !player2Wallet) {
        return 'Connect both players\' wallets to start';
      } else if (!player1Wallet) {
        return 'Waiting for Player 1 to connect wallet';
      } else if (!player2Wallet) {
        return 'Waiting for Player 2 to connect wallet';
      } else if (gameState === 'betting') {
        return 'Players are placing their bets';
      } else {
        return 'Both players connected. Place your bets to start';
      }
    } else if (gameState === 'playing') {
      if (game.isCheck()) {
        return `Check! ${currentTurn === 'white' ? 'Player 1' : 'Player 2'}'s turn`;
      }
      return `${currentTurn === 'white' ? 'Player 1 (White)' : 'Player 2 (Black)'}'s turn`;
    } else if (gameState === 'completed') {
      if (game.isDraw()) {
        return 'Game ended in a draw!';
      } else {
        // If it's black's turn and game is over, white won (and vice versa)
        return `${game.turn() === 'b' ? 'Player 1 (White)' : 'Player 2 (Black)'} wins!`;
      }
    }
    return '';
  };

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Game Status</h2>
        {gameState === 'completed' && (
          <button 
            onClick={startNewGame}
            className="btn-primary"
          >
            New Game
          </button>
        )}
      </div>

      <div className="text-xl font-medium text-center p-3 bg-gray-100 rounded">
        {getGameStatus()}
      </div>

      {gameState === 'playing' && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Move History</h3>
          <div className="h-32 overflow-y-auto p-2 bg-gray-50 rounded">
            {game.history().map((move: string, index: number) => (
              <span key={index} className="inline-block mr-2 mb-1 px-2 py-1 bg-gray-200 rounded text-sm">
                {index % 2 === 0 ? `${Math.floor(index/2) + 1}.` : ''} {move}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Player turn indicator for same-device play */}
      {gameState === 'playing' && (
        <div className="mt-4 p-3 bg-gray-100 rounded flex items-center justify-between">
          <div className={`flex items-center ${currentTurn === 'white' ? 'font-bold' : 'opacity-50'}`}>
            <div className="w-4 h-4 rounded-full bg-white border border-gray-300 mr-2"></div>
            <span>Player 1</span>
          </div>
          <div className={`flex items-center ${currentTurn === 'black' ? 'font-bold' : 'opacity-50'}`}>
            <div className="w-4 h-4 rounded-full bg-black mr-2"></div>
            <span>Player 2</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameDashboard; 