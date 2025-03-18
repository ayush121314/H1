import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ErrorBoundary from '../components/ErrorBoundary';

declare global {
  interface Window {
    ethereum: any;
  }
}

// Web3 wallet connection state context could be added here

function MyApp({ Component, pageProps }: AppProps) {
  const [provider, setProvider] = useState<any>(null);

  // Initialize ethers provider when the app loads
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
      } catch (error) {
        console.error("Error initializing provider:", error);
      }
    }
  }, []);

  // We don't need to connect a wallet here anymore - we'll handle that in the index page
  // for each player separately

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Component 
          {...pageProps} 
          provider={provider}
        />
      </div>
    </ErrorBoundary>
  );
}

export default MyApp; 