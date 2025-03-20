import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

const App = () => {
  // Wallet states
  const [wallets, setWallets] = useState<string[]>([
    '0x1234567890123456789012345678901234567890',
    '0x2345678901234567890123456789012345678901',
    '0x3456789012345678901234567890123456789012',
    '0x4567890123456789012345678901234567890123',
    '0x5678901234567890123456789012345678901234'
  ]);
  
  const [selectedWallets, setSelectedWallets] = useState<{
    player1Wallet: string | null;
    player2Wallet: string | null;
    escrowWallet: string | null;
  }>({
    player1Wallet: null,
    player2Wallet: null,
    escrowWallet: null
  });
  
  // Notification state
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    show: false,
    message: '',
    type: 'info'
  });
  
  // Add effect to monitor wallet selection changes
  useEffect(() => {
    console.log('Selected wallets changed:', selectedWallets);
    // Check for duplicate wallets across different roles
    const walletAddresses = Object.entries(selectedWallets)
      .filter(([_, address]) => address !== null)
      .map(([_, address]) => address);
    
    const uniqueWallets = new Set(walletAddresses);
    
    if (walletAddresses.length !== uniqueWallets.size) {
      console.error('DUPLICATE WALLET DETECTED:', selectedWallets);
      showNotification('Duplicate wallet detected. This should not happen.', 'error');
    }
  }, [selectedWallets]);
  
  // Transaction state
  const [transaction, setTransaction] = useState<{
    inProgress: boolean;
    amount: string;
    from: string | null;
    to: string | null;
    verified: boolean;
  }>({
    inProgress: false,
    amount: '',
    from: null,
    to: null,
    verified: false
  });

  // Helper function to show notifications instead of alerts
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({
      show: true,
      message,
      type
    });
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Function to handle wallet deselection (Change button)
  const deselectWallet = (walletType: 'player1Wallet' | 'player2Wallet' | 'escrowWallet') => {
    console.log(`Deselecting wallet for ${walletType}`);
    console.log('Current selected wallets before deselection:', selectedWallets);

    // Update selected wallets by setting the specified wallet type to null
    setSelectedWallets(prev => {
      const updated = {
        ...prev,
        [walletType]: null
      };
      console.log('Updated wallets after deselection:', updated);
      return updated;
    });
    
    showNotification(`${walletType.replace('Wallet', '')} wallet has been deselected`, 'info');
  };

  // Function to select a wallet
  const selectWallet = (walletAddress: string, walletType: 'player1Wallet' | 'player2Wallet' | 'escrowWallet') => {
    console.log(`Attempting to select wallet ${walletAddress} for ${walletType}`);
    console.log('Current selected wallets:', selectedWallets);
    
    // Check if the wallet is already selected for any role
    if (
      (selectedWallets.player1Wallet === walletAddress) ||
      (selectedWallets.player2Wallet === walletAddress) ||
      (selectedWallets.escrowWallet === walletAddress)
    ) {
      console.log(`Wallet ${walletAddress} is already selected, preventing duplicate selection`);
      showNotification(`This wallet (${walletAddress.substring(0, 6)}...) is already selected for another role. Please choose a different wallet.`, 'error');
      return;
    }

    // Check if the wallet address is valid (basic format check)
    if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      console.log(`Invalid wallet format: ${walletAddress}`);
      showNotification('Invalid wallet address format. Please select a valid wallet.', 'error');
      return;
    }

    // Log what's about to change
    console.log(`Setting ${walletType} to ${walletAddress}`);
    
    // Update selected wallets
    setSelectedWallets(prev => {
      const updated = {
        ...prev,
        [walletType]: walletAddress
      };
      console.log('Updated wallets:', updated);
      return updated;
    });
    
    showNotification(`Wallet successfully selected for ${walletType.replace('Wallet', '')}`, 'success');
  };

  // Function to initiate a transaction
  const initiateTransaction = (amount: string, from: string, to: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      showNotification('Please enter a valid amount', 'error');
      return;
    }
    
    setTransaction({
      inProgress: true,
      amount,
      from,
      to,
      verified: false
    });
    
    showNotification(`Transaction initiated: ${amount} from ${from.substring(0, 6)}... to ${to.substring(0, 6)}...`, 'info');
  };

  // Function to verify transaction details
  const verifyTransaction = () => {
    // In a real implementation, this would connect to a wallet extension
    // and verify the details match what the user expects
    
    setTransaction(prev => ({
      ...prev,
      verified: true
    }));
    
    showNotification('Transaction details verified', 'success');
  };

  // Function to submit transaction
  const submitTransaction = () => {
    if (!transaction.verified) {
      showNotification('Please verify the transaction details first', 'error');
      return;
    }
    
    // In a real implementation, this would submit the transaction to the blockchain
    
    showNotification(`Transaction of ${transaction.amount} successfully completed!`, 'success');
    
    // Reset transaction state
    setTransaction({
      inProgress: false,
      amount: '',
      from: null,
      to: null,
      verified: false
    });
  };

  // Function to cancel transaction
  const cancelTransaction = () => {
    setTransaction({
      inProgress: false,
      amount: '',
      from: null,
      to: null,
      verified: false
    });
    
    showNotification('Transaction cancelled', 'info');
  };

  return (
    <div className="container">
      <h1>Wallet Management System</h1>
      
      {/* Notification component */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          <button 
            className="close-btn" 
            onClick={() => setNotification(prev => ({ ...prev, show: false }))}
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Wallet Selection */}
      <div className="section wallet-selection">
        <h2>Select Wallets</h2>
        <p>Each wallet must be unique and cannot be selected more than once.</p>
        
        <div className="wallet-groups">
          <div className="wallet-group">
            <h3>Player 1 Wallet</h3>
            <div className="selected-wallet">
              {selectedWallets.player1Wallet ? (
                <>
                  <span>{selectedWallets.player1Wallet}</span>
                  <button onClick={() => deselectWallet('player1Wallet')}>
                    Change
                  </button>
                </>
              ) : (
                <span className="not-selected">No wallet selected</span>
              )}
            </div>
            
            {!selectedWallets.player1Wallet && (
              <div className="wallet-list">
                <h4>Available Wallets</h4>
                <ul>
                  {wallets.map(wallet => {
                    // Check if this wallet is already selected for any role
                    const isAlreadySelected = 
                      selectedWallets.player2Wallet === wallet || 
                      selectedWallets.escrowWallet === wallet;
                    
                    return (
                      <li key={wallet}>
                        <button 
                          className={`wallet-btn ${isAlreadySelected ? 'disabled' : ''}`}
                          onClick={() => selectWallet(wallet, 'player1Wallet')}
                          disabled={isAlreadySelected}
                        >
                          {wallet.substring(0, 10)}...{wallet.substring(wallet.length - 6)}
                          {isAlreadySelected && <span className="selected-elsewhere"> (Already Selected)</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
          
          <div className="wallet-group">
            <h3>Player 2 Wallet</h3>
            <div className="selected-wallet">
              {selectedWallets.player2Wallet ? (
                <>
                  <span>{selectedWallets.player2Wallet}</span>
                  <button onClick={() => deselectWallet('player2Wallet')}>
                    Change
                  </button>
                </>
              ) : (
                <span className="not-selected">No wallet selected</span>
              )}
            </div>
            
            {!selectedWallets.player2Wallet && (
              <div className="wallet-list">
                <h4>Available Wallets</h4>
                <ul>
                  {wallets.map(wallet => {
                    // Check if this wallet is already selected for any role
                    const isAlreadySelected = 
                      selectedWallets.player1Wallet === wallet || 
                      selectedWallets.escrowWallet === wallet;
                    
                    return (
                      <li key={wallet}>
                        <button 
                          className={`wallet-btn ${isAlreadySelected ? 'disabled' : ''}`}
                          onClick={() => selectWallet(wallet, 'player2Wallet')}
                          disabled={isAlreadySelected}
                        >
                          {wallet.substring(0, 10)}...{wallet.substring(wallet.length - 6)}
                          {isAlreadySelected && <span className="selected-elsewhere"> (Already Selected)</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
          
          <div className="wallet-group">
            <h3>Escrow Wallet</h3>
            <div className="selected-wallet">
              {selectedWallets.escrowWallet ? (
                <>
                  <span>{selectedWallets.escrowWallet}</span>
                  <button onClick={() => deselectWallet('escrowWallet')}>
                    Change
                  </button>
                </>
              ) : (
                <span className="not-selected">No wallet selected</span>
              )}
            </div>
            
            {!selectedWallets.escrowWallet && (
              <div className="wallet-list">
                <h4>Available Wallets</h4>
                <ul>
                  {wallets.map(wallet => {
                    // Check if this wallet is already selected for any role
                    const isAlreadySelected = 
                      selectedWallets.player1Wallet === wallet || 
                      selectedWallets.player2Wallet === wallet;
                    
                    return (
                      <li key={wallet}>
                        <button 
                          className={`wallet-btn ${isAlreadySelected ? 'disabled' : ''}`}
                          onClick={() => selectWallet(wallet, 'escrowWallet')}
                          disabled={isAlreadySelected}
                        >
                          {wallet.substring(0, 10)}...{wallet.substring(wallet.length - 6)}
                          {isAlreadySelected && <span className="selected-elsewhere"> (Already Selected)</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Transaction Section */}
      <div className="section transaction">
        <h2>Make a Transaction</h2>
        
        {!transaction.inProgress ? (
          <div className="transaction-form">
            <div className="form-group">
              <label htmlFor="amount">Amount:</label>
              <input 
                type="number" 
                id="amount" 
                value={transaction.amount}
                onChange={e => setTransaction(prev => ({ ...prev, amount: e.target.value }))}
                min="0.001"
                step="0.001"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="from-wallet">From:</label>
              <select 
                id="from-wallet"
                onChange={e => setTransaction(prev => ({ ...prev, from: e.target.value }))}
                value={transaction.from || ''}
              >
                <option value="">Select a wallet</option>
                {selectedWallets.player1Wallet && (
                  <option value={selectedWallets.player1Wallet}>
                    Player 1: {selectedWallets.player1Wallet.substring(0, 10)}...
                  </option>
                )}
                {selectedWallets.player2Wallet && (
                  <option value={selectedWallets.player2Wallet}>
                    Player 2: {selectedWallets.player2Wallet.substring(0, 10)}...
                  </option>
                )}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="to-wallet">To:</label>
              <select 
                id="to-wallet"
                onChange={e => setTransaction(prev => ({ ...prev, to: e.target.value }))}
                value={transaction.to || ''}
              >
                <option value="">Select a wallet</option>
                {selectedWallets.escrowWallet && (
                  <option value={selectedWallets.escrowWallet}>
                    Escrow: {selectedWallets.escrowWallet.substring(0, 10)}...
                  </option>
                )}
              </select>
            </div>
            
            <div className="form-actions">
              <button 
                className="primary-btn"
                onClick={() => {
                  if (transaction.from && transaction.to && transaction.amount) {
                    initiateTransaction(transaction.amount, transaction.from, transaction.to);
                  } else {
                    showNotification('Please fill all transaction details', 'error');
                  }
                }}
              >
                Initiate Transaction
              </button>
            </div>
          </div>
        ) : (
          <div className="transaction-verification">
            <h3>Verify Transaction Details</h3>
            
            <div className="verification-details">
              <p><strong>Amount:</strong> {transaction.amount}</p>
              <p><strong>From:</strong> {transaction.from}</p>
              <p><strong>To:</strong> {transaction.to}</p>
            </div>
            
            <div className="verification-actions">
              {!transaction.verified ? (
                <button className="primary-btn" onClick={verifyTransaction}>
                  Verify Details
                </button>
              ) : (
                <button className="success-btn" onClick={submitTransaction}>
                  Complete Transaction
                </button>
              )}
              
              <button className="secondary-btn" onClick={cancelTransaction}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="section wallet-status">
        <h2>Wallet Status</h2>
        <div className="wallet-summary">
          <div className="wallet-card">
            <h3>Player 1</h3>
            <p className="wallet-address">
              {selectedWallets.player1Wallet ? 
                `${selectedWallets.player1Wallet.substring(0, 10)}...${selectedWallets.player1Wallet.substring(selectedWallets.player1Wallet.length - 6)}` : 
                'Not selected'
              }
            </p>
          </div>
          
          <div className="wallet-card">
            <h3>Player 2</h3>
            <p className="wallet-address">
              {selectedWallets.player2Wallet ? 
                `${selectedWallets.player2Wallet.substring(0, 10)}...${selectedWallets.player2Wallet.substring(selectedWallets.player2Wallet.length - 6)}` : 
                'Not selected'
              }
            </p>
          </div>
          
          <div className="wallet-card">
            <h3>Escrow</h3>
            <p className="wallet-address">
              {selectedWallets.escrowWallet ? 
                `${selectedWallets.escrowWallet.substring(0, 10)}...${selectedWallets.escrowWallet.substring(selectedWallets.escrowWallet.length - 6)}` : 
                'Not selected'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create root element if it doesn't exist
if (typeof document !== 'undefined') {
  const rootElement = document.getElementById('root') || document.createElement('div');
  
  if (!rootElement.id) {
    rootElement.id = 'root';
    document.body.appendChild(rootElement);
  }
  
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

export default App; 