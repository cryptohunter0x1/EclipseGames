import React, { useState, useEffect } from 'react';
import TicTacToe from './components/TicTacToe';
import Tetris from './components/Tetris';

declare global {
  interface Window {
    salmon?: {
      connect?: () => Promise<void>;
      requestAccounts?: () => Promise<void>;
      getAddress?: () => Promise<string>;
      publicKey?: string | { toBase58: () => string };
      // ... autres méthodes du portefeuille Salmon
    };
  }
}

const App: React.FC = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Vérification du portefeuille Salmon :", window.salmon);
    console.log("Vérification de la présence du portefeuille Salmon...");
    if (typeof window.salmon !== 'undefined') {
      console.log("Portefeuille Salmon détecté");
      setWallet(window.salmon);
    } else {
      console.log("Portefeuille Salmon non détecté");
    }
  }, []);

  useEffect(() => {
    console.log("Contenu de window.salmon :", window.salmon);
    if (window.salmon) {
      console.log("Méthodes disponibles dans window.salmon :", Object.keys(window.salmon));
    }
  }, []);

  const connectWallet = async () => {
    if (window.salmon) {
      try {
        // Connexion
        if (typeof window.salmon.connect === 'function') {
          await window.salmon.connect();
        } else if (typeof window.salmon.requestAccounts === 'function') {
          await window.salmon.requestAccounts();
        } else {
          throw new Error("Aucune méthode de connexion trouvée");
        }

        // Récupération de l'adresse
        let address;
        if (typeof window.salmon.getAddress === 'function') {
          address = await window.salmon.getAddress();
        } else if (typeof window.salmon.publicKey === 'string') {
          address = window.salmon.publicKey;
        } else if (typeof window.salmon.publicKey === 'object' && window.salmon.publicKey.toBase58) {
          address = window.salmon.publicKey.toBase58();
        } else {
          throw new Error("Impossible de récupérer l'adresse du portefeuille");
        }

        console.log("Adresse du portefeuille récupérée :", address);
        setWalletAddress(address);
        setWalletConnected(true);
      } catch (error: unknown) {
        console.error("Erreur détaillée lors de la connexion :", error);
        if (error instanceof Error) {
          setError(`Impossible de se connecter au portefeuille : ${error.message}`);
        } else {
          setError("Impossible de se connecter au portefeuille : erreur inconnue");
        }
      }
    } else {
      setError("Portefeuille Salmon non détecté. Veuillez l'installer et l'activer.");
    }
  };

  const disconnectWallet = async () => {
    if (wallet) {
      try {
        await wallet.disconnect();
        setWalletConnected(false);
        setWalletAddress(null);
        setSelectedGame(null);
        setError(null);
      } catch (error) {
        console.error("Erreur lors de la déconnexion du portefeuille:", error);
        setError("Impossible de se déconnecter du portefeuille");
      }
    }
  };

  const handleGameSelection = (game: string) => {
    setSelectedGame(game);
  };

  const handleGameEnd = () => {
    setSelectedGame(null);
  };

  const renderGame = () => {
    if (!walletConnected || !walletAddress) return null;

    switch (selectedGame) {
      case 'tictactoe':
        return <TicTacToe onGameEnd={handleGameEnd} wallet={wallet} walletAddress={walletAddress} />;
      case 'tetris':
        return <Tetris onGameEnd={handleGameEnd} wallet={wallet} walletAddress={walletAddress} />;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <h1>Eclipse Games</h1>
      {!walletConnected ? (
        <button onClick={connectWallet}>Connecter le portefeuille Salmon</button>
      ) : (
        <>
          <p>Portefeuille connecté : {walletAddress}</p>
          <button onClick={disconnectWallet}>Déconnecter le portefeuille</button>
          {!selectedGame ? (
            <div>
              <h2>Sélectionnez un jeu :</h2>
              <button onClick={() => handleGameSelection('tictactoe')}>Jouer à Tic Tac Toe (0.01 SOL)</button>
              <button onClick={() => handleGameSelection('tetris')}>Jouer à Tetris (0.01 SOL)</button>
            </div>
          ) : (
            renderGame()
          )}
        </>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default App;