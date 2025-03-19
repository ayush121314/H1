import React from 'react';
import { EscrowStatus } from '../contracts/EscrowContractAdapter';
import { formatWalletAddress } from '../utils/transactions';

interface EscrowPanelProps {
  escrowAddress: string | null;
  escrowStatus: EscrowStatus;
  escrowBalance: number;
  useSimulationMode: boolean;
  setUseSimulationMode: (mode: boolean) => void;
  onConnectEscrowWallet: () => void;
  onDisconnectEscrow: () => void;
  onCreateSimulatedEscrow: () => void;
  onInitializeEscrow: () => void;
  onResetGame: () => void;
  onResetWallets: () => void;
}

const EscrowPanel: React.FC<EscrowPanelProps> = ({
  escrowAddress,
  escrowStatus,
  escrowBalance,
  useSimulationMode,
  setUseSimulationMode,
  onConnectEscrowWallet,
  onDisconnectEscrow,
  onCreateSimulatedEscrow,
  onInitializeEscrow,
  onResetGame,
  onResetWallets
}) => {
  return (
    <div className="mt-8 p-4 bg-gray-200 rounded">
      <h3 className="text-lg font-bold mb-2">Contract Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p><strong>Escrow Address:</strong> {escrowAddress || 'Not connected'}</p>
          <p><strong>Status:</strong> {EscrowStatus[escrowStatus]}</p>
          <p><strong>Escrow Balance:</strong> {escrowBalance} APT</p>
          
          {/* Escrow wallet connection panel */}
          <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded">
            <h4 className="font-bold text-indigo-800">Escrow Wallet</h4>
            {escrowAddress ? (
              <div className="mt-2">
                <p className="text-indigo-700">Escrow wallet connected:</p>
                <p className="font-mono text-sm mt-1">{escrowAddress}</p>
                <button
                  className="mt-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  onClick={onDisconnectEscrow}
                >
                  Disconnect Escrow
                </button>
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-indigo-700 mb-2">Connect your escrow wallet:</p>
                <button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded w-full"
                  onClick={onConnectEscrowWallet}
                  disabled={useSimulationMode}
                >
                  Connect Escrow Wallet
                </button>
                <p className="text-xs text-indigo-600 mt-1">
                  The escrow wallet will hold funds during the game and distribute to the winner.
                </p>
              </div>
            )}
          </div>
          
          {/* Wallet Connection Tips */}
          <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800 font-medium">3-Wallet Setup Instructions:</p>
            <ol className="list-decimal list-inside text-blue-700 pl-2 text-sm space-y-1 mt-1">
              <li>Connect Player 1 wallet first</li>
              <li>Connect Player 2 wallet second (make sure to switch to a different wallet in Petra)</li>
              <li>Connect the Escrow wallet third (should be a separate wallet from both players)</li>
              <li>Place bets and lock escrow to start the game</li>
              <li>After game completes, the escrow wallet will pay the winner</li>
            </ol>
          </div>
        </div>
        <div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="simulationMode"
              checked={useSimulationMode}
              onChange={(e) => setUseSimulationMode(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="simulationMode">Simulation Mode (No real transactions)</label>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Enable simulation mode to test the game flow without actual blockchain transactions.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
              onClick={onInitializeEscrow}
              disabled={useSimulationMode}
            >
              Initialize Escrow
            </button>
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded"
              onClick={onCreateSimulatedEscrow}
              disabled={!useSimulationMode}
            >
              Create Simulated Escrow
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
              onClick={onResetGame}
            >
              Reset Game
            </button>
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded"
              onClick={onResetWallets}
            >
              Reset All Wallets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscrowPanel; 