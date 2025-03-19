import { useState, useCallback } from 'react';
import { Chess } from 'chess.js';
import { GameState, Winner } from '../types/game';

export function useChessGame() {
  // Game state
  const [game, setGame] = useState<any>(new Chess());
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white');
  const [winner, setWinner] = useState<Winner>(null);
  
  // Make a move in the chess game
  const makeAMove = useCallback((move: any) => {
    const gameCopy = new Chess(game.fen());
    
    try {
      const result = gameCopy.move(move);
      setGame(gameCopy);
      
      // Switch turns
      setCurrentPlayer(gameCopy.turn() === 'w' ? 'white' : 'black');
      
      return result;
    } catch (error) {
      return null;
    }
  }, [game]);

  // Handle dropping a piece on the chessboard
  const onDrop = useCallback((sourceSquare: string, targetSquare: string) => {
    // Only allow moves if the game is active
    if (gameState !== 'playing') return false;
    
    // Enforce turn-based gameplay
    const currentTurn = game.turn() === 'w' ? 'white' : 'black';
    
    // In the real game, check if it's the correct player's turn
    // For now, we just allow the move based on white/black's turn
    if (currentTurn !== currentPlayer) {
      console.log(`Not your turn. Current turn: ${currentTurn}`);
      return false;
    }
    
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // Default promotion to queen
    });

    // If the move is illegal, return false
    if (move === null) return false;

    // Check for game over conditions
    if (game.isGameOver()) {
      handleGameEnd();
    }

    return true;
  }, [game, gameState, currentPlayer, makeAMove]);

  // Handle game end
  const handleGameEnd = useCallback((winnerParam?: Winner) => {
    setGameState('completed');
    
    // Determine the winner if not provided
    let currentWinner = winnerParam;
    
    if (!currentWinner) {
      // Determine winner based on the chess game state
      if (game.isDraw()) {
        currentWinner = 'draw';
      } else {
        // White wins if it's not black's turn (checkmate)
        currentWinner = game.turn() === 'b' ? 'player1' : 'player2';
      }
    }
    
    setWinner(currentWinner);
    console.log(`Game ended with winner: ${currentWinner}`);
    
    return currentWinner;
  }, [game]);

  // Forfeit the current game
  const forfeitGame = useCallback((playerNumber: 1 | 2) => {
    if (gameState !== 'playing') {
      console.log("Can only forfeit during an active game");
      return null;
    }
    
    setGameState('completed');
    
    // Determine the winner (opposite of the player who forfeited)
    const winner = playerNumber === 1 ? 'player2' : 'player1';
    console.log(`Player ${playerNumber} forfeited. ${winner === 'player1' ? 'Player 1' : 'Player 2'} wins!`);
    
    // Set the winner
    setWinner(winner);
    
    return winner;
  }, [gameState]);

  // Start a new game
  const startNewGame = useCallback(() => {
    setGame(new Chess());
    setGameState('waiting');
    setCurrentPlayer('white');
    setWinner(null);
  }, []);

  // Reset game state (but keep the board as is)
  const resetGameState = useCallback(() => {
    console.log("Resetting game state");
    setGameState('waiting');
    setWinner(null);
    
    // Reset the game board
    setGame(new Chess());
    
    // Reset current player
    setCurrentPlayer('white');
    
    console.log("Game state reset complete");
  }, []);

  return {
    game,
    setGame,
    gameState,
    setGameState,
    currentPlayer,
    setCurrentPlayer,
    winner,
    setWinner,
    makeAMove,
    onDrop,
    handleGameEnd,
    forfeitGame,
    startNewGame,
    resetGameState
  };
} 