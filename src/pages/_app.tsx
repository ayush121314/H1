import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useState, useEffect } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { Network } from 'aptos';

// Define the window type for Aptos
declare global {
  interface Window {
    aptos: any;
  }
}

// Web3 wallet connection state context could be added here

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <AptosWalletAdapterProvider
        autoConnect={true}
        onError={(error) => {
          console.error("Wallet adapter error:", error);
        }}
        // Explicitly opt-in to Petra wallet
        optInWallets={["Petra"]}
      >
        <div className="min-h-screen bg-background">
          <Component {...pageProps} />
        </div>
      </AptosWalletAdapterProvider>
    </ErrorBoundary>
  );
}

export default MyApp; 