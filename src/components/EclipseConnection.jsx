import { useState, useEffect } from 'react';
import { ethers } from 'ethers'; // Pour Ethereum Sepolia
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'; // Pour Solana

interface EclipseConnectionProps {
  onConnected: (provider: ethers.BrowserProvider | Connection, account: string) => void;
}

const EclipseConnection: React.FC<EclipseConnectionProps> = ({ onConnected }) => {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [balance, setBalance] = useState(null);
  const [networkType, setNetworkType] = useState(null); // Gérer Solana ou Ethereum

  useEffect(() => {
    // On vérifie si l'utilisateur veut interagir avec Ethereum (Sepolia) ou Solana
    const isEthereum = window.ethereum ? true : false;
    if (isEthereum) {
      initializeEthereum(); // Interaction avec Sepolia
      setNetworkType('ethereum');
    } else {
      initializeSolana(); // Interaction avec Solana
      setNetworkType('solana');
    }
  }, []);

  const initializeEthereum = async () => {
    // Connexion à Ethereum Sepolia via MetaMask ou autre portefeuille EVM
    const providerInstance = new ethers.BrowserProvider(window.ethereum);
    setProvider(providerInstance);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const signer = await providerInstance.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      const balance = await providerInstance.getBalance(address);
      setBalance(ethers.formatEther(balance));
      onConnected(providerInstance, address);
    } catch (error) {
      console.error("User denied account access or error occurred", error);
    }
  };

  const initializeSolana = async () => {
    // Connexion à Solana via @solana/web3.js
    const connection = new Connection('https://testnet.dev2.eclipsenetwork.xyz'); // Eclipse testnet URL
    const publicKey = new PublicKey('Votre clé publique Solana');
    
    try {
      const balanceInLamports = await connection.getBalance(publicKey);
      const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;
      setBalance(balanceInSOL);
      setAccount(publicKey.toBase58());
      onConnected(connection, publicKey.toBase58());
    } catch (error) {
      console.error('Error connecting to Solana network', error);
    }
  };

  const disconnect = () => {
    setAccount('');
    setProvider(null);
    setBalance(null);
    onConnected(null, null);
  };

  return (
    <div className="blockchain-connection">
      {account ? (
        <div>
          <p>Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
          <p>Balance: {balance ? balance.toFixed(4) : '?'} {networkType === 'ethereum' ? 'ETH' : 'SOL'}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={networkType === 'ethereum' ? initializeEthereum : initializeSolana}>
          {networkType === 'ethereum' ? 'Connect EVM Wallet' : 'Connect Solana Wallet'}
        </button>
      )}
    </div>
  );
};

export default EclipseConnection;
