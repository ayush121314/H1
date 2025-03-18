import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import GameDashboard from '../components/GameDashboard';
import BettingInterface from '../components/BettingInterface';
import AIAgentPanel from '../components/AIAgentPanel';
import LoadingComponent from '../components/LoadingComponent';

// Define the game state type to fix type errors
type GameState = 'waiting' | 'betting' | 'playing' | 'completed';

export default function Home({ provider }: any) {
  const [game, setGame] = useState<any>(new Chess());
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Player wallets and bets
  const [player1Wallet, setPlayer1Wallet] = useState<any>(null);
  const [player2Wallet, setPlayer2Wallet] = useState<any>(null);
  const [player1Bet, setPlayer1Bet] = useState<number>(0);
  const [player2Bet, setPlayer2Bet] = useState<number>(0);
  const [finalBetAmount, setFinalBetAmount] = useState<number>(0);
  
  const [aiEnabled, setAiEnabled] = useState(true);
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white');
  const [activePlayerWallet, setActivePlayerWallet] = useState<1 | 2>(1); // Which player is connecting wallet

  // Connect wallet for specific player
  const connectPlayerWallet = async (playerNumber: 1 | 2) => {
    if (!provider) {
      setError("No provider available. Please install MetaMask.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      setActivePlayerWallet(playerNumber);
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      const signer = await provider.getSigner();
      
      const walletInfo = {
        address: accounts[0],
        signer
      };
      
      if (playerNumber === 1) {
        setPlayer1Wallet(walletInfo);
      } else {
        setPlayer2Wallet(walletInfo);
      }
    } catch (error: any) {
      console.error(`Error connecting player ${playerNumber} wallet:`, error);
      setError(error.message || `Error connecting wallet for Player ${playerNumber}`);
    } finally {
      setIsLoading(false);
    }
  };

  function makeAMove(move: any) {
    const gameCopy = new Chess(game.fen());
    
    try {
      const result = gameCopy.move(move);
      setGame(gameCopy);
      
      // Switch turns
      setCurrentPlayer(gameCopy.turn() === 'w' ? 'white' : 'black');
      
      return result;
    } catch (error) {
      return null;
    }
  }

  function onDrop(sourceSquare: string, targetSquare: string) {
    // Only allow moves if the game is active
    if (gameState !== 'playing') return false;
    
    // Enforce turn-based gameplay
    const currentTurn = game.turn() === 'w' ? 'white' : 'black';
    
    // Player 1 is white, Player 2 is black
    const isCorrectPlayerTurn = 
      (currentTurn === 'white' && player1Wallet) || 
      (currentTurn === 'black' && player2Wallet);
    
    if (!isCorrectPlayerTurn) {
      console.log(`Not your turn. Current turn: ${currentTurn}`);
      return false;
    }
    
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // Default promotion to queen
    });

    // If the move is illegal, return false
    if (move === null) return false;

    // Check for game over conditions
    if (game.isGameOver()) {
      handleGameEnd();
    }

    return true;
  }

  function handleGameEnd() {
    setGameState('completed');
    
    // AI agent facilitates the payout
    if (aiEnabled) {
      // Determine the winner and distribute the bet
      let winner;
      
      if (game.isDraw()) {
        winner = 'draw';
      } else {
        // White wins if it's not black's turn (checkmate)
        winner = game.turn() === 'b' ? 'white' : 'black';
      }
      
      console.log(`Game ended. Winner: ${winner}`);
      
      // In a real implementation, this would trigger a smart contract call
      // to distribute the pooled bet amount to the winner
    }
  }

  function startNewGame() {
    setGame(new Chess());
    setGameState('waiting');
    setPlayer1Bet(0);
    setPlayer2Bet(0);
    setFinalBetAmount(0);
    setCurrentPlayer('white');
  }

  function placePlayerBet(playerNumber: 1 | 2, amount: number) {
    if (playerNumber === 1) {
      setPlayer1Bet(amount);
    } else {
      setPlayer2Bet(amount);
    }
    
    // Check if both players have placed bets
    if (playerNumber === 1 && player2Bet > 0) {
      startGameWithBets(amount, player2Bet);
    } else if (playerNumber === 2 && player1Bet > 0) {
      startGameWithBets(player1Bet, amount);
    } else {
      // Only one player has bet so far
      setGameState('betting');
    }
  }
  
  function startGameWithBets(bet1: number, bet2: number) {
    // AI agent determines the lower bet amount
    const lowerBet = Math.min(bet1, bet2);
    setFinalBetAmount(lowerBet * 2);
    
    console.log(`Both players have placed bets. Pool amount: ${lowerBet * 2} ETH`);
    
    // Start the game
    setGameState('playing');
  }

  // Check if both wallets are connected
  const bothWalletsConnected = player1Wallet && player2Wallet;
  
  // Check if it's the betting phase and which player needs to bet
  const needsPlayer1Bet = gameState === 'betting' && player1Bet === 0 && player2Bet > 0;
  const needsPlayer2Bet = gameState === 'betting' && player2Bet === 0 && player1Bet > 0;

  // Add a new function to handle game forfeits
  function forfeitGame(playerNumber: 1 | 2) {
    if (gameState !== 'playing') {
      console.log("Can only forfeit during an active game");
      return;
    }
    
    setGameState('completed');
    
    // Determine the winner (opposite of the player who forfeited)
    const winner = playerNumber === 1 ? 'black' : 'white';
    console.log(`Player ${playerNumber} forfeited. ${winner === 'white' ? 'Player 1' : 'Player 2'} wins!`);
    
    // AI agent facilitates the payout to the winner
    if (aiEnabled && finalBetAmount > 0) {
      // In a real implementation, this would trigger a smart contract call
      // to distribute the pooled bet amount to the winner
      console.log(`Distributing ${finalBetAmount.toFixed(4)} ETH to ${winner === 'white' ? 'Player 1' : 'Player 2'}`);
    }
  }

  // Early return for error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Chess GameFi - Same Device</title>
        <meta name="description" content="Chess GameFi with AI Agent P2P Betting - Same Device" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-secondary mb-2">Chess GameFi</h1>
        <p className="text-lg text-gray-600">Same Device Chess with AI-Facilitated Betting</p>
      </header>

      {isLoading ? (
        <LoadingComponent message="Connecting wallet..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="chess-board">
              <Chessboard 
                position={game.fen()} 
                onPieceDrop={onDrop} 
                boardOrientation={'white'} // Always show white's perspective
              />
            </div>
            
            <GameDashboard 
              gameState={gameState}
              startNewGame={startNewGame}
              game={game}
              currentTurn={currentPlayer}
              player1Wallet={player1Wallet}
              player2Wallet={player2Wallet}
            />
            
            {/* Quit Game Options - Only show during active game */}
            {gameState === 'playing' && (
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-bold mb-2">Player 1 (White)</h3>
                  <button 
                    onClick={() => forfeitGame(1)}
                    className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Forfeit Game
                  </button>
                  <p className="mt-2 text-xs text-gray-500">
                    Forfeiting will award the win to Player 2
                    {finalBetAmount > 0 && ` and transfer the bet of ${finalBetAmount.toFixed(4)} ETH`}
                  </p>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-bold mb-2">Player 2 (Black)</h3>
                  <button 
                    onClick={() => forfeitGame(2)}
                    className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Forfeit Game
                  </button>
                  <p className="mt-2 text-xs text-gray-500">
                    Forfeiting will award the win to Player 1
                    {finalBetAmount > 0 && ` and transfer the bet of ${finalBetAmount.toFixed(4)} ETH`}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1">
            {/* Player 1 Wallet Connection */}
            <div className="betting-card mb-6">
              <h2 className="text-xl font-bold mb-2">Player 1 (White)</h2>
              {!player1Wallet ? (
                <div>
                  <p className="mb-4">Connect Player 1's wallet to place bets and play</p>
                  <button 
                    onClick={() => connectPlayerWallet(1)}
                    className="btn-primary w-full"
                  >
                    Connect Player 1 Wallet
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-sm truncate">
                    {player1Wallet.address.slice(0, 6)}...{player1Wallet.address.slice(-4)}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Connected</span>
                </div>
              )}
            </div>
            
            {/* Player 2 Wallet Connection */}
            <div className="betting-card mb-6">
              <h2 className="text-xl font-bold mb-2">Player 2 (Black)</h2>
              {!player2Wallet ? (
                <div>
                  <p className="mb-4">Connect Player 2's wallet to place bets and play</p>
                  <button 
                    onClick={() => connectPlayerWallet(2)}
                    className="btn-primary w-full"
                    disabled={!player1Wallet} // Require Player 1 to connect first
                  >
                    Connect Player 2 Wallet
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-sm truncate">
                    {player2Wallet.address.slice(0, 6)}...{player2Wallet.address.slice(-4)}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Connected</span>
                </div>
              )}
            </div>
            
            {/* Betting Interface */}
            {bothWalletsConnected && (gameState === 'waiting' || gameState === 'betting') && (
              <div className="betting-card mb-6">
                <h2 className="text-2xl font-bold mb-4">Betting</h2>
                
                {needsPlayer1Bet ? (
                  <div className="p-3 bg-yellow-100 rounded-lg mb-4">
                    <p className="text-sm font-medium">Player 2 has bet {player2Bet.toFixed(4)} ETH</p>
                    <p className="text-sm">Player 1 needs to place their bet</p>
                  </div>
                ) : needsPlayer2Bet ? (
                  <div className="p-3 bg-yellow-100 rounded-lg mb-4">
                    <p className="text-sm font-medium">Player 1 has bet {player1Bet.toFixed(4)} ETH</p>
                    <p className="text-sm">Player 2 needs to place their bet</p>
                  </div>
                ) : null}
                
                <div className="grid grid-cols-2 gap-4">
                  <BettingInterface 
                    wallet={player1Wallet}
                    gameState={gameState}
                    betAmount={player1Bet}
                    opponentBet={player2Bet}
                    placeBet={(amount) => placePlayerBet(1, amount)}
                    disabled={player1Bet > 0}
                    playerName="Player 1"
                  />
                  
                  <BettingInterface 
                    wallet={player2Wallet}
                    gameState={gameState}
                    betAmount={player2Bet}
                    opponentBet={player1Bet}
                    placeBet={(amount) => placePlayerBet(2, amount)}
                    disabled={player2Bet > 0}
                    playerName="Player 2"
                  />
                </div>
                
                {gameState === 'betting' && (
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/30">
                    <p className="text-center text-sm font-medium">
                      Waiting for {needsPlayer1Bet ? 'Player 1' : 'Player 2'} to place their bet
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Game Status */}
            {gameState === 'playing' && (
              <div className="betting-card mb-6">
                <h2 className="text-2xl font-bold mb-4">Game in Progress</h2>
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/30 mb-4">
                  <div className="text-sm font-semibold text-center mb-1">Total Pool</div>
                  <div className="text-2xl font-bold text-center">
                    {finalBetAmount.toFixed(4)} ETH
                  </div>
                  <div className="text-xs text-center text-gray-600 mt-1">
                    (Based on the lower bet amount)
                  </div>
                </div>
                
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <p className="text-center font-medium">
                    Current Turn: {currentPlayer === 'white' ? 'Player 1 (White)' : 'Player 2 (Black)'}
                  </p>
                </div>
              </div>
            )}
            
            {/* Game Result */}
            {gameState === 'completed' && (
              <div className="betting-card mb-6">
                <h2 className="text-2xl font-bold mb-4">Game Completed</h2>
                
                <div className="p-4 bg-accent/20 rounded-lg border border-accent/30 mb-4">
                  <p className="text-center font-bold">
                    {game.isDraw() 
                      ? 'Game ended in a draw! Bets will be returned.'
                      : `${game.turn() === 'b' ? 'Player 1 (White)' : 'Player 2 (Black)'} wins!`}
                  </p>
                  <p className="text-sm text-center mt-2">
                    {game.isDraw() 
                      ? 'Each player receives their original bet back.'
                      : `Winner receives ${finalBetAmount.toFixed(4)} ETH`}
                  </p>
                </div>
                
                <button 
                  onClick={startNewGame}
                  className="btn-primary w-full"
                >
                  Start New Game
                </button>
              </div>
            )}
            
            <AIAgentPanel 
              aiEnabled={aiEnabled}
              setAiEnabled={setAiEnabled}
              gameState={gameState}
            />
          </div>
        </div>
      )}
    </div>
  );
} 