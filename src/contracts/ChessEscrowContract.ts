// ChessEscrowContract.ts
// Simulates an Aptos blockchain smart contract for chess game escrow

import { AptosClient, Types } from 'aptos';

// In a real implementation, these would be defined in the Move smart contract
export enum EscrowStatus {
  PENDING = 'pending',           // Contract created, awaiting deposits
  FUNDED = 'funded',             // Both players have deposited funds
  PLAYING = 'playing',           // Game in progress
  COMPLETED = 'completed',       // Game completed, funds released
  DISPUTED = 'disputed',         // Dispute raised, awaiting resolution
  CANCELLED = 'cancelled',       // Game cancelled, funds returned if any
  TIMED_OUT = 'timed_out'        // Game timed out, funds handled according to timeout policy
}

export type EscrowParticipant = {
  address: string;               // Player's wallet address
  depositAmount: number;         // Amount deposited in APT
  hasDeposited: boolean;         // Whether player has deposited funds
  depositTimestamp?: number;     // When the deposit was made
  signedGameStart?: boolean;     // Whether player signed to start the game
};

// This class simulates what would be defined in a Move smart contract
export class ChessEscrowContract {
  private contractAddress: string;
  private player1: EscrowParticipant;
  private player2: EscrowParticipant;
  private status: EscrowStatus;
  private gameTimeoutMs: number;
  private arbiter: string;             // Address of arbiter who can resolve disputes
  private winner: string | null;
  private gameStartTime: number | null;
  private minimumBet: number;
  private timeoutHandler: NodeJS.Timeout | null;
  private client: AptosClient;

  // Contract events (in a real contract these would be emitted on-chain)
  private onStatusChange?: (status: EscrowStatus) => void;
  private onWinnerDeclared?: (winner: string) => void;
  private onTimeout?: () => void;

  constructor(
    contractAddress: string,
    player1Address: string,
    player2Address: string,
    minimumBet: number,
    arbiterAddress: string,
    client: AptosClient
  ) {
    this.contractAddress = contractAddress;
    this.player1 = {
      address: player1Address,
      depositAmount: 0,
      hasDeposited: false
    };
    this.player2 = {
      address: player2Address,
      depositAmount: 0,
      hasDeposited: false
    };
    this.status = EscrowStatus.PENDING;
    this.gameTimeoutMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    this.arbiter = arbiterAddress;
    this.winner = null;
    this.gameStartTime = null;
    this.minimumBet = minimumBet;
    this.timeoutHandler = null;
    this.client = client;
    
    console.log(`ChessEscrow contract created at ${contractAddress}`);
    console.log(`Players: ${player1Address} and ${player2Address}`);
    console.log(`Minimum bet: ${minimumBet} APT`);
  }

  // Register callback functions for contract events
  public registerEventHandlers(
    onStatusChange?: (status: EscrowStatus) => void,
    onWinnerDeclared?: (winner: string) => void,
    onTimeout?: () => void
  ) {
    this.onStatusChange = onStatusChange;
    this.onWinnerDeclared = onWinnerDeclared;
    this.onTimeout = onTimeout;
  }

  // Get the current status of the escrow contract
  public getStatus(): EscrowStatus {
    return this.status;
  }

  // Get the contract address
  public getContractAddress(): string {
    return this.contractAddress;
  }
  
  // Get minimum bet amount
  public getMinimumBet(): number {
    return this.minimumBet;
  }

  // Get player information
  public getPlayerInfo(playerAddress: string): EscrowParticipant | null {
    if (playerAddress === this.player1.address) {
      return { ...this.player1 };
    } else if (playerAddress === this.player2.address) {
      return { ...this.player2 };
    }
    return null;
  }

  // Check if both players have deposited funds
  public areBothDepositsComplete(): boolean {
    return this.player1.hasDeposited && this.player2.hasDeposited;
  }

  // Calculate the total escrowed amount (minimum of both players' bets × 2)
  public getTotalEscrowedAmount(): number {
    if (!this.areBothDepositsComplete()) {
      return 0;
    }
    
    const minBet = Math.min(this.player1.depositAmount, this.player2.depositAmount);
    return minBet * 2;
  }

