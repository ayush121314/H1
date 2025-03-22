import { AptosClient, Types, TxnBuilderTypes, BCS } from 'aptos';

// Enum for contract states matching the Move contract
export enum EscrowStatus {
  PENDING = 0,
  FUNDED = 1,
  PLAYING = 2,
  COMPLETED = 3,
  DISPUTED = 4,
  CANCELLED = 5,
  TIMED_OUT = 6
}

// Class to interface with the chess escrow contract on Aptos
export class EscrowContractAdapter {
  private client: AptosClient;
  private moduleAddress: string;
  private escrowAddress: string | null = null;
  
  constructor(
    nodeUrl: string,
    moduleAddress: string, // Removed default value - must be provided explicitly
  ) {
    this.client = new AptosClient(nodeUrl);
    this.moduleAddress = moduleAddress;
    // No longer setting escrow address to module address by default
    console.log("Adapter created with module address:", moduleAddress);
  }
  
  // Set the escrow contract address
  public setEscrowAddress(address: string): void {
    console.log(`Setting escrow address to: ${address}`);
    this.escrowAddress = address;
  }
  
  // Get the escrow address
  public getEscrowAddress(): string | null {
    return this.escrowAddress;
  }
  
  // Initialize a new escrow contract using any wallet
  public async initializeEscrow(
    sender: any, // Wallet instance
    player1Address: string,
    player2Address: string,
    minimumBet: number,
    timeoutSeconds: number = 24 * 60 * 60, // 24 hours in seconds
  ): Promise<string | null> {
    try {
      // Convert APT to octas (smallest unit) - 1 APT = 10^8 Octas
      const minimumBetOctas = (minimumBet * 100000000).toString();
      
      // Get the wallet address to set as escrow (could be a completely new wallet)
      let walletAddress;
      
      // Try different wallet API styles to get the address
      if (sender.account) {
        // Standard Petra wallet
        const response = await sender.account();
        walletAddress = response.address;
      } else if (typeof window !== 'undefined' && window.aptos) {
        // window.aptos API
        const response = await window.aptos.connect();
        walletAddress = response.address;
      } else {
        throw new Error("Could not determine wallet address");
      }
      
      // Validate the escrow wallet is not the same as player wallets
      if (walletAddress === player1Address) {
        throw new Error("Escrow wallet cannot be the same as Player 1's wallet");
      }
      
      if (walletAddress === player2Address) {
        throw new Error("Escrow wallet cannot be the same as Player 2's wallet");
      }
      
      console.log(`Using wallet as escrow: ${walletAddress}`);
      
      // Use the moduleAddress as the arbiter for simplicity
      const arbiterAddress = this.moduleAddress;
      
      const payload = {
        type: "entry_function_payload",
        function: `${this.moduleAddress}::chess_escrow::create_escrow`,
        type_arguments: [],
        arguments: [
          player1Address,
          player2Address,
          minimumBetOctas,
          arbiterAddress,
          timeoutSeconds.toString()
        ]
      };
      
      console.log("Initializing escrow with payload:", JSON.stringify(payload, null, 2));
      
      const txResponse = await this.submitTransaction(sender, payload);
      
      if (txResponse && txResponse.hash) {
        // Set the escrow address to the wallet address that initialized it
        this.escrowAddress = walletAddress;
        console.log(`Escrow initialized with address: ${walletAddress}`);
        console.log(`Transaction hash: ${txResponse.hash}`);
        return walletAddress;
      }
      
      return null;
    } catch (error) {
      console.error("Error initializing escrow:", error);
      throw error;
    }
  }
  
  // Deposit funds into the escrow
  public async deposit(
    sender: any, // Wallet instance
    amount: number,
  ): Promise<boolean> {
    if (!this.escrowAddress) {
      throw new Error("Escrow address not set");
    }
    
    try {
      // Convert APT to octas
      const amountInOctas = (amount * 100000000).toString();
      
      const payload = {
        type: "entry_function_payload",
        function: `${this.moduleAddress}::escrow::deposit`,
        type_arguments: [],
        arguments: [this.escrowAddress, amountInOctas]
      };
      
      const response = await this.submitTransaction(sender, payload);
      
      return !!response && !!response.hash;
    } catch (error) {
      console.error("Error depositing to escrow:", error);
      throw error;
    }
  }
  
