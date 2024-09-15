import { WalletAdapter as SolanaWalletAdapter } from '@solana/wallet-adapter-base';
import { Connection, Transaction } from '@solana/web3.js';

export type SalmonWallet = SolanaWalletAdapter;

declare global {
  interface Window {
    salmon?: SalmonWallet;
  }
}

export interface WalletAdapter extends Omit<SolanaWalletAdapter, 'sendTransaction'> {
  transfer?: (transaction: any) => Promise<any>;
  signAndSendTransaction?: (transaction: any) => Promise<any>;
  sendTransaction?: (transaction: Transaction | {
    to: string;
    amount: string;
    blockchain: string;
  }, connection?: Connection) => Promise<any>;
}

export {};
