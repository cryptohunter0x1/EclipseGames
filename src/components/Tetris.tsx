import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import './Tetris.css';  // Au lieu de import styles from './Tetris.module.css';

const FEE_AMOUNT = ethers.parseEther("0.001"); // 0.001 ETH
const FEE_RECEIVER = "3hhyWcsVjchWy5zuNFJvjskgcZ8WDuuvWDuSyr3GQoUe";

interface GameProps {
  onGameEnd: () => void;
  wallet: any; // Vous pouvez spécifier un type plus précis si nécessaire
  walletAddress: string;
}

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const Tetris: React.FC<GameProps> = ({ onGameEnd, wallet, walletAddress }) => {
  const [board, setBoard] = useState<number[][]>(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
  const [currentPiece, setCurrentPiece] = useState<number[][]>([[1, 1], [1, 1]]);
  const [currentPosition, setCurrentPosition] = useState({ x: 4, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  const provider = new ethers.JsonRpcProvider("https://testnet.dev2.eclipsenetwork.xyz");

  const FEE_AMOUNT = ethers.parseEther("0.001"); // 0.001 ETH
  const FEE_RECEIVER = "3hhyWcsVjchWy5zuNFJvjskgcZ8WDuuvWDuSyr3GQoUe";

  const startGame = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulation du paiement
      console.log("Simulation du paiement de", ethers.formatEther(FEE_AMOUNT), "ETH");
      await new Promise(resolve => setTimeout(resolve, 2000)); // Attente simulée de 2 secondes
      
      console.log("Paiement simulé réussi");
      setGameStarted(true);
      setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
      setCurrentPiece([[1, 1], [1, 1]]);
      setCurrentPosition({ x: 4, y: 0 });
      setScore(0);
      setGameOver(false);
    } catch (err: any) {
      console.error("Erreur lors de la simulation du paiement:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const movePiece = useCallback((dx: number, dy: number) => {
    if (gameOver) return;
    const newX = currentPosition.x + dx;
    const newY = currentPosition.y + dy;
    if (isValidMove(newX, newY, currentPiece)) {
      setCurrentPosition({ x: newX, y: newY });
    } else if (dy > 0) {
      const newBoard = board.map(row => [...row]);
      currentPiece.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) {
            newBoard[currentPosition.y + y][currentPosition.x + x] = value;
          }
        });
      });
      setBoard(newBoard);
      clearLines(newBoard);
      spawnNewPiece();
    }
  }, [currentPosition, currentPiece, board, gameOver]);

  const isValidMove = (x: number, y: number, piece: number[][]) => {
    for (let row = 0; row < piece.length; row++) {
      for (let col = 0; col < piece[row].length; col++) {
        if (piece[row][col]) {
          const newX = x + col;
          const newY = y + row;
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT || (newY >= 0 && board[newY][newX])) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const clearLines = (newBoard: number[][]) => {
    let linesCleared = 0;
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== 0)) {
        newBoard.splice(y, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(0));
        linesCleared++;
        y++;
      }
    }
    if (linesCleared > 0) {
      setScore(prevScore => prevScore + linesCleared * 100);
    }
  };

  const spawnNewPiece = () => {
    const pieces = [
      [[1, 1], [1, 1]],
      [[1, 1, 1, 1]],
      [[1, 1, 1], [0, 1, 0]],
      [[1, 1, 0], [0, 1, 1]],
      [[0, 1, 1], [1, 1, 0]],
      [[1, 1, 1], [1, 0, 0]],
      [[1, 1, 1], [0, 0, 1]]
    ];
    const newPiece = pieces[Math.floor(Math.random() * pieces.length)];
    setCurrentPiece(newPiece);
    setCurrentPosition({ x: Math.floor((BOARD_WIDTH - newPiece[0].length) / 2), y: 0 });

    if (!isValidMove(Math.floor((BOARD_WIDTH - newPiece[0].length) / 2), 0, newPiece)) {
      setGameOver(true);
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameOver) return;
      switch (event.key) {
        case 'ArrowLeft':
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          movePiece(0, 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [movePiece, gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const gameLoop = setInterval(() => {
      movePiece(0, 1);
    }, 1000);
    return () => clearInterval(gameLoop);
  }, [movePiece, gameOver]);

  const renderBoard = () => {
    const renderedBoard = board.map((row) => [...row]);
    currentPiece.forEach((row, pieceY) => {
      row.forEach((cell, pieceX) => {
        if (cell && currentPosition.y + pieceY >= 0) {
          renderedBoard[currentPosition.y + pieceY][currentPosition.x + pieceX] = cell;
        }
      });
    });

    return (
      <div className="tetris-board">
        {renderedBoard.map((row, y) => (
          <div key={y} className="tetris-row">
            {row.map((cell, x) => (
              <div key={x} className={`tetris-cell ${cell ? 'filled' : ''}`}></div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  if (!gameStarted) {
    return (
      <div>
        <h2>Tetris</h2>
        <p>Adresse du wallet : {walletAddress}</p>
        {error && <p style={{color: 'red'}}>Erreur : {error}</p>}
        <button onClick={startGame} disabled={isLoading}>
          {isLoading ? 'Paiement en cours...' : `Démarrer une nouvelle partie (${ethers.formatEther(FEE_AMOUNT)} ETH)`}
        </button>
        <button onClick={onGameEnd}>Retour à la sélection des jeux</button>
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
      <p>Adresse du wallet : {walletAddress}</p>
      {renderBoard()}
      {gameOver && (
        <button onClick={startGame} disabled={isLoading}>
          {isLoading ? 'Paiement en cours...' : `Démarrer une nouvelle partie (${ethers.formatEther(FEE_AMOUNT)} ETH)`}
        </button>
      )}
      <button onClick={onGameEnd}>Retour à la sélection des jeux</button>
    </div>
  );
};

const TetrisGame = Tetris; // Si vous voulez garder le nom TetrisGame
export default Tetris;
