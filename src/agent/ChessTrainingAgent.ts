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
  private lastSuggestedMove: { from: string; to: string; promotion?: string; strength: number } | null = null;
  
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
   * Evaluates a move and returns its strength
   * This is used by both suggestMove and analyzeLastMove to ensure consistency
   */
  private evaluateMove(move: any, isActualMove: boolean = false): number {
    let strength = 0;
    
    // Material value evaluation (standard piece values)
    const pieceValues: Record<string, number> = {
      'p': 1,   // pawn
      'n': 3,   // knight
      'b': 3.25, // bishop
      'r': 5,   // rook
      'q': 9,   // queen
      'k': 0    // king (we don't capture the king)
    };
    
    // Capturing moves gain the value of the captured piece
    if (move.captured) {
      strength += pieceValues[move.captured] * (isActualMove ? 0.5 : 10);
    }
    
    // Promotions are very valuable
    if (move.flags?.includes('p')) {
      strength += pieceValues['q'] * (isActualMove ? 1 : 8);
    }
    
    // Check gives a bonus
    if (move.flags?.includes('ch') || (move.san && move.san.includes('+'))) {
      strength += isActualMove ? 0.5 : 5;
    }
    
    // Moving to center squares is good in openings and middlegame
    const centerSquares = ['d4', 'd5', 'e4', 'e5'];
    const nearCenterSquares = ['c3', 'c4', 'c5', 'c6', 'd3', 'd6', 'e3', 'e6', 'f3', 'f4', 'f5', 'f6'];
    
    const pieceCount = this.game.board().flat().filter(Boolean).length;
    const isOpening = pieceCount > 28;
    const isMiddlegame = pieceCount > 20 && pieceCount <= 28;
    
    if ((isOpening || isMiddlegame) && centerSquares.includes(move.to)) {
      strength += isActualMove ? 0.5 : 3;
    } else if ((isOpening || isMiddlegame) && nearCenterSquares.includes(move.to)) {
      strength += isActualMove ? 0.25 : 1.5;
    }
    
    // Developing pieces in the opening is good (moving knights and bishops out)
    if (isOpening) {
      // Moving pieces from their starting positions
      if (
        (move.piece === 'n' && ['b1', 'g1', 'b8', 'g8'].includes(move.from)) ||
        (move.piece === 'b' && ['c1', 'f1', 'c8', 'f8'].includes(move.from))
      ) {
        strength += isActualMove ? 0.75 : 4;
      }
      
      // Castling is good in the opening
      if (move.flags?.includes('k') || move.flags?.includes('q')) {
        strength += isActualMove ? 1.5 : 7;
      }
    }
    
    // Only add random variance for non-expert mode or when not checking a previously suggested move
    let varianceFactor = 0;
    if (this.difficulty !== 'expert' || isActualMove) {
      switch (this.difficulty) {
        case 'beginner':
          varianceFactor = isActualMove ? 0.4 : 0.5;
          break;
        case 'intermediate':
          varianceFactor = isActualMove ? 0.3 : 0.4;
          break;
        case 'advanced':
          varianceFactor = isActualMove ? 0.2 : 0.3;
          break;
        case 'expert':
          varianceFactor = isActualMove ? 0.1 : 0;
          break;
      }
      
      // Apply the random variance - smaller for actual move analysis
      strength += (Math.random() * 2 - 1) * varianceFactor;
    }
    
    return strength;
  }
  
  /**
   * Suggests the next best move based on current board position
   */
  public suggestMove(): { from: string; to: string; promotion?: string } {
    // Get all possible moves
    const possibleMoves = this.game.moves({ verbose: true });
    
    // Safety check - if no moves available, return empty move
    if (possibleMoves.length === 0) {
      console.error('No valid moves available');
      this.lastSuggestedMove = null;
      return { from: '', to: '' };
    }
    
    console.log(`ChessTrainingAgent - Found ${possibleMoves.length} possible moves`);
    
    // Evaluate all possible moves using the shared evaluation function
    const rankedMoves = possibleMoves.map(move => {
      const strength = this.evaluateMove(move);
      return { ...move, strength };
    });
    
    // Sort moves by strength (highest first)
    rankedMoves.sort((a, b) => b.strength - a.strength);
    
    // Select a move based on difficulty level
    let selectedMove;
    const totalMoves = rankedMoves.length;
    
    switch (this.difficulty) {
      case 'beginner':
        // Beginner: Choose among the top 50% of moves
        selectedMove = rankedMoves[Math.floor(Math.random() * Math.max(Math.floor(totalMoves * 0.5), 1))];
        break;
      case 'intermediate':
        // Intermediate: Choose among the top 30% of moves
        selectedMove = rankedMoves[Math.floor(Math.random() * Math.max(Math.floor(totalMoves * 0.3), 1))];
        break;
      case 'advanced':
        // Advanced: Choose among the top 15% of moves
        selectedMove = rankedMoves[Math.floor(Math.random() * Math.max(Math.floor(totalMoves * 0.15), 1))];
        break;
      case 'expert':
        // Expert: Always choose the best move (no randomness)
        selectedMove = rankedMoves[0];
        break;
      default:
        selectedMove = rankedMoves[0]; // Default to the top move
    }
    
    console.log('ChessTrainingAgent - Selected move:', selectedMove);
    
    // Store the suggested move for later reference
    this.lastSuggestedMove = {
      from: selectedMove.from,
      to: selectedMove.to,
      promotion: selectedMove.promotion,
      strength: selectedMove.strength
    };
    
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
    
    // Check if this is the move we just suggested (for expert mode)
    let evaluation = 0;
    let wasSuggestedMove = false;
    let moveType = '';
    let positionContext = '';
    
    // Create a temporary game to evaluate the move details
    const tempGame = new Chess(this.game.fen());
    let moveDetails;
    
    try {
      // Try to get move details by making the move
      moveDetails = tempGame.move({
        from: from,
        to: to,
        promotion: 'q' // Default to queen promotion
      });
    } catch (error) {
      console.error('Error analyzing move:', error);
      moveDetails = null;
    }
    
    // Analyze move type and position context if move is valid
    if (moveDetails) {
      // Identify move type
      if (moveDetails.captured) {
        moveType = `capture of ${moveDetails.captured === 'p' ? 'pawn' : 
                              moveDetails.captured === 'n' ? 'knight' :
                              moveDetails.captured === 'b' ? 'bishop' :
                              moveDetails.captured === 'r' ? 'rook' :
                              moveDetails.captured === 'q' ? 'queen' : 'piece'}`;
      } else if (moveDetails.san === 'O-O') {
        moveType = 'kingside castling';
      } else if (moveDetails.san === 'O-O-O') {
        moveType = 'queenside castling';
      } else if (moveDetails.flags.includes('p')) {
        moveType = `promotion to ${moveDetails.promotion || 'queen'}`;
      } else if (moveDetails.san.includes('+')) {
        moveType = 'check';
      } else if (moveDetails.san.includes('#')) {
        moveType = 'checkmate';
      } else if (moveDetails.piece === 'p') {
        moveType = 'pawn move';
      } else {
        moveType = `${moveDetails.piece === 'n' ? 'knight' :
                     moveDetails.piece === 'b' ? 'bishop' :
                     moveDetails.piece === 'r' ? 'rook' :
                     moveDetails.piece === 'q' ? 'queen' : 'king'} move`;
      }
      
      // Determine position context
      const pieceCount = this.game.board().flat().filter(Boolean).length;
      
      if (pieceCount > 28) {
        positionContext = 'opening';
      } else if (pieceCount > 12) {
        positionContext = 'middlegame';
      } else {
        positionContext = 'endgame';
      }
    }
    
    if (this.lastSuggestedMove && 
        this.lastSuggestedMove.from === from && 
        this.lastSuggestedMove.to === to) {
      // This was our suggested move
      if (this.difficulty === 'expert') {
        evaluation = Math.abs(this.lastSuggestedMove.strength);
        if (evaluation < 1) evaluation = 1; // Ensure it's at least somewhat positive
      } else {
        evaluation = this.lastSuggestedMove.strength;
      }
      wasSuggestedMove = true;
    } else if (moveDetails) {
      // This wasn't our suggested move, evaluate it normally
      evaluation = this.evaluateMove(moveDetails, true);
      
      // Check for common mistakes
      // Moving the same piece twice in the opening
      const pieceCount = this.game.board().flat().filter(Boolean).length;
      if (pieceCount > 28 && this.moveHistory.length >= 2) {
        const previousMoveTo = this.moveHistory[this.moveHistory.length - 2].substring(2);
        if (previousMoveTo === from) {
          evaluation -= 1;
        }
      }
    } else {
      // Invalid move
      evaluation = -5;
    }
    
    // Clamp evaluation to a reasonable range, but ensure suggested moves in expert mode
    // always get a positive evaluation
    if (wasSuggestedMove && this.difficulty === 'expert') {
      evaluation = Math.max(1, Math.min(5, evaluation));
    } else {
      evaluation = Math.max(-5, Math.min(5, evaluation));
    }
    
    // Determine if it was a good move
    const isBest = evaluation > 0.5 || (wasSuggestedMove && this.difficulty === 'expert');
    
    // Generate a simple comment based on the evaluation
    let comment: string;
    
    if (wasSuggestedMove && this.difficulty === 'expert') {
      comment = "Excellent choice! This is the expert recommendation.";
    } else if (!moveDetails) {
      comment = "This move appears to be invalid. Please check the rules of chess.";
    } else {
      // Generate comments based on evaluation
      if (evaluation > 3) {
        comment = "Excellent move!";
      } else if (evaluation > 1) {
        comment = "Good move.";
      } else if (evaluation > -1) {
        comment = "Reasonable move.";
      } else if (evaluation > -3) {
        comment = "Questionable move.";
      } else {
        comment = "Poor move.";
      }
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
    // Simplified strategic tips
    const tips = [
      "Control the center with your pawns and pieces.",
      "Develop your knights and bishops early.",
      "Castle to protect your king.",
      "Connect your rooks by clearing the pieces between them.",
      "Look for tactical opportunities like forks and pins.",
      "Don't bring your queen out too early.",
      "Avoid moving the same piece multiple times in the opening.",
      "Protect your pieces and don't leave them hanging.",
      "Think about your opponent's threats before making your move.",
      "Have a plan for your pieces."
    ];
    
    return tips[Math.floor(Math.random() * tips.length)];
  }
} 