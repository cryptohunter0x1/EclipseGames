import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import styles from './HomePage.module.css';

const CustomWalletButton: React.FC = () => {
  const { connected } = useWallet();

  if (!connected) {
    return <WalletMultiButton className={styles.walletButton} />;
  }

  // Si connecté, on affiche juste l'adresse du wallet
  return (
    <div className={styles.walletAddress}>
      <WalletMultiButton className={styles.walletButton} />
    </div>
  );
};

export default CustomWalletButton;
