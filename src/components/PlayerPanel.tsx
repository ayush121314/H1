import React from 'react';
import { PlayerWalletInfo } from '../types/game';
import { formatWalletAddress, getWalletConnectionInstructions } from '../utils/transactions';

interface PlayerPanelProps {
  playerNumber: 1 | 2;
  playerWallet: PlayerWalletInfo | null;
  playerBet: number;
  playerEscrowLocked: boolean;
  otherPlayerBet: number;
  gameState: string;
  useSimulationMode: boolean;
  onConnectWallet: (playerNumber: 1 | 2) => void;
  onDisconnectWallet: (playerNumber: 1 | 2) => void;
  onSetManualWalletAddress: (playerNumber: 1 | 2) => void;
  onLockEscrow: (playerNumber: 1 | 2) => void;
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({
  playerNumber,
  playerWallet,
  playerBet,
  playerEscrowLocked,
  otherPlayerBet,
  gameState,
  useSimulationMode,
  onConnectWallet,
  onDisconnectWallet,
  onSetManualWalletAddress,
  onLockEscrow
}) => {
  // Calculate minimum bet between the players
  const minimumBet = Math.min(playerBet > 0 ? playerBet : Infinity, otherPlayerBet > 0 ? otherPlayerBet : Infinity);
  
  return (
    <div className={`player-panel p-4 ${playerNumber === 1 ? 'bg-gradient-to-br from-primary-900/20 to-primary-800/10' : 'bg-gradient-to-br from-secondary-900/20 to-secondary-800/10'}`}>
      {/* Header with player info */}
      <div className="flex items-center mb-3">
        <div className={`w-3 h-3 rounded-full ${playerNumber === 1 ? 'bg-primary-500' : 'bg-secondary-500'} mr-2`}></div>
        <h3 className="text-lg font-bold flex items-center">
          Player {playerNumber} 
          <span className="text-gray-400 text-sm font-normal ml-2">
            ({playerNumber === 1 ? 'White' : 'Black'})
          </span>
        </h3>
      </div>
      
      {/* Connected wallet info or connect button */}
      {playerWallet ? (
        <div className="glass-card p-3 bg-dark-800/80 mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-300">Wallet</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${playerNumber === 1 ? 'bg-primary-900/30 text-primary-400' : 'bg-secondary-900/30 text-secondary-400'}`}>
              Connected
            </span>
          </div>
          
          <div className="flex items-center mb-2">
            <svg className={`w-4 h-4 mr-2 ${playerNumber === 1 ? 'text-primary-400' : 'text-secondary-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="font-mono text-xs text-gray-300" title={playerWallet.address}>
              {formatWalletAddress(playerWallet.address)}
            </p>
          </div>
          
          <div className="flex justify-between items-center text-sm mb-3">
            <span className="text-gray-400">Balance:</span>
            <span className={`font-mono font-medium ${playerNumber === 1 ? 'text-primary-400' : 'text-secondary-400'}`}>
              {playerWallet.balance} APT
            </span>
          </div>
          
          <div className="flex space-x-2">
            <button 
              className="btn-outline text-error-400 border-error-600 hover:bg-error-900/20 py-1 px-3 text-sm flex-1"
              onClick={() => onDisconnectWallet(playerNumber)}
            >
              Disconnect
            </button>
            {useSimulationMode && (
              <button
                className="btn-ghost py-1 px-3 text-sm"
                onClick={() => onSetManualWalletAddress(playerNumber)}
              >
                Edit
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-card p-3 bg-dark-800/80 mb-3">
          <p className="text-sm text-gray-400 mb-3">
            {getWalletConnectionInstructions(playerNumber)}
          </p>
          <button
            className={`btn w-full ${playerNumber === 1 ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onConnectWallet(playerNumber)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Connect Player {playerNumber}
          </button>
        </div>
      )}

      {/* Betting and escrow info */}
      {gameState === 'betting' && playerBet > 0 && !playerEscrowLocked && otherPlayerBet > 0 && (
        <div className={`glass-card p-3 ${playerNumber === 1 ? 'bg-primary-900/10' : 'bg-secondary-900/10'}`}>
          <div className="flex justify-between mb-2 text-sm">
            <span className="font-medium text-gray-300">Your Bet:</span>
            <span className={`font-mono font-medium ${playerNumber === 1 ? 'text-primary-400' : 'text-secondary-400'}`}>
              {playerBet} APT
            </span>
          </div>
          <div className="flex justify-between mb-3 text-sm">
            <span className="font-medium">Minimum:</span>
            <div className="text-right">
              <span className={`font-mono font-medium ${playerNumber === 1 ? 'text-primary-400' : 'text-secondary-400'}`}>
                {minimumBet === Infinity ? 0 : minimumBet} APT
              </span>
            </div>
          </div>
          
          <button
            className="btn-accent w-full flex items-center justify-center py-1.5 text-sm"
            onClick={() => onLockEscrow(playerNumber)}
            disabled={!playerWallet || playerEscrowLocked}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Lock Escrow
          </button>
        </div>
      )}

      {/* Escrow lock confirmation */}
      {playerEscrowLocked && (
        <div className="glass-card p-3 bg-accent-900/10 border border-accent-800/30">
          <div className="flex items-center text-accent-400 text-sm">
            <svg className="w-4 h-4 mr-1 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-medium">Escrow locked!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerPanel; 