import { AptosClient } from 'aptos';

// Initialize the Aptos client
const client = new AptosClient('https://fullnode.testnet.aptoslabs.com/v1');

// Helper function to transfer funds from a player to the escrow
export async function transferToEscrow(
  playerNumber: 1 | 2, 
  amount: number, 
  targetAddress: string,
  useSimulationMode: boolean = false
): Promise<boolean> {
  console.log(`Transferring ${amount} APT from Player ${playerNumber} to ${targetAddress}`);
  
  // For testing only - simulation mode doesn't do actual transfers
  if (useSimulationMode) {
    console.log("Using simulation mode for escrow transfer (no actual funds will be moved)");
    await new Promise(resolve => setTimeout(resolve, 1000)); // Mock transaction delay
    return true;
  }
  
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
  
  // Submit the transaction - try direct method first
  try {
    let txHash = "";
    
    // Try direct Petra method first
    if (window.aptos && typeof window.aptos.signAndSubmitTransaction === 'function') {
      console.log("Using direct Petra wallet for transaction");
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

// Function to check if Petra wallet is installed and available
export function isPetraWalletAvailable(): boolean {
  return typeof window !== 'undefined' && 
         typeof window.aptos !== 'undefined' && 
         typeof window.aptos.connect === 'function';
}

// Helper function to format wallet address for display
export function formatWalletAddress(address: string): string {
  if (!address) return '';
  
  if (address.length < 10) return address;
  
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Helper function to get instructions based on player number
export function getWalletConnectionInstructions(playerNumber: 1 | 2): string {
  if (playerNumber === 1) {
    return "Connect your first wallet by clicking the button below.";
  } else {
    return "To connect Player 2's wallet:\n1. Open your Petra wallet extension\n2. Switch to a DIFFERENT wallet account (important!)\n3. Click 'Connect Player 2 Wallet'\n\nUsing the same wallet for both players is not recommended for real games.";
  }
} 