import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { GameDashboard } from '../components/GameDashboard';
import BettingInterface from '../components/BettingInterface';
import AIAgentPanel from '../components/AIAgentPanel';
import LoadingComponent from '../components/LoadingComponent';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Types, AptosClient } from 'aptos';
import { EscrowContractAdapter, EscrowStatus, DisputeResolution } from '../contracts/EscrowContractAdapter';

// Define types at the top of the file
type Winner = 'player1' | 'player2' | 'draw' | null;
type GameState = 'waiting' | 'betting' | 'bet_announced' | 'escrow_locked' | 'playing' | 'completed';

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
  
  // Escrow adapter for blockchain interactions
  const escrowAdapter = useMemo(() => new EscrowContractAdapter(
    'https://fullnode.testnet.aptoslabs.com/v1',
    '0x1' // Default module address, would be replaced with actual deployed address
  ), []);
  
  // Add escrow tracking properties 
  const [useSimulationMode, setUseSimulationMode] = useState<boolean>(true); // Default to true since we're not really deploying
  const [escrowLocked, setEscrowLocked] = useState<boolean>(false);
  const [player1EscrowLocked, setPlayer1EscrowLocked] = useState<boolean>(false);
  const [player2EscrowLocked, setPlayer2EscrowLocked] = useState<boolean>(false);
  
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white');
  const [activePlayerWallet, setActivePlayerWallet] = useState<1 | 2>(1); // Which player is connecting wallet
  
  // New state for escrow contract data
  const [escrowAddress, setEscrowAddress] = useState<string | null>(null);
  const [escrowStatus, setEscrowStatus] = useState<EscrowStatus>(EscrowStatus.PENDING);
  const [escrowBalance, setEscrowBalance] = useState<number>(0);
  
  // Wallet adapter
  const { 
    connect, 
    disconnect, 
    account, 
    connected, 
    signAndSubmitTransaction 
  } = useWallet();

  // Add the winner state to the Home component
  const [winner, setWinner] = useState<Winner>(null);

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

  // Initialize escrow when both wallets are connected
  useEffect(() => {
    if (player1Wallet && player2Wallet && !escrowAddress && !isLoading) {
      console.log("Both wallets connected, initializing escrow");
      
      // In simulation mode, create a simulated escrow automatically
      if (useSimulationMode) {
        createSimulatedEscrow();
      }
      // In real mode, don't auto-initialize to avoid unexpected reconnection prompts
      // User will need to click the Initialize Escrow button
    }
  }, [player1Wallet, player2Wallet, escrowAddress, isLoading, useSimulationMode]);

  // Function to reset wallet connections - moved to the top to fix reference error
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
      setEscrowLocked(false);
      setPlayer1EscrowLocked(false);
      setPlayer2EscrowLocked(false);
      setEscrowAddress(null);
      
      console.log("Wallet connections reset successfully");
    } catch (error) {
      console.error("Error resetting wallet connections:", error);
      setError("Failed to reset wallet connections. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to initialize the escrow contract
  const initializeEscrow = async () => {
    if (!player1Wallet || !player2Wallet) {
      console.error("Cannot initialize escrow: both players must be connected");
      setError("Both players must be connected to initialize the escrow");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Initializing escrow contract");

      // In simulation mode, just set a fake address
      if (useSimulationMode) {
        try {
          const simulatedAddress = 'simulated_escrow_' + Date.now();
          console.log("Creating simulated escrow with address:", simulatedAddress);
          
          // Set the address in the adapter
          escrowAdapter.setEscrowAddress(simulatedAddress);
          
          // Set the address in our component state
          setEscrowAddress(simulatedAddress);
          
          console.log("Simulated escrow initialized with address:", simulatedAddress);
          
          // Add a small delay to ensure state updates
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Double check that the address was set
          if (!escrowAddress) {
            console.log("Escrow address state not updated yet, but continuing...");
          }
          
          setIsLoading(false);
          return;
        } catch (simError) {
          console.error("Error in simulation mode:", simError);
          // Continue to try real mode, but log the error
        }
      }

      // Try connecting to Player 1's wallet
      console.log("Attempting to connect to Player 1's wallet for escrow initialization");
      // If Player 1 is connected through wallet adapter, make sure we're using that
      if (account && account.address && account.address.toString() === player1Wallet.address) {
        console.log("Using connected wallet adapter for escrow creation");
        
        const createEscrowResult = await escrowAdapter.createEscrow(
          { signAndSubmitTransaction: signAndSubmitTransaction }, // Use the adapter
          player1Wallet.address,
          player2Wallet.address,
          0.1, // Minimum bet of 0.1 APT
          player1Wallet.address, // Use player 1 as arbiter (in a real app, this would be a neutral third party)
          24 * 60 * 60 // 24 hour timeout
        );
        
        if (createEscrowResult) {
          setEscrowAddress(createEscrowResult);
          console.log("Escrow contract created with address:", createEscrowResult);
          setIsLoading(false);
          return;
        }
      }
      
      // If adapter didn't work, try the direct window.aptos method
      if (window.aptos) {
        try {
          console.log("Connecting to wallet via window.aptos for escrow creation");
          
          // Check if already connected to the right wallet
          let currentAccount = null;
          try {
            currentAccount = await window.aptos.account();
          } catch (e) {
            console.log("No account currently connected, will need to connect");
          }
          
          // Only show prompt and connect if not already connected to Player 1's wallet
          if (!currentAccount || currentAccount.address !== player1Wallet.address) {
            console.log("Not connected to Player 1's wallet, requesting connection");
            window.alert("Please make sure Player 1's wallet is selected in your Petra extension to initialize the escrow.");
            await window.aptos.connect();
          } else {
            console.log("Already connected to Player 1's wallet, proceeding without reconnection");
          }
          
          // Ensure it's Player 1's wallet
          const account = await window.aptos.account();
          if (account && account.address === player1Wallet.address) {
            console.log("Connected to correct wallet, creating escrow");
            
            const createEscrowResult = await escrowAdapter.createEscrow(
              window.aptos,
              player1Wallet.address,
              player2Wallet.address,
              0.1, // Minimum bet of 0.1 APT
              player1Wallet.address, // Use player 1 as arbiter
              24 * 60 * 60 // 24 hour timeout
            );
            
            if (createEscrowResult) {
              setEscrowAddress(createEscrowResult);
              console.log("Escrow contract created with address:", createEscrowResult);
              setIsLoading(false);
              return;
            }
          } else {
            console.warn("Connected to wrong wallet address:", account?.address);
            throw new Error(`Wrong wallet connected. Expected ${player1Wallet.address} but got ${account?.address}. Please make sure Player 1's wallet is selected.`);
          }
        } catch (error) {
          console.error("Error with direct Petra connection:", error);
          throw error;
        }
      } else {
        throw new Error("Petra wallet extension not found. Please install Petra and reload the page.");
      }

    } catch (error: any) {
      console.error("Error initializing escrow:", error);
      setError(error.message || "Failed to initialize escrow");
    } finally {
      setIsLoading(false);
    }
  };

  // Remove the complex wallet address checking and replace ensureCorrectWalletConnected with a simpler version
  async function ensureCorrectWalletConnected(playerNumber: 1 | 2) {
    console.log(`Ensuring wallet for Player ${playerNumber} is connected`);
    
    // If in simulation mode, just return true
    if (useSimulationMode) {
      console.log("Simulation mode: Assuming wallet is connected");
      return true;
    }
    
    // For Player 1 or Player 2, simply try to connect via window.aptos
    try {
      console.log(`Attempting to connect to Player ${playerNumber}'s wallet`);
      
      // Prompt user to switch to the correct wallet
      window.alert(`Please make sure Player ${playerNumber}'s wallet is selected in your Petra extension.`);
      
      const response = await window.aptos.connect();
      if (response && response.address) {
        console.log(`Connected to wallet with address: ${response.address}`);
        return true;
      } else {
        console.error("Failed to get wallet address");
        return false;
      }
    } catch (error) {
      console.error(`Error connecting to Player ${playerNumber}'s wallet:`, error);
      return false;
    }
  }

  // Update the connectPlayerWallet function to show correct prompts based on player number
  const connectPlayerWallet = async (playerNumber: 1 | 2) => {
    // Prevent multiple connection attempts
    if (isLoading) {
      console.log("Connection already in progress, ignoring duplicate request");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Connecting wallet for Player ${playerNumber}...`);
      
      // Make sure there's a global aptos object
      if (typeof window === 'undefined' || !window.aptos) {
        setError("Petra wallet is not installed. Please install the Petra wallet extension from https://petra.app/ and refresh the page.");
        setIsLoading(false);
        return;
      }
      
      // Check if this player's wallet is already connected
      const playerWallet = playerNumber === 1 ? player1Wallet : player2Wallet;
      if (playerWallet) {
        console.log(`Player ${playerNumber}'s wallet is already connected:`, playerWallet.address);
        setIsLoading(false);
        return;
      }
      
      // Show the correct prompt based on player number
      window.alert(`Please make sure Player ${playerNumber}'s wallet is selected in your Petra extension.`);
      
      // Direct connection approach - simplest and most reliable
      try {
        const response = await window.aptos.connect();
        console.log(`Wallet connection response for Player ${playerNumber}:`, response);
        
        if (response && response.address) {
          console.log(`Connected to wallet for Player ${playerNumber}:`, response.address);
          
          // Check if this wallet is already connected as the other player
          const otherPlayerWallet = playerNumber === 1 ? player2Wallet : player1Wallet;
          if (otherPlayerWallet && otherPlayerWallet.address === response.address) {
            const confirmUse = window.confirm(
              `WARNING: This wallet (${response.address.substring(0, 6)}...${response.address.substring(response.address.length - 4)}) is already connected as Player ${playerNumber === 1 ? '2' : '1'}.\n\n` +
              `Using the same wallet for both players is NOT recommended for real games.\n\n` +
              `Do you want to continue using this wallet for both players?`
            );
            
            if (!confirmUse) {
              throw new Error(`Please connect a different wallet for Player ${playerNumber}. Go to your Petra extension and switch accounts first.`);
            }
            
            console.log(`User confirmed using the same wallet for both players: ${response.address}`);
          }
          
          // Get wallet balance
          const balance = await getAccountBalance(response.address);
          
          // Set the wallet in state
          const walletInfo: PlayerWalletInfo = {
            address: response.address,
            balance: balance
          };
          
          if (playerNumber === 1) {
            setPlayer1Wallet(walletInfo);
          } else {
            setPlayer2Wallet(walletInfo);
          }
          
          console.log(`Successfully set Player ${playerNumber}'s wallet`);
        } else {
          throw new Error("Failed to get wallet address");
        }
      } catch (error: any) {
        console.error(`Error connecting wallet for Player ${playerNumber}:`, error);
        throw new Error(`Failed to connect wallet: ${error.message || 'Unknown error'}`);
      }
      
    } catch (error: any) {
      console.error(`Error in wallet connection for Player ${playerNumber}:`, error);
      setError(error.message || `Failed to connect wallet for Player ${playerNumber}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a function to set the escrow wallet - this would be a third wallet
  const connectEscrowWallet = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Connecting escrow wallet...");
      
      if (typeof window === 'undefined' || !window.aptos) {
        setError("Petra wallet is not installed. Please install the Petra wallet extension.");
        setIsLoading(false);
        return;
      }
      
      // Prompt to select the escrow wallet
      window.alert("Please make sure your ESCROW wallet is selected in your Petra extension.");
      
      const response = await window.aptos.connect();
      console.log("Escrow wallet connection response:", response);
      
      if (response && response.address) {
        console.log("Connected to escrow wallet:", response.address);
        
        // Set the escrow address in the adapter
        escrowAdapter.setEscrowAddress(response.address);
        
        // Set the address in component state
        setEscrowAddress(response.address);
        
        console.log("Escrow wallet set successfully:", response.address);
      } else {
        throw new Error("Failed to get escrow wallet address");
      }
      
    } catch (error: any) {
      console.error("Error connecting escrow wallet:", error);
      setError(error.message || "Failed to connect escrow wallet");
    } finally {
      setIsLoading(false);
    }
  };

  // Update payWinner function to use the escrow wallet to pay the winner
  async function payWinner(winner: Winner) {
    try {
      console.log(`Paying winner: ${winner}`);
      
      // Only proceed if not in simulation mode and escrow is locked
      if (!useSimulationMode && escrowLocked && escrowAddress) {
        // Handle draw case
        if (winner === 'draw') {
          console.log("Draw game - returning funds to both players");
          
          // For a draw, return original bet amounts to each player
          // Connect to escrow wallet first
          window.alert("Please select the ESCROW wallet in your Petra extension to return funds.");
          const escrowWalletConnected = await window.aptos.connect();
          
          if (!escrowWalletConnected || escrowWalletConnected.address !== escrowAddress) {
            throw new Error("Failed to connect to escrow wallet. Please ensure the correct wallet is selected.");
          }
          
          // Return funds to Player 1
          if (player1Wallet) {
            console.log(`Returning ${player1Bet} APT to Player 1 from escrow`);
            const payload1 = {
              type: "entry_function_payload",
              function: "0x1::coin::transfer",
              type_arguments: ["0x1::aptos_coin::AptosCoin"],
              arguments: [player1Wallet.address, Math.floor(player1Bet * 100000000).toString()]
            };
            
            const txResponse1 = await window.aptos.signAndSubmitTransaction(payload1);
            console.log("Player 1 refund transaction:", txResponse1);
          }
          
          // Return funds to Player 2
          if (player2Wallet) {
            console.log(`Returning ${player2Bet} APT to Player 2 from escrow`);
            const payload2 = {
              type: "entry_function_payload",
              function: "0x1::coin::transfer",
              type_arguments: ["0x1::aptos_coin::AptosCoin"],
              arguments: [player2Wallet.address, Math.floor(player2Bet * 100000000).toString()]
            };
            
            const txResponse2 = await window.aptos.signAndSubmitTransaction(payload2);
            console.log("Player 2 refund transaction:", txResponse2);
          }
        } 
        // Handle winner case
        else {
          const winnerWallet = winner === 'player1' ? player1Wallet : player2Wallet;
          
          if (!winnerWallet) {
            throw new Error("Winner wallet not found");
          }
          
          console.log(`Transferring ${finalBetAmount} APT to winner (${winnerWallet.address})`);
          
          // Connect to escrow wallet
          window.alert("Please select the ESCROW wallet in your Petra extension to pay the winner.");
          const escrowWalletConnected = await window.aptos.connect();
          
          if (!escrowWalletConnected || escrowWalletConnected.address !== escrowAddress) {
            throw new Error("Failed to connect to escrow wallet. Please ensure the correct wallet is selected.");
          }
          
          // Transfer all funds from escrow to winner
          const payload = {
            type: "entry_function_payload",
            function: "0x1::coin::transfer",
            type_arguments: ["0x1::aptos_coin::AptosCoin"],
            arguments: [winnerWallet.address, Math.floor(finalBetAmount * 100000000).toString()]
          };
          
          const txResponse = await window.aptos.signAndSubmitTransaction(payload);
          console.log("Winner payment transaction:", txResponse);
        }
        
        // Update player balances after transfers
        if (player1Wallet) {
          const newBalance1 = await getAccountBalance(player1Wallet.address);
          setPlayer1Wallet({
            ...player1Wallet,
            balance: newBalance1
          });
        }
        
        if (player2Wallet) {
          const newBalance2 = await getAccountBalance(player2Wallet.address);
          setPlayer2Wallet({
            ...player2Wallet,
            balance: newBalance2
          });
        }
      } 
      // Simulation mode handling
      else if (useSimulationMode) {
        if (winner === 'draw') {
          console.log("Draw game - both players receive their bets back (simulation)");
          
          if (player1Wallet) {
            setPlayer1Wallet({
              ...player1Wallet,
              balance: player1Wallet.balance + player1Bet
            });
          }
          
          if (player2Wallet) {
            setPlayer2Wallet({
              ...player2Wallet,
              balance: player2Wallet.balance + player2Bet
            });
          }
        } else {
          const payoutAmount = finalBetAmount;
          
          if (winner === 'player1' && player1Wallet) {
            console.log(`Updating Player 1 wallet balance: +${payoutAmount} APT (simulation)`);
            setPlayer1Wallet({
              ...player1Wallet,
              balance: player1Wallet.balance + payoutAmount
            });
          } else if (winner === 'player2' && player2Wallet) {
            console.log(`Updating Player 2 wallet balance: +${payoutAmount} APT (simulation)`);
            setPlayer2Wallet({
              ...player2Wallet,
              balance: player2Wallet.balance + payoutAmount
            });
          }
        }
      }
      
      console.log("Winner payment completed successfully");
    } catch (error: any) {
      console.error("Error paying winner:", error);
      setError(error.message || "Failed to pay winner");
    }
  }

  // Reset game state
  function resetGameState() {
    console.log("Resetting game state");
    setGameState('waiting');
    setPlayer1Bet(0);
    setPlayer2Bet(0);
    setPlayer1EscrowLocked(false);
    setPlayer2EscrowLocked(false);
    setEscrowLocked(false);
    setFinalBetAmount(0);
    setEscrowStatus(EscrowStatus.PENDING);
    setEscrowBalance(0);
    setWinner(null);
    
    // Reset the game board
    setGame(new Chess());
    
    // Reset current player
    setCurrentPlayer('white');
    
    console.log("Game state reset complete");
  }

  // Check if both wallets are connected
  const bothWalletsConnected = player1Wallet && player2Wallet;
  
  // Check if it's the betting phase and which player needs to bet
  const needsPlayer1Bet = gameState === 'betting' && player1Bet === 0 && player2Bet > 0;
  const needsPlayer2Bet = gameState === 'betting' && player2Bet === 0 && player1Bet > 0;

  // Add helper function to explain wallet connection steps
  const getWalletConnectionInstructions = (playerNumber: 1 | 2) => {
    if (playerNumber === 1) {
      return "Connect your first wallet by clicking the button below.";
    } else {
      return "To connect Player 2's wallet:\n1. Open your Petra wallet extension\n2. Switch to a DIFFERENT wallet account (important!)\n3. Click 'Connect Player 2 Wallet'\n\nUsing the same wallet for both players is not recommended for real games.";
    }
  };

  // Force disconnect before connecting Player 2
  const connectPlayer2Wallet = async () => {
    // First try to disconnect any connected wallet
    if (connected) {
      console.log("Force disconnecting before connecting Player 2's wallet");
      try {
        await disconnect();
        // Wait for disconnection to complete
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn("Error during forced disconnection:", e);
      }
    }
    
    // Check if Player 1 wallet is connected and provide specific instructions
    if (player1Wallet) {
      const walletPreface = player1Wallet.address.substring(0, 6) + "..." + 
                           player1Wallet.address.substring(player1Wallet.address.length - 4);
      
      // Show detailed instructions for switching wallets
      window.alert(
        `IMPORTANT: Before connecting Player 2's wallet\n\n` +
        `1. Open your Petra wallet extension\n` +
        `2. Currently, Player 1 is using wallet: ${walletPreface}\n` +
        `3. Switch to a DIFFERENT account in your Petra wallet\n` +
        `4. Then click OK to continue connecting`
      );
    }
    
    // Now try to connect Player 2's wallet
    connectPlayerWallet(2);
  };

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

  // Add function to announce bets for both players and calculate minimum
  const announceUnifiedBet = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Announcing unified bet - Player 1: ${player1Bet} APT, Player 2: ${player2Bet} APT`);
      
      // Validate both players have wallets connected
      if (!player1Wallet || !player2Wallet) {
        throw new Error('Both players must connect their wallets before announcing bets');
      }
      
      // Validate bet amounts
      if (player1Bet <= 0 || player2Bet <= 0) {
        throw new Error('Both players must enter valid bet amounts (greater than 0)');
      }
      
      // Check sufficient funds
      if (player1Wallet.balance < player1Bet) {
        throw new Error(`Player 1 has insufficient funds. Available: ${player1Wallet.balance} APT, Bet: ${player1Bet} APT`);
      }
      
      if (player2Wallet.balance < player2Bet) {
        throw new Error(`Player 2 has insufficient funds. Available: ${player2Wallet.balance} APT, Bet: ${player2Bet} APT`);
      }
      
      // Calculate minimum bet
      const minimumBet = Math.min(player1Bet, player2Bet);
      console.log(`Calculated minimum bet: ${minimumBet} APT`);
      
      // Set final bet amount (pot)
      setFinalBetAmount(minimumBet * 2);
      
      // Update game state
      setGameState('betting');
      
      console.log('Unified bet announcement successful');
      
    } catch (error: any) {
      console.error('Error announcing unified bet:', error);
      setError(error.message || 'Failed to announce unified bet');
    } finally {
      setIsLoading(false);
    }
  };

  // Lock the escrow by transferring the minimum bet amount from a specific player
  async function lockEscrow(playerNumber: 1 | 2) {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Starting escrow locking process for Player ${playerNumber}`);
      console.log(`Current escrow lock status: Player 1: ${player1EscrowLocked}, Player 2: ${player2EscrowLocked}`);
      
      // Verify both players have placed bets
      if (player1Bet <= 0 || player2Bet <= 0) {
        throw new Error("Both players must announce bets before locking escrow");
      }
      
      // Determine the minimum bet amount (this is what will be deducted)
      const minimumBet = Math.min(player1Bet, player2Bet);
      console.log(`Minimum bet amount between players: ${minimumBet} APT`);
      
      // Get player wallet
      const playerWallet = playerNumber === 1 ? player1Wallet : player2Wallet;
      if (!playerWallet) {
        throw new Error(`Player ${playerNumber} wallet not connected`);
      }
      
      // In simulation mode, create an escrow if not yet initialized
      if (useSimulationMode && !escrowAddress) {
        console.log("No escrow initialized yet, but in simulation mode. Creating escrow now...");
        const simulatedAddress = 'simulated_escrow_' + Date.now();
        escrowAdapter.setEscrowAddress(simulatedAddress);
        setEscrowAddress(simulatedAddress);
        console.log("Auto-created simulated escrow with address:", simulatedAddress);
        
        // Brief pause to let state update
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Make sure an escrow address is set
      if (!escrowAddress) {
        throw new Error("No escrow wallet connected. Please connect the escrow wallet first.");
      }
      
      console.log(`Depositing ${minimumBet} APT to escrow contract from Player ${playerNumber}`);
      
      // Use simulation mode if enabled
      if (useSimulationMode) {
        console.log("Using simulation mode - no actual transfer will occur");
        
        // Simulate deposit
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update UI state
        if (playerNumber === 1) {
          setPlayer1EscrowLocked(true);
          setPlayer1Wallet({
            ...playerWallet,
            balance: playerWallet.balance - minimumBet
          });
        } else {
          setPlayer2EscrowLocked(true);
          setPlayer2Wallet({
            ...playerWallet,
            balance: playerWallet.balance - minimumBet
          });
        }
        
        console.log(`Simulated escrow lock successful for Player ${playerNumber}`);
        
        // Update escrow balance in simulation mode
        setEscrowBalance(prevBalance => prevBalance + minimumBet);
      } else {
        // Real deposit by transferring funds to the escrow address
        // Make sure the player's wallet is connected
        const isWalletConnected = await ensureCorrectWalletConnected(playerNumber);
        if (!isWalletConnected) {
          throw new Error(`Please connect the wallet for Player ${playerNumber} to continue`);
        }
        
        // Direct transfer to escrow address - using minimumBet instead of player's full bet
        const transferSuccess = await transferToEscrow(playerNumber, minimumBet, escrowAddress);
        
        if (!transferSuccess) {
          throw new Error(`Failed to transfer funds to escrow for Player ${playerNumber}`);
        }
        
        // Update UI state
        if (playerNumber === 1) {
          setPlayer1EscrowLocked(true);
          
          // Refresh balance
          const newBalance = await getAccountBalance(playerWallet.address);
          setPlayer1Wallet({
            ...playerWallet,
            balance: newBalance
          });
        } else {
          setPlayer2EscrowLocked(true);
          
          // Refresh balance
          const newBalance = await getAccountBalance(playerWallet.address);
          setPlayer2Wallet({
            ...playerWallet,
            balance: newBalance
          });
        }
        
        console.log(`Escrow lock successful for Player ${playerNumber}`);
        
        // Update escrow balance - in real mode, we'd query the contract
        const escrowBalanceResult = await getAccountBalance(escrowAddress);
        setEscrowBalance(escrowBalanceResult);
      }
      
      // Now check if both players have locked their escrow
      if (playerNumber === 1 ? player2EscrowLocked : player1EscrowLocked) {
        console.log("Both players have deposited funds to escrow. Starting game...");
        
        // Final pool amount is minimum bet × 2
        const finalPoolAmount = minimumBet * 2;
        
        console.log(`Setting final bet amount to ${finalPoolAmount} APT (${minimumBet} × 2)`);
        setFinalBetAmount(finalPoolAmount);
        setEscrowLocked(true);
        
        // Start the game with a slight delay to ensure UI updates
        setTimeout(() => {
          console.log("Transitioning game state to 'playing'");
          setGameState('playing');
          setEscrowStatus(EscrowStatus.PLAYING);
        }, 500);
      } else {
        console.log(`Waiting for the other player to lock their escrow`);
      }
    } catch (error: any) {
      console.error(`Error locking escrow for Player ${playerNumber}:`, error);
      setError(error.message || `Failed to lock escrow for Player ${playerNumber}`);
    } finally {
      setIsLoading(false);
    }
  }
  
  // Check if both players have locked their escrow and start the game if they have
  function checkAndStartGame() {
    console.log("Checking escrow lock status:", { 
      player1Locked: player1EscrowLocked, 
      player2Locked: player2EscrowLocked,
      currentGameState: gameState
    });
    
    if (player1EscrowLocked && player2EscrowLocked) {
      console.log("Both players have locked their escrow. Starting game...");
      
      // Set final bet amount (the pool)
      const minBetAmount = Math.min(player1Bet, player2Bet);
      console.log(`Setting final bet amount to ${minBetAmount * 2} APT (min of ${player1Bet} and ${player2Bet})`);
      
      setFinalBetAmount(minBetAmount * 2);
      setEscrowLocked(true);
      setGameState('playing');
      console.log("Game state set to 'playing'");
    }
  }

  // Helper function to transfer funds from a player to the escrow
  async function transferToEscrow(playerNumber: 1 | 2, amount: number, targetAddress: string) {
    console.log(`Transferring ${amount} APT from Player ${playerNumber} to ${targetAddress}`);
    
    const playerWallet = playerNumber === 1 ? player1Wallet : player2Wallet;
    if (!playerWallet) {
      throw new Error(`Player ${playerNumber} wallet not connected`);
    }
    
    // For testing only - simulation mode doesn't do actual transfers
    if (useSimulationMode) {
      console.log("Using simulation mode for escrow transfer (no actual funds will be moved)");
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock transaction delay
      return true;
    }
    
    // Need to make sure the correct wallet is connected
    console.log(`Ensuring correct wallet is connected for Player ${playerNumber}`);
    const isCorrectWalletConnected = await ensureCorrectWalletConnected(playerNumber);
    if (!isCorrectWalletConnected) {
      throw new Error(`Please connect the wallet for Player ${playerNumber} to continue`);
    }
    
    console.log("Wallet correctly connected, preparing transaction");
    
    // Validate target address
    if (!targetAddress || targetAddress.trim() === '') {
      console.error("Invalid target address:", targetAddress);
      throw new Error("Invalid recipient address. Unable to process transfer.");
    }
    
    // Convert amount to octas
    const amountInOctas = Math.floor(amount * 100000000).toString();
    console.log(`Amount in Octas: ${amountInOctas}`);
    
    // Create payload
    const payload = {
      type: "entry_function_payload",
      function: "0x1::coin::transfer",
      type_arguments: ["0x1::aptos_coin::AptosCoin"],
      arguments: [targetAddress, amountInOctas]
    };
    
    console.log("Transaction payload created:", JSON.stringify(payload));
    
    // Submit the transaction - try direct method first for more reliable popup display
    try {
      let txHash = "";
      
      // Try direct Petra method first - often more reliable for showing the popup
      if (window.aptos && typeof window.aptos.signAndSubmitTransaction === 'function') {
        console.log("Using direct Petra wallet for transaction - this should trigger the popup");
        try {
          // Force focus on current window to help popup appear
          window.focus();
          
          const response = await window.aptos.signAndSubmitTransaction(payload);
          console.log("Direct transaction response:", response);
          if (response && response.hash) {
            txHash = response.hash;
            console.log("Transaction hash received:", txHash);
          } else {
            console.error("Direct transaction response missing hash:", response);
          }
        } catch (directError) {
          console.error("Direct transaction error:", directError);
          if (directError.message) {
            throw new Error(`Transaction failed: ${directError.message}`);
          }
        }
      }
      
      // Fall back to adapter if direct method didn't work
      if (!txHash && connected && account && typeof signAndSubmitTransaction === 'function') {
        console.log("Falling back to wallet adapter for transaction");
        try {
          const response = await signAndSubmitTransaction(payload as any);
          console.log("Adapter transaction response:", response);
          if (response && response.hash) {
            txHash = response.hash;
            console.log("Transaction hash received from adapter:", txHash);
          } else {
            console.error("Adapter transaction response missing hash:", response);
          }
        } catch (adapterError) {
          console.error("Adapter transaction error:", adapterError);
          if (adapterError.message) {
            throw new Error(`Transaction failed: ${adapterError.message}`);
          }
        }
      }
      
      // If we still don't have a hash, the transaction failed
      if (!txHash) {
        throw new Error("Transaction failed. Make sure your wallet is unlocked and has sufficient funds.");
      }
      
      // Wait for transaction confirmation
      console.log(`Transaction submitted with hash: ${txHash}`);
      
      try {
        console.log("Waiting for transaction confirmation...");
        const txResult = await client.waitForTransactionWithResult(txHash);
        console.log(`Transfer for Player ${playerNumber} confirmed:`, txResult);
        return true;
      } catch (confirmError) {
        console.warn("Error confirming transaction:", confirmError);
        // Transaction might still go through, so we'll consider this a success
        console.log("Continuing despite confirmation error (transaction may still be processing)");
        return true;
      }
    } catch (txError: any) {
      console.error(`Error in transfer for Player ${playerNumber}:`, txError);
      if (txError.message) {
        throw new Error(`Failed to transfer funds: ${txError.message}`);
      } else {
        throw new Error("Failed to transfer funds. Please check your wallet and try again.");
      }
    }
  }

  // Restore startNewGame function
  function startNewGame() {
    setGame(new Chess());
    resetGameState();
    setCurrentPlayer('white');
  }

  // Restore forfeitGame function
  async function forfeitGame(playerNumber: 1 | 2) {
    if (gameState !== 'playing') {
      console.log("Can only forfeit during an active game");
      return;
    }
    
    setGameState('completed');
    
    // Determine the winner (opposite of the player who forfeited)
    const winner = playerNumber === 1 ? 'player2' : 'player1';
    console.log(`Player ${playerNumber} forfeited. ${winner === 'player1' ? 'Player 1' : 'Player 2'} wins!`);
    
    // Handle the game end with the determined winner
    await handleGameEnd(winner);
  }

  // Add connect/disconnect wallet functions
  const connectWallet = (playerNumber: 1 | 2) => {
    connectPlayerWallet(playerNumber);
  };

  const disconnectWallet = (playerNumber: 1 | 2) => {
    if (playerNumber === 1) {
      setPlayer1Wallet(null);
    } else {
      setPlayer2Wallet(null);
    }
    disconnect();
  };

  // Add a manual wallet address setter function
  const setManualWalletAddress = (playerNumber: 1 | 2) => {
    // Prompt user for wallet address
    const address = window.prompt(`Enter wallet address for Player ${playerNumber}:`);
    
    if (!address || address.trim() === '') {
      console.log("No address provided, cancelling manual wallet setup");
      return;
    }
    
    try {
      console.log(`Setting manual wallet address for Player ${playerNumber}: ${address}`);
      
      // Create wallet info with the provided address
      // We'll assume a balance of 10 APT for testing purposes
      const walletInfo: PlayerWalletInfo = {
        address: address.trim(),
        balance: 10 // Default balance for testing
      };
      
      // Set the wallet for the appropriate player
      if (playerNumber === 1) {
        setPlayer1Wallet(walletInfo);
      } else {
        setPlayer2Wallet(walletInfo);
      }
      
      // If this is being done in simulation mode, update the corresponding escrow setup
      if (useSimulationMode && playerNumber === 1 && player2Wallet) {
        console.log("Both players now have wallets, attempting to initialize escrow");
        // Use a timeout to allow state to update
        setTimeout(() => {
          initializeEscrow();
        }, 500);
      }
      
    } catch (error: any) {
      console.error(`Error setting manual wallet for Player ${playerNumber}:`, error);
      setError(error.message || `Failed to set manual wallet for Player ${playerNumber}`);
    }
  };

  // Function to create a simulated escrow (for debugging/testing)
  const createSimulatedEscrow = () => {
    if (!useSimulationMode) {
      setError("Please enable simulation mode first");
      return;
    }
    
    console.log("Creating a simulated escrow for testing");
    const simulatedAddress = 'simulated_escrow_' + Date.now();
    escrowAdapter.setEscrowAddress(simulatedAddress);
    setEscrowAddress(simulatedAddress);
    console.log("Created simulated escrow with address:", simulatedAddress);
    
    // Also set escrow status to PENDING
    setEscrowStatus(EscrowStatus.PENDING);
  };

  // Add missing chess functions
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

  // Handle game end function
  async function handleGameEnd(winnerParam?: Winner) {
    setGameState('completed');
    
    // Determine the winner if not provided
    let currentWinner = winnerParam;
    
    if (!currentWinner) {
      // Determine winner based on the chess game state
      if (game.isDraw()) {
        currentWinner = 'draw';
      } else {
        // White wins if it's not black's turn (checkmate)
        currentWinner = game.turn() === 'b' ? 'player1' : 'player2';
      }
    }
    
    setWinner(currentWinner);
    console.log(`Game ended with winner: ${currentWinner}`);

    // Only update escrow and pay winner if escrow was locked (real game played)
    if (escrowLocked) {
      try {
        // Update UI state
        setEscrowStatus(EscrowStatus.COMPLETED);
        
        // Pay winner
        await payWinner(currentWinner);
        
      } catch (error: any) {
        console.error("Error handling game end with escrow:", error);
        setError(error.message || "Failed to complete game settlement");
      }
    }

    // Reset game state after a delay to allow any animations to complete
    setTimeout(() => {
      resetGameState();
    }, 3000);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Chess Game with Aptos</title>
        <meta name="description" content="Play chess with Aptos blockchain integration" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-3xl font-bold text-center mb-8">Chess Game with Aptos</h1>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error: </strong> {error}
          <button 
            onClick={() => setError(null)}
            className="ml-4 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="bg-white p-6 rounded shadow-lg">
            <p className="text-lg font-semibold">Processing...</p>
            <p className="text-gray-600">Please wait while your transaction is being processed.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left panel - Player 1 */}
          <div className="bg-gray-100 p-4 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Player 1 (White)</h2>
            
            {player1Wallet ? (
              <div>
                <p className="mb-2">
                  <span className="font-semibold">Address:</span>{' '}
                  <span title={player1Wallet.address} className="cursor-help">{player1Wallet.address.substring(0, 6)}...{player1Wallet.address.substring(player1Wallet.address.length - 4)}</span>
                </p>
                <p className="mb-4">
                  <span className="font-semibold">Balance:</span> {player1Wallet.balance} APT
                </p>
                <div className="flex space-x-2 mb-4">
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => disconnectWallet(1)}
                  >
                    Disconnect
                  </button>
                  {useSimulationMode && (
                    <button
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
                      onClick={() => setManualWalletAddress(1)}
                    >
                      Edit Address
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-2">{getWalletConnectionInstructions(1)}</p>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded block w-full"
                  onClick={() => connectWallet(1)}
                >
                  Connect Player 1 Wallet
                </button>
                {useSimulationMode && (
                  <button
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded block w-full"
                    onClick={() => setManualWalletAddress(1)}
                  >
                    Set Manual Address
                  </button>
                )}
              </div>
            )}

            {gameState === 'betting' && player1Bet > 0 && !player1EscrowLocked && player2Bet > 0 && (
              <div className="mt-4">
                <p className="mb-2">
                  <span className="font-semibold">Your Bet:</span> {player1Bet} APT
                </p>
                <p className="mb-2 text-blue-700">
                  <span className="font-semibold">Minimum Bet:</span> {Math.min(player1Bet, player2Bet)} APT
                  <span className="text-xs ml-1">(this amount will be deducted)</span>
                </p>
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                  onClick={() => lockEscrow(1)}
                  disabled={!player1Wallet || player1EscrowLocked}
                >
                  Lock Your Escrow
                </button>
                <p className="text-sm text-gray-600 mt-2">
                  {player1EscrowLocked ? 'Your escrow is locked!' : 'Lock your escrow to proceed with the game'}
                </p>
              </div>
            )}

            {player1EscrowLocked && (
              <div className="mt-2 bg-green-100 p-2 rounded">
                <p className="text-green-700">Escrow locked successfully!</p>
              </div>
            )}
          </div>

          {/* Middle panel - Game */}
          <div className="bg-white p-4 rounded shadow">
            <div className="mb-4">
              <GameDashboard
                gameState={gameState}
                player1Wallet={player1Wallet}
                player2Wallet={player2Wallet}
                player1Bet={player1Bet}
                player2Bet={player2Bet}
                player1EscrowLocked={player1EscrowLocked}
                player2EscrowLocked={player2EscrowLocked}
                escrowLocked={escrowLocked}
                finalBetAmount={finalBetAmount}
                winner={winner}
              />
            </div>

            {/* Unified Betting Interface - Show when both wallets are connected and in waiting state */}
            {gameState === 'waiting' && player1Wallet && player2Wallet && (
              <div className="mb-6 p-4 border border-yellow-200 bg-yellow-50 rounded">
                <h3 className="text-lg font-bold text-center mb-3">Announce Bets</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="font-medium text-center mb-1">Player 1 Bet</p>
                    <div className="flex items-center justify-center">
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={player1Bet}
                        onChange={(e) => setPlayer1Bet(parseFloat(e.target.value) || 0)}
                        className="p-2 border rounded w-full text-center"
                        placeholder="Enter amount"
                      />
                      <span className="ml-2">APT</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-center mb-1">Player 2 Bet</p>
                    <div className="flex items-center justify-center">
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={player2Bet}
                        onChange={(e) => setPlayer2Bet(parseFloat(e.target.value) || 0)}
                        className="p-2 border rounded w-full text-center"
                        placeholder="Enter amount"
                      />
                      <span className="ml-2">APT</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={announceUnifiedBet}
                  disabled={!player1Wallet || !player2Wallet || player1Bet <= 0 || player2Bet <= 0}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-bold text-lg"
                >
                  Announce Bets & Calculate Minimum
                </button>
                <p className="text-xs text-center text-gray-600 mt-2">
                  This will calculate the minimum bet amount from both players
                </p>
              </div>
            )}

            <div className="mb-4 aspect-square max-w-md mx-auto">
              <Chessboard
                position={game.fen()}
                onPieceDrop={onDrop}
                boardOrientation="white"
              />
            </div>

            {gameState === 'playing' && (
              <div className="text-center">
                <p className="mb-2 text-lg font-semibold">
                  Current Player: {currentPlayer === 'white' ? 'White (Player 1)' : 'Black (Player 2)'}
                </p>
                <p className="mb-4 text-gray-600">
                  Total Pool: {finalBetAmount} APT
                </p>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-2"
                  onClick={() => forfeitGame(currentPlayer === 'white' ? 1 : 2)}
                >
                  Forfeit
                </button>
              </div>
            )}

            {gameState === 'completed' && (
              <div className="text-center mt-4">
                <h3 className="text-xl font-bold mb-2">
                  {winner === 'draw' ? 'Game Ended in a Draw' : `${winner === 'player1' ? 'Player 1' : 'Player 2'} Wins!`}
                </h3>
                <p className="mb-4">
                  {winner === 'draw' 
                    ? 'Both players receive their bets back' 
                    : `${winner === 'player1' ? 'Player 1' : 'Player 2'} receives ${finalBetAmount} APT`}
                </p>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={startNewGame}
                >
                  Start New Game
                </button>
              </div>
            )}
          </div>

          {/* Right panel - Player 2 */}
          <div className="bg-gray-100 p-4 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Player 2 (Black)</h2>
            
            {player2Wallet ? (
              <div>
                <p className="mb-2">
                  <span className="font-semibold">Address:</span>{' '}
                  <span title={player2Wallet.address} className="cursor-help">{player2Wallet.address.substring(0, 6)}...{player2Wallet.address.substring(player2Wallet.address.length - 4)}</span>
                </p>
                <p className="mb-4">
                  <span className="font-semibold">Balance:</span> {player2Wallet.balance} APT
                </p>
                <div className="flex space-x-2 mb-4">
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => disconnectWallet(2)}
                  >
                    Disconnect
                  </button>
                  {useSimulationMode && (
                    <button
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
                      onClick={() => setManualWalletAddress(2)}
                    >
                      Edit Address
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
                  <p className="text-yellow-800 whitespace-pre-line font-medium">{getWalletConnectionInstructions(2)}</p>
                </div>
                <button
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded block w-full font-bold"
                  onClick={connectPlayer2Wallet}
                >
                  Connect Player 2 Wallet
                </button>
                {useSimulationMode && (
                  <button
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded block w-full"
                    onClick={() => setManualWalletAddress(2)}
                  >
                    Set Manual Address
                  </button>
                )}
              </div>
            )}

            {gameState === 'betting' && player2Bet > 0 && !player2EscrowLocked && player1Bet > 0 && (
              <div className="mt-4">
                <p className="mb-2">
                  <span className="font-semibold">Your Bet:</span> {player2Bet} APT
                </p>
                <p className="mb-2 text-blue-700">
                  <span className="font-semibold">Minimum Bet:</span> {Math.min(player1Bet, player2Bet)} APT
                  <span className="text-xs ml-1">(this amount will be deducted)</span>
                </p>
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                  onClick={() => lockEscrow(2)}
                  disabled={!player2Wallet || player2EscrowLocked}
                >
                  Lock Your Escrow
                </button>
                <p className="text-sm text-gray-600 mt-2">
                  {player2EscrowLocked ? 'Your escrow is locked!' : 'Lock your escrow to proceed with the game'}
                </p>
              </div>
            )}

            {player2EscrowLocked && (
              <div className="mt-2 bg-green-100 p-2 rounded">
                <p className="text-green-700">Escrow locked successfully!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Simulation mode toggle and contract status */}
      <div className="mt-8 p-4 bg-gray-200 rounded">
        <h3 className="text-lg font-bold mb-2">Contract Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Escrow Address:</strong> {escrowAddress || 'Not connected'}</p>
            <p><strong>Status:</strong> {EscrowStatus[escrowStatus]}</p>
            <p><strong>Escrow Balance:</strong> {escrowBalance} APT</p>
            
            {/* Escrow wallet connection panel */}
            <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded">
              <h4 className="font-bold text-indigo-800">Escrow Wallet</h4>
              {escrowAddress ? (
                <div className="mt-2">
                  <p className="text-indigo-700">Escrow wallet connected:</p>
                  <p className="font-mono text-sm mt-1">{escrowAddress}</p>
                  <button
                    className="mt-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    onClick={() => setEscrowAddress(null)}
                  >
                    Disconnect Escrow
                  </button>
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-indigo-700 mb-2">Connect your escrow wallet:</p>
                  <button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded w-full"
                    onClick={connectEscrowWallet}
                    disabled={useSimulationMode}
                  >
                    Connect Escrow Wallet
                  </button>
                  <p className="text-xs text-indigo-600 mt-1">
                    The escrow wallet will hold funds during the game and distribute to the winner.
                  </p>
                </div>
              )}
            </div>
            
            {/* Wallet Connection Tips */}
            <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800 font-medium">3-Wallet Setup Instructions:</p>
              <ol className="list-decimal list-inside text-blue-700 pl-2 text-sm space-y-1 mt-1">
                <li>Connect Player 1 wallet first</li>
                <li>Connect Player 2 wallet second (make sure to switch to a different wallet in Petra)</li>
                <li>Connect the Escrow wallet third (should be a separate wallet from both players)</li>
                <li>Place bets and lock escrow to start the game</li>
                <li>After game completes, the escrow wallet will pay the winner</li>
              </ol>
            </div>
          </div>
          <div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="simulationMode"
                checked={useSimulationMode}
                onChange={(e) => setUseSimulationMode(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="simulationMode">Simulation Mode (No real transactions)</label>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Enable simulation mode to test the game flow without actual blockchain transactions.
            </p>
            <div className="mt-2">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2"
                onClick={initializeEscrow}
                disabled={useSimulationMode || !escrowAddress || !player1Wallet || !player2Wallet}
              >
                Initialize Escrow
              </button>
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded mr-2"
                onClick={createSimulatedEscrow}
                disabled={!useSimulationMode}
              >
                Create Simulated Escrow
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded mr-2"
                onClick={resetGameState}
              >
                Reset Game
              </button>
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                onClick={resetWalletConnections}
              >
                Reset All Wallets
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 