declare module '*.json' {
    const value: any;
    export default value;
  }

interface Backpack {
  connect(): Promise<void>;
  ethereum: any;
}

interface Window {
  backpack?: Backpack;
  ethereum?: {
    isSalmon?: boolean;
    request: (args: { method: string }) => Promise<any>;
  };
}

interface EthereumProvider {
  isSalmon: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
}

interface Window {
  ethereum?: EthereumProvider;
  backpack?: {
    ethereum: EthereumProvider;
  };
}