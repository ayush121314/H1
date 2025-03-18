import { Chess } from 'chess.js';
import { ChessAIAgent } from './ChessAIAgent';
import { BlockchainManager } from '../utils/blockchain';

/**
 * ChessGameAgent - Connects the chess game with the AI agent for betting
 * This class serves as a bridge between the game UI and the blockchain betting system
 */
export class ChessGameAgent {
  private agent: ChessAIAgent;
  private blockchainManager: BlockchainManager;
  private activeGameId: string | null = null;
  private playerAddress: string | null = null;
  private opponentAddress: string | null = null;
  
  constructor(contractAddress: string) {
    this.agent = new ChessAIAgent(contractAddress);
    this.blockchainManager = new BlockchainManager(contractAddress);
  }
  
  /**
   * Initialize the agent with blockchain provider
   */
  public async initialize(provider: any): Promise<boolean> {
    try {
      const success = await this.blockchainManager.initialize(provider);
      if (success) {
        this.playerAddress = await this.blockchainManager.getWalletAddress();
      }
      return success;
    } catch (error) {
      console.error("Error initializing ChessGameAgent:", error);
      return false;
    }
  }
  
  /**
   * Start a new game with betting
   */
  public async startNewGame(betAmount: number): Promise<{gameId: string, finalBetAmount: number}> {
    try {
      if (!this.playerAddress) {
        throw new Error("Player address not available");
      }
      
      // Generate a simulated opponent address for the demo
      // In a real P2P game, this would be the actual opponent's address
      this.opponentAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      
      // Create a new game ID
      const gameId = `chess_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      this.activeGameId = gameId;
      
      // Create the game in the blockchain
      await this.blockchainManager.createGame(
        gameId, 
        this.playerAddress, 
        this.opponentAddress
      );
      
      // Place player's bet
      await this.blockchainManager.placeBet(gameId, betAmount.toString());
      
      // Simulate opponent placing a bet (AI agent facilitated)
      // In a real P2P game, the opponent would place their own bet
      const opponentBetAmount = Math.floor(Math.random() * 0.1 * 100) / 100 + 0.05;
      
      // Initialize the bet in the AI agent
      const betDetails = this.agent.initializeBet(
        gameId,
        this.playerAddress,
        betAmount,
        this.opponentAddress,
        opponentBetAmount
      );
      
      // Start the game on the blockchain
      await this.blockchainManager.startGame(gameId);
      
      // Activate the bet in the AI agent
      this.agent.activateBet(gameId);
      
      return {
        gameId,
        finalBetAmount: betDetails.poolAmount / 2 // The actual bet amount per player
      };
      
    } catch (error) {
      console.error("Error starting new game with betting:", error);
      throw error;
    }
  }
  
  /**
   * End the game and handle the payout
   */
  public async completeGame(game: Chess, winner: 'white' | 'black' | 'draw'): Promise<boolean> {
    try {
      if (!this.activeGameId) {
        throw new Error("No active game");
      }
      
      // Get the final moves from the game
      const finalMoves = game.history();
      
      // Complete the game in the AI agent
      this.agent.completeGame(this.activeGameId, winner, finalMoves);
      
      // Determine the winner address for the blockchain
      let winnerAddress: string;
      if (winner === 'draw') {
        winnerAddress = '0x0000000000000000000000000000000000000000'; // Zero address for draw
      } else {
        // Player is always white in this demo
        winnerAddress = winner === 'white' ? this.playerAddress! : this.opponentAddress!;
      }
      
      // Complete the game on the blockchain
      await this.blockchainManager.completeGame(this.activeGameId, winnerAddress);
      
      // If the player won, withdraw their winnings
      if (winner === 'white') {
        await this.blockchainManager.withdrawWinnings();
      }
      
      return true;
    } catch (error) {
      console.error("Error completing game:", error);
      return false;
    }
  }
  
  /**
   * Get market analysis from the AI agent
   */
  public getMarketAnalysis(): any {
    return this.agent.analyzeMarketConditions();
  }
  
  /**
   * Get the player's wallet address
   */
  public getPlayerAddress(): string | null {
    return this.playerAddress;
  }
} 