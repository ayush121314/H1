import React, { useState, useEffect } from 'react';

interface PlayerWalletInfo {
  address: string;
  balance: number;
}

interface BettingInterfaceProps {
  wallet: PlayerWalletInfo | null;
  gameState: string;
  betAmount: number;
  opponentBet: number;
  placeBet: (amount: number) => void;
  disabled: boolean;
  playerName: string;
}

type GameState = 'waiting' | 'betting' | 'bet_announced' | 'escrow_locked' | 'playing' | 'completed';

const BettingInterface: React.FC<BettingInterfaceProps> = ({
  wallet,
  gameState,
  betAmount,
  opponentBet,
  placeBet,
  disabled,
  playerName,
}) => {
  const [inputAmount, setInputAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Pre-fill the input field with opponent's bet amount
    if (opponentBet > 0 && betAmount === 0) {
      setInputAmount(opponentBet.toString());
    }
  }, [opponentBet, betAmount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputAmount(e.target.value);
    setError(null);
  };

  const handleBet = () => {
    const amount = parseFloat(inputAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid bet amount');
      return;
    }
    
    // Check if player has sufficient balance
    if (wallet && amount > wallet.balance) {
      setError(`Insufficient balance. You have ${wallet.balance.toFixed(4)} APT`);
      return;
    }
    
    // Place the bet
    placeBet(amount);
  };

  if (!wallet) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">{playerName}</h3>
        <p className="text-sm text-gray-500">Please connect wallet</p>
      </div>
    );
  }

  if (betAmount > 0) {
    return (
      <div className="p-4 border border-green-200 rounded-lg bg-green-50">
        <h3 className="text-lg font-semibold mb-2">{playerName}</h3>
        <div className="text-center">
          <span className="text-sm text-gray-600">Bet placed:</span>
          <div className="text-lg font-bold text-green-800">{betAmount.toFixed(4)} APT</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">{playerName}</h3>
      
      <div className="mb-2 text-sm text-gray-600">
        <span>Balance: </span>
        <span className="font-semibold">{wallet.balance.toFixed(4)} APT</span>
      </div>
      
      {gameState === 'waiting' || gameState === 'betting' ? (
        <div>
          <div className="mb-3">
            <label htmlFor={`betAmount-${playerName}`} className="text-sm text-gray-600 block mb-1">
              Bet Amount (APT)
            </label>
            <input
              id={`betAmount-${playerName}`}
              type="number"
              step="0.01"
              min="0.01"
              value={inputAmount}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="0.00"
              disabled={disabled}
            />
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>
          
          <button 
            onClick={handleBet}
            disabled={disabled || !inputAmount}
            className={`w-full py-2 rounded-lg text-sm font-medium ${
              disabled ? 'bg-gray-300 text-gray-500' : 'bg-primary text-white hover:bg-primary/80'
            }`}
          >
            Place Bet
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Betting not available</p>
      )}
    </div>
  );
};

export default BettingInterface; 