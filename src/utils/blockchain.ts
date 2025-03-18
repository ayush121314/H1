import { ethers } from 'ethers';

// Smart contract ABI
const CHESS_BETTING_ABI = [
  "function createGame(string calldata gameId, address player1, address player2) external",
  "function placeBet(string calldata gameId) external payable",
  "function startGame(string calldata gameId) external",
  "function completeGame(string calldata gameId, address winner) external",
  "function cancelGame(string calldata gameId) external",
  "function withdraw() external",
  "event GameCreated(string gameId, address player1, address player2)",
  "event BetPlaced(string gameId, address player, uint256 amount)",
  "event GameStarted(string gameId, uint256 poolAmount)",
  "event GameCompleted(string gameId, address winner, uint256 payout)",
  "event GameDrawn(string gameId)"
];

// Default contract address - would be replaced with the actual deployed contract
const DEFAULT_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

export class BlockchainManager {
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private contractAddress: string;
  
  constructor(contractAddress: string = DEFAULT_CONTRACT_ADDRESS) {
    this.contractAddress = contractAddress;
  }
  
  // Initialize connection with wallet
  public async initialize(provider: ethers.Provider): Promise<boolean> {
    try {
      this.provider = provider;
      this.signer = await provider.getSigner();
      
      // Initialize contract with signer
      this.contract = new ethers.Contract(
        this.contractAddress,
        CHESS_BETTING_ABI,
        this.signer
      );
      
      return true;
    } catch (error) {
      console.error("Error initializing blockchain connection:", error);
      return false;
    }
  }
  
  // Create a new game
  public async createGame(gameId: string, player1: string, player2: string): Promise<boolean> {
    try {
      if (!this.contract) {
        throw new Error("Contract not initialized");
      }
      
      const tx = await this.contract.createGame(gameId, player1, player2);
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error("Error creating game:", error);
      return false;
    }
  }
  
  // Place a bet on a game
  public async placeBet(gameId: string, amount: string): Promise<boolean> {
    try {
      if (!this.contract) {
        throw new Error("Contract not initialized");
      }
      
      const tx = await this.contract.placeBet(gameId, {
        value: ethers.parseEther(amount)
      });
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error("Error placing bet:", error);
      return false;
    }
  }
  
  // Start a game
  public async startGame(gameId: string): Promise<boolean> {
    try {
      if (!this.contract) {
        throw new Error("Contract not initialized");
      }
      
      const tx = await this.contract.startGame(gameId);
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error("Error starting game:", error);
      return false;
    }
  }
  
  // Complete a game and set the winner
  public async completeGame(gameId: string, winner: string): Promise<boolean> {
    try {
      if (!this.contract) {
        throw new Error("Contract not initialized");
      }
      
      const tx = await this.contract.completeGame(gameId, winner);
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error("Error completing game:", error);
      return false;
    }
  }
  
  // Withdraw winnings
  public async withdrawWinnings(): Promise<boolean> {
    try {
      if (!this.contract) {
        throw new Error("Contract not initialized");
      }
      
      const tx = await this.contract.withdraw();
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error("Error withdrawing winnings:", error);
      return false;
    }
  }
  
  // Get player's wallet address
  public async getWalletAddress(): Promise<string> {
    if (!this.signer) {
      throw new Error("Signer not initialized");
    }
    
    return await this.signer.getAddress();
  }
  
  // Check if MetaMask is available
  public static isMetaMaskAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }
} 