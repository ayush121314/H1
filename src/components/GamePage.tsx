import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { GameDashboard } from './GameDashboard';
import PlayerPanel from './PlayerPanel';
import ChessGamePanel from './ChessGamePanel';
import AIAgentPanel from './AIAgentPanel';
import TrainingPanel from './TrainingPanel';
import EscrowPanel from './EscrowPanel';
import { trainingAgentService } from '../agent/TrainingAgentService';

// Mock data for demonstration
const mockData = {
  gameState: 'waiting', // Changed to 'waiting' to ensure toggles are enabled
  player1Wallet: { address: '0x1234567890123456789012345678901234567890', balance: 75 },
  player2Wallet: { address: '0x2345678901234567890123456789012345678901', balance: 60 },
  player1Bet: 15,
  player2Bet: 10,
  player1EscrowLocked: true,
  player2EscrowLocked: true,
  escrowLocked: true,
  finalBetAmount: 20,
  winner: null,
  currentPlayer: 'white',
  game: {
    fen: () => 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' // Starting position
  }
};

const GamePage: React.FC = () => {
  // Add state for AI betting agent and training mode
  const [aiEnabled, setAiEnabled] = useState(false);
  const [useSimulationMode, setUseSimulationMode] = useState(true);
  const [trainingModeEnabled, setTrainingModeEnabled] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | undefined>(undefined);
  
  // Enable/disable the training agent when training mode is toggled
  useEffect(() => {
    trainingAgentService.setEnabled(trainingModeEnabled);
  }, [trainingModeEnabled]);
  
  // These would normally be implemented with actual state and logic
  const handleDrop = (sourceSquare: string, targetSquare: string) => {
    console.log(`Move from ${sourceSquare} to ${targetSquare}`);
    // Set the last move for training mode analysis
    setLastMove({ from: sourceSquare, to: targetSquare });
    return true;
  };

  const handleSuggestMove = (move: { from: string; to: string; promotion?: string }) => {
    console.log(`Suggesting move from ${move.from} to ${move.to}`);
    // In a real implementation, this would highlight the suggested move on the board
  };

  const handleAnnounceUnifiedBet = () => {
    console.log('Announcing unified bet');
  };

  const handleStartNewGame = () => {
    console.log('Starting new game');
    // Reset the last move for training mode
    setLastMove(undefined);
  };

  const handleForfeit = () => {
    console.log('Forfeit game');
  };

  const handlePlayerBetChange = (playerNumber: number, amount: number) => {
    console.log(`Player ${playerNumber} bet changed to ${amount}`);
  };

  const handleConnectWallet = (playerNumber: number) => {
    console.log(`Connecting wallet for player ${playerNumber}`);
  };

  const handleDisconnectWallet = (playerNumber: number) => {
    console.log(`Disconnecting wallet for player ${playerNumber}`);
  };

  const handleSetManualWalletAddress = (playerNumber: number) => {
    console.log(`Setting manual wallet address for player ${playerNumber}`);
  };

  const handleLockEscrow = (playerNumber: number) => {
    console.log(`Locking escrow for player ${playerNumber}`);
  };

  const handleConnectEscrowWallet = () => {
    console.log('Connecting escrow wallet');
  };

  const handleDisconnectEscrow = () => {
    console.log('Disconnecting escrow wallet');
  };

  // Debugging - log when component renders
  console.log("GamePage rendering with AI enabled:", aiEnabled, "Training enabled:", trainingModeEnabled);

  return (
    <Layout currentPage="game">
      <div className="container mx-auto p-4">
        {/* Game Dashboard */}
        <div className="mb-6">
          <GameDashboard 
            gameState={mockData.gameState as any}
            player1Wallet={mockData.player1Wallet}
            player2Wallet={mockData.player2Wallet}
            player1Bet={mockData.player1Bet}
            player2Bet={mockData.player2Bet}
            player1EscrowLocked={mockData.player1EscrowLocked}
            player2EscrowLocked={mockData.player2EscrowLocked}
            escrowLocked={mockData.escrowLocked}
            finalBetAmount={mockData.finalBetAmount}
            winner={mockData.winner as any}
          />
        </div>

        {/* Main game layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Side - Controls */}
          <div className="w-full lg:w-80 flex flex-col gap-4">
            <PlayerPanel
              playerNumber={1}
              playerWallet={mockData.player1Wallet as any}
              playerBet={mockData.player1Bet}
              playerEscrowLocked={mockData.player1EscrowLocked}
              otherPlayerBet={mockData.player2Bet}
              gameState={mockData.gameState}
              useSimulationMode={useSimulationMode}
              onConnectWallet={() => handleConnectWallet(1)}
              onDisconnectWallet={() => handleDisconnectWallet(1)}
              onSetManualWalletAddress={() => handleSetManualWalletAddress(1)}
              onLockEscrow={() => handleLockEscrow(1)}
            />
            
            <PlayerPanel
              playerNumber={2}
              playerWallet={mockData.player2Wallet as any}
              playerBet={mockData.player2Bet}
              playerEscrowLocked={mockData.player2EscrowLocked}
              otherPlayerBet={mockData.player1Bet}
              gameState={mockData.gameState}
              useSimulationMode={useSimulationMode}
              onConnectWallet={() => handleConnectWallet(2)}
              onDisconnectWallet={() => handleDisconnectWallet(2)}
              onSetManualWalletAddress={() => handleSetManualWalletAddress(2)}
              onLockEscrow={() => handleLockEscrow(2)}
            />
            
            <EscrowPanel
              escrowAddress={mockData.player1Wallet?.address || null}
              escrowStatus={0}
              escrowBalance={100}
              useSimulationMode={useSimulationMode}
              setUseSimulationMode={setUseSimulationMode}
              onConnectEscrowWallet={handleConnectEscrowWallet}
              onDisconnectEscrow={handleDisconnectEscrow}
              onCreateSimulatedEscrow={() => {}}
              onInitializeEscrow={() => {}}
              onResetGame={handleStartNewGame}
              onResetWallets={() => {}}
            />
          </div>
          
          {/* Right Side - Game Board */}
          <div className="flex-1">
            <ChessGamePanel
              game={mockData.game}
              gameState={mockData.gameState as any}
              currentPlayer={mockData.currentPlayer as any}
              winner={mockData.winner as any}
              finalBetAmount={mockData.finalBetAmount}
              player1Wallet={mockData.player1Wallet}
              player2Wallet={mockData.player2Wallet}
              player1Bet={mockData.player1Bet}
              player2Bet={mockData.player2Bet}
              onDrop={handleDrop}
              onAnnounceUnifiedBet={handleAnnounceUnifiedBet}
              onStartNewGame={handleStartNewGame}
              onForfeit={handleForfeit}
              onPlayer1BetChange={(amount) => handlePlayerBetChange(1, amount)}
              onPlayer2BetChange={(amount) => handlePlayerBetChange(2, amount)}
            />
          </div>
        </div>
        
        {/* AI and Training panels */}
        <div className="mt-6">
          <AIAgentPanel
            aiEnabled={aiEnabled}
            setAiEnabled={setAiEnabled}
            gameState={mockData.gameState as any}
            useSimulationMode={useSimulationMode}
            setUseSimulationMode={setUseSimulationMode}
            trainingModeEnabled={trainingModeEnabled}
            setTrainingModeEnabled={setTrainingModeEnabled}
          />
          
          {trainingModeEnabled && (
            <TrainingPanel
              trainingModeEnabled={trainingModeEnabled}
              fen={mockData.game.fen()}
              lastMove={lastMove}
              onSuggestMove={handleSuggestMove}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default GamePage;