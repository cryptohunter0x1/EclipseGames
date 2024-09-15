// Tetris.tsx
import React, { useState, useCallback } from 'react';
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'; 
import { Program, AnchorProvider } from '@project-serum/anchor';
import idl from './tetris.json'; // Assurez-vous d'avoir ce fichier

const FEE_AMOUNT = LAMPORTS_PER_SOL * 0.001;
const FEE_RECEIVER = new PublicKey("3hhyWcsVjchWy5zuNFJvjskgcZ8WDuuvWDuSyr3GQoUe");

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

// Déclare les props pour Tetris
export interface TetrisProps {
  onGameEnd: () => void;
}

const Tetris: React.FC<TetrisProps> = ({ onGameEnd }) => {
  const { publicKey, sendTransaction, connected } = useWallet();
  const anchorWallet = useAnchorWallet(); // Récupérer le portefeuille connecté
  
  // Déclaration des états
  const [board, setBoard] = useState<number[][]>(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
  const [currentPiece, setCurrentPiece] = useState<number[][]>([[1, 1], [1, 1]]);
  const [currentPosition, setCurrentPosition] = useState({ x: 4, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Fonction pour démarrer le jeu et payer les frais via Anchor
  const startGame = useCallback(async () => {
    if (!anchorWallet || !publicKey) {
      setError("Wallet not connected");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const connection = new Connection("https://staging-rpc.dev2.eclipsenetwork.xyz", 'confirmed');
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: FEE_RECEIVER,
          lamports: FEE_AMOUNT,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log("Game started successfully");
      setGameStarted(true);
      resetGame();
    } catch (err: any) {
      console.error("Error starting game:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [anchorWallet, publicKey, sendTransaction]);

  const resetGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
    setCurrentPiece([[1, 1], [1, 1]]);
    setCurrentPosition({ x: 4, y: 0 });
    setScore(0);
    setGameOver(false);
  };

  const renderBoard = () => {
    return (
      <div className="tetris-board">
        {board.map((row, y) => (
          <div key={y} className="tetris-row">
            {row.map((cell, x) => (
              <div key={x} className={`tetris-cell ${cell ? 'filled' : ''}`}></div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  if (!connected) {
    return (
      <div>
        <h2>Tetris</h2>
        <p>Please connect your wallet to play Tetris</p>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div>
        <h2>Tetris</h2>
        <p>Wallet address: {publicKey?.toBase58()}</p>
        {error && <p style={{color: 'red'}}>Error: {error}</p>}
        <button onClick={startGame} disabled={isLoading}>
          {isLoading ? 'Processing payment...' : `Start new game (${FEE_AMOUNT / LAMPORTS_PER_SOL} SOL)`}
        </button>
      </div>
    );
  }

  return (
    <div className="tetrisGame">
      <h2>Tetris</h2>
      <div className="tetris-info">
        <p>Score: {score}</p>
        {gameOver && <p>Game Over!</p>}
      </div>
      <p>Wallet address: {publicKey?.toBase58()}</p>
      {gameStarted ? (
        <div className="tetris-game">
          {/* Contenu du jeu Tetris */}
          {renderBoard()}
        </div>
      ) : (
        <button onClick={startGame}>Start Game</button>
      )}
      <button onClick={onGameEnd}>Back to game selection</button>
    </div>
  );
};

export default Tetris;

