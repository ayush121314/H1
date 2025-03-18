module chess_escrow::escrow {
    use std::error;
    use std::signer;
    use std::string;
    use aptos_framework::account;
    use aptos_framework::coin;
    use aptos_framework::timestamp;
    use aptos_std::table::{Self, Table};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::event::{Self, EventHandle};

    // Status Constants
    const STATUS_PENDING: u8 = 0;
    const STATUS_FUNDED: u8 = 1;
    const STATUS_PLAYING: u8 = 2;
    const STATUS_COMPLETED: u8 = 3;
    const STATUS_DISPUTED: u8 = 4;
    const STATUS_CANCELLED: u8 = 5;

    // Error codes
    const ENOT_INITIALIZED: u64 = 1;
    const EINVALID_PLAYER: u64 = 2;
    const EINVALID_AMOUNT: u64 = 3;
    const EINVALID_STATE: u64 = 4;
    const EPLAYER_ALREADY_SIGNED: u64 = 5;
    const EINVALID_ESCROW: u64 = 6;
    const EINSUFFICIENT_BALANCE: u64 = 7;
    const EPLAYER_NOT_SIGNED: u64 = 8;
    const ETIMEOUT_NOT_REACHED: u64 = 9;
    const ENOT_ARBITER: u64 = 10;

    // Player info structure
    struct PlayerInfo has store, drop, copy {
        addr: address,
        deposited: bool,
        signed: bool,
        amount: u64,
    }

    // Game escrow structure
    struct GameEscrow has store {
        player1: PlayerInfo,
        player2: PlayerInfo,
        arbiter: address,
        status: u8,
        min_bet: u64,
        timeout: u64,
        start_time: u64,
        winner: address,
    }

    // Registry to track all escrows
    struct EscrowRegistry has key {
        escrows: Table<address, GameEscrow>,
        status_change_events: EventHandle<StatusChangeEvent>,
        winner_events: EventHandle<WinnerDeclaredEvent>,
        timeout_events: EventHandle<TimeoutEvent>,
        dispute_events: EventHandle<DisputeEvent>,
    }

    // Event definitions
    struct StatusChangeEvent has drop, store {
        escrow_address: address,
        new_status: u8,
    }

    struct WinnerDeclaredEvent has drop, store {
        escrow_address: address,
        winner: address,
        amount: u64,
    }

    struct TimeoutEvent has drop, store {
        escrow_address: address,
        timeout_time: u64,
    }

    struct DisputeEvent has drop, store {
        escrow_address: address,
        raised_by: address,
        resolution: u8,
    }

    // Initialize the registry
    public entry fun initialize_registry(account: &signer) {
        let account_addr = signer::address_of(account);
        
        if (!exists<EscrowRegistry>(account_addr)) {
            move_to(account, EscrowRegistry {
                escrows: table::new(),
                status_change_events: account::new_event_handle<StatusChangeEvent>(account),
                winner_events: account::new_event_handle<WinnerDeclaredEvent>(account),
                timeout_events: account::new_event_handle<TimeoutEvent>(account),
                dispute_events: account::new_event_handle<DisputeEvent>(account),
            });
        };
    }

    // Create a new escrow
    public entry fun create_escrow(
        creator: &signer,
        player2_addr: address,
        min_bet: u64,
        arbiter_addr: address,
        timeout_seconds: u64
    ) acquires EscrowRegistry {
        let creator_addr = signer::address_of(creator);
        
        // Initialize registry if not already done
        if (!exists<EscrowRegistry>(creator_addr)) {
            initialize_registry(creator);
        };
        
        let registry = borrow_global_mut<EscrowRegistry>(creator_addr);
        
        // Create the escrow
        let escrow = GameEscrow {
            player1: PlayerInfo { addr: creator_addr, deposited: false, signed: false, amount: 0 },
            player2: PlayerInfo { addr: player2_addr, deposited: false, signed: false, amount: 0 },
            arbiter: arbiter_addr,
            status: STATUS_PENDING,
            min_bet: min_bet,
            timeout: timeout_seconds,
            start_time: 0,
            winner: @0x0,
        };
        
        // Add to registry
        table::add(&mut registry.escrows, creator_addr, escrow);
        
        // Emit status change event
        event::emit_event(&mut registry.status_change_events, StatusChangeEvent {
            escrow_address: creator_addr,
            new_status: STATUS_PENDING,
        });
    }

    // Deposit funds to escrow
    public entry fun deposit(
        player: &signer,
        escrow_addr: address,
        amount: u64
    ) acquires EscrowRegistry {
        let player_addr = signer::address_of(player);
        
        // Verify registry exists
        assert!(exists<EscrowRegistry>(escrow_addr), error::not_found(ENOT_INITIALIZED));
        
        let registry = borrow_global_mut<EscrowRegistry>(escrow_addr);
        
        // Verify escrow exists
        assert!(table::contains(&registry.escrows, escrow_addr), error::not_found(EINVALID_ESCROW));
        
        let escrow = table::borrow_mut(&mut registry.escrows, escrow_addr);
        
        // Verify correct state
        assert!(escrow.status == STATUS_PENDING, error::invalid_state(EINVALID_STATE));
        
        // Verify valid amount
        assert!(amount >= escrow.min_bet, error::invalid_argument(EINVALID_AMOUNT));
        
        // Determine which player is depositing
        if (player_addr == escrow.player1.addr) {
            assert!(!escrow.player1.deposited, error::already_exists(EINVALID_STATE));
            escrow.player1.deposited = true;
            escrow.player1.amount = amount;
        } else if (player_addr == escrow.player2.addr) {
            assert!(!escrow.player2.deposited, error::already_exists(EINVALID_STATE));
            escrow.player2.deposited = true;
            escrow.player2.amount = amount;
        } else {
            abort error::permission_denied(EINVALID_PLAYER)
        };
        
        // Transfer the coins to the escrow
        coin::transfer<AptosCoin>(player, escrow_addr, amount);
        
        // Update status if both players have deposited
        if (escrow.player1.deposited && escrow.player2.deposited) {
            escrow.status = STATUS_FUNDED;
            
            // Emit status change event
            event::emit_event(&mut registry.status_change_events, StatusChangeEvent {
                escrow_address: escrow_addr,
                new_status: STATUS_FUNDED,
            });
        };
    }

    // Sign to start the game
    public entry fun sign_to_start(
        player: &signer,
        escrow_addr: address
    ) acquires EscrowRegistry {
        let player_addr = signer::address_of(player);
        
        // Verify registry exists
        assert!(exists<EscrowRegistry>(escrow_addr), error::not_found(ENOT_INITIALIZED));
        
        let registry = borrow_global_mut<EscrowRegistry>(escrow_addr);
        
        // Verify escrow exists
        assert!(table::contains(&registry.escrows, escrow_addr), error::not_found(EINVALID_ESCROW));
        
        let escrow = table::borrow_mut(&mut registry.escrows, escrow_addr);
        
        // Verify correct state
        assert!(escrow.status == STATUS_FUNDED, error::invalid_state(EINVALID_STATE));
        
        // Determine which player is signing
        if (player_addr == escrow.player1.addr) {
            assert!(!escrow.player1.signed, error::already_exists(EPLAYER_ALREADY_SIGNED));
            escrow.player1.signed = true;
        } else if (player_addr == escrow.player2.addr) {
            assert!(!escrow.player2.signed, error::already_exists(EPLAYER_ALREADY_SIGNED));
            escrow.player2.signed = true;
        } else {
            abort error::permission_denied(EINVALID_PLAYER)
        };
        
        // Update status if both players have signed
        if (escrow.player1.signed && escrow.player2.signed) {
            escrow.status = STATUS_PLAYING;
            escrow.start_time = timestamp::now_seconds();
            
            // Emit status change event
            event::emit_event(&mut registry.status_change_events, StatusChangeEvent {
                escrow_address: escrow_addr,
                new_status: STATUS_PLAYING,
            });
        };
    }

    // Complete game - declare winner
    public entry fun complete_game(
        caller: &signer,
        escrow_addr: address,
        winner_addr: address
    ) acquires EscrowRegistry {
        let caller_addr = signer::address_of(caller);
        
        // Verify registry exists
        assert!(exists<EscrowRegistry>(escrow_addr), error::not_found(ENOT_INITIALIZED));
        
        let registry = borrow_global_mut<EscrowRegistry>(escrow_addr);
        
        // Verify escrow exists
        assert!(table::contains(&registry.escrows, escrow_addr), error::not_found(EINVALID_ESCROW));
        
        let escrow = table::borrow_mut(&mut registry.escrows, escrow_addr);
        
        // Verify correct state
        assert!(escrow.status == STATUS_PLAYING, error::invalid_state(EINVALID_STATE));
        
        // Verify caller is player1, player2, or arbiter
        assert!(
            caller_addr == escrow.player1.addr || 
            caller_addr == escrow.player2.addr || 
            caller_addr == escrow.arbiter,
            error::permission_denied(EINVALID_PLAYER)
        );
        
        // Verify winner is either player1 or player2
        assert!(
            winner_addr == escrow.player1.addr || 
            winner_addr == escrow.player2.addr,
            error::invalid_argument(EINVALID_PLAYER)
        );
        
        // Set winner and update status
        escrow.winner = winner_addr;
        escrow.status = STATUS_COMPLETED;
        
        // Emit events
        event::emit_event(&mut registry.status_change_events, StatusChangeEvent {
            escrow_address: escrow_addr,
            new_status: STATUS_COMPLETED,
        });
        
        let total_amount = escrow.player1.amount + escrow.player2.amount;
        event::emit_event(&mut registry.winner_events, WinnerDeclaredEvent {
            escrow_address: escrow_addr,
            winner: winner_addr,
            amount: total_amount,
        });
    }

    // Release funds to winner
    public entry fun release_funds(
        caller: &signer,
        escrow_addr: address
    ) acquires EscrowRegistry {
        let caller_addr = signer::address_of(caller);
        
        // Verify registry exists
        assert!(exists<EscrowRegistry>(escrow_addr), error::not_found(ENOT_INITIALIZED));
        
        let registry = borrow_global_mut<EscrowRegistry>(escrow_addr);
        
        // Verify escrow exists
        assert!(table::contains(&registry.escrows, escrow_addr), error::not_found(EINVALID_ESCROW));
        
        let escrow = table::borrow_mut(&mut registry.escrows, escrow_addr);
        
        // Verify correct state
        assert!(escrow.status == STATUS_COMPLETED, error::invalid_state(EINVALID_STATE));
        
        // Verify caller is player1, player2, or arbiter
        assert!(
            caller_addr == escrow.player1.addr || 
            caller_addr == escrow.player2.addr || 
            caller_addr == escrow.arbiter,
            error::permission_denied(EINVALID_PLAYER)
        );
        
        // Calculate total amount
        let total_amount = escrow.player1.amount + escrow.player2.amount;
        
        // Transfer funds to winner
        if (coin::balance<AptosCoin>(escrow_addr) >= total_amount) {
            coin::transfer<AptosCoin>(caller, escrow.winner, total_amount);
        } else {
            abort error::resource_exhausted(EINSUFFICIENT_BALANCE)
        };
    }

    // View functions
    #[view]
    public fun get_escrow_status(escrow_addr: address): u8 acquires EscrowRegistry {
        if (!exists<EscrowRegistry>(escrow_addr)) {
            return STATUS_PENDING
        };
        
        let registry = borrow_global<EscrowRegistry>(escrow_addr);
        
        if (!table::contains(&registry.escrows, escrow_addr)) {
            return STATUS_PENDING
        };
        
        let escrow = table::borrow(&registry.escrows, escrow_addr);
        escrow.status
    }

    #[view]
    public fun get_escrow_winner(escrow_addr: address): address acquires EscrowRegistry {
        if (!exists<EscrowRegistry>(escrow_addr)) {
            return @0x0
        };
        
        let registry = borrow_global<EscrowRegistry>(escrow_addr);
        
        if (!table::contains(&registry.escrows, escrow_addr)) {
            return @0x0
        };
        
        let escrow = table::borrow(&registry.escrows, escrow_addr);
        escrow.winner
    }

    #[view]
    public fun get_escrow_balance(escrow_addr: address): u64 {
        coin::balance<AptosCoin>(escrow_addr)
    }
} 