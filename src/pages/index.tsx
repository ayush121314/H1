import { useEffect } from 'react';
import Head from 'next/head';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { GameDashboard } from '../components/GameDashboard';
import LoadingComponent from '../components/LoadingComponent';
import PlayerPanel from '../components/PlayerPanel';
import ChessGamePanel from '../components/ChessGamePanel';
import EscrowPanel from '../components/EscrowPanel';
import { transferToEscrow } from '../utils/transactions';

// Import custom hooks
import { useWalletConnection } from '../hooks/useWalletConnection';
import { useEscrow } from '../hooks/useEscrow';
import { useChessGame } from '../hooks/useChessGame';
import { useBetting } from '../hooks/useBetting';

// Add type declarations for the window.aptos object
declare global {
  interface Window {
    aptos: any;
  }
}

export default function Home() {
  // Use wallet adapter from Aptos
  const { signAndSubmitTransaction, disconnect, connected, account } = useWallet();
  
  // Use our custom hooks for different aspects of the application
  const walletHook = useWalletConnection();
  const escrowHook = useEscrow();
  const gameHook = useChessGame();
  const bettingHook = useBetting();

  // Initialize escrow when both wallets are connected
  useEffect(() => {
    if (walletHook.player1Wallet && walletHook.player2Wallet && !escrowHook.escrowAddress && !walletHook.isLoading) {
      console.log("Both wallets connected, initializing escrow");
      
      // In simulation mode, create a simulated escrow automatically
      if (escrowHook.useSimulationMode) {
        escrowHook.createSimulatedEscrow();
      }
    }
  }, [walletHook.player1Wallet, walletHook.player2Wallet, escrowHook.escrowAddress, walletHook.isLoading, escrowHook.useSimulationMode]);

  // Check if both players have locked their escrow and start the game if they have
  useEffect(() => {
    if (escrowHook.player1EscrowLocked && escrowHook.player2EscrowLocked && gameHook.gameState !== 'playing') {
      // Calculate final bet amount
      const minBetAmount = Math.min(bettingHook.player1Bet, bettingHook.player2Bet);
      bettingHook.setFinalBetAmount(minBetAmount * 2);
      
      // Update escrow status
      escrowHook.setEscrowLocked(true);
      
      // Start the game
      gameHook.setGameState('playing');
    }
  }, [escrowHook.player1EscrowLocked, escrowHook.player2EscrowLocked, gameHook.gameState, bettingHook]);

  // Handle escrow locking from a player
  const handleLockEscrow = async (playerNumber: 1 | 2) => {
    // Use the escrow hook to lock the escrow
    const result = await escrowHook.lockEscrow(
      playerNumber,
      walletHook.player1Wallet,
      walletHook.player2Wallet,
      bettingHook.player1Bet,
      bettingHook.player2Bet,
      walletHook.ensureCorrectWalletConnected,
      walletHook.getAccountBalance,
      async (playerNumber, amount, targetAddress) => {
        return transferToEscrow(playerNumber, amount, targetAddress, escrowHook.useSimulationMode);
      }
    );

    // If the lock was successful and it was a simulation, update player wallet balances
    if (result.wasLocked && escrowHook.useSimulationMode) {
      const minimumBet = Math.min(bettingHook.player1Bet, bettingHook.player2Bet);
      
      // Reduce the balance of the player who locked
      if (playerNumber === 1 && walletHook.player1Wallet) {
        walletHook.player1Wallet.balance -= minimumBet;
      } else if (playerNumber === 2 && walletHook.player2Wallet) {
        walletHook.player2Wallet.balance -= minimumBet;
      }
    }
  };

  // Announce bets
  const handleAnnounceUnifiedBet = () => {
    bettingHook.announceUnifiedBet(
      walletHook.player1Wallet,
      walletHook.player2Wallet,
      () => gameHook.setGameState('betting')
    );
  };

  // Forfeit the current game
  const handleForfeit = () => {
    const currentPlayerNumber = gameHook.currentPlayer === 'white' ? 1 : 2;
    const winner = gameHook.forfeitGame(currentPlayerNumber);
    
    if (winner) {
      handleGameEnd(winner);
    }
  };

  // Handle game end and payments
  const handleGameEnd = async (winnerParam?: 'player1' | 'player2' | 'draw' | null) => {
    // Determine the winner
    const winner = winnerParam || gameHook.handleGameEnd();
    
    // Pay the winner if escrow is locked
    if (escrowHook.escrowLocked) {
      await escrowHook.payWinner(
        winner,
        walletHook.player1Wallet,
        walletHook.player2Wallet,
        bettingHook.player1Bet,
        bettingHook.player2Bet,
        bettingHook.finalBetAmount,
        walletHook.getAccountBalance
      );
      
      // If we're in simulation mode, update the player balances accordingly
      if (escrowHook.useSimulationMode) {
        if (winner === 'draw') {
          // Return the bets to each player
          if (walletHook.player1Wallet) {
            walletHook.player1Wallet.balance += bettingHook.player1Bet;
          }
          
          if (walletHook.player2Wallet) {
            walletHook.player2Wallet.balance += bettingHook.player2Bet;
          }
        } else {
          // Give the full pot to the winner
          if (winner === 'player1' && walletHook.player1Wallet) {
            walletHook.player1Wallet.balance += bettingHook.finalBetAmount;
          } else if (winner === 'player2' && walletHook.player2Wallet) {
            walletHook.player2Wallet.balance += bettingHook.finalBetAmount;
          }
        }
      }
    }
    
    // Reset the game state after a delay
    setTimeout(() => {
      resetAllState();
    }, 3000);
  };

  // Reset all state
  const resetAllState = () => {
    gameHook.resetGameState();
    bettingHook.resetBettingState();
    escrowHook.resetEscrowState();
  };

  // Start a new game
  const handleStartNewGame = () => {
    gameHook.startNewGame();
    bettingHook.resetBettingState();
    escrowHook.resetEscrowState();
  };

  // Initialize escrow contract
  const handleInitializeEscrow = () => {
    escrowHook.initializeEscrow(walletHook.player1Wallet, walletHook.player2Wallet);
  };

  // Show error panel if there's an error
  const error = walletHook.error || escrowHook.error || bettingHook.error;
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-3">
            <button 
              onClick={() => {
                walletHook.setError(null);
                escrowHook.setError(null);
                bettingHook.setError(null);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Dismiss
            </button>
            <button 
              onClick={walletHook.resetWalletConnections}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Reset Wallet Connections
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  const isLoading = walletHook.isLoading || escrowHook.isLoading || bettingHook.isLoading;
  if (isLoading) {
    return <LoadingComponent />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Chess Game with Aptos</title>
        <meta name="description" content="Play chess with Aptos blockchain integration" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-3xl font-bold text-center mb-8">Chess Game with Aptos</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left panel - Player 1 */}
        <PlayerPanel 
          playerNumber={1}
          playerWallet={walletHook.player1Wallet}
          playerBet={bettingHook.player1Bet}
          playerEscrowLocked={escrowHook.player1EscrowLocked}
          otherPlayerBet={bettingHook.player2Bet}
          gameState={gameHook.gameState}
          useSimulationMode={escrowHook.useSimulationMode}
          onConnectWallet={walletHook.connectPlayerWallet}
          onDisconnectWallet={walletHook.disconnectWallet}
          onSetManualWalletAddress={walletHook.setManualWalletAddress}
          onLockEscrow={() => handleLockEscrow(1)}
        />
          
        {/* Middle panel - Game */}
        <ChessGamePanel
          game={gameHook.game}
          gameState={gameHook.gameState}
          currentPlayer={gameHook.currentPlayer}
          winner={gameHook.winner}
          finalBetAmount={bettingHook.finalBetAmount}
          player1Wallet={walletHook.player1Wallet}
          player2Wallet={walletHook.player2Wallet}
          player1Bet={bettingHook.player1Bet}
          player2Bet={bettingHook.player2Bet}
          onDrop={gameHook.onDrop}
          onAnnounceUnifiedBet={handleAnnounceUnifiedBet}
          onStartNewGame={handleStartNewGame}
          onForfeit={handleForfeit}
          onPlayer1BetChange={bettingHook.setPlayer1Bet}
          onPlayer2BetChange={bettingHook.setPlayer2Bet}
        />
          
        {/* Right panel - Player 2 */}
        <PlayerPanel 
          playerNumber={2}
          playerWallet={walletHook.player2Wallet}
          playerBet={bettingHook.player2Bet}
          playerEscrowLocked={escrowHook.player2EscrowLocked}
          otherPlayerBet={bettingHook.player1Bet}
          gameState={gameHook.gameState}
          useSimulationMode={escrowHook.useSimulationMode}
          onConnectWallet={() => walletHook.connectPlayer2Wallet()}
          onDisconnectWallet={walletHook.disconnectWallet}
          onSetManualWalletAddress={walletHook.setManualWalletAddress}
          onLockEscrow={() => handleLockEscrow(2)}
        />
      </div>

      {/* Contract status panel */}
      <EscrowPanel 
        escrowAddress={escrowHook.escrowAddress}
        escrowStatus={escrowHook.escrowStatus}
        escrowBalance={escrowHook.escrowBalance}
        useSimulationMode={escrowHook.useSimulationMode}
        setUseSimulationMode={escrowHook.setUseSimulationMode}
        onConnectEscrowWallet={escrowHook.connectEscrowWallet}
        onDisconnectEscrow={() => escrowHook.setEscrowAddress(null)}
        onCreateSimulatedEscrow={escrowHook.createSimulatedEscrow}
        onInitializeEscrow={handleInitializeEscrow}
        onResetGame={resetAllState}
        onResetWallets={walletHook.resetWalletConnections}
      />
    </div>
  );
} 