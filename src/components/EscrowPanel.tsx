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
    <div className="escrow-panel p-4 bg-gradient-to-br from-accent-900/20 to-primary-900/20 rounded">
      <div className="flex items-center mb-3">
        <div className="w-3 h-3 rounded-full bg-accent-500 mr-2"></div>
        <h3 className="text-lg font-bold text-gradient">Escrow Wallet</h3>
      </div>
      
      {escrowAddress ? (
        <div className="glass-card p-3 bg-dark-800/80">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-accent-400 font-medium">Connected</span>
            <span className="text-xs bg-accent-900/20 text-accent-400 px-2 py-0.5 rounded-full">Active</span>
          </div>
          <div className="flex items-center mb-3">
            <svg className="w-4 h-4 text-accent-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="font-mono text-xs text-gray-300">{formatWalletAddress(escrowAddress)}</p>
          </div>
          
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-gray-400">Balance:</span>
            <span className="font-mono text-accent-400 font-medium">{escrowBalance} APT</span>
          </div>
          
          <button
            className="btn-outline text-error-400 border-error-600 hover:bg-error-900/20 py-1 px-3 text-sm w-full"
            onClick={onDisconnectEscrow}
          >
            Disconnect Escrow
          </button>
        </div>
      ) : (
        <div className="glass-card p-3 bg-dark-800/80">
          <p className="text-sm text-gray-300 mb-3">
            The escrow wallet holds funds during the game and distributes to the winner.
          </p>
          <button
            className="btn-accent w-full py-2"
            onClick={onConnectEscrowWallet}
            disabled={useSimulationMode}
          >
            Connect Escrow Wallet
          </button>
        </div>
      )}
      
      {/* Quick instructions */}
      <div className="mt-3 p-2 bg-dark-800/50 rounded text-xs text-gray-400">
        <p className="font-medium text-accent-400 mb-1">Quick Setup:</p>
        <ol className="list-decimal list-inside space-y-0.5 pl-1">
          <li>Connect Player 1 wallet (White)</li>
          <li>Connect Player 2 wallet (Black)</li>
          <li>Connect Escrow wallet</li>
          <li>Set bets and lock escrow</li>
        </ol>
      </div>
    </div>
  );
};

export default EscrowPanel; 