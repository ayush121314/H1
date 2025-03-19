import React from 'react';
import Layout from './Layout';
import { GameDashboard } from './GameDashboard';
import PlayerPanel from './PlayerPanel';
import ChessGamePanel from './ChessGamePanel';

// Mock data for demonstration
const mockData = {
  gameState: 'playing',
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
  // These would normally be implemented with actual state and logic
  const handleDrop = (sourceSquare: string, targetSquare: string) => {
    console.log(`Move from ${sourceSquare} to ${targetSquare}`);
    return true;
  };

  const handleAnnounceUnifiedBet = () => {
    console.log('Announcing unified bet');
  };

  const handleStartNewGame = () => {
    console.log('Starting new game');
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

  return (
    <Layout currentPage="game">
      <div className="game-section">
        <div className="chess-container">
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
        
        <div className="side-panels">
          <PlayerPanel
            playerNumber={1}
            playerWallet={mockData.player1Wallet as any}
            playerBet={mockData.player1Bet}
            playerEscrowLocked={mockData.player1EscrowLocked}
            otherPlayerBet={mockData.player2Bet}
            gameState={mockData.gameState}
            useSimulationMode={true}
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
            useSimulationMode={true}
            onConnectWallet={() => handleConnectWallet(2)}
            onDisconnectWallet={() => handleDisconnectWallet(2)}
            onSetManualWalletAddress={() => handleSetManualWalletAddress(2)}
            onLockEscrow={() => handleLockEscrow(2)}
          />
        </div>
      </div>
    </Layout>
  );
};

export default GamePage;