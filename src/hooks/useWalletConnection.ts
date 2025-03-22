import { useState, useCallback } from 'react';
import { AptosClient } from 'aptos';
import { PlayerWalletInfo } from '../types/game';

// Define hook for wallet connection management
export function useWalletConnection() {
  const [player1Wallet, setPlayer1Wallet] = useState<PlayerWalletInfo | null>(null);
  const [player2Wallet, setPlayer2Wallet] = useState<PlayerWalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [client] = useState<AptosClient>(new AptosClient('https://fullnode.testnet.aptoslabs.com/v1'));

  // Get wallet balance
  const getAccountBalance = useCallback(async (address: string): Promise<number> => {
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
  }, [client]);

  // Connect player wallet
  const connectPlayerWallet = useCallback(async (playerNumber: 1 | 2) => {
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
            // Block connection with error instead of asking for confirmation
            window.alert(
              `Error: This wallet (${response.address.substring(0, 6)}...${response.address.substring(response.address.length - 4)}) is already connected as Player ${playerNumber === 1 ? '2' : '1'}.\n\n` +
              `Please connect a different wallet for Player ${playerNumber}. Go to your Petra extension and switch accounts first.`
            );
            
            throw new Error(`Cannot use the same wallet for both players. Please connect a different wallet for Player ${playerNumber}.`);
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
  }, [player1Wallet, player2Wallet, isLoading, getAccountBalance]);

  // Connect Player 2 Wallet with special handling
  const connectPlayer2Wallet = useCallback(async () => {
    // Show detailed instructions for switching wallets
    if (player1Wallet) {
      const walletPreface = player1Wallet.address.substring(0, 6) + "..." + 
                           player1Wallet.address.substring(player1Wallet.address.length - 4);
      
      window.alert(
        `You're about to connect Player 2's wallet.\n\n` + 
        `Player 1 is currently using wallet: ${walletPreface}\n\n` +
        `IMPORTANT: Please make sure you've switched to a DIFFERENT wallet in your Petra extension before proceeding.`
      );
    }
    
    // Now try to connect Player 2's wallet
    connectPlayerWallet(2);
  }, [player1Wallet, connectPlayerWallet]);

  // Disconnect wallet
  const disconnectWallet = useCallback((playerNumber: 1 | 2) => {
    if (playerNumber === 1) {
      setPlayer1Wallet(null);
    } else {
      setPlayer2Wallet(null);
    }
    
    // Try to disconnect from the Petra wallet if available
    if (window && window.aptos && typeof window.aptos.disconnect === 'function') {
      window.aptos.disconnect().catch(console.error);
    }
  }, []);

  // Reset all wallet connections
  const resetWalletConnections = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Resetting wallet connections...");
      
      // Disconnect if possible
      if (window && window.aptos && typeof window.aptos.disconnect === 'function') {
        await window.aptos.disconnect().catch(console.error);
      }
      
      // Reset state
      setPlayer1Wallet(null);
      setPlayer2Wallet(null);
      
      console.log("Wallet connections reset successfully");
    } catch (error: any) {
      console.error("Error resetting wallet connections:", error);
      setError("Failed to reset wallet connections. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set a manual wallet address (for simulation)
  const setManualWalletAddress = useCallback((playerNumber: 1 | 2) => {
    // Prompt user for wallet address
    const address = window.prompt(`Enter wallet address for Player ${playerNumber}:`);
    
    if (!address || address.trim() === '') {
      console.log("No address provided, cancelling manual wallet setup");
      return;
    }
    
    try {
      console.log(`Setting manual wallet address for Player ${playerNumber}: ${address}`);
      
      // Check if this wallet is already connected as the other player
      const otherPlayerWallet = playerNumber === 1 ? player2Wallet : player1Wallet;
      if (otherPlayerWallet && otherPlayerWallet.address === address.trim()) {
        window.alert(
          `Error: This wallet address is already connected as Player ${playerNumber === 1 ? '2' : '1'}.\n\n` +
          `Please enter a different address for Player ${playerNumber}.`
        );
        return;
      }
      
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
      
    } catch (error: any) {
      console.error(`Error setting manual wallet for Player ${playerNumber}:`, error);
      setError(error.message || `Failed to set manual wallet for Player ${playerNumber}`);
    }
  }, [player1Wallet, player2Wallet]);

  // Function to ensure the correct wallet is connected
  const ensureCorrectWalletConnected = useCallback(async (playerNumber: 1 | 2) => {
    console.log(`Ensuring wallet for Player ${playerNumber} is connected`);
    
    try {
      console.log(`Attempting to connect to Player ${playerNumber}'s wallet`);
      
      // Get the expected wallet address for this player
      const expectedWallet = playerNumber === 1 ? player1Wallet : player2Wallet;
      
      if (!expectedWallet) {
        window.alert(`Player ${playerNumber}'s wallet is not connected yet. Please connect it first.`);
        return false;
      }
      
      // Prompt user to switch to the correct wallet
      window.alert(`Please make sure Player ${playerNumber}'s wallet (${expectedWallet.address.substring(0, 6)}...${expectedWallet.address.substring(expectedWallet.address.length - 4)}) is selected in your Petra extension.`);
      
      const response = await window.aptos.connect();
      if (response && response.address) {
        console.log(`Connected to wallet with address: ${response.address}`);
        
        // Verify the connected wallet matches the expected player's wallet
        if (response.address !== expectedWallet.address) {
          window.alert(`Error: Wrong wallet connected. Expected Player ${playerNumber}'s wallet (${expectedWallet.address.substring(0, 6)}...${expectedWallet.address.substring(expectedWallet.address.length - 4)}) but got a different wallet (${response.address.substring(0, 6)}...${response.address.substring(response.address.length - 4)}).`);
          console.error(`Wrong wallet connected. Expected ${expectedWallet.address} but got ${response.address}`);
          return false;
        }
        
        return true;
      } else {
        console.error("Failed to get wallet address");
        return false;
      }
    } catch (error) {
      console.error(`Error connecting to Player ${playerNumber}'s wallet:`, error);
      return false;
    }
  }, [player1Wallet, player2Wallet]);

  return {
    player1Wallet,
    player2Wallet,
    isLoading,
    error,
    setError,
    getAccountBalance,
    connectPlayerWallet,
    connectPlayer2Wallet,
    disconnectWallet,
    resetWalletConnections,
    setManualWalletAddress,
    ensureCorrectWalletConnected,
    client
  };
} 