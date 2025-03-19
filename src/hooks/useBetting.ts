import { useState, useCallback } from 'react';
import { PlayerWalletInfo } from '../types/game';

export function useBetting() {
  // Betting state
  const [player1Bet, setPlayer1Bet] = useState<number>(0);
  const [player2Bet, setPlayer2Bet] = useState<number>(0);
  const [finalBetAmount, setFinalBetAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate minimum bet
  const getMinimumBet = useCallback(() => {
    if (player1Bet <= 0 || player2Bet <= 0) return 0;
    return Math.min(player1Bet, player2Bet);
  }, [player1Bet, player2Bet]);

  // Announce bets for both players and calculate minimum
  const announceUnifiedBet = useCallback(async (
    player1Wallet: PlayerWalletInfo | null,
    player2Wallet: PlayerWalletInfo | null,
    onBetsAnnounced: () => void
  ) => {
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
      
      // Call the callback function to update game state
      onBetsAnnounced();
      
      console.log('Unified bet announcement successful');
      
    } catch (error: any) {
      console.error('Error announcing unified bet:', error);
      setError(error.message || 'Failed to announce unified bet');
    } finally {
      setIsLoading(false);
    }
  }, [player1Bet, player2Bet]);

  // Transfer funds between wallets (for simulation)
  const updatePlayerBalance = useCallback((
    playerNumber: 1 | 2,
    amount: number,
    player1Wallet: PlayerWalletInfo | null,
    player2Wallet: PlayerWalletInfo | null,
    setPlayer1Wallet: (wallet: PlayerWalletInfo | null) => void,
    setPlayer2Wallet: (wallet: PlayerWalletInfo | null) => void
  ) => {
    if (playerNumber === 1 && player1Wallet) {
      setPlayer1Wallet({
        ...player1Wallet,
        balance: player1Wallet.balance + amount
      });
    } else if (playerNumber === 2 && player2Wallet) {
      setPlayer2Wallet({
        ...player2Wallet,
        balance: player2Wallet.balance + amount
      });
    }
  }, []);

  // Reset betting state
  const resetBettingState = useCallback(() => {
    setPlayer1Bet(0);
    setPlayer2Bet(0);
    setFinalBetAmount(0);
  }, []);

  return {
    player1Bet,
    setPlayer1Bet,
    player2Bet,
    setPlayer2Bet,
    finalBetAmount,
    setFinalBetAmount,
    isLoading,
    error,
    setError,
    getMinimumBet,
    announceUnifiedBet,
    updatePlayerBalance,
    resetBettingState
  };
} 