  // Sign to start the game
  public async signToStartGame(
    sender: any, // Wallet instance
  ): Promise<boolean> {
    if (!this.escrowAddress) {
      throw new Error("Escrow address not set");
    }
    
    try {
      const payload = {
        type: "entry_function_payload",
        function: `${this.moduleAddress}::escrow::sign_to_start_game`,
        type_arguments: [],
        arguments: [this.escrowAddress]
      };
      
      const response = await this.submitTransaction(sender, payload);
      
      return !!response && !!response.hash;
    } catch (error) {
      console.error("Error signing to start game:", error);
      throw error;
    }
  }
  
  // Complete the game with a winner - includes automatic fund release
  public async completeGame(
    sender: any, // Wallet instance
    winnerAddress: string,
  ): Promise<boolean> {
    if (!this.escrowAddress) {
      throw new Error("Escrow address not set");
    }
    
    console.log(`Completing game with winner: ${winnerAddress}`);
    console.log(`Using escrow address: ${this.escrowAddress}`);
    
    try {
      // Verify wallet connection
      if (typeof window !== 'undefined' && window.aptos) {
        const walletInfo = await window.aptos.connect();
        console.log(`Connected wallet for transaction: ${walletInfo.address}`);
      }
      
      const payload = {
        type: "entry_function_payload",
        function: `${this.moduleAddress}::escrow::complete_game`,
        type_arguments: [],
        arguments: [this.escrowAddress, winnerAddress]
      };
      
      const response = await this.submitTransaction(sender, payload);
      
      // Automatically release funds without requiring approval
      if (response && response.hash) {
        console.log("Game completed, funds will be automatically transferred to the winner");
        console.log("Transaction hash:", response.hash);
        
        // Wait for the transaction to be confirmed before releasing funds
        await this.client.waitForTransactionWithResult(response.hash);
        try {
          await this.releaseFunds(sender);
        } catch (error) {
          console.error("Error releasing funds automatically, may need manual release:", error);
        }
      }
      
      return !!response && !!response.hash;
    } catch (error) {
      console.error("Error completing game:", error);
      throw error;
    }
  }
  
  // Complete the game as a draw - includes automatic fund release
  public async completeGameAsDraw(
    sender: any, // Wallet instance
  ): Promise<boolean> {
    if (!this.escrowAddress) {
      throw new Error("Escrow address not set");
    }
    
    console.log(`Completing game as draw`);
    console.log(`Using escrow address: ${this.escrowAddress}`);
    
    try {
      // Verify wallet connection
      if (typeof window !== 'undefined' && window.aptos) {
        const walletInfo = await window.aptos.connect();
        console.log(`Connected wallet for transaction: ${walletInfo.address}`);
      }
      
      const payload = {
        type: "entry_function_payload",
        function: `${this.moduleAddress}::escrow::complete_game_as_draw`,
        type_arguments: [],
        arguments: [this.escrowAddress]
      };
      
      const response = await this.submitTransaction(sender, payload);
      
      // Automatically release funds without requiring approval
      if (response && response.hash) {
        console.log("Game completed as draw, funds will be automatically returned to players");
        console.log("Transaction hash:", response.hash);
        
        // Wait for the transaction to be confirmed before releasing funds
        await this.client.waitForTransactionWithResult(response.hash);
        try {
          await this.releaseFunds(sender);
        } catch (error) {
          console.error("Error releasing funds automatically, may need manual release:", error);
        }
      }
      
      return !!response && !!response.hash;
    } catch (error) {
      console.error("Error completing game as draw:", error);
      throw error;
    }
  }
  
  // Release funds to the winner or back to players in case of a draw
  public async releaseFunds(
    sender: any, // Wallet instance
  ): Promise<boolean> {
    if (!this.escrowAddress) {
      throw new Error("Escrow address not set");
    }
    
    try {
      const payload = {
        type: "entry_function_payload",
        function: `${this.moduleAddress}::escrow::release_funds`,
        type_arguments: [],
        arguments: [this.escrowAddress]
      };
      
      // This transaction doesn't require approval - it's automated
      const response = await this.submitTransaction(sender, payload);
      console.log("Funds released to the appropriate recipient(s)");
      
      return !!response && !!response.hash;
    } catch (error) {
      console.error("Error releasing funds:", error);
      throw error;
    }
  }
  
  // Raise a dispute
  public async raiseDispute(
    sender: any, // Wallet instance
    reason: string,
  ): Promise<boolean> {
    if (!this.escrowAddress) {
      throw new Error("Escrow address not set");
    }
    
    try {
      const payload = {
        type: "entry_function_payload",
        function: `${this.moduleAddress}::escrow::raise_dispute`,
        type_arguments: [],
        arguments: [this.escrowAddress, reason]
      };
      
      const response = await this.submitTransaction(sender, payload);
      
      return !!response && !!response.hash;
    } catch (error) {
      console.error("Error raising dispute:", error);
      throw error;
    }
  }
  
