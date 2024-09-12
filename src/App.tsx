import React, { useState, useEffect } from 'react';
import TicTacToe from './components/TicTacToe';
import Tetris from './components/Tetris';
import GameSelector from './components/GameSelector';
import './App.css';

declare global {
  interface Window {
    salmon?: any;
  }
}

function App() {
  const [selectedGame, setSelectedGame] = useState<'tictactoe' | 'tetris' | null>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSalmonWallet = async () => {
    console.log("Vérification de Salmon Wallet...");
    setError(null);
    setIsLoading(true);

    if (typeof window.salmon !== 'undefined') {
      console.log("Salmon Wallet détecté dans la fenêtre");
      try {
        console.log("Tentative de connexion à Salmon Wallet...");
        await window.salmon.connect();
        console.log("Connexion à Salmon Wallet réussie");
        setWallet(window.salmon);
        console.log("Wallet connecté:", window.salmon);
        console.log("Méthodes disponibles dans wallet:", Object.keys(window.salmon));
      } catch (error: any) {
        console.error("Erreur lors de la connexion à Salmon Wallet:", error);
        setError(`Erreur de connexion: ${error.message}`);
      }
    } else {
      console.log("Salmon Wallet non détecté");
      setError("Salmon Wallet n'est pas détecté. Veuillez l'installer et l'activer.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    console.log("App component mounted");
    checkSalmonWallet();
  }, []);

  const handleGameEnd = () => {
    setSelectedGame(null);
  };

  const renderGame = () => {
    if (error) {
      return (
        <div>
          <p className="error-message">{error}</p>
          <button onClick={checkSalmonWallet}>Réessayer la connexion</button>
          <p>Vous pouvez continuer sans portefeuille, mais certaines fonctionnalités seront limitées.</p>
          <GameSelector onSelectGame={setSelectedGame} wallet={null} />
        </div>
      );
    }

    if (!wallet) {
      return <p>Tentative de connexion à Salmon Wallet...</p>;
    }

    switch (selectedGame) {
      case 'tictactoe':
        return <TicTacToe onGameEnd={handleGameEnd} wallet={wallet} />;
      case 'tetris':
        return <Tetris onGameEnd={handleGameEnd} wallet={wallet} />;
      default:
        return <GameSelector onSelectGame={setSelectedGame} wallet={wallet} />;
    }
  };

  if (isLoading) {
    return <div>Chargement de l'application...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Eclipse Games</h1>
      </header>
      <main>
        {renderGame()}
      </main>
      <footer>
        <div className="debug-info">
          <h3>Informations de débogage :</h3>
          <pre>{JSON.stringify({ walletConnected: !!wallet, selectedGame, error }, null, 2)}</pre>
        </div>
      </footer>
    </div>
  );
}

export default App;
