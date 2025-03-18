import React, { useState } from 'react';

// Define same GameState type as in other components
type GameState = 'waiting' | 'betting' | 'playing' | 'completed';

interface BettingInterfaceProps {
  wallet: any;
  gameState: GameState;
  betAmount: number;
  opponentBet: number;
  placeBet: (amount: number) => void;
  disabled?: boolean;
  playerName?: string;
}

const BettingInterface: React.FC<BettingInterfaceProps> = ({
  wallet,
  gameState,
  betAmount,
  opponentBet,
  placeBet,
  disabled = false,
  playerName = 'Player'
}) => {
  const [inputAmount, setInputAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimals
    if (/^\d*\.?\d*$/.test(value)) {
      setInputAmount(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputAmount || parseFloat(inputAmount) <= 0) return;

    setIsProcessing(true);
    try {
      // In a real implementation, this would call a smart contract
      // For demo purposes, we're just simulating the bet placement
      
      // Simulate blockchain transaction delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Process the bet
      placeBet(parseFloat(inputAmount));
      setInputAmount('');
    } catch (error) {
      console.error('Error placing bet:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // If this player has already bet or betting is disabled
  if (betAmount > 0 || disabled) {
    return (
      <div className="p-3 bg-gray-100 rounded text-center">
        <div className="text-sm font-medium mb-1">{playerName}'s Bet</div>
        <div className="text-lg font-bold">{betAmount > 0 ? `${betAmount.toFixed(4)} ETH` : 'Waiting...'}</div>
      </div>
    );
  }

  return (
    <div className="p-3 border rounded">
      <div className="text-sm font-medium mb-2">{playerName}'s Bet</div>
      
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={inputAmount}
          onChange={handleInputChange}
          placeholder="0.1"
          className="input-field w-full text-sm p-2"
          disabled={isProcessing || !wallet}
        />
        <button
          type="submit"
          className="btn-primary w-full text-sm py-1"
          disabled={isProcessing || !wallet || !inputAmount || parseFloat(inputAmount) <= 0}
        >
          {isProcessing ? 'Processing...' : 'Place Bet'}
        </button>
      </form>
    </div>
  );
};

export default BettingInterface; 