import { SalmonWallet } from './src/components/type';

declare global {
  interface Window {
    salmon?: SalmonWallet;
  }
}