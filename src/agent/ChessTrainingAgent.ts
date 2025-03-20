/**
 * ChessTrainingAgent - AI agent for training mode in chess game
 * 
 * This agent helps users practice chess by:
 * 1. Suggesting optimal moves
 * 2. Analyzing player's moves
 * 3. Providing strategic advice
 * 4. Adapting difficulty based on player skill level
 */

import { Chess } from 'chess.js';

// Define difficulty levels
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

interface MoveAnalysis {
  move: string;
  evaluation: number;
  comment: string;
  isBest: boolean;
}

export class ChessTrainingAgent {
  private game: Chess;
  private difficulty: DifficultyLevel;
  private moveHistory: string[];
  private lastAnalysis: MoveAnalysis | null;
  
  constructor(fen?: string) {
    this.game = new Chess(fen);
    this.difficulty = 'intermediate'; // Default difficulty
    this.moveHistory = [];
    this.lastAnalysis = null;
  }
  
  /**
   * Sets the difficulty level for the training agent
   */
  public setDifficulty(level: DifficultyLevel): void {
    this.difficulty = level;
  }
  
  /**
   * Gets the current difficulty level
   */
  public getDifficulty(): DifficultyLevel {
    return this.difficulty;
  }
  
  /**
   * Updates the internal game state
   */
  public updateGameState(fen: string): void {
    this.game = new Chess(fen);
  }
  
  /**
   * Suggests the next best move based on current board position
   */
  public suggestMove(): { from: string; to: string; promotion?: string } {
    // In a real implementation, this would use a chess engine evaluation
    // For this demo, we'll use a simple approach based on difficulty levels
    
    const possibleMoves = this.game.moves({ verbose: true });
    if (possibleMoves.length === 0) return { from: '', to: '' };
    
    // Simulate different skill levels by the quality of move selection
    let selectedMoveIndex: number;
    
    switch (this.difficulty) {
      case 'beginner':
        // Beginner: Choose a random move (sometimes not optimal)
        selectedMoveIndex = Math.floor(Math.random() * possibleMoves.length);
        break;
      case 'intermediate':
        // Intermediate: Choose among the top 50% of moves
        selectedMoveIndex = Math.floor(Math.random() * (possibleMoves.length / 2));
        break;
      case 'advanced':
        // Advanced: Choose among the top 25% of moves
        selectedMoveIndex = Math.floor(Math.random() * (possibleMoves.length / 4));
        break;
      case 'expert':
        // Expert: Choose the best move (or very close to it)
        selectedMoveIndex = 0;
        break;
      default:
        selectedMoveIndex = 0;
    }
    
    const selectedMove = possibleMoves[selectedMoveIndex];
    
    return {
      from: selectedMove.from,
      to: selectedMove.to,
      promotion: selectedMove.promotion
    };
  }
  
  /**
   * Analyzes the last move played by the user
   */
  public analyzeLastMove(from: string, to: string): MoveAnalysis {
    // Record the move
    const moveString = `${from}${to}`;
    this.moveHistory.push(moveString);
    
    // In a real implementation, this would compare against a chess engine's evaluation
    // For this demo, we'll generate a simulated analysis
    
    // Simulate an evaluation score (-10 to 10, where positive is good for the player who just moved)
    const randomFactor = Math.random() * 2 - 1; // -1 to 1
    let evaluation: number;
    
    switch (this.difficulty) {
      case 'beginner':
        // Beginner: High variance in evaluation
        evaluation = randomFactor * 5; 
        break;
      case 'intermediate':
        // Intermediate: Medium variance
        evaluation = randomFactor * 3;
        break;
      case 'advanced':
        // Advanced: Lower variance
        evaluation = randomFactor * 2;
        break;
      case 'expert':
        // Expert: Very precise evaluation
        evaluation = randomFactor;
        break;
      default:
        evaluation = randomFactor * 3;
    }
    
    // Determine if it was a good move
    const isBest = evaluation > 0;
    
    // Generate a comment based on the evaluation
    let comment: string;
    if (evaluation > 3) {
      comment = "Excellent move! This gives you a significant advantage.";
    } else if (evaluation > 1) {
      comment = "Good move. You're improving your position.";
    } else if (evaluation > -1) {
      comment = "Reasonable move, but there may be better options.";
    } else if (evaluation > -3) {
      comment = "This move weakens your position slightly. Consider alternatives next time.";
    } else {
      comment = "This move gives your opponent an advantage. Try to look for better options.";
    }
    
    const analysis: MoveAnalysis = {
      move: moveString,
      evaluation,
      comment,
      isBest
    };
    
    this.lastAnalysis = analysis;
    return analysis;
  }
  
  /**
   * Provides a strategic tip based on the current board position
   */
  public getStrategicTip(): string {
    // In a real implementation, this would analyze the position and provide relevant advice
    // For this demo, we'll use a set of generic chess tips
    
    const openingTips = [
      "Try to control the center with pawns and pieces.",
      "Develop your knights and bishops early in the game.",
      "Castle early to protect your king.",
      "Don't move the same piece multiple times in the opening."
    ];
    
    const middlegameTips = [
      "Look for tactical opportunities like forks, pins, and discovered attacks.",
      "Improve the position of your least active piece.",
      "Create and exploit weaknesses in your opponent's pawn structure.",
      "Plan your attacks on the side where you have a space advantage."
    ];
    
    const endgameTips = [
      "Activate your king in the endgame.",
      "Push passed pawns toward promotion.",
      "Trade pieces when ahead in material, but not pawns.",
      "Remember the opposition principle with kings."
    ];
    
    // Determine game phase based on piece count
    const pieceCount = this.game.board().flat().filter(Boolean).length;
    
    if (pieceCount > 24) {
      // Opening
      return openingTips[Math.floor(Math.random() * openingTips.length)];
    } else if (pieceCount > 10) {
      // Middlegame
      return middlegameTips[Math.floor(Math.random() * middlegameTips.length)];
    } else {
      // Endgame
      return endgameTips[Math.floor(Math.random() * endgameTips.length)];
    }
  }
} 