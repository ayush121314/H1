// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title ChessBetting
 * @dev Smart contract for managing chess game bets
 * This contract is part of a Chess GameFi application with AI-facilitated betting
 */
contract ChessBetting {
    // Events
    event GameCreated(string gameId, address player1, address player2);
    event BetPlaced(string gameId, address player, uint256 amount);
    event GameStarted(string gameId, uint256 poolAmount);
    event GameCompleted(string gameId, address winner, uint256 payout);
    event GameDrawn(string gameId);
    
    // Structs
    struct Game {
        string gameId;
        address player1;
        address player2;
        uint256 player1Bet;
        uint256 player2Bet;
        uint256 poolAmount;
        GameStatus status;
        address winner;
        uint256 gameStartTime;
        uint256 gameEndTime;
    }
    
    // Enums
    enum GameStatus {
        Created,
        BetsPlaced,
        InProgress,
        Completed,
        Cancelled
    }
    
    // State variables
    mapping(string => Game) public games;
    mapping(address => uint256) public pendingWithdrawals;
    address public aiAgentAddress;
    address public owner;
    uint256 public platformFee = 1; // 1% fee
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAIAgent() {
        require(msg.sender == aiAgentAddress, "Only AI agent can call this function");
        _;
    }
    
    /**
     * @dev Constructor
     */
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Set the AI agent address
     * @param _aiAgentAddress The address of the AI agent
     */
    function setAIAgent(address _aiAgentAddress) external onlyOwner {
        aiAgentAddress = _aiAgentAddress;
    }
    
    /**
     * @dev Create a new game
     * @param gameId Unique identifier for the game
     * @param player1 Address of player 1
     * @param player2 Address of player 2
     */
    function createGame(string calldata gameId, address player1, address player2) external onlyAIAgent {
        require(games[gameId].player1 == address(0), "Game already exists");
        
        games[gameId] = Game({
            gameId: gameId,
            player1: player1,
            player2: player2,
            player1Bet: 0,
            player2Bet: 0,
            poolAmount: 0,
            status: GameStatus.Created,
            winner: address(0),
            gameStartTime: 0,
            gameEndTime: 0
        });
        
        emit GameCreated(gameId, player1, player2);
    }
    
    /**
     * @dev Place a bet for a game
     * @param gameId The game ID
     */
    function placeBet(string calldata gameId) external payable {
        Game storage game = games[gameId];
        
        require(game.player1 != address(0), "Game does not exist");
        require(game.status == GameStatus.Created, "Game is not in created state");
        require(msg.value > 0, "Bet amount must be greater than 0");
        require(
            msg.sender == game.player1 || msg.sender == game.player2,
            "Only registered players can bet"
        );
        
        if (msg.sender == game.player1) {
            require(game.player1Bet == 0, "Player 1 already placed a bet");
            game.player1Bet = msg.value;
        } else {
            require(game.player2Bet == 0, "Player 2 already placed a bet");
            game.player2Bet = msg.value;
        }
        
        emit BetPlaced(gameId, msg.sender, msg.value);
        
        // If both players have placed their bets, update game status
        if (game.player1Bet > 0 && game.player2Bet > 0) {
            // Calculate the pool amount (lower of the two bets)
            uint256 lowerBet = game.player1Bet < game.player2Bet ? game.player1Bet : game.player2Bet;
            
            // Refund excess bet amounts
            if (game.player1Bet > lowerBet) {
                uint256 refund = game.player1Bet - lowerBet;
                game.player1Bet = lowerBet;
                pendingWithdrawals[game.player1] += refund;
            }
            
            if (game.player2Bet > lowerBet) {
                uint256 refund = game.player2Bet - lowerBet;
                game.player2Bet = lowerBet;
                pendingWithdrawals[game.player2] += refund;
            }
            
            game.poolAmount = lowerBet * 2;
            game.status = GameStatus.BetsPlaced;
        }
    }
    
    /**
     * @dev Start the game
     * @param gameId The game ID
     */
    function startGame(string calldata gameId) external onlyAIAgent {
        Game storage game = games[gameId];
        
        require(game.status == GameStatus.BetsPlaced, "Bets not placed yet");
        
        game.status = GameStatus.InProgress;
        game.gameStartTime = block.timestamp;
        
        emit GameStarted(gameId, game.poolAmount);
    }
    
    /**
     * @dev Complete the game and distribute winnings
     * @param gameId The game ID
     * @param winner The winner's address
     */
    function completeGame(string calldata gameId, address winner) external onlyAIAgent {
        Game storage game = games[gameId];
        
        require(game.status == GameStatus.InProgress, "Game not in progress");
        require(
            winner == game.player1 || winner == game.player2 || winner == address(0),
            "Invalid winner address"
        );
        
        game.gameEndTime = block.timestamp;
        
        if (winner == address(0)) {
            // Draw - return bets to players
            pendingWithdrawals[game.player1] += game.player1Bet;
            pendingWithdrawals[game.player2] += game.player2Bet;
            game.status = GameStatus.Completed;
            emit GameDrawn(gameId);
        } else {
            // Winner takes all (minus platform fee)
            game.winner = winner;
            uint256 platformFeeAmount = (game.poolAmount * platformFee) / 100;
            uint256 winnerPayout = game.poolAmount - platformFeeAmount;
            
            pendingWithdrawals[winner] += winnerPayout;
            pendingWithdrawals[owner] += platformFeeAmount;
            
            game.status = GameStatus.Completed;
            emit GameCompleted(gameId, winner, winnerPayout);
        }
    }
    
    /**
     * @dev Withdraw pending funds
     */
    function withdraw() external {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No funds to withdraw");
        
        pendingWithdrawals[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Cancel a game and refund bets
     * @param gameId The game ID
     */
    function cancelGame(string calldata gameId) external onlyAIAgent {
        Game storage game = games[gameId];
        
        require(
            game.status == GameStatus.Created || game.status == GameStatus.BetsPlaced,
            "Game cannot be cancelled"
        );
        
        if (game.player1Bet > 0) {
            pendingWithdrawals[game.player1] += game.player1Bet;
        }
        
        if (game.player2Bet > 0) {
            pendingWithdrawals[game.player2] += game.player2Bet;
        }
        
        game.status = GameStatus.Cancelled;
    }
    
    /**
     * @dev Update platform fee percentage
     * @param _platformFee New platform fee percentage
     */
    function updatePlatformFee(uint256 _platformFee) external onlyOwner {
        require(_platformFee <= 5, "Fee cannot exceed 5%");
        platformFee = _platformFee;
    }
}