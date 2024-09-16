import React, { useMemo, useEffect, useState } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { SalmonWalletAdapter } from '@solana/wallet-adapter-salmon';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';
import { WalletModalProvider, WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import HomePage from './components/HomePage';

import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  // Network setup
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => "https://testnet.dev2.eclipsenetwork.xyz", []);

  // Setup Salmon Wallet and Backpack Wallet
  const wallets = useMemo(() => [
    new SalmonWalletAdapter(), 
    new BackpackWalletAdapter()
  ], []);

  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);

  // Listen for connection and disconnection events
  useEffect(() => {
    const wallet = wallets[0]; // Assuming default is Salmon, can modify to handle multiple wallets

    // Handle connection and disconnection
    wallet.on('connect', () => {
      setConnected(true);
      if (wallet.publicKey) {
        setPublicKey(wallet.publicKey);
        console.log('Connected to Wallet:', wallet.publicKey.toString());
      }
    });

    wallet.on('disconnect', () => {
      setConnected(false);
      setPublicKey(null);
      console.log('Disconnected from Wallet');
    });
  }, [wallets]);

  // Function to send a test transaction
  const sendTransaction = async () => {
    if (!connected || !publicKey) {
      alert('Please connect a wallet first!');
      return;
    }

    const connection = new Connection(endpoint);
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey('DestinatairePublicKeyIci'), // Replace with destination public key
        lamports: 1000000, // Amount to send (1 SOL = 1e9 Lamports)
      })
    );

    try {
      const signature = await wallets[0].sendTransaction(transaction, connection); // Send transaction with the wallet
      console.log('Transaction successful with signature:', signature);
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div>
            <h1>Connect to Salmon or Backpack Wallet</h1>
            <WalletMultiButton />
            {connected && publicKey && (
              <div>
                <p>Connected Wallet: {publicKey.toString()}</p>
                <button onClick={sendTransaction}>Send Test Transaction</button>
              </div>
            )}
            {connected && <WalletDisconnectButton />}
          </div>
          <HomePage />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