  // Simulates a player depositing funds into the escrow contract
  public async deposit(
    playerAddress: string, 
    amount: number, 
    txPayload: Types.TransactionPayload,
    simulate: boolean = false
  ): Promise<boolean> {
    console.log(`Deposit request from ${playerAddress} for ${amount} APT`);

    // Validate player is a participant
    if (playerAddress !== this.player1.address && playerAddress !== this.player2.address) {
      console.error(`[Contract Error] Invalid player address: ${playerAddress}`);
      return false;
    }

    // Validate contract is in correct state
    if (this.status !== EscrowStatus.PENDING) {
      console.error(`[Contract Error] Cannot deposit in current state: ${this.status}`);
      return false;
    }

    // Validate amount meets minimum
    if (amount < this.minimumBet) {
      console.error(`[Contract Error] Deposit amount (${amount}) less than minimum bet (${this.minimumBet})`);
      return false;
    }

    // Check if player has already deposited
    const player = playerAddress === this.player1.address ? this.player1 : this.player2;
    if (player.hasDeposited) {
      console.error(`[Contract Error] Player has already deposited funds`);
      return false;
    }

    // In a real contract, these checks would happen in Move code
    // Here we simulate them
    
    // In simulation mode, we bypass the actual transaction
    if (simulate) {
      // Update player deposit status
      if (playerAddress === this.player1.address) {
        this.player1.depositAmount = amount;
        this.player1.hasDeposited = true;
        this.player1.depositTimestamp = Date.now();
      } else {
        this.player2.depositAmount = amount;
        this.player2.hasDeposited = true;
        this.player2.depositTimestamp = Date.now();
      }
    } else {
      // In a real implementation, this would call the actual contract function
      // We would verify the transaction was submitted and confirmed
      
      try {
        // This is just a placeholder for the real transaction submission
        // In reality, the player would directly call the contract via wallet
        console.log(`[Contract] Processing deposit transaction...`);
        console.log(`[Contract] Transaction payload:`, txPayload);
        
        // Simulate blockchain delay (would be actual tx confirmation in real implementation)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update player deposit status (after confirmed transaction)
        if (playerAddress === this.player1.address) {
          this.player1.depositAmount = amount;
          this.player1.hasDeposited = true;
          this.player1.depositTimestamp = Date.now();
        } else {
          this.player2.depositAmount = amount;
          this.player2.hasDeposited = true;
          this.player2.depositTimestamp = Date.now();
        }
      } catch (error) {
        console.error(`[Contract Error] Transaction failed:`, error);
        return false;
      }
    }

    console.log(`[Contract] ${playerAddress} successfully deposited ${amount} APT`);
    
    // If both players have deposited, update contract status
    if (this.areBothDepositsComplete()) {
      this.updateStatus(EscrowStatus.FUNDED);
      console.log(`[Contract] Both players have deposited. Contract is fully funded!`);
    }
    
    return true;
  }

  // Start the game after both players have deposited
  public startGame(): boolean {
    if (this.status !== EscrowStatus.FUNDED) {
      console.error(`[Contract Error] Cannot start game in state: ${this.status}`);
      return false;
    }
    
    if (!this.areBothDepositsComplete()) {
      console.error(`[Contract Error] Cannot start game: both players must deposit first`);
      return false;
    }
    
    this.gameStartTime = Date.now();
    this.updateStatus(EscrowStatus.PLAYING);
    console.log(`[Contract] Game started at ${new Date(this.gameStartTime).toISOString()}`);
    
    // Start game timeout
    this.startGameTimeout();
    
    return true;
  }

  // Start the timeout for the game
  private startGameTimeout(): void {
    if (this.timeoutHandler) {
      clearTimeout(this.timeoutHandler);
    }
    
    this.timeoutHandler = setTimeout(() => {
      if (this.status === EscrowStatus.PLAYING) {
        console.log(`[Contract] Game timed out after ${this.gameTimeoutMs / (60 * 60 * 1000)} hours`);
        this.handleTimeout();
      }
    }, this.gameTimeoutMs);
  }

  // Handle game timeout (in real contract, this would be triggered by someone calling a timeout function)
  private handleTimeout(): void {
    if (this.status !== EscrowStatus.PLAYING) {
      return;
    }
    
    this.updateStatus(EscrowStatus.TIMED_OUT);
    
    // In a timeout, funds are typically:
    // 1. Returned to players (equal split)
    // 2. Sent to a designated winner if one player was inactive
    // 3. Held pending arbiter decision
    
    if (this.onTimeout) {
      this.onTimeout();
    }
    
    console.log(`[Contract] Game timed out. Funds held pending arbiter decision.`);
  }

  // Complete the game with a winner or draw
  public completeGame(winnerAddress: string | null, isDraw: boolean = false): boolean {
    // Validate contract is in PLAYING state
    if (this.status !== EscrowStatus.PLAYING) {
      console.error(`[Contract Error] Cannot complete game in state: ${this.status}`);
      return false;
    }
    
    // Validate winner is a participant or it's a draw
    if (winnerAddress !== null && 
        winnerAddress !== this.player1.address && 
        winnerAddress !== this.player2.address) {
      console.error(`[Contract Error] Invalid winner address: ${winnerAddress}`);
      return false;
    }
    
    // Clear timeout
    if (this.timeoutHandler) {
      clearTimeout(this.timeoutHandler);
      this.timeoutHandler = null;
    }
    
    // Record winner
    this.winner = winnerAddress;
    
    // Update status
    this.updateStatus(EscrowStatus.COMPLETED);
    
    if (isDraw) {
      console.log(`[Contract] Game ended in a draw. Funds will be returned to players.`);
    } else if (winnerAddress) {
      console.log(`[Contract] Game completed with winner: ${winnerAddress}`);
      if (this.onWinnerDeclared) {
        this.onWinnerDeclared(winnerAddress);
      }
    }
    
    return true;
  }

  // Release funds to winner or back to players in case of draw
  public async releaseFunds(): Promise<boolean> {
    // Validate contract state
    if (this.status !== EscrowStatus.COMPLETED) {
      console.error(`[Contract Error] Cannot release funds in state: ${this.status}`);
      return false;
    }
    
    const totalAmount = this.getTotalEscrowedAmount();
    
    // If it's a draw, return deposits to each player
    if (this.winner === null) {
      console.log(`[Contract] Processing refunds for draw`);
      
      // In a real contract, this would involve two transfers
      const player1Refund = this.player1.depositAmount;
      const player2Refund = this.player2.depositAmount;
      
      console.log(`[Contract] Refunding ${player1Refund} APT to ${this.player1.address}`);
      console.log(`[Contract] Refunding ${player2Refund} APT to ${this.player2.address}`);
      
      // Simulate blockchain delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    }
    
    // If there's a winner, transfer total to winner
    console.log(`[Contract] Releasing ${totalAmount} APT to winner: ${this.winner}`);
    
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  }

  // Raise a dispute (can be called by either player)
  public raiseDispute(playerAddress: string, reason: string): boolean {
    // Validate player is a participant
    if (playerAddress !== this.player1.address && playerAddress !== this.player2.address) {
      console.error(`[Contract Error] Invalid player address for dispute: ${playerAddress}`);
      return false;
    }
    
    // Can only dispute active games
    if (this.status !== EscrowStatus.PLAYING) {
      console.error(`[Contract Error] Cannot raise dispute in state: ${this.status}`);
      return false;
    }
    
    console.log(`[Contract] Dispute raised by ${playerAddress}: ${reason}`);
    this.updateStatus(EscrowStatus.DISPUTED);
    
    return true;
  }

  // Arbiter resolves a dispute
  public resolveDispute(
    arbiterAddress: string, 
    resolution: 'player1' | 'player2' | 'draw' | 'cancel'
  ): boolean {
    // Validate arbiter
    if (arbiterAddress !== this.arbiter) {
      console.error(`[Contract Error] Invalid arbiter address: ${arbiterAddress}`);
      return false;
    }
    
    // Can only resolve disputes
    if (this.status !== EscrowStatus.DISPUTED && this.status !== EscrowStatus.TIMED_OUT) {
      console.error(`[Contract Error] Cannot resolve in state: ${this.status}`);
      return false;
    }
    
    console.log(`[Contract] Dispute resolution by arbiter: ${resolution}`);
    
    if (resolution === 'player1') {
      this.winner = this.player1.address;
      this.updateStatus(EscrowStatus.COMPLETED);
      if (this.onWinnerDeclared) {
        this.onWinnerDeclared(this.player1.address);
      }
    } else if (resolution === 'player2') {
      this.winner = this.player2.address;
      this.updateStatus(EscrowStatus.COMPLETED);
      if (this.onWinnerDeclared) {
        this.onWinnerDeclared(this.player2.address);
      }
    } else if (resolution === 'draw') {
      this.winner = null;
      this.updateStatus(EscrowStatus.COMPLETED);
    } else if (resolution === 'cancel') {
      this.winner = null;
      this.updateStatus(EscrowStatus.CANCELLED);
    }
    
    return true;
  }

  // Cancel the escrow and refund (if applicable)
  public async cancelEscrow(): Promise<boolean> {
    // Cannot cancel if already completed or cancelled
    if (this.status === EscrowStatus.COMPLETED || this.status === EscrowStatus.CANCELLED) {
      console.error(`[Contract Error] Cannot cancel in state: ${this.status}`);
      return false;
    }
    
    this.updateStatus(EscrowStatus.CANCELLED);
    console.log(`[Contract] Escrow cancelled. Processing refunds if applicable.`);
    
    // Refund any deposits
    if (this.player1.hasDeposited) {
      console.log(`[Contract] Refunding ${this.player1.depositAmount} APT to ${this.player1.address}`);
    }
    
    if (this.player2.hasDeposited) {
      console.log(`[Contract] Refunding ${this.player2.depositAmount} APT to ${this.player2.address}`);
    }
    
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  }

  // Reset the contract for a new game (in a real contract, you'd deploy a new instance)
  public reset(): void {
    this.player1.depositAmount = 0;
    this.player1.hasDeposited = false;
    this.player1.depositTimestamp = undefined;
    this.player1.signedGameStart = undefined;
    
    this.player2.depositAmount = 0;
    this.player2.hasDeposited = false;
    this.player2.depositTimestamp = undefined;
    this.player2.signedGameStart = undefined;
    
    this.status = EscrowStatus.PENDING;
    this.gameStartTime = null;
    this.winner = null;
    
    if (this.timeoutHandler) {
      clearTimeout(this.timeoutHandler);
      this.timeoutHandler = null;
    }
    
    console.log(`[Contract] Contract reset to pending state`);
  }

  // Update contract status and trigger callback
  private updateStatus(newStatus: EscrowStatus): void {
    const oldStatus = this.status;
    this.status = newStatus;
    
    console.log(`[Contract] Status changed: ${oldStatus} -> ${newStatus}`);
    
    if (this.onStatusChange) {
      this.onStatusChange(newStatus);
    }
  }
  
  // Get escrow information (in a real contract, this would be a view function)
  public getEscrowInfo(): {
    contractAddress: string;
    player1: EscrowParticipant;
    player2: EscrowParticipant;
    status: EscrowStatus;
    totalAmount: number;
    winner: string | null;
    gameStartTime: number | null;
  } {
    return {
      contractAddress: this.contractAddress,
      player1: { ...this.player1 },
      player2: { ...this.player2 },
      status: this.status,
      totalAmount: this.getTotalEscrowedAmount(),
      winner: this.winner,
      gameStartTime: this.gameStartTime
    };
  }
}

// In a real implementation, this would be the contract's Move code
/*
module chess_escrow {
    use std::signer;
    use aptos_framework::account;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::event::{Self, EventHandle};
    
    // Contract states
    const PENDING: u8 = 0;
    const FUNDED: u8 = 1;
    const PLAYING: u8 = 2;
    const COMPLETED: u8 = 3;
    const DISPUTED: u8 = 4;
    const CANCELLED: u8 = 5;
    const TIMED_OUT: u8 = 6;
    
    // Errors
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_INVALID_STATE: u64 = 2;
    const E_ALREADY_DEPOSITED: u64 = 3;
    const E_INSUFFICIENT_DEPOSIT: u64 = 4;
    const E_NOT_A_PLAYER: u64 = 5;
    const E_GAME_IN_PROGRESS: u64 = 6;
    
    struct GameEscrow has key {
        player1: address,
        player2: address,
        player1_deposit: Coin<AptosCoin>,
        player2_deposit: Coin<AptosCoin>,
        minimum_bet: u64,
        status: u8,
        arbiter: address,
        winner: Option<address>,
        game_start_time: Option<u64>,
        timeout_seconds: u64,
        
        status_change_events: EventHandle<StatusChangeEvent>,
        winner_declared_events: EventHandle<WinnerDeclaredEvent>,
    }
    
    struct StatusChangeEvent has drop, store {
        old_status: u8,
        new_status: u8,
        timestamp: u64,
    }
    
    struct WinnerDeclaredEvent has drop, store {
        winner: address,
        timestamp: u64,
    }
    
    public entry fun initialize(
        account: &signer,
        player1: address,
        player2: address,
        minimum_bet: u64,
        arbiter: address,
        timeout_seconds: u64,
    ) {
        let sender = signer::address_of(account);
        
        // Create empty escrow resource
        let escrow = GameEscrow {
            player1,
            player2,
            player1_deposit: coin::zero<AptosCoin>(),
            player2_deposit: coin::zero<AptosCoin>(),
            minimum_bet,
            status: PENDING,
            arbiter,
            winner: option::none(),
            game_start_time: option::none(),
            timeout_seconds,
            status_change_events: account::new_event_handle<StatusChangeEvent>(account),
            winner_declared_events: account::new_event_handle<WinnerDeclaredEvent>(account),
        };
        
        move_to(account, escrow);
    }
    
    public entry fun deposit(
        account: &signer, 
        escrow_address: address,
        amount: u64
    ) acquires GameEscrow {
        let sender = signer::address_of(account);
        let escrow = borrow_global_mut<GameEscrow>(escrow_address);
        
        // Check contract state
        assert!(escrow.status == PENDING, E_INVALID_STATE);
        
        // Check if sender is a player
        assert!(sender == escrow.player1 || sender == escrow.player2, E_NOT_A_PLAYER);
        
        // Check deposit amount
        assert!(amount >= escrow.minimum_bet, E_INSUFFICIENT_DEPOSIT);
        
        // Deposit based on player
        if (sender == escrow.player1) {
            // Ensure player hasn't already deposited
            assert!(coin::value(&escrow.player1_deposit) == 0, E_ALREADY_DEPOSITED);
            
            // Transfer APT from sender to escrow
            let deposit = coin::withdraw<AptosCoin>(account, amount);
            coin::merge(&mut escrow.player1_deposit, deposit);
        } else {
            // Must be player 2
            assert!(coin::value(&escrow.player2_deposit) == 0, E_ALREADY_DEPOSITED);
            
            // Transfer APT from sender to escrow
            let deposit = coin::withdraw<AptosCoin>(account, amount);
            coin::merge(&mut escrow.player2_deposit, deposit);
        };
        
        // Check if escrow is now fully funded
        if (coin::value(&escrow.player1_deposit) > 0 && coin::value(&escrow.player2_deposit) > 0) {
            // Update status to FUNDED
            let old_status = escrow.status;
            escrow.status = FUNDED;
            
            // Emit status change event
            event::emit_event(&mut escrow.status_change_events, StatusChangeEvent {
                old_status,
                new_status: FUNDED,
                timestamp: timestamp::now_seconds(),
            });
        };
    }
    
    // Additional contract methods would be implemented here:
    // - start_game
    // - complete_game
    // - release_funds
    // - raise_dispute
    // - resolve_dispute
    // - cancel_escrow
    // - check_timeout
    // etc.
}
*/ 