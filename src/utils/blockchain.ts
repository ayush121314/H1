import { AptosClient, Types, HexString } from 'aptos';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

// Move contract module information
const MODULE_ADDRESS = "0x1"; // Replace with your actual module address
const MODULE_NAME = "chess_betting";

export class BlockchainManager {
  private client: AptosClient | null = null;
  private moduleAddress: string;
  
  constructor(moduleAddress: string = MODULE_ADDRESS) {
    this.moduleAddress = moduleAddress;
  }
  
  // Initialize connection with Aptos client
  public async initialize(aptosClient: AptosClient): Promise<boolean> {
    try {
      this.client = aptosClient;
      return true;
    } catch (error) {
      console.error("Error initializing Aptos connection:", error);
      return false;
    }
  }
  
  // These methods should be used in a React component that has access to the useWallet hook
  // For example, the component would call the hook and pass the wallet methods to these functions
  
  // Create a new game
  public async createGame(
    gameId: string, 
    player1: string, 
    player2: string,
    signAndSubmitTransaction: (payload: Types.EntryFunctionPayload) => Promise<{ hash: string }>
  ): Promise<boolean> {
    try {
      if (!this.client) {
        throw new Error("Aptos client not initialized");
      }
      
      const payload: Types.EntryFunctionPayload = {
        function: `${this.moduleAddress}::${MODULE_NAME}::create_game`,
        type_arguments: [],
        arguments: [gameId, player1, player2]
      };
      
      const response = await signAndSubmitTransaction(payload);
      await this.client.waitForTransaction(response.hash);
      
      return true;
    } catch (error) {
      console.error("Error creating game:", error);
      return false;
    }
  }
  
  // Place a bet on a game
  public async placeBet(
    gameId: string, 
    amount: string,
    signAndSubmitTransaction: (payload: Types.EntryFunctionPayload) => Promise<{ hash: string }>
  ): Promise<boolean> {
    try {
      if (!this.client) {
        throw new Error("Aptos client not initialized");
      }
      
      const payload: Types.EntryFunctionPayload = {
        function: `${this.moduleAddress}::${MODULE_NAME}::place_bet`,
        type_arguments: [],
        arguments: [gameId, amount]
      };
      
      const response = await signAndSubmitTransaction(payload);
      await this.client.waitForTransaction(response.hash);
      
      return true;
    } catch (error) {
      console.error("Error placing bet:", error);
      return false;
    }
  }
  
  // Start a game
  public async startGame(
    gameId: string,
    signAndSubmitTransaction: (payload: Types.EntryFunctionPayload) => Promise<{ hash: string }>
  ): Promise<boolean> {
    try {
      if (!this.client) {
        throw new Error("Aptos client not initialized");
      }
      
      const payload: Types.EntryFunctionPayload = {
        function: `${this.moduleAddress}::${MODULE_NAME}::start_game`,
        type_arguments: [],
        arguments: [gameId]
      };
      
      const response = await signAndSubmitTransaction(payload);
      await this.client.waitForTransaction(response.hash);
      
      return true;
    } catch (error) {
      console.error("Error starting game:", error);
      return false;
    }
  }
  
  // Complete a game and set the winner
  public async completeGame(
    gameId: string, 
    winner: string,
    signAndSubmitTransaction: (payload: Types.EntryFunctionPayload) => Promise<{ hash: string }>
  ): Promise<boolean> {
    try {
      if (!this.client) {
        throw new Error("Aptos client not initialized");
      }
      
      const payload: Types.EntryFunctionPayload = {
        function: `${this.moduleAddress}::${MODULE_NAME}::complete_game`,
        type_arguments: [],
        arguments: [gameId, winner]
      };
      
      const response = await signAndSubmitTransaction(payload);
      await this.client.waitForTransaction(response.hash);
      
      return true;
    } catch (error) {
      console.error("Error completing game:", error);
      return false;
    }
  }
  
  // Withdraw winnings
  public async withdrawWinnings(
    signAndSubmitTransaction: (payload: Types.EntryFunctionPayload) => Promise<{ hash: string }>
  ): Promise<boolean> {
    try {
      if (!this.client) {
        throw new Error("Aptos client not initialized");
      }
      
      const payload: Types.EntryFunctionPayload = {
        function: `${this.moduleAddress}::${MODULE_NAME}::withdraw`,
        type_arguments: [],
        arguments: []
      };
      
      const response = await signAndSubmitTransaction(payload);
      await this.client.waitForTransaction(response.hash);
      
      return true;
    } catch (error) {
      console.error("Error withdrawing winnings:", error);
      return false;
    }
  }
  
  // Static method to check if a supported wallet is available
  public static isWalletAvailable(): boolean {
    return typeof window !== 'undefined' && 
           window.hasOwnProperty('aptos');
  }
} 