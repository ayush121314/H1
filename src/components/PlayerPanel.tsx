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
    <div className="bg-gray-100 p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-4">
        Player {playerNumber} ({playerNumber === 1 ? 'White' : 'Black'})
      </h2>
      
      {playerWallet ? (
        <div>
          <p className="mb-2">
            <span className="font-semibold">Address:</span>{' '}
            <span title={playerWallet.address} className="cursor-help">
              {formatWalletAddress(playerWallet.address)}
            </span>
          </p>
          <p className="mb-4">
            <span className="font-semibold">Balance:</span> {playerWallet.balance} APT
          </p>
          <div className="flex space-x-2 mb-4">
            <button 
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              onClick={() => onDisconnectWallet(playerNumber)}
            >
              Disconnect
            </button>
            {useSimulationMode && (
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
                onClick={() => onSetManualWalletAddress(playerNumber)}
              >
                Edit Address
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 mb-2">
            {getWalletConnectionInstructions(playerNumber)}
          </p>
          <button
            className={`${playerNumber === 1 ? 'bg-blue-500 hover:bg-blue-600' : 'bg-purple-500 hover:bg-purple-600'} text-white px-4 py-2 rounded block w-full`}
            onClick={() => onConnectWallet(playerNumber)}
          >
            Connect Player {playerNumber} Wallet
          </button>
          {useSimulationMode && (
            <button
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded block w-full"
              onClick={() => onSetManualWalletAddress(playerNumber)}
            >
              Set Manual Address
            </button>
          )}
        </div>
      )}

      {gameState === 'betting' && playerBet > 0 && !playerEscrowLocked && otherPlayerBet > 0 && (
        <div className="mt-4">
          <p className="mb-2">
            <span className="font-semibold">Your Bet:</span> {playerBet} APT
          </p>
          <p className="mb-2 text-blue-700">
            <span className="font-semibold">Minimum Bet:</span> {minimumBet === Infinity ? 0 : minimumBet} APT
            <span className="text-xs ml-1">(this amount will be deducted)</span>
          </p>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
            onClick={() => onLockEscrow(playerNumber)}
            disabled={!playerWallet || playerEscrowLocked}
          >
            Lock Your Escrow
          </button>
          <p className="text-sm text-gray-600 mt-2">
            {playerEscrowLocked ? 'Your escrow is locked!' : 'Lock your escrow to proceed with the game'}
          </p>
        </div>
      )}

      {playerEscrowLocked && (
        <div className="mt-2 bg-green-100 p-2 rounded">
          <p className="text-green-700">Escrow locked successfully!</p>
        </div>
      )}
    </div>
  );
};

export default PlayerPanel; 