  // Resolve a dispute (arbiter only)
  public async resolveDispute(
    sender: any, // Wallet instance (arbiter)
    resolution: number, // 0=draw, 1=player1 wins, 2=player2 wins, 3=cancel
    resolutionNotes: string,
  ): Promise<boolean> {
    if (!this.escrowAddress) {
      throw new Error("Escrow address not set");
    }
    
    try {
      const payload = {
        type: "entry_function_payload",
        function: `${this.moduleAddress}::escrow::resolve_dispute`,
        type_arguments: [],
        arguments: [this.escrowAddress, resolution.toString(), resolutionNotes]
      };
      
      const response = await this.submitTransaction(sender, payload);
      
      return !!response && !!response.hash;
    } catch (error) {
      console.error("Error resolving dispute:", error);
      throw error;
    }
  }
  
  // Check if game has timed out
  public async checkTimeout(
    sender: any, // Wallet instance
  ): Promise<boolean> {
    if (!this.escrowAddress) {
      throw new Error("Escrow address not set");
    }
    
    try {
      const payload = {
        type: "entry_function_payload",
        function: `${this.moduleAddress}::escrow::check_timeout`,
        type_arguments: [],
        arguments: [this.escrowAddress]
      };
      
      const response = await this.submitTransaction(sender, payload);
      
      return !!response && !!response.hash;
    } catch (error) {
      console.error("Error checking timeout:", error);
      throw error;
    }
  }
  
  // Cancel the escrow
  public async cancelEscrow(
    sender: any, // Wallet instance
  ): Promise<boolean> {
    if (!this.escrowAddress) {
      throw new Error("Escrow address not set");
    }
    
    try {
      const payload = {
        type: "entry_function_payload",
        function: `${this.moduleAddress}::escrow::cancel_escrow`,
        type_arguments: [],
        arguments: [this.escrowAddress]
      };
      
      const response = await this.submitTransaction(sender, payload);
      
      return !!response && !!response.hash;
    } catch (error) {
      console.error("Error cancelling escrow:", error);
      throw error;
    }
  }
  
  // Refund after cancellation
  public async refundAfterCancellation(
    sender: any, // Wallet instance
  ): Promise<boolean> {
    if (!this.escrowAddress) {
      throw new Error("Escrow address not set");
    }
    
    try {
      const payload = {
        type: "entry_function_payload",
        function: `${this.moduleAddress}::escrow::refund_after_cancellation`,
        type_arguments: [],
        arguments: [this.escrowAddress]
      };
      
      const response = await this.submitTransaction(sender, payload);
      
      return !!response && !!response.hash;
    } catch (error) {
      console.error("Error refunding after cancellation:", error);
      throw error;
    }
  }
  
  //
  // View functions (read-only contract calls)
  //
  
  // Get escrow status
  public async getEscrowStatus(): Promise<EscrowStatus> {
    if (!this.escrowAddress) {
      throw new Error("Escrow address not set");
    }
    
    try {
      const resource = await this.client.getAccountResource(
        this.escrowAddress,
        `${this.moduleAddress}::escrow::GameEscrow`
      );
      
      if (resource && resource.data) {
        return (resource.data as any).status as EscrowStatus;
      }
      
      throw new Error("Could not retrieve escrow status");
    } catch (error) {
      console.error("Error getting escrow status:", error);
      throw error;
    }
  }
  
  // Get winner address
  public async getWinner(): Promise<string | null> {
    if (!this.escrowAddress) {
      throw new Error("Escrow address not set");
    }
    
    try {
      const result = await this.client.view({
        function: `${this.moduleAddress}::escrow::get_winner`,
        type_arguments: [],
        arguments: [this.escrowAddress]
      });
      
      // The result will be an array with the Option<address>
      // If Some(address), it will be an object with a vector
      if (result && result.length > 0 && result[0]) {
        return result[0] as string;
      }
      
      return null; // None case (draw or not set)
    } catch (error) {
      console.error("Error getting winner:", error);
      throw error;
    }
  }
  
  // Get escrow balance
  public async getEscrowBalance(): Promise<number> {
    if (!this.escrowAddress) {
      throw new Error("Escrow address not set");
    }
    
    try {
      const result = await this.client.view({
        function: `${this.moduleAddress}::escrow::get_escrow_balance`,
        type_arguments: [],
        arguments: [this.escrowAddress]
      });
      
      if (result && result.length > 0) {
        // Convert octas to APT
        return Number(result[0]) / 100000000;
      }
      
      return 0;
    } catch (error) {
      console.error("Error getting escrow balance:", error);
      throw error;
    }
  }
  
