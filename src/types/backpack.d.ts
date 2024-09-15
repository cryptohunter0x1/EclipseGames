interface Backpack {
  connect(): Promise<void>;
  ethereum: any;
}

interface Window {
  backpack?: Backpack;
  ethereum?: any;
}
