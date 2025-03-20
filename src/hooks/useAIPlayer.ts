import { useCallback, useState } from 'react';
import { Chess } from 'chess.js';

// Chess evaluator to determine the best move
// This is a simple implementation - could be improved with a more sophisticated algorithm
const evaluateBoard = (game: Chess, depth = 2) => {
  if (depth === 0) {
    // Simple piece value evaluation
    const fen = game.fen();
    let value = 0;
    
    // Count material advantage
    for (const piece of fen.split(' ')[0]) {
      switch (piece) {
        case 'P': value += 10; break;
        case 'N': value += 30; break;
        case 'B': value += 30; break;
        case 'R': value += 50; break;
        case 'Q': value += 90; break;
        case 'K': value += 900; break;
        case 'p': value -= 10; break;
        case 'n': value -= 30; break;
        case 'b': value -= 30; break;
        case 'r': value -= 50; break;
        case 'q': value -= 90; break;
        case 'k': value -= 900; break;
        default: break;
      }
    }
    
    return game.turn() === 'w' ? value : -value;
  }
  
  // Get all possible moves
  const moves = game.moves({ verbose: true });
  
  // If in checkmate
  if (moves.length === 0) {
    return game.turn() === 'w' ? -Infinity : Infinity;
  }
  
  let bestEval = game.turn() === 'w' ? -Infinity : Infinity;
  
  // Minimax evaluation for each move
  for (const move of moves) {
    const gameCopy = new Chess(game.fen());
    gameCopy.move(move);
    
    const evaluation = evaluateBoard(gameCopy, depth - 1);
    
    if (game.turn() === 'w') {
      bestEval = Math.max(bestEval, evaluation);
    } else {
      bestEval = Math.min(bestEval, evaluation);
    }
  }
  
  return bestEval;
};

export function useAIPlayer() {
  const [isAIThinking, setIsAIThinking] = useState(false);

  // Get AI's move based on the current game state (always medium difficulty)
  const getAIMove = useCallback((game: Chess) => {
    setIsAIThinking(true);
    
    return new Promise<{from: string, to: string}>((resolve) => {
      // Adding a slight delay to simulate "thinking"
      setTimeout(() => {
        const moves = game.moves({ verbose: true });
        
        if (moves.length === 0) {
          setIsAIThinking(false);
          return null;
        }
        
        // Medium difficulty: Evaluate moves with depth 2
        let bestMove = moves[0];
        let bestValue = -Infinity;
        
        // Fixed depth for medium difficulty
        const depth = 2;
        
        for (const move of moves) {
          const gameCopy = new Chess(game.fen());
          gameCopy.move(move);
          
          const moveValue = -evaluateBoard(gameCopy, depth);
          
          if (moveValue > bestValue) {
            bestValue = moveValue;
            bestMove = move;
          }
        }
        
        setIsAIThinking(false);
        resolve({
          from: bestMove.from,
          to: bestMove.to
        });
      }, 500); // Simulated thinking time
    });
  }, []);

  return {
    getAIMove,
    isAIThinking
  };
} 