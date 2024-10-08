import React, { useState, useCallback, useEffect, useRef } from 'react'; 
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'; 
import './Tetris.css'; 

const FEE_AMOUNT = LAMPORTS_PER_SOL * 0.001;
const FEE_RECEIVER = new PublicKey("3hhyWcsVjchWy5zuNFJvjskgcZ8WDuuvWDuSyr3GQoUe");

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const TETROMINOS = {
  O: [[1, 1], [1, 1]],
  I: [[1, 1, 1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  L: [[1, 0, 0], [1, 1, 1]],
  J: [[0, 0, 1], [1, 1, 1]],
  Z: [[1, 1, 0], [0, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
};

interface TetrisProps {
  onGameEnd: () => void;
}

const Tetris: React.FC<TetrisProps> = ({ onGameEnd }) => {
  const { publicKey, sendTransaction, connected } = useWallet();

  const [board, setBoard] = useState<number[][]>(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
  const [currentPiece, setCurrentPiece] = useState<number[][]>(TETROMINOS.O);
  const [currentPosition, setCurrentPosition] = useState<{ x: number; y: number }>({ x: 4, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  
  const intervalIdRef = useRef<number | null>(null);

  const isValidMove = useCallback((x: number, y: number, piece: number[][]) => {
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
  }, [board]);

  const checkLines = useCallback(() => {
    let linesCleared = 0;
    const newBoard = board.filter(row => {
      if (row.every(cell => cell !== 0)) {
        linesCleared++;
        return false;
      }
      return true;
    });
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }
    setBoard(newBoard);
    setScore(prev => prev + linesCleared * 100);
  }, [board]);

  const spawnNewPiece = useCallback(() => {
    const pieces = Object.values(TETROMINOS);
    const newPiece = pieces[Math.floor(Math.random() * pieces.length)];
    const newPosition = { 
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(newPiece[0].length / 2), 
      y: 0 
    };
    
    if (isValidMove(newPosition.x, newPosition.y, newPiece)) {
      setCurrentPiece(newPiece);
      setCurrentPosition(newPosition);
    } else {
      setGameOver(true);
    }
  }, [isValidMove]);

  const placePiece = useCallback(() => {
    const newBoard = [...board];
    for (let y = 0; y < currentPiece.length; y++) {
      for (let x = 0; x < currentPiece[y].length; x++) {
        if (currentPiece[y][x]) {
          if (currentPosition.y + y < BOARD_HEIGHT) {
            newBoard[currentPosition.y + y][currentPosition.x + x] = 1;
          }
        }
      }
    }
    setBoard(newBoard);
    checkLines();
    spawnNewPiece();
  }, [board, currentPiece, currentPosition, checkLines, spawnNewPiece]);

  const movePiece = useCallback((dx: number, dy: number) => {
    if (isValidMove(currentPosition.x + dx, currentPosition.y + dy, currentPiece)) {
      setCurrentPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    } else if (dy > 0) {
      placePiece();
    }
  }, [currentPosition, currentPiece, isValidMove, placePiece]);

  const rotatePiece = useCallback(() => {
    const rotated = currentPiece[0].map((_, index) =>
      currentPiece.map(row => row[index]).reverse()
    );
    if (isValidMove(currentPosition.x, currentPosition.y, rotated)) {
      setCurrentPiece(rotated);
    }
  }, [currentPiece, currentPosition, isValidMove]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!gameOver && gameStarted) {
      switch (e.key) {
        case 'ArrowLeft':
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          movePiece(0, 1);
          break;
        case 'ArrowUp':
          rotatePiece();
          break;
      }
    }
  }, [gameOver, gameStarted, movePiece, rotatePiece]);

  useEffect(() => {
    if (!gameOver && gameStarted) {
      intervalIdRef.current = window.setInterval(() => {
        if (!isValidMove(currentPosition.x, currentPosition.y + 1, currentPiece)) {
          placePiece();
        } else {
          movePiece(0, 1);
        }
      }, 1000);
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [gameOver, gameStarted, currentPosition, currentPiece, isValidMove, placePiece, movePiece]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const startGame = useCallback(async () => {
    if (!connected || !publicKey) {
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
      
      console.log("Payment successful, initializing game...");
      setIsInitializing(true);
      await initializeGame();
      setGameStarted(true);
      setIsInitializing(false);
      console.log("Game started successfully");
    } catch (err: any) {
      console.error("Error starting game:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [connected, publicKey, sendTransaction]);

  const resetGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
    setCurrentPiece(TETROMINOS.O);
    setCurrentPosition({ x: 4, y: 0 });
    setScore(0);
    setGameOver(false);
  };

  const renderBoard = () => {
    const boardWithPiece = board.map(row => [...row]);
    currentPiece.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const boardY = y + currentPosition.y;
          const boardX = x + currentPosition.x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            boardWithPiece[boardY][boardX] = value;
          }
        }
      });
    });

    return (
      <div className="tetris-board">
        {boardWithPiece.map((row, y) => (
          <div key={y} className="tetris-row">
            {row.map((cell, x) => (
              <div 
                key={x} 
                className={`tetris-cell ${cell ? 'filled' : ''}`} 
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  const initializeGame = async () => {
    resetGame();
    spawnNewPiece();
  };

  const renderGame = () => {
    if (!connected) {
      return <div>Please connect your wallet to play Tetris</div>;
    }

    if (!gameStarted) {
      return (
        <div>
          <h2>Tetris</h2>
          <p>Wallet address: {publicKey?.toBase58()}</p>
          {error && <p style={{color: 'red'}}>Error: {error}</p>}
          <button onClick={startGame} disabled={isLoading || isInitializing}>
            {isLoading ? 'Processing payment...' : isInitializing ? 'Initializing game...' : `Start new game (${FEE_AMOUNT / LAMPORTS_PER_SOL} SOL)`}
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
        <div className="tetris-board-container">
          {renderBoard()}
        </div>
        <button onClick={onGameEnd}>Back to game selection</button>
      </div>
    );
  };

  return renderGame();
};

export default Tetris;
