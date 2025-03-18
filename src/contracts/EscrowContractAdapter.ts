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
    moduleAddress: string = '0x72e87c94e15ee1a95d23486984c9914849399a775e9ae4006b3b230c990a4cc0', // Newly deployed module address
  ) {
    this.client = new AptosClient(nodeUrl);
    this.moduleAddress = moduleAddress;
  }
  
  // Set the escrow contract address
  public setEscrowAddress(address: string): void {
    this.escrowAddress = address;
  }
  
  // Get the escrow address
  public getEscrowAddress(): string | null {
    return this.escrowAddress;
  }
  
  // Create a new escrow contract
  public async createEscrow(
    sender: any, // Wallet instance
    player1Address: string,
    player2Address: string,
    minimumBet: number,
    arbiterAddress: string,
    timeoutSeconds: number = 24 * 60 * 60, // 24 hours in seconds
  ): Promise<string | null> {
    try {
      // Convert APT to octas (smallest unit) - 1 APT = 10^8 Octas
      const minimumBetOctas = (minimumBet * 100000000).toString();
      
      const payload = {
        type: "entry_function_payload",
        function: `${this.moduleAddress}::chess_escrow::escrow::create_escrow`,
        type_arguments: [],
        arguments: [
          player1Address,
          player2Address,
          minimumBetOctas,
          arbiterAddress,
          timeoutSeconds.toString()
        ]
      };
      
      const response = await this.submitTransaction(sender, payload);
      
      if (response && response.hash) {
        // In a real implementation, we'd need to query the chain to get the address
        // of the newly created escrow resource. Here, we're simplifying by
        // assuming it's the sender's address (which is where the resource is stored).
        this.escrowAddress = sender.address;
        return sender.address;
      }
      
      return null;
    } catch (error) {
      console.error("Error creating escrow:", error);
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
        function: `${this.moduleAddress}::chess_escrow::escrow::deposit`,
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
        function: `${this.moduleAddress}::chess_escrow::escrow::sign_to_start_game`,
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
  
  // Complete the game with a winner
  public async completeGame(
    sender: any, // Wallet instance
    winnerAddress: string,
  ): Promise<boolean> {
    if (!this.escrowAddress) {
      throw new Error("Escrow address not set");
    }
    
    try {
      const payload = {
        type: "entry_function_payload",
        function: `${this.moduleAddress}::chess_escrow::escrow::complete_game`,
        type_arguments: [],
        arguments: [this.escrowAddress, winnerAddress]
      };
      
      const response = await this.submitTransaction(sender, payload);
      
      return !!response && !!response.hash;
    } catch (error) {
      console.error("Error completing game:", error);
      throw error;
    }
  }
  
  // Complete the game as a draw
  public async completeGameAsDraw(
    sender: any, // Wallet instance
  ): Promise<boolean> {
    if (!this.escrowAddress) {
      throw new Error("Escrow address not set");
    }
    
    try {
      const payload = {
        type: "entry_function_payload",
        function: `${this.moduleAddress}::chess_escrow::escrow::complete_game_as_draw`,
        type_arguments: [],
        arguments: [this.escrowAddress]
      };
      
      const response = await this.submitTransaction(sender, payload);
      
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
        function: `${this.moduleAddress}::chess_escrow::escrow::release_funds`,
        type_arguments: [],
        arguments: [this.escrowAddress]
      };
      
      const response = await this.submitTransaction(sender, payload);
      
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
        function: `${this.moduleAddress}::chess_escrow::escrow::raise_dispute`,
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
        function: `${this.moduleAddress}::chess_escrow::escrow::resolve_dispute`,
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
        function: `${this.moduleAddress}::chess_escrow::escrow::check_timeout`,
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
        function: `${this.moduleAddress}::chess_escrow::escrow::cancel_escrow`,
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
        function: `${this.moduleAddress}::chess_escrow::escrow::refund_after_cancellation`,
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
        `${this.moduleAddress}::chess_escrow::escrow::GameEscrow`
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
        function: `${this.moduleAddress}::chess_escrow::escrow::get_winner`,
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
        function: `${this.moduleAddress}::chess_escrow::escrow::get_escrow_balance`,
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
        function: `${this.moduleAddress}::chess_escrow::escrow::are_both_deposits_complete`,
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
        function: `${this.moduleAddress}::chess_escrow::escrow::get_minimum_bet`,
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
        function: `${this.moduleAddress}::chess_escrow::escrow::get_player_info`,
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
        function: `${this.moduleAddress}::chess_escrow::escrow::get_total_escrowed_amount`,
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
        function: `${this.moduleAddress}::chess_escrow::escrow::get_game_time_remaining`,
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
      // For Petra and similar wallets
      if (sender.signAndSubmitTransaction) {
        return await sender.signAndSubmitTransaction(payload);
      }
      
      // For direct wallet API (window.aptos)
      if (typeof window !== 'undefined' && window.aptos) {
        return await window.aptos.signAndSubmitTransaction(payload);
      }
      
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