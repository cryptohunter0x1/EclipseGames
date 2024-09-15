import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import styles from './HomePage.module.css';
import Tetris from '../components/Tetris';
import TicTacToe from '../components/TicTacToe';
import logo from '../images/logo.png';
import tetrisIcon from '../images/tetris-icon.png';
import tictactoeIcon from '../images/tictactoe-icon.png';
import backgroundImage from '../images/background.jpg';
import CustomWalletButton from './CustomWalletButton';

const games = [
  { id: 'Tetris', name: 'Tetris', icon: tetrisIcon },
  { id: 'Tic Tac Toe', name: 'Tic Tac Toe', icon: tictactoeIcon },
];

// Définition du GameComponent
const GameComponent: React.FC<{ gameName: string }> = ({ gameName }) => {
  return (
    <div className={styles.gameContainer}>
      <h3>{gameName}</h3>
      <p>Ici se trouvera le jeu {gameName}.</p>
      <p>Cliquez sur "Retour à la sélection" pour choisir un autre jeu.</p>
    </div>
  );
};

const HomePage: React.FC = () => {
  const { connected, publicKey, wallet } = useWallet();
  const { connection } = useConnection();
  const [isConnected, setIsConnected] = useState(false);
  const [currentGame, setCurrentGame] = useState<string | null>(null);

  useEffect(() => {
    setIsConnected(connected);
  }, [connected]);

  const handleDisconnect = () => {
    setIsConnected(false);
    setCurrentGame(null);
  };

  const handleGameEnd = () => {
    setCurrentGame(null);
  };

  const renderGame = () => {
    console.log("renderGame appelé, jeu actuel:", currentGame);
    if (!publicKey) {
      console.log("publicKey non disponible");
      return null;
    }
    
    const walletAddress = publicKey.toBase58();
    console.log("walletAddress:", walletAddress);
    
    switch (currentGame) {
      case 'Tetris':
        console.log("Tentative de rendu de Tetris");
        return (
          <div style={{ border: '2px solid blue', padding: '10px' }}>
            <Tetris 
              onGameEnd={handleGameEnd} 
              wallet={wallet} 
              walletAddress={walletAddress}
            />
          </div>
        );
      case 'Tic Tac Toe':
        console.log("Rendering Tic Tac Toe");
        return <TicTacToe 
          onGameEnd={handleGameEnd} 
          walletAddress={walletAddress}
          provider={connection}
        />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.homePage}>
      <h1 className={styles.title}>Eclipse Games</h1>
      
      <div className={styles.walletConnection}>
        <CustomWalletButton />
      </div>
      
      {isConnected && !currentGame && (
        <div className={styles.gameSelection}>
          <h2>Sélectionnez un jeu</h2>
          <div className={styles.gameButtons}>
            {games.map(game => (
              <button key={game.id} onClick={() => setCurrentGame(game.id)}>
                <img src={game.icon} alt={`${game.name} icon`} className={styles.gameIcon} />
                {game.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {currentGame && (
        <div className={styles.gameContainer}>
          {renderGame()}
        </div>
      )}
    </div>
  );
};

export default HomePage;