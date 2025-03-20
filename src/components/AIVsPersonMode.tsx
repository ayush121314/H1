import React, { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useAIPlayer } from '../hooks/useAIPlayer';

interface AIVsPersonModeProps {
  onExit: () => void;
}

const AIVsPersonMode: React.FC<AIVsPersonModeProps> = ({ onExit }) => {
  // Initialize chess game
  const [game, setGame] = useState(new Chess());
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [gameStatus, setGameStatus] = useState<'playing' | 'checkmate' | 'draw' | 'stalemate'>('playing');
  const [winner, setWinner] = useState<'player' | 'ai' | 'draw' | null>(null);
  
  // Get AI player hook (always using medium difficulty)
  const { getAIMove, isAIThinking } = useAIPlayer();
  
  // Make a move and update the game state
  const makeMove = (move: { from: string, to: string }) => {
    const gameCopy = new Chess(game.fen());
    
    try {
      // Attempt to make the move
      const result = gameCopy.move({
        from: move.from,
        to: move.to,
        promotion: 'q' // Always promote to queen for simplicity
      });
      
      if (result === null) return false;
      
      // Update game state
      setGame(gameCopy);
      
      // Check for game end conditions
      if (gameCopy.isCheckmate()) {
        setGameStatus('checkmate');
        setWinner(gameCopy.turn() === 'w' ? 'ai' : 'player');
      } else if (gameCopy.isDraw()) {
        setGameStatus('draw');
        setWinner('draw');
      } else if (gameCopy.isStalemate()) {
        setGameStatus('stalemate');
        setWinner('draw');
      }
      
      return true;
    } catch (error) {
      console.error('Invalid move', error);
      return false;
    }
  };
  
  // Handle AI's turn
  useEffect(() => {
    // If it's AI's turn and the game is still active
    const isAITurn = (playerColor === 'white' && game.turn() === 'b') || 
                     (playerColor === 'black' && game.turn() === 'w');
                     
    if (isAITurn && gameStatus === 'playing') {
      // Get AI's move
      getAIMove(game).then(move => {
        if (move) {
          makeMove(move);
        }
      });
    }
  }, [game, playerColor, gameStatus, getAIMove]);
  
  // Handle player's move
  const onDrop = (sourceSquare: string, targetSquare: string) => {
    // Check if it's player's turn
    const isPlayerTurn = (playerColor === 'white' && game.turn() === 'w') || 
                         (playerColor === 'black' && game.turn() === 'b');
                         
    if (!isPlayerTurn || gameStatus !== 'playing') {
      return false;
    }
    
    // Make the move
    return makeMove({ from: sourceSquare, to: targetSquare });
  };
  
  // Start a new game
  const startNewGame = () => {
    setGame(new Chess());
    setGameStatus('playing');
    setWinner(null);
  };
  
  // Switch player color
  const switchColor = () => {
    if (gameStatus === 'playing' && !isAIThinking) {
      const newColor = playerColor === 'white' ? 'black' : 'white';
      setPlayerColor(newColor);
      
      // If switching to black, AI needs to make first move as white
      if (newColor === 'black' && game.turn() === 'w') {
        getAIMove(game).then(move => {
          if (move) {
            makeMove(move);
          }
        });
      }
    }
  };

  return (
    <div className="ai-vs-person-mode">
      <div className="panel bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 relative overflow-hidden p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-gradient">AI vs Person Mode</h2>
        
        <div className="flex items-center justify-center mb-4">
          <span className="px-3 py-1 bg-accent-900/40 border border-accent-700/50 rounded-full text-sm text-accent-300">
            Medium Difficulty AI
          </span>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">You Play As</h3>
          <div className="flex gap-2">
            <button 
              className={`px-4 py-2 rounded ${playerColor === 'white' ? 'bg-white text-black' : 'bg-gray-700 text-white'}`}
              onClick={() => setPlayerColor('white')}
              disabled={gameStatus !== 'playing' || isAIThinking}
            >
              White
            </button>
            <button 
              className={`px-4 py-2 rounded ${playerColor === 'black' ? 'bg-black text-white border border-gray-600' : 'bg-gray-700 text-white'}`}
              onClick={() => setPlayerColor('black')}
              disabled={gameStatus !== 'playing' || isAIThinking}
            >
              Black
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="chess-board bg-dark-800">
            <Chessboard
              position={game.fen()}
              onPieceDrop={onDrop}
              boardOrientation={playerColor}
              customBoardStyle={{
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5)',
                borderRadius: '0.5rem',
                overflow: 'hidden'
              }}
              customDarkSquareStyle={{ backgroundColor: '#1e293b' }}
              customLightSquareStyle={{ backgroundColor: '#334155' }}
            />
          </div>
        </div>
        
        {isAIThinking && (
          <div className="text-center mb-4">
            <p className="text-accent-400">AI is thinking...</p>
          </div>
        )}
        
        {gameStatus !== 'playing' && (
          <div className="glass-card p-6 text-center mb-6 bg-gradient-to-br from-accent-900/20 to-primary-900/20 border border-accent-800/30">
            <h3 className="text-2xl font-bold mb-4 text-gradient">
              {winner === 'player' ? 'You Win!' : 
               winner === 'ai' ? 'AI Wins!' : 
               'Game Drawn!'}
            </h3>
            <p className="text-lg text-gray-300 mb-6">
              {gameStatus === 'checkmate' ? 'Checkmate!' : 
               gameStatus === 'stalemate' ? 'Stalemate!' : 
               'Draw by repetition or 50-move rule'}
            </p>
            <button
              className="btn-primary flex items-center mx-auto"
              onClick={startNewGame}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Start New Game
            </button>
          </div>
        )}
        
        <div className="flex justify-between">
          <button 
            className="btn-secondary"
            onClick={onExit}
          >
            Return to Main Menu
          </button>
          
          {gameStatus === 'playing' && (
            <button 
              className="btn-accent"
              onClick={startNewGame}
            >
              Restart Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIVsPersonMode; 