  // Check if both deposits are complete
  public async areBothDepositsComplete(): Promise<boolean> {
    if (!this.escrowAddress) {
      throw new Error("Escrow address not set");
    }
    
    try {
      const result = await this.client.view({
        function: `${this.moduleAddress}::escrow::are_both_deposits_complete`,
        type_arguments: [],
        arguments: [this.escrowAddress]
      });
      
      if (result && result.length > 0) {
        return Boolean(result[0]);
      }
      
      return false;
    } catch (error) {
      console.error("Error checking deposits completion:", error);
      throw error;
    }
  }
  
  // Get minimum bet
  public async getMinimumBet(): Promise<number> {
    if (!this.escrowAddress) {
      throw new Error("Escrow address not set");
    }
    
    try {
      const result = await this.client.view({
        function: `${this.moduleAddress}::escrow::get_minimum_bet`,
        type_arguments: [],
        arguments: [this.escrowAddress]
      });
      
      if (result && result.length > 0) {
        // Convert octas to APT
        return Number(result[0]) / 100000000;
      }
      
      return 0;
    } catch (error) {
      console.error("Error getting minimum bet:", error);
      throw error;
    }
  }
  
  // Get player info
  public async getPlayerInfo(playerAddress: string): Promise<{
    hasDeposited: boolean;
    depositAmount: number;
    signedGameStart: boolean;
  }> {
    if (!this.escrowAddress) {
      throw new Error("Escrow address not set");
    }
    
    try {
      const result = await this.client.view({
        function: `${this.moduleAddress}::escrow::get_player_info`,
        type_arguments: [],
        arguments: [this.escrowAddress, playerAddress]
      });
      
      if (result && result.length >= 3) {
        return {
          hasDeposited: Boolean(result[0]),
          depositAmount: Number(result[1]) / 100000000, // Convert octas to APT
          signedGameStart: Boolean(result[2])
        };
      }
      
      throw new Error("Invalid player info result");
    } catch (error) {
      console.error("Error getting player info:", error);
      throw error;
    }
  }
  
  // Get total escrowed amount
  public async getTotalEscrowedAmount(): Promise<number> {
    if (!this.escrowAddress) {
      throw new Error("Escrow address not set");
    }
    
    try {
      const result = await this.client.view({
        function: `${this.moduleAddress}::escrow::get_total_escrowed_amount`,
        type_arguments: [],
        arguments: [this.escrowAddress]
      });
      
      if (result && result.length > 0) {
        // Convert octas to APT
        return Number(result[0]) / 100000000;
      }
      
      return 0;
    } catch (error) {
      console.error("Error getting total escrowed amount:", error);
      throw error;
    }
  }
  
  // Get game time remaining
  public async getGameTimeRemaining(): Promise<number | null> {
    if (!this.escrowAddress) {
      throw new Error("Escrow address not set");
    }
    
    try {
      const result = await this.client.view({
        function: `${this.moduleAddress}::escrow::get_game_time_remaining`,
        type_arguments: [],
        arguments: [this.escrowAddress]
      });
      
      // The result will be an array with the Option<u64>
      if (result && result.length > 0 && result[0]) {
        return Number(result[0]);
      }
      
      return null; // None case (game not started or not in playing state)
    } catch (error) {
      console.error("Error getting game time remaining:", error);
      throw error;
    }
  }
  
  // Helper method to submit a transaction
  private async submitTransaction(
    sender: any, // Wallet instance
    payload: any
  ): Promise<any> {
    try {
      // For direct wallet API (window.aptos) - try this first
      if (typeof window !== 'undefined' && window.aptos) {
        console.log("Using window.aptos wallet for transaction");
        return await window.aptos.signAndSubmitTransaction(payload);
      }
      
      // For Petra and similar wallets
      if (sender && sender.signAndSubmitTransaction) {
        console.log("Using provided wallet for transaction");
        return await sender.signAndSubmitTransaction(payload);
      }
      
      // If we get here, no compatible wallet was found
      console.error("No compatible wallet found for transaction");
      throw new Error("No compatible wallet found");
    } catch (error) {
      console.error("Transaction error:", error);
      throw error;
    }
  }
}

// Export an enum for dispute resolution codes
export enum DisputeResolution {
  DRAW = 0,
  PLAYER1_WINS = 1,
  PLAYER2_WINS = 2,
  CANCEL = 3
} 