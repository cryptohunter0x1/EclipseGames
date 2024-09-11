import React, { useState, useEffect } from 'react';
import './GameSelector.css';

interface GameSelectorProps {
  wallet: any; // Instance de Salmon Wallet
  onSelectGame: (game: 'tictactoe' | 'tetris' | null) => void;
}

const GameSelector: React.FC<GameSelectorProps> = ({ wallet, onSelectGame }) => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        if (wallet) {
          setWalletConnected(true);
          setConnectionError(null);
          console.log("Méthodes disponibles dans wallet:", Object.keys(wallet));
        } else {
          setWalletConnected(false);
          setConnectionError("Salmon Wallet n'est pas connecté");
        }
      } catch (error: any) {
        console.error("Erreur lors de la vérification de la connexion du wallet:", error);
        setWalletConnected(false);
        setConnectionError(error.message);
      }
    };

    checkWalletConnection();
  }, [wallet]);

  if (!walletConnected) {
    return (
      <div className="game-selector">
        <h1>Connexion au wallet requise</h1>
        <p>{connectionError || "Veuillez connecter Salmon Wallet pour jouer."}</p>
      </div>
    );
  }

  return (
    <div className="game-selector">
      <h1>Sélectionnez un jeu</h1>
      <button onClick={() => onSelectGame('tictactoe')}>
        Jouer à Tic Tac Toe (0.01 SOL)
      </button>
      <button onClick={() => onSelectGame('tetris')}>
        Jouer à Tetris (0.01 SOL)
      </button>
      <div className="wallet-info">
        <p>Salmon Wallet connecté</p>
        <p>Adresse: {wallet.publicKey?.toString()}</p>
      </div>
      {connectionError && <p className="error">{connectionError}</p>}
      <div className="debug-info">
        <h2>Informations de débogage :</h2>
        <pre>{JSON.stringify({ walletConnected, error: connectionError }, null, 2)}</pre>
      </div>
    </div>
  );
};

export default GameSelector;