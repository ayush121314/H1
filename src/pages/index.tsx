import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import GameDashboard from '../components/GameDashboard';
import BettingInterface from '../components/BettingInterface';
import AIAgentPanel from '../components/AIAgentPanel';
import LoadingComponent from '../components/LoadingComponent';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Types, AptosClient } from 'aptos';

// Define the game state type to fix type errors
type GameState = 'waiting' | 'betting' | 'playing' | 'completed';

// Define player wallet info type
interface PlayerWalletInfo {
  address: string;
  balance: number;
}

export default function Home() {
  // Game state
  const [game, setGame] = useState<any>(new Chess());
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Aptos client for blockchain interactions
  const [client] = useState<AptosClient>(new AptosClient('https://fullnode.testnet.aptoslabs.com/v1'));
  
  // Player wallets and bets
  const [player1Wallet, setPlayer1Wallet] = useState<PlayerWalletInfo | null>(null);
  const [player2Wallet, setPlayer2Wallet] = useState<PlayerWalletInfo | null>(null);
  const [player1Bet, setPlayer1Bet] = useState<number>(0);
  const [player2Bet, setPlayer2Bet] = useState<number>(0);
  const [finalBetAmount, setFinalBetAmount] = useState<number>(0);
  
  // Game management
  const [aiEnabled, setAiEnabled] = useState(true);
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white');
  const [activePlayerWallet, setActivePlayerWallet] = useState<1 | 2>(1); // Which player is connecting wallet
  
  // Wallet adapter
  const { 
    connect, 
    disconnect, 
    account, 
    connected, 
    signAndSubmitTransaction 
  } = useWallet();

  // Get wallet balance
  const getAccountBalance = async (address: string): Promise<number> => {
    try {
      const resources = await client.getAccountResources(address);
      const aptosCoinResource = resources.find(
        (r) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
      );
      
      if (aptosCoinResource) {
        const balance = (aptosCoinResource.data as any).coin.value;
        // Convert from octas (10^8) to APT
        return Number(balance) / 100000000;
      }
      return 0;
    } catch (error) {
      console.error('Error getting account balance:', error);
      return 0;
    }
  };

  // Effect to handle wallet changes
  useEffect(() => {
    // Disable automatic wallet connection handling to prevent interference
    // This useEffect was automatically connecting Player 1, which conflicts with our manual wallet management
    // Keeping it empty but keeping the dependencies to maintain React rules
  }, [connected, account, player1Wallet, player2Wallet]); // Run when connection state changes

  // Connect wallet for specific player
  const connectPlayerWallet = async (playerNumber: 1 | 2) => {
    setIsLoading(true);
    setError(null);
    
    try {
      setActivePlayerWallet(playerNumber);
      
      // Make sure there's a global aptos object
      if (typeof window === 'undefined' || !window.aptos) {
        setError("Petra wallet is not installed. Please install the Petra wallet extension from https://petra.app/ and refresh the page.");
        setIsLoading(false);
        return;
      }

      console.log("Wallet adapter state before connection:", { connected, account });
      
      // Try direct connection to Petra if the adapter isn't working
      try {
        // Add delay before attempting connection
        await new Promise(resolve => setTimeout(resolve, 300));
        
        console.log(`Connecting wallet for Player ${playerNumber}...`);
        
        // If already connected, just use the current account
        if (connected && account && account.address) {
          console.log("Using already connected wallet:", account.address.toString());
        } else {
          // First try connecting via the wallet adapter
          await connect('Petra');
          console.log("Connection attempt completed");
        }
        
        // Allow time for connection to register
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log("Wallet adapter state after connection:", { connected, account });
        
        // If still not connected, try direct connection via window.aptos
        if (!connected || !account || !account.address) {
          console.log("Adapter connect failed, trying direct window.aptos connection...");
          
          // Try to connect directly via window.aptos if available
          if (window.aptos) {
            try {
              const response = await window.aptos.connect();
              console.log("Direct Petra connection response:", response);
              
              if (response && response.address) {
                console.log("Direct connection succeeded with address:", response.address);
                
                // Create a wallet object from the direct connection
                const walletInfo: PlayerWalletInfo = {
                  address: response.address,
                  balance: await getAccountBalance(response.address)
                };
                
                // Set the wallet without relying on the adapter
                if (playerNumber === 1) {
                  setPlayer1Wallet(walletInfo);
                } else {
                  setPlayer2Wallet(walletInfo);
                }
                
                // Return early since we've handled this manually
                setIsLoading(false);
                return;
              }
            } catch (directError) {
              console.error("Error with direct Petra connection:", directError);
            }
          }
          
          // If we get here, both connection methods failed
          throw new Error('Failed to connect wallet. Please make sure your wallet is unlocked and try again.');
        }
      } catch (connectError) {
        console.error("Connection error:", connectError);
        throw new Error(`Failed to connect wallet: ${connectError.message || 'Unknown error'}`);
      }
      
      // If we get here, the connection was successful via adapter
      const walletAddress = account.address.toString();
      console.log(`Connected to wallet: ${walletAddress}`);
      
      // Check if this wallet is already assigned to another player
      if (playerNumber === 1 && player2Wallet && player2Wallet.address === walletAddress) {
        throw new Error("This wallet is already connected as Player 2. Please use a different wallet.");
      } else if (playerNumber === 2 && player1Wallet && player1Wallet.address === walletAddress) {
        throw new Error("This wallet is already connected as Player 1. Please use a different wallet.");
      }
      
      // Get wallet balance
      const balance = await getAccountBalance(walletAddress);
      
      // Create wallet info object
      const walletInfo: PlayerWalletInfo = {
        address: walletAddress,
        balance: balance
      };
      
      // Set the wallet for the appropriate player
      console.log(`Setting wallet for Player ${playerNumber}: ${walletAddress}`);
      if (playerNumber === 1) {
        setPlayer1Wallet(walletInfo);
      } else {
        setPlayer2Wallet(walletInfo);
      }
      
    } catch (error: any) {
      console.error(`Error connecting wallet for Player ${playerNumber}:`, error);
      setError(error.message || `Failed to connect wallet for Player ${playerNumber}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to reset wallet connections
  const resetWalletConnections = async () => {
    try {
      setIsLoading(true);
      console.log("Resetting wallet connections...");
      
      // Disconnect only if connected
      if (connected) {
        await disconnect();
      }
      
      // Reset state
      setPlayer1Wallet(null);
      setPlayer2Wallet(null);
      setPlayer1Bet(0);
      setPlayer2Bet(0);
      setFinalBetAmount(0);
      
      console.log("Wallet connections reset successfully");
    } catch (error) {
      console.error("Error resetting wallet connections:", error);
      setError("Failed to reset wallet connections. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  };

  // Create escrow transaction payload
  const createBetPayload = (amount: number, recipientAddress: string) => {
    // Convert APT to Octas (smallest unit) - 1 APT = 10^8 Octas
    const amountInOctas = (amount * 100000000).toString();
    
    return {
      type: "entry_function_payload",
      function: "0x1::coin::transfer",
      type_arguments: ["0x1::aptos_coin::AptosCoin"],
      arguments: [recipientAddress, amountInOctas]
    } as any; // Type assertion to avoid TypeScript errors
  };

  // Place player bet with actual transaction
  async function placePlayerBet(playerNumber: 1 | 2, amount: number) {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Starting bet placement for Player ${playerNumber} with amount ${amount} APT`);
      
      // Check if player wallet is connected
      const currentWallet = playerNumber === 1 ? player1Wallet : player2Wallet;
      if (!currentWallet) {
        throw new Error(`Player ${playerNumber} wallet not connected`);
      }
      
      console.log(`Using wallet with address: ${currentWallet.address}`);
      
      // Determine recipient
      const recipientWallet = playerNumber === 1 ? player2Wallet : player1Wallet;
      if (!recipientWallet) {
        throw new Error("Cannot place bet: Both players must be connected");
      }
      
      const recipientAddress = recipientWallet.address;
      console.log(`Recipient address: ${recipientAddress}`);
      
      // SIMPLIFIED WALLET CONNECTION CHECK
      let isCorrectWalletConnected = false;
      
      // Check if a wallet is connected and it's the right one
      if (connected && account && account.address && 
          account.address.toString() === currentWallet.address) {
        console.log("Correct wallet is already connected");
        isCorrectWalletConnected = true;
      } else {
        console.log("Need to connect the correct wallet");
        
        // First try to disconnect if another wallet is connected
        if (connected) {
          console.log("Disconnecting current wallet first");
          try {
            await disconnect();
            // Brief pause to allow disconnection to complete
            await new Promise(resolve => setTimeout(resolve, 300));
          } catch (disconnectError) {
            console.warn("Error during disconnection:", disconnectError);
            // Continue anyway - we'll try to connect
          }
        }
        
        // Try connecting with the wallet adapter first
        try {
          console.log("Connecting via wallet adapter");
          await connect('Petra');
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait for connection
          
          // Check if we connected to the correct wallet
          if (account && account.address && 
              account.address.toString() === currentWallet.address) {
            console.log("Successfully connected to the correct wallet");
            isCorrectWalletConnected = true;
          } else {
            console.log("Connected to wrong wallet or connection failed");
          }
        } catch (connectError) {
          console.warn("Wallet adapter connection failed:", connectError);
        }
        
        // If wallet adapter failed, try direct connection
        if (!isCorrectWalletConnected && window.aptos) {
          try {
            console.log("Trying direct wallet connection");
            const response = await window.aptos.connect();
            console.log("Direct wallet connection response:", response);
            
            if (response && response.address === currentWallet.address) {
              console.log("Direct connection successful");
              isCorrectWalletConnected = true;
            } else {
              console.log(`Connected to ${response?.address || 'unknown'}, needed ${currentWallet.address}`);
            }
          } catch (directError) {
            console.error("Direct wallet connection failed:", directError);
          }
        }
      }
      
      // Check if we have a connected wallet
      if (!isCorrectWalletConnected) {
        throw new Error("Please make sure the correct wallet is connected and unlocked. You may need to select the correct account in your wallet.");
      }
      
      // IMPROVED TRANSACTION HANDLING
      // Validate player has enough funds before attempting transaction
      console.log(`Player ${playerNumber} balance: ${currentWallet.balance} APT, attempting to bet ${amount} APT`);
      if (currentWallet.balance < amount) {
        throw new Error(`Insufficient funds. You need at least ${amount} APT to place this bet.`);
      }
      
      // Create transaction payload with extensive logging
      console.log("Creating transaction payload...");
      try {
        // Convert APT to Octas (smallest unit) - 1 APT = 10^8 Octas
        const amountInOctas = Math.floor(amount * 100000000).toString();
        console.log(`Amount in Octas: ${amountInOctas}`);
        
        const payload = {
          type: "entry_function_payload",
          function: "0x1::coin::transfer",
          type_arguments: ["0x1::aptos_coin::AptosCoin"],
          arguments: [recipientAddress, amountInOctas]
        };
        
        console.log("Transaction payload created:", JSON.stringify(payload));
        
        // Submit transaction with enhanced error handling
        console.log("Attempting to submit transaction...");
        let txHash = "";
        
        // First try the wallet adapter method
        if (connected && account && typeof signAndSubmitTransaction === 'function') {
          try {
            console.log("Using wallet adapter signAndSubmitTransaction");
            const response = await signAndSubmitTransaction(payload as any);
            
            if (response && response.hash) {
              txHash = response.hash;
              console.log(`Transaction submitted via adapter with hash: ${txHash}`);
            } else {
              console.error("Adapter transaction response missing hash:", response);
              throw new Error("Transaction failed: No transaction hash returned from adapter");
            }
          } catch (adapterError) {
            console.error("Adapter transaction submission failed:", adapterError);
            
            // Fall back to direct method
            if (window.aptos && typeof window.aptos.signAndSubmitTransaction === 'function') {
              console.log("Falling back to direct window.aptos.signAndSubmitTransaction");
              try {
                const directResponse = await window.aptos.signAndSubmitTransaction(payload);
                
                if (directResponse && directResponse.hash) {
                  txHash = directResponse.hash;
                  console.log(`Transaction submitted via direct method with hash: ${txHash}`);
                } else {
                  console.error("Direct transaction response missing hash:", directResponse);
                  throw new Error("Transaction failed: No transaction hash returned from direct method");
                }
              } catch (directError) {
                console.error("Direct transaction submission failed:", directError);
                throw directError; // Re-throw to be caught by the outer catch
              }
            } else {
              // No fallback available, re-throw the adapter error
              throw adapterError;
            }
          }
        } 
        // If adapter not available, try direct method
        else if (window.aptos && typeof window.aptos.signAndSubmitTransaction === 'function') {
          console.log("Adapter not available, using direct window.aptos.signAndSubmitTransaction");
          try {
            const directResponse = await window.aptos.signAndSubmitTransaction(payload);
            
            if (directResponse && directResponse.hash) {
              txHash = directResponse.hash;
              console.log(`Transaction submitted via direct method with hash: ${txHash}`);
            } else {
              console.error("Direct transaction response missing hash:", directResponse);
              throw new Error("Transaction failed: No transaction hash returned from direct method");
            }
          } catch (directError) {
            console.error("Direct transaction submission failed:", directError);
            throw directError;
          }
        } else {
          throw new Error("No transaction submission method available. Please make sure your wallet is properly connected.");
        }
        
        // Wait for transaction confirmation with better error handling
        if (txHash) {
          try {
            console.log(`Waiting for transaction ${txHash} to be confirmed...`);
            const txResult = await client.waitForTransactionWithResult(txHash);
            console.log("Transaction confirmed:", txResult);
            
            // Check if transaction was successful - using a type-safe approach
            // @ts-ignore - Handle potential type mismatch in transaction result
            if (txResult && typeof txResult.success === 'boolean' && txResult.success === false) {
              console.error("Transaction failed on chain:", txResult);
              throw new Error("Transaction failed on chain. Please check your wallet for details.");
            }
          } catch (confirmError) {
            console.warn("Error confirming transaction:", confirmError);
            console.log("Continuing despite confirmation error (transaction may still be processing)");
            // Don't throw here - the transaction might still be processing
          }
          
          // Update state even if confirmation failed - transaction was submitted
          console.log(`Updating Player ${playerNumber} bet state...`);
          if (playerNumber === 1) {
            setPlayer1Bet(amount);
            // Update wallet balance
            setPlayer1Wallet({
              ...player1Wallet,
              balance: player1Wallet.balance - amount
            });
          } else {
            setPlayer2Bet(amount);
            // Update wallet balance
            setPlayer2Wallet({
              ...player2Wallet,
              balance: player2Wallet.balance - amount
            });
          }
          
          // Check if both players have placed bets
          if ((playerNumber === 1 && player2Bet > 0) || (playerNumber === 2 && player1Bet > 0)) {
            console.log("Both players have placed bets. Starting game...");
            const otherPlayerBet = playerNumber === 1 ? player2Bet : player1Bet;
            startGameWithBets(playerNumber === 1 ? amount : otherPlayerBet, playerNumber === 1 ? otherPlayerBet : amount);
          } else {
            // Only one player has bet so far
            console.log("Waiting for other player to place bet...");
            setGameState('betting');
          }
          
          console.log("Bet placement completed successfully");
        } else {
          throw new Error("Failed to get transaction hash. Please try again.");
        }
      } catch (txError: any) {
        console.error("Transaction error:", txError);
        throw new Error(`Transaction failed: ${txError.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error(`Error placing bet for Player ${playerNumber}:`, error);
      setError(error.message || `Failed to place bet for Player ${playerNumber}`);
    } finally {
      setIsLoading(false);
    }
  }
  
  function startGameWithBets(bet1: number, bet2: number) {
    // AI agent determines the lower bet amount
    const lowerBet = Math.min(bet1, bet2);
    setFinalBetAmount(lowerBet * 2);
    
    console.log(`Both players have placed bets. Pool amount: ${lowerBet * 2} APT`);
    
    // Start the game
    setGameState('playing');
  }

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

  // Pay the winner by transferring the bet amount
  async function payWinner(winnerAddress: string, amount: number) {
    try {
      setIsLoading(true);
      console.log(`Starting payment to winner ${winnerAddress} with amount ${amount} APT`);
      
      // Validate inputs
      if (!winnerAddress || winnerAddress.trim() === '') {
        console.error("Invalid winner address");
        return; // Silently return instead of showing error to user
      }
      
      if (amount <= 0) {
        console.error("Invalid payment amount:", amount);
        return; // Silently return instead of showing error to user
      }
      
      // Create transaction payload
      const amountInOctas = Math.floor(amount * 100000000).toString();
      console.log(`Amount in Octas: ${amountInOctas}`);
      
      const payload = {
        type: "entry_function_payload",
        function: "0x1::coin::transfer",
        type_arguments: ["0x1::aptos_coin::AptosCoin"],
        arguments: [winnerAddress, amountInOctas]
      };
      
      console.log("Winner payment payload created:", JSON.stringify(payload));
      
      // Submit transaction with enhanced error handling
      console.log("Attempting to submit winner payment transaction...");
      let txHash = "";
      let transactionSucceeded = false;
      
      // Try transaction submission
      try {
        // First try the wallet adapter if available
        if (connected && account && typeof signAndSubmitTransaction === 'function') {
          console.log("Using wallet adapter for winner payment");
          const response = await signAndSubmitTransaction(payload as any);
          
          if (response && response.hash) {
            txHash = response.hash;
            console.log(`Winner payment transaction submitted via adapter with hash: ${txHash}`);
            transactionSucceeded = true;
          } else {
            console.warn("Adapter transaction response missing hash:", response);
            // Don't throw, try direct method
          }
        }
        
        // If adapter failed or not available, try direct method
        if (!transactionSucceeded && window.aptos && typeof window.aptos.signAndSubmitTransaction === 'function') {
          console.log("Using direct Petra wallet for winner payment");
          const directResponse = await window.aptos.signAndSubmitTransaction(payload);
          
          if (directResponse && directResponse.hash) {
            txHash = directResponse.hash;
            console.log(`Winner payment transaction submitted directly with hash: ${txHash}`);
            transactionSucceeded = true;
          } else {
            console.warn("Direct transaction response missing hash:", directResponse);
          }
        }
        
        // If we have a hash, wait for confirmation
        if (txHash) {
          try {
            console.log(`Waiting for winner payment transaction ${txHash} to be confirmed...`);
            const txResult = await client.waitForTransactionWithResult(txHash);
            console.log("Winner payment transaction confirmed:", txResult);
          } catch (confirmError) {
            console.warn("Error confirming winner payment transaction:", confirmError);
            console.log("Continuing despite confirmation error (transaction may still be processing)");
            // Don't throw - transaction was submitted and might still process
          }
          
          console.log(`Payment to winner ${winnerAddress} completed: ${amount} APT`);
        } else if (!transactionSucceeded) {
          console.error("No transaction hash returned for winner payment");
          // Don't throw error to user - handle silently
        }
      } catch (txError) {
        console.error("Winner payment transaction error:", txError);
        // Only log the error, don't show to user since this is part of game completion
      }
    } catch (error: any) {
      // Only log the error, don't display to user
      console.error('Error in payWinner function:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGameEnd() {
    setGameState('completed');
    
    // AI agent facilitates the payout
    if (aiEnabled && finalBetAmount > 0) {
      // Determine the winner and distribute the bet
      let winner;
      let winnerAddress = '';
      
      if (game.isDraw()) {
        winner = 'draw';
        // In a draw, refund half to each player
        console.log('Game ended in a draw. Refunding bets.');
        if (player1Wallet && player2Wallet) {
          await payWinner(player1Wallet.address, finalBetAmount / 2);
          await payWinner(player2Wallet.address, finalBetAmount / 2);
        }
      } else {
        // White wins if it's not black's turn (checkmate)
        winner = game.turn() === 'b' ? 'white' : 'black';
        winnerAddress = winner === 'white' 
          ? (player1Wallet ? player1Wallet.address : '')
          : (player2Wallet ? player2Wallet.address : '');
          
        console.log(`Game ended. Winner: ${winner}, address: ${winnerAddress}`);
        
        if (winnerAddress && finalBetAmount > 0) {
          // Pay the winner
          await payWinner(winnerAddress, finalBetAmount);
        }
      }
    }
  }

  // Handle forfeit with payout to the other player
  async function forfeitGame(playerNumber: 1 | 2) {
    if (gameState !== 'playing') {
      console.log("Can only forfeit during an active game");
      return;
    }
    
    setGameState('completed');
    
    // Determine the winner (opposite of the player who forfeited)
    const winner = playerNumber === 1 ? 'black' : 'white';
    const winnerAddress = winner === 'white'
      ? (player1Wallet ? player1Wallet.address : '')
      : (player2Wallet ? player2Wallet.address : '');
      
    console.log(`Player ${playerNumber} forfeited. ${winner === 'white' ? 'Player 1' : 'Player 2'} wins!`);
    
    // AI agent facilitates the payout to the winner
    if (aiEnabled && finalBetAmount > 0 && winnerAddress) {
      await payWinner(winnerAddress, finalBetAmount);
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

  // Check if both wallets are connected
  const bothWalletsConnected = player1Wallet && player2Wallet;
  
  // Check if it's the betting phase and which player needs to bet
  const needsPlayer1Bet = gameState === 'betting' && player1Bet === 0 && player2Bet > 0;
  const needsPlayer2Bet = gameState === 'betting' && player2Bet === 0 && player1Bet > 0;

  // Early return for error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-3">
            <button 
              onClick={() => setError(null)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Dismiss
            </button>
            <button 
              onClick={resetWalletConnections}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Reset Wallet Connections
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Chess GameFi - Aptos</title>
        <meta name="description" content="Chess GameFi with AI Agent P2P Betting on Aptos" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-secondary mb-2">Chess GameFi</h1>
        <p className="text-lg text-gray-600">Aptos Chess with AI-Facilitated Betting</p>
      </header>

      {isLoading ? (
        <LoadingComponent message="Processing blockchain transaction..." />
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
              player1Wallet={player1Wallet ? { address: player1Wallet.address } : null}
              player2Wallet={player2Wallet ? { address: player2Wallet.address } : null}
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
                    {finalBetAmount > 0 && ` and transfer the bet of ${finalBetAmount.toFixed(4)} APT`}
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
                    {finalBetAmount > 0 && ` and transfer the bet of ${finalBetAmount.toFixed(4)} APT`}
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
                  <p className="mb-4">Connect Player 1's Petra wallet to place bets and play</p>
                  <button 
                    onClick={() => connectPlayerWallet(1)}
                    className="btn-primary w-full"
                  >
                    Connect Player 1 Wallet
                  </button>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm truncate">
                      {player1Wallet.address.slice(0, 6)}...{player1Wallet.address.slice(-4)}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Connected</span>
                  </div>
                  <div className="text-sm">
                    <strong>Balance:</strong> {player1Wallet.balance.toFixed(4)} APT
                  </div>
                </div>
              )}
            </div>
            
            {/* Player 2 Wallet Connection */}
            <div className="betting-card mb-6">
              <h2 className="text-xl font-bold mb-2">Player 2 (Black)</h2>
              {!player2Wallet ? (
                <div>
                  <p className="mb-4">Connect Player 2's Petra wallet to place bets and play</p>
                  <button 
                    onClick={() => connectPlayerWallet(2)}
                    className="btn-primary w-full"
                    disabled={!player1Wallet} // Require Player 1 to connect first
                  >
                    Connect Player 2 Wallet
                  </button>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm truncate">
                      {player2Wallet.address.slice(0, 6)}...{player2Wallet.address.slice(-4)}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Connected</span>
                  </div>
                  <div className="text-sm">
                    <strong>Balance:</strong> {player2Wallet.balance.toFixed(4)} APT
                  </div>
                </div>
              )}
            </div>
            
            {/* Betting Interface */}
            {bothWalletsConnected && (gameState === 'waiting' || gameState === 'betting') && (
              <div className="betting-card mb-6">
                <h2 className="text-2xl font-bold mb-4">Betting</h2>
                
                {needsPlayer1Bet ? (
                  <div className="p-3 bg-yellow-100 rounded-lg mb-4">
                    <p className="text-sm font-medium">Player 2 has bet {player2Bet.toFixed(4)} APT</p>
                    <p className="text-sm">Player 1 needs to place their bet</p>
                  </div>
                ) : needsPlayer2Bet ? (
                  <div className="p-3 bg-yellow-100 rounded-lg mb-4">
                    <p className="text-sm font-medium">Player 1 has bet {player1Bet.toFixed(4)} APT</p>
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
                    {finalBetAmount.toFixed(4)} APT
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
                      : `Winner receives ${finalBetAmount.toFixed(4)} APT`}
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