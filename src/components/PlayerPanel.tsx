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
    <div className={`player-panel relative overflow-hidden`}>
      {/* Decorative elements */}
      <div className="absolute -left-10 -top-10 w-32 h-32 rounded-full bg-gradient-to-br from-dark-700 to-dark-800 opacity-20" />
      <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-gradient-to-tr from-dark-700 to-dark-600 opacity-20" />
      
      <div className="relative">
        <div className="flex items-center mb-4">
          <div className={`w-3 h-3 rounded-full ${playerNumber === 1 ? 'bg-primary-500' : 'bg-secondary-500'} mr-2`}></div>
          <h2 className="text-xl font-bold">
            Player {playerNumber} <span className="text-gray-400 font-normal">({playerNumber === 1 ? 'White' : 'Black'})</span>
          </h2>
        </div>
        
        {playerWallet ? (
          <div className="space-y-4">
            <div className="wallet-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 font-medium">Wallet Address</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-primary-900/30 text-primary-400">Connected</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-primary-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <div>
                  <p className="font-mono text-sm text-gray-300" title={playerWallet.address}>
                    {formatWalletAddress(playerWallet.address)}
                  </p>
                  <p className="text-xs text-gray-500">Click to copy</p>
                </div>
              </div>
            </div>
            
            <div className="wallet-card">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-300 font-medium">Balance</span>
                <span className="font-mono text-accent-400 font-medium">{playerWallet.balance} APT</span>
              </div>
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-dark-900">
                  <div 
                    style={{ width: `${Math.min(100, (playerWallet.balance / 100) * 100)}%` }} 
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${playerNumber === 1 ? 'bg-primary-500' : 'bg-secondary-500'}`}>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button 
                className="btn-outline text-error-400 border-error-600 hover:bg-error-900/20"
                onClick={() => onDisconnectWallet(playerNumber)}
              >
                Disconnect
              </button>
              {useSimulationMode && (
                <button
                  className="btn-ghost"
                  onClick={() => onSetManualWalletAddress(playerNumber)}
                >
                  Edit Address
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="glass-card bg-dark-800/50 p-4">
              <p className="text-sm text-gray-400 mb-4 italic">
                {getWalletConnectionInstructions(playerNumber)}
              </p>
              <button
                className={`btn ${playerNumber === 1 ? 'btn-primary' : 'btn-secondary'} w-full`}
                onClick={() => onConnectWallet(playerNumber)}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Connect Player {playerNumber} Wallet
              </button>
              {useSimulationMode && (
                <button
                  className="btn-ghost w-full mt-2"
                  onClick={() => onSetManualWalletAddress(playerNumber)}
                >
                  Set Manual Address
                </button>
              )}
            </div>
          </div>
        )}

        {gameState === 'betting' && playerBet > 0 && !playerEscrowLocked && otherPlayerBet > 0 && (
          <div className="mt-4 glass-card p-4 bg-primary-900/10">
            <div className="flex justify-between mb-2">
              <span className="font-medium text-gray-300">Your Bet:</span>
              <span className="font-mono font-medium text-primary-400">{playerBet} APT</span>
            </div>
            <div className="flex justify-between mb-4 text-primary-400">
              <span className="font-medium">Minimum Bet:</span>
              <div className="text-right">
                <span className="font-mono font-medium">{minimumBet === Infinity ? 0 : minimumBet} APT</span>
                <span className="block text-xs text-primary-500/70">(this amount will be deducted)</span>
              </div>
            </div>
            <button
              className="btn-accent w-full flex items-center justify-center"
              onClick={() => onLockEscrow(playerNumber)}
              disabled={!playerWallet || playerEscrowLocked}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Lock Your Escrow
            </button>
            <p className="text-sm text-gray-400 mt-2 text-center">
              {playerEscrowLocked ? 'Your escrow is locked!' : 'Lock your escrow to proceed with the game'}
            </p>
          </div>
        )}

        {playerEscrowLocked && (
          <div className="mt-4 glass-card p-4 bg-accent-900/10 border border-accent-800/30">
            <div className="flex items-center text-accent-400">
              <svg className="w-5 h-5 mr-2 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="font-medium">Escrow locked successfully!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerPanel; 