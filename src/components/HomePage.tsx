import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import styles from './HomePage.module.css';
import Tetris from './Tetris';
import TicTacToe from './TicTacToe';
import tetrisIcon from '../images/tetris-icon.png';
import tictactoeIcon from '../images/tictactoe-icon.png';
import CustomWalletButton from './CustomWalletButton';

const games = [
  { id: 'Tetris', name: 'Tetris', icon: tetrisIcon },
  { id: 'Tic Tac Toe', name: 'Tic Tac Toe', icon: tictactoeIcon },
];

const HomePage: React.FC = () => {
  const { connected, publicKey } = useWallet();
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
    if (!publicKey) {
      return null;
    }
    
    const walletAddress = publicKey.toBase58();
    
    switch (currentGame) {
      case 'Tetris':
        return (
          <div style={{ border: '2px solid blue', padding: '10px' }}>
            <Tetris onGameEnd={handleGameEnd} />
          </div>
        );
      case 'Tic Tac Toe':
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