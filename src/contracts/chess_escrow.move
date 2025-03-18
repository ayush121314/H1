module chess_game::escrow {
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use std::option::{Self, Option};
    use aptos_framework::account;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::event::{Self, EventHandle};
    
    // Contract states
    const STATUS_PENDING: u8 = 0;
    const STATUS_FUNDED: u8 = 1;
    const STATUS_PLAYING: u8 = 2;
    const STATUS_COMPLETED: u8 = 3;
    const STATUS_DISPUTED: u8 = 4;
    const STATUS_CANCELLED: u8 = 5;
    const STATUS_TIMED_OUT: u8 = 6;
    
    // Errors
    const ENOT_AUTHORIZED: u64 = 1;
    const EINVALID_STATE: u64 = 2;
    const EALREADY_DEPOSITED: u64 = 3;
    const EINSUFFICIENT_DEPOSIT: u64 = 4;
    const ENOT_A_PLAYER: u64 = 5;
    const EGAME_IN_PROGRESS: u64 = 6;
    const EINVALID_WINNER: u64 = 7;
    const ETIMEOUT_REQUIRED: u64 = 8;
    const EBOTH_DEPOSITS_REQUIRED: u64 = 9;
    const ENOT_COMPLETED: u64 = 10;
    const EGAME_NOT_STARTED: u64 = 11;
    
    /// PlayerInfo keeps track of a player's deposit and status
    struct PlayerInfo has store, drop {
        address: address,
        deposit_amount: u64,
        has_deposited: bool,
        deposit_timestamp: Option<u64>,
        signed_game_start: bool,
    }
    
    /// GameEscrow holds the funds and game state
    struct GameEscrow has key {
        player1: PlayerInfo,
        player2: PlayerInfo,
        escrow_balance: Coin<AptosCoin>,  // Holds all escrowed funds
        status: u8,
        arbiter: address,
        winner: Option<address>,
        game_start_time: Option<u64>,
        game_timeout_seconds: u64,
        minimum_bet: u64,
        dispute_reason: Option<String>,
        
        status_change_events: EventHandle<StatusChangeEvent>,
        winner_declared_events: EventHandle<WinnerDeclaredEvent>,
        timeout_events: EventHandle<TimeoutEvent>,
        dispute_events: EventHandle<DisputeEvent>,
    }
    
    /// EscrowInfo is a resource that tracks all created escrows
    struct EscrowRegistry has key {
        escrows: vector<address>,
    }
    
    /// Events
    struct StatusChangeEvent has drop, store {
        escrow_address: address,
        old_status: u8,
        new_status: u8,
        timestamp: u64,
    }
    
    struct WinnerDeclaredEvent has drop, store {
        escrow_address: address,
        winner: address,
        timestamp: u64,
    }
    
    struct TimeoutEvent has drop, store {
        escrow_address: address,
        timestamp: u64,
    }
    
    struct DisputeEvent has drop, store {
        escrow_address: address,
        disputer: address,
        reason: String,
        timestamp: u64,
    }
    
    /// Initialize the EscrowRegistry - called once by module publisher
    public entry fun initialize_registry(account: &signer) {
        let registry = EscrowRegistry {
            escrows: vector::empty<address>(),
        };
        move_to(account, registry);
    }
    
    /// Create a new chess escrow between two players
    public entry fun create_escrow(
        account: &signer,
        player1: address,
        player2: address,
        minimum_bet: u64,
        arbiter: address,
        timeout_seconds: u64,
    ) {
        let sender = signer::address_of(account);
        
        // Ensure timeouts are reasonable (minimum 1 hour)
        assert!(timeout_seconds >= 3600, error::invalid_argument(ETIMEOUT_REQUIRED));
        
        // Create player info structures
        let player1_info = PlayerInfo {
            address: player1,
            deposit_amount: 0,
            has_deposited: false,
            deposit_timestamp: option::none(),
            signed_game_start: false,
        };
        
        let player2_info = PlayerInfo {
            address: player2,
            deposit_amount: 0,
            has_deposited: false,
            deposit_timestamp: option::none(),
            signed_game_start: false,
        };
        
        // Create escrow resource
        let escrow = GameEscrow {
            player1: player1_info,
            player2: player2_info,
            escrow_balance: coin::zero<AptosCoin>(),
            status: STATUS_PENDING,
            arbiter: arbiter,
            winner: option::none(),
            game_start_time: option::none(),
            game_timeout_seconds: timeout_seconds,
            minimum_bet: minimum_bet,
            dispute_reason: option::none(),
            status_change_events: account::new_event_handle<StatusChangeEvent>(account),
            winner_declared_events: account::new_event_handle<WinnerDeclaredEvent>(account),
            timeout_events: account::new_event_handle<TimeoutEvent>(account),
            dispute_events: account::new_event_handle<DisputeEvent>(account),
        };
        
        // Move escrow to account
        move_to(account, escrow);
        
        // Register this escrow in the registry if it exists
        if (exists<EscrowRegistry>(@chess_game)) {
            let registry = borrow_global_mut<EscrowRegistry>(@chess_game);
            vector::push_back(&mut registry.escrows, sender);
        };
    }
    
    /// Deposit funds into the escrow
    public entry fun deposit(
        account: &signer, 
        escrow_address: address,
        amount: u64
    ) acquires GameEscrow {
        let sender = signer::address_of(account);
        let escrow = borrow_global_mut<GameEscrow>(escrow_address);
        
        // Check contract state is PENDING
        assert!(escrow.status == STATUS_PENDING, error::invalid_state(EINVALID_STATE));
        
        // Check deposit amount meets minimum
        assert!(amount >= escrow.minimum_bet, error::invalid_argument(EINSUFFICIENT_DEPOSIT));
        
        let now = timestamp::now_seconds();
        
        // Handle deposit based on player
        if (sender == escrow.player1.address) {
            // Check player hasn't already deposited
            assert!(!escrow.player1.has_deposited, error::already_exists(EALREADY_DEPOSITED));
            
            // Update player info
            escrow.player1.deposit_amount = amount;
            escrow.player1.has_deposited = true;
            escrow.player1.deposit_timestamp = option::some(now);
            
            // Transfer coins to escrow
            let deposit_coins = coin::withdraw<AptosCoin>(account, amount);
            coin::merge(&mut escrow.escrow_balance, deposit_coins);
        } else if (sender == escrow.player2.address) {
            // Check player hasn't already deposited
            assert!(!escrow.player2.has_deposited, error::already_exists(EALREADY_DEPOSITED));
            
            // Update player info
            escrow.player2.deposit_amount = amount;
            escrow.player2.has_deposited = true;
            escrow.player2.deposit_timestamp = option::some(now);
            
            // Transfer coins to escrow
            let deposit_coins = coin::withdraw<AptosCoin>(account, amount);
            coin::merge(&mut escrow.escrow_balance, deposit_coins);
        } else {
            // Not a valid player
            abort error::permission_denied(ENOT_A_PLAYER)
        };
        
        // Check if both players have deposited and update status if necessary
        if (escrow.player1.has_deposited && escrow.player2.has_deposited) {
            update_status(escrow, escrow_address, STATUS_FUNDED);
        };
    }
    
    /// Sign to start the game - both players must sign
    public entry fun sign_to_start_game(
        account: &signer,
        escrow_address: address
    ) acquires GameEscrow {
        let sender = signer::address_of(account);
        let escrow = borrow_global_mut<GameEscrow>(escrow_address);
        
        // Check contract is in FUNDED state
        assert!(escrow.status == STATUS_FUNDED, error::invalid_state(EINVALID_STATE));
        
        // Check sender is a player
        if (sender == escrow.player1.address) {
            escrow.player1.signed_game_start = true;
        } else if (sender == escrow.player2.address) {
            escrow.player2.signed_game_start = true;
        } else {
            abort error::permission_denied(ENOT_A_PLAYER)
        };
        
        // If both players have signed, start the game
        if (escrow.player1.signed_game_start && escrow.player2.signed_game_start) {
            // Set the game start time
            escrow.game_start_time = option::some(timestamp::now_seconds());
            
            // Update status to PLAYING
            update_status(escrow, escrow_address, STATUS_PLAYING);
        };
    }
    
    /// Declare the winner of the game (can only be called by the escrow creator)
    public entry fun complete_game(
        account: &signer,
        escrow_address: address,
        winner_address: address
    ) acquires GameEscrow {
        let sender = signer::address_of(account);
        let escrow = borrow_global_mut<GameEscrow>(escrow_address);
        
        // Only the escrow creator or arbiter can complete the game
        assert!(sender == escrow_address || sender == escrow.arbiter, 
                error::permission_denied(ENOT_AUTHORIZED));
        
        // Game must be in PLAYING state
        assert!(escrow.status == STATUS_PLAYING, error::invalid_state(EINVALID_STATE));
        
        // Winner must be one of the players
        assert!(winner_address == escrow.player1.address || winner_address == escrow.player2.address,
                error::invalid_argument(EINVALID_WINNER));
        
        // Set the winner
        escrow.winner = option::some(winner_address);
        
        // Update status
        update_status(escrow, escrow_address, STATUS_COMPLETED);
        
        // Emit winner event
        event::emit_event(&mut escrow.winner_declared_events, WinnerDeclaredEvent {
            escrow_address,
            winner: winner_address,
            timestamp: timestamp::now_seconds(),
        });
    }
    
    /// Complete the game as a draw (funds return to both players)
    public entry fun complete_game_as_draw(
        account: &signer,
        escrow_address: address
    ) acquires GameEscrow {
        let sender = signer::address_of(account);
        let escrow = borrow_global_mut<GameEscrow>(escrow_address);
        
        // Only the escrow creator or arbiter can complete the game
        assert!(sender == escrow_address || sender == escrow.arbiter, 
                error::permission_denied(ENOT_AUTHORIZED));
        
        // Game must be in PLAYING state
        assert!(escrow.status == STATUS_PLAYING, error::invalid_state(EINVALID_STATE));
        
        // For a draw, winner remains None
        
        // Update status
        update_status(escrow, escrow_address, STATUS_COMPLETED);
    }
    
    /// Release funds to the winner or back to players if draw
    public entry fun release_funds(
        account: &signer,
        escrow_address: address
    ) acquires GameEscrow {
        let sender = signer::address_of(account);
        let escrow = borrow_global_mut<GameEscrow>(escrow_address);
        
        // Only the escrow creator or arbiter can release funds
        assert!(sender == escrow_address || sender == escrow.arbiter, 
                error::permission_denied(ENOT_AUTHORIZED));
        
        // Game must be in COMPLETED state
        assert!(escrow.status == STATUS_COMPLETED, error::invalid_state(ENOT_COMPLETED));
        
        // Handle based on whether there's a winner or draw
        if (option::is_some(&escrow.winner)) {
            // Get winner address
            let winner_addr = *option::borrow(&escrow.winner);
            
            // Calculate minimum bet (determines the pool amount)
            let min_bet = if (escrow.player1.deposit_amount < escrow.player2.deposit_amount) {
                escrow.player1.deposit_amount
            } else {
                escrow.player2.deposit_amount
            };
            
            // Calculate total award (minimum bet × 2)
            let total_award = min_bet * 2;
            
            // Extract winner's award from the escrow balance
            let winner_award = coin::extract(&mut escrow.escrow_balance, total_award);
            
            // Handle excess deposits (if a player bet more than the other)
            if (escrow.player1.deposit_amount > min_bet && escrow.player1.address != winner_addr) {
                // Player 1 overpaid and didn't win, refund the difference
                let excess = escrow.player1.deposit_amount - min_bet;
                let refund = coin::extract(&mut escrow.escrow_balance, excess);
                coin::deposit(escrow.player1.address, refund);
            };
            
            if (escrow.player2.deposit_amount > min_bet && escrow.player2.address != winner_addr) {
                // Player 2 overpaid and didn't win, refund the difference
                let excess = escrow.player2.deposit_amount - min_bet;
                let refund = coin::extract(&mut escrow.escrow_balance, excess);
                coin::deposit(escrow.player2.address, refund);
            };
            
            // Deposit the award to the winner
            coin::deposit(winner_addr, winner_award);
        } else {
            // It's a draw, return original deposits to each player
            let player1_refund = coin::extract(&mut escrow.escrow_balance, escrow.player1.deposit_amount);
            let player2_refund = coin::extract(&mut escrow.escrow_balance, escrow.player2.deposit_amount);
            
            coin::deposit(escrow.player1.address, player1_refund);
            coin::deposit(escrow.player2.address, player2_refund);
        };
        
        // Update status to indicate funds have been released
        // In this implementation we reuse COMPLETED, but could add a new state like SETTLED
    }
    
    /// Raise a dispute about the game
    public entry fun raise_dispute(
        account: &signer,
        escrow_address: address,
        reason: String
    ) acquires GameEscrow {
        let sender = signer::address_of(account);
        let escrow = borrow_global_mut<GameEscrow>(escrow_address);
        
        // Check sender is a player
        assert!(sender == escrow.player1.address || sender == escrow.player2.address,
                error::permission_denied(ENOT_A_PLAYER));
        
        // Can only dispute active games
        assert!(escrow.status == STATUS_PLAYING, error::invalid_state(EINVALID_STATE));
        
        // Record dispute reason
        escrow.dispute_reason = option::some(reason);
        
        // Update status
        update_status(escrow, escrow_address, STATUS_DISPUTED);
        
        // Emit dispute event
        event::emit_event(&mut escrow.dispute_events, DisputeEvent {
            escrow_address,
            disputer: sender,
            reason,
            timestamp: timestamp::now_seconds(),
        });
    }
    
    /// Resolve a dispute (arbiter only)
    public entry fun resolve_dispute(
        account: &signer,
        escrow_address: address,
        resolution: u8,  // 0=draw, 1=player1 wins, 2=player2 wins, 3=cancel
        resolution_notes: String
    ) acquires GameEscrow {
        let sender = signer::address_of(account);
        let escrow = borrow_global_mut<GameEscrow>(escrow_address);
        
        // Only arbiter can resolve disputes
        assert!(sender == escrow.arbiter, error::permission_denied(ENOT_AUTHORIZED));
        
        // Can only resolve disputes or timeouts
        assert!(escrow.status == STATUS_DISPUTED || escrow.status == STATUS_TIMED_OUT,
                error::invalid_state(EINVALID_STATE));
        
        // Handle based on resolution code
        if (resolution == 0) {
            // Draw - leave winner as None
            update_status(escrow, escrow_address, STATUS_COMPLETED);
        } else if (resolution == 1) {
            // Player 1 wins
            escrow.winner = option::some(escrow.player1.address);
            update_status(escrow, escrow_address, STATUS_COMPLETED);
            
            // Emit winner event
            event::emit_event(&mut escrow.winner_declared_events, WinnerDeclaredEvent {
                escrow_address,
                winner: escrow.player1.address,
                timestamp: timestamp::now_seconds(),
            });
        } else if (resolution == 2) {
            // Player 2 wins
            escrow.winner = option::some(escrow.player2.address);
            update_status(escrow, escrow_address, STATUS_COMPLETED);
            
            // Emit winner event
            event::emit_event(&mut escrow.winner_declared_events, WinnerDeclaredEvent {
                escrow_address,
                winner: escrow.player2.address,
                timestamp: timestamp::now_seconds(),
            });
        } else if (resolution == 3) {
            // Cancel game
            update_status(escrow, escrow_address, STATUS_CANCELLED);
        } else {
            // Invalid resolution code
            abort error::invalid_argument(EINVALID_STATE)
        };
        
        // Resolution notes are not stored, just used in the event emission
        // Could add a field to store them if needed
    }
    
    /// Check if a game has timed out (anyone can call)
    public entry fun check_timeout(
        account: &signer,
        escrow_address: address
    ) acquires GameEscrow {
        let escrow = borrow_global_mut<GameEscrow>(escrow_address);
        
        // Can only timeout PLAYING games
        assert!(escrow.status == STATUS_PLAYING, error::invalid_state(EINVALID_STATE));
        
        // Game must have started
        assert!(option::is_some(&escrow.game_start_time), error::invalid_state(EGAME_NOT_STARTED));
        
        let start_time = *option::borrow(&escrow.game_start_time);
        let current_time = timestamp::now_seconds();
        
        // Check if game has timed out
        if ((current_time - start_time) > escrow.game_timeout_seconds) {
            // Game has timed out
            update_status(escrow, escrow_address, STATUS_TIMED_OUT);
            
            // Emit timeout event
            event::emit_event(&mut escrow.timeout_events, TimeoutEvent {
                escrow_address,
                timestamp: current_time,
            });
        };
        // If not timed out, nothing happens
    }
    
    /// Cancel a game (only in PENDING state)
    public entry fun cancel_escrow(
        account: &signer,
        escrow_address: address
    ) acquires GameEscrow {
        let sender = signer::address_of(account);
        let escrow = borrow_global_mut<GameEscrow>(escrow_address);
        
        // Only escrow creator, arbiter, or players can cancel
        assert!(
            sender == escrow_address || 
            sender == escrow.arbiter || 
            sender == escrow.player1.address || 
            sender == escrow.player2.address,
            error::permission_denied(ENOT_AUTHORIZED)
        );
        
        // Can only cancel if not already completed or already cancelled
        assert!(
            escrow.status != STATUS_COMPLETED && escrow.status != STATUS_CANCELLED,
            error::invalid_state(EINVALID_STATE)
        );
        
        // If game is in progress (PLAYING), only arbiter can cancel
        if (escrow.status == STATUS_PLAYING && sender != escrow.arbiter) {
            abort error::permission_denied(ENOT_AUTHORIZED)
        };
        
        // Update status
        update_status(escrow, escrow_address, STATUS_CANCELLED);
    }
    
    /// Refund deposits after cancellation
    public entry fun refund_after_cancellation(
        account: &signer,
        escrow_address: address
    ) acquires GameEscrow {
        let sender = signer::address_of(account);
        let escrow = borrow_global_mut<GameEscrow>(escrow_address);
        
        // Only escrow creator or arbiter can process refunds
        assert!(
            sender == escrow_address || sender == escrow.arbiter,
            error::permission_denied(ENOT_AUTHORIZED)
        );
        
        // Must be in CANCELLED state
        assert!(escrow.status == STATUS_CANCELLED, error::invalid_state(EINVALID_STATE));
        
        // Return deposits to players
        if (escrow.player1.has_deposited) {
            let refund = coin::extract(&mut escrow.escrow_balance, escrow.player1.deposit_amount);
            coin::deposit(escrow.player1.address, refund);
        };
        
        if (escrow.player2.has_deposited) {
            let refund = coin::extract(&mut escrow.escrow_balance, escrow.player2.deposit_amount);
            coin::deposit(escrow.player2.address, refund);
        };
    }
    
    /// Helper function to update status and emit event
    fun update_status(escrow: &mut GameEscrow, escrow_address: address, new_status: u8) {
        let old_status = escrow.status;
        escrow.status = new_status;
        
        // Emit status change event
        event::emit_event(&mut escrow.status_change_events, StatusChangeEvent {
            escrow_address,
            old_status,
            new_status,
            timestamp: timestamp::now_seconds(),
        });
    }
    
    // View functions
    
    #[view]
    public fun get_escrow_status(escrow_address: address): u8 acquires GameEscrow {
        let escrow = borrow_global<GameEscrow>(escrow_address);
        escrow.status
    }
    
    #[view]
    public fun get_winner(escrow_address: address): Option<address> acquires GameEscrow {
        let escrow = borrow_global<GameEscrow>(escrow_address);
        escrow.winner
    }
    
    #[view]
    public fun get_escrow_balance(escrow_address: address): u64 acquires GameEscrow {
        let escrow = borrow_global<GameEscrow>(escrow_address);
        coin::value(&escrow.escrow_balance)
    }
    
    #[view]
    public fun are_both_deposits_complete(escrow_address: address): bool acquires GameEscrow {
        let escrow = borrow_global<GameEscrow>(escrow_address);
        escrow.player1.has_deposited && escrow.player2.has_deposited
    }
    
    #[view]
    public fun get_minimum_bet(escrow_address: address): u64 acquires GameEscrow {
        let escrow = borrow_global<GameEscrow>(escrow_address);
        escrow.minimum_bet
    }
    
    #[view]
    public fun get_player_info(
        escrow_address: address,
        player_address: address
    ): (bool, u64, bool) acquires GameEscrow {
        let escrow = borrow_global<GameEscrow>(escrow_address);
        
        if (player_address == escrow.player1.address) {
            (
                escrow.player1.has_deposited,
                escrow.player1.deposit_amount,
                escrow.player1.signed_game_start
            )
        } else if (player_address == escrow.player2.address) {
            (
                escrow.player2.has_deposited,
                escrow.player2.deposit_amount,
                escrow.player2.signed_game_start
            )
        } else {
            abort error::invalid_argument(ENOT_A_PLAYER)
        }
    }
    
    #[view]
    public fun get_total_escrowed_amount(escrow_address: address): u64 acquires GameEscrow {
        let escrow = borrow_global<GameEscrow>(escrow_address);
        
        if (!escrow.player1.has_deposited || !escrow.player2.has_deposited) {
            return 0
        };
        
        let min_bet = if (escrow.player1.deposit_amount < escrow.player2.deposit_amount) {
            escrow.player1.deposit_amount
        } else {
            escrow.player2.deposit_amount
        };
        
        min_bet * 2
    }
    
    #[view]
    public fun get_game_time_remaining(escrow_address: address): Option<u64> acquires GameEscrow {
        let escrow = borrow_global<GameEscrow>(escrow_address);
        
        if (escrow.status != STATUS_PLAYING || option::is_none(&escrow.game_start_time)) {
            return option::none()
        };
        
        let start_time = *option::borrow(&escrow.game_start_time);
        let current_time = timestamp::now_seconds();
        let elapsed = current_time - start_time;
        
        if (elapsed >= escrow.game_timeout_seconds) {
            option::some(0)
        } else {
            option::some(escrow.game_timeout_seconds - elapsed)
        }
    }
} 