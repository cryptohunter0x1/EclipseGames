import React, { useMemo, useEffect, useState } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { SalmonWalletAdapter } from '@solana/wallet-adapter-salmon';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import HomePage from './components/HomePage';
import linktreeLogo from './images/linktr.eeCryptoHunter0x.png';

import '@solana/wallet-adapter-react-ui/styles.css';

interface AppProps {
  onGameEnd: () => void;
}

const App: React.FC<AppProps> = ({ onGameEnd }) => {
  const endpoint = useMemo(() => "https://testnet.dev2.eclipsenetwork.xyz", []);

  const wallets = useMemo(() => [
    new SalmonWalletAdapter(), 
    new BackpackWalletAdapter()
  ], []);

  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  useEffect(() => {
    const wallet = wallets[0]; 

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

  const connectWallet = async () => {
    if (isWalletConnected) {
      console.log("Le portefeuille est déjà connecté");
      return;
    }

    try {
      if (window?.salmon && !window.salmon.connected) {
        await window.salmon.connect();
        const publicKey = window.salmon.publicKey;
        setPublicKey(publicKey);
        setIsWalletConnected(true);
        console.log("Portefeuille connecté :", publicKey?.toString());
      } else if (window?.salmon?.connected) {
        console.log("Portefeuille déjà connecté :", window.salmon?.publicKey?.toString());
      } else {
        console.error("L'extension Salmon n'est pas installée");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion au portefeuille:", error);
    }
  };

  const disconnectWallet = async () => {
    if (!isWalletConnected) {
      console.log("Le portefeuille n'est pas connecté");
      return;
    }

    try {
      if (window?.salmon) {
        await window.salmon.disconnect();
        setPublicKey(null); 
        setIsWalletConnected(false);
        console.log("Portefeuille déconnecté");
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion du portefeuille:", error);
    }
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div>
            <button onClick={connectWallet} style={{ display: 'none' }}>
              Connecter le portefeuille
            </button>
          </div>
          <HomePage />

          {/* Logo Linktree en bas à droite */}
          <div 
            style={{
              position: 'fixed',
              bottom: '30px',
              right: '120px',
            }}
          >
            <a 
              href="https://linktr.ee/CryptoHunter0x" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <img 
                src={linktreeLogo}  
                alt="Logo Linktree" 
                style={{ width: '80px', height: '80px' }} 
              />
            </a>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
