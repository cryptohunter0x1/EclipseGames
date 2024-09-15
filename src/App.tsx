import React from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { SalmonWalletAdapter } from '@solana/wallet-adapter-salmon';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import HomePage from './components/HomePage';

import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = React.useMemo(() => "https://testnet.dev2.eclipsenetwork.xyz", []);

  const wallets = React.useMemo(
    () => [new SalmonWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <HomePage />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;