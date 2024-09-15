import React, { useState, useEffect } from 'react';
import { useWallet, Wallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import GameSelector from './GameSelector';
import Tetris from './Tetris';
import TicTacToe from './TicTacToe';
import { ethers } from 'ethers';
import { Connection } from '@solana/web3.js';

function AppContent() {
  const [currentGame, setCurrentGame] = useState<'tictactoe' | 'tetris' | null>(null);
  const { publicKey, connected, disconnect, wallet } = useWallet();
  const [provider, setProvider] = useState<Connection | null>(null);

  useEffect(() => {
    const newProvider = new Connection("https://testnet.dev2.eclipsenetwork.xyz");
    setProvider(newProvider);
  }, []);

  useEffect(() => {
    console.log("Wallet connecté:", !!wallet);
    console.log("Clé publique:", publicKey ? publicKey.toString() : 'Non disponible');
  }, [wallet, publicKey]);

  const handleGameEnd = () => {
    setCurrentGame(null);
  };

  const GameSelector = ({ onSelectGame }: { onSelectGame: (game: 'tictactoe' | 'tetris') => void }) => (
    <div>
      <h2>Sélectionnez un jeu</h2>
      <button onClick={() => onSelectGame('tictactoe')}>Tic Tac Toe</button>
      <button onClick={() => onSelectGame('tetris')}>Tetris</button>
    </div>
  );

  return (
    <div className="App">
      <h1>Eclipse Games</h1>
      <WalletMultiButton />
      <button onClick={disconnect}>Déconnecter le wallet</button>
      {connected && publicKey ? (
        <>
          {!currentGame && (
            <GameSelector onSelectGame={setCurrentGame} />
          )}
          {currentGame === 'tetris' && wallet ? (
            <Tetris onGameEnd={handleGameEnd} />
          ) : currentGame === 'tetris' ? (
            <p>Please connect your wallet to play Tetris</p>
          ) : null}
          {currentGame === 'tictactoe' && provider && (
            <TicTacToe
              onGameEnd={handleGameEnd}
              walletAddress={publicKey.toBase58()}
              provider={provider as Connection}
            />
          )}
        </>
      ) : (
        <p>Veuillez connecter votre wallet pour jouer.</p>
      )}
    </div>
  );
}

export default AppContent;
