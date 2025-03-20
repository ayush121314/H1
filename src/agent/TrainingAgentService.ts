import { ChessTrainingAgent, DifficultyLevel } from './ChessTrainingAgent';

/**
 * TrainingAgentService - Service for managing the training agent
 * 
 * This service provides an interface to interact with the training agent
 * and coordinates the training mode functionality.
 */
export class TrainingAgentService {
  private agent: ChessTrainingAgent | null = null;
  private enabled: boolean = false;
  
  /**
   * Initialize the training agent
   */
  public init(initialFen?: string): void {
    this.agent = new ChessTrainingAgent(initialFen);
    this.enabled = true;
  }
  
  /**
   * Enable or disable the training agent
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    
    // If enabling and no agent exists, create one
    if (enabled && !this.agent) {
      this.agent = new ChessTrainingAgent();
    }
  }
  
  /**
   * Check if the training agent is enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }
  
  /**
   * Set the difficulty level of the training agent
   */
  public setDifficulty(level: DifficultyLevel): void {
    if (!this.agent) {
      this.init();
    }
    this.agent?.setDifficulty(level);
  }
  
  /**
   * Get the current difficulty level
   */
  public getDifficulty(): DifficultyLevel | null {
    return this.agent?.getDifficulty() || null;
  }
  
  /**
   * Update the game state in the agent
   */
  public updateGameState(fen: string): void {
    if (!this.agent) {
      this.init(fen);
      return;
    }
    this.agent.updateGameState(fen);
  }
  
  /**
   * Get a suggested move from the training agent
   */
  public suggestMove(): { from: string; to: string; promotion?: string } | null {
    if (!this.enabled || !this.agent) {
      return null;
    }
    return this.agent.suggestMove();
  }
  
  /**
   * Analyze the last move made by the player
   */
  public analyzeMove(from: string, to: string): any | null {
    if (!this.enabled || !this.agent) {
      return null;
    }
    return this.agent.analyzeLastMove(from, to);
  }
  
  /**
   * Get a strategic tip from the training agent
   */
  public getStrategicTip(): string | null {
    if (!this.enabled || !this.agent) {
      return null;
    }
    return this.agent.getStrategicTip();
  }
}

// Create and export a singleton instance
export const trainingAgentService = new TrainingAgentService(); 