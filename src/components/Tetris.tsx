import React, { useState, useEffect, useCallback } from 'react';
import { PublicKey, LAMPORTS_PER_SOL, Connection, Transaction, SystemProgram } from '@solana/web3.js';
import './Tetris.css';

const FEE_AMOUNT = 0.01 * LAMPORTS_PER_SOL; // 0.01 SOL
const FEE_RECEIVER = new PublicKey('3hhyWcsVjchWy5zuNFJvjskgcZ8WDuuvWDuSyr3GQoUe');

interface GameProps {
  onGameEnd: () => void;
  wallet: any; // Instance de Salmon Wallet
}

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const Tetris: React.FC<GameProps> = ({ onGameEnd, wallet }) => {
  const [board, setBoard] = useState<number[][]>(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
  const [currentPiece, setCurrentPiece] = useState<number[][]>([[1, 1], [1, 1]]);
  const [currentPosition, setCurrentPosition] = useState({ x: 4, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fee, setFee] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [senderAddress, setSenderAddress] = useState<string>('');
  const [rpcUrl, setRpcUrl] = useState<string>('');

  useEffect(() => {
    const estimateTransactionFee = async () => {
      try {
        const customRpcUrl = "https://testnet.dev2.eclipsenetwork.xyz";
        const connection = new Connection(customRpcUrl);
        setRpcUrl(customRpcUrl);

        if (!wallet || !wallet.publicKey) {
          throw new Error("Salmon Wallet n'est pas connecté ou la clé publique n'est pas disponible.");
        }

        const senderPublicKey = new PublicKey(wallet.publicKey);
        setSenderAddress(senderPublicKey.toString());

        const transaction = new Transaction();
        const transferInstruction = SystemProgram.transfer({
          fromPubkey: senderPublicKey,
          toPubkey: FEE_RECEIVER,
          lamports: FEE_AMOUNT
        });
        transaction.add(transferInstruction);

        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = senderPublicKey;

        const message = transaction.compileMessage();
        const estimatedFee = await connection.getFeeForMessage(message, 'recent');

        if (estimatedFee.value === null) {
          throw new Error('Échec de l\'estimation des frais');
        }
        setFee(estimatedFee.value);
      } catch (err: any) {
        console.error("Erreur lors de l'estimation des frais:", err);
        setError(err.message);
      }
    };

    estimateTransactionFee();
  }, [wallet]);

  const paySalmon = async () => {
    if (!wallet) {
      throw new Error("Salmon Wallet n'est pas connecté.");
    }
    
    try {
      const transaction = {
        to: FEE_RECEIVER.toBase58(),
        amount: FEE_AMOUNT.toString(),
        blockchain: 'solana'
      };
  
      console.log("Tentative de transaction:", transaction);
      console.log("Méthodes disponibles dans wallet:", Object.keys(wallet));

      let tx;
      if (typeof wallet.transfer === 'function') {
        tx = await wallet.transfer(transaction);
      } else if (typeof wallet.signAndSendTransaction === 'function') {
        tx = await wallet.signAndSendTransaction(transaction);
      } else if (typeof wallet.sendTransaction === 'function') {
        tx = await wallet.sendTransaction(transaction);
      } else {
        throw new Error("Aucune méthode de transaction compatible n'a été trouvée dans Salmon Wallet");
      }

      console.log("Transaction envoyée:", tx);
      return tx;
    } catch (error: any) {
      console.error("Erreur lors de l'envoi de la transaction:", error);
      throw error;
    }
  };

  const startGame = async () => {
    setIsLoading(true);
    try {
      await paySalmon();
      setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
      setCurrentPiece([[1, 1], [1, 1]]);
      setCurrentPosition({ x: 4, y: 0 });
      setScore(0);
      setGameOver(false);
    } catch (error: any) {
      console.error("Erreur lors du démarrage du jeu:", error);
      alert("Une erreur s'est produite lors du paiement. Veuillez réessayer.");
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

  return (
    <div className="tetris-container">
      <h2>Tetris</h2>
      <div className="tetris-info">
        <p>Score: {score}</p>
        {gameOver && <p>Game Over!</p>}
      </div>
      <p>URL RPC connectée : {rpcUrl}</p>
      <p>Adresse de l'expéditeur : {senderAddress}</p>
      <p>Adresse du destinataire : {FEE_RECEIVER.toBase58()}</p>
      {fee !== null ? (
        <p>Frais de transaction estimés : {fee / LAMPORTS_PER_SOL} SOL</p>
      ) : error ? (
        <p>Erreur : {error}</p>
      ) : (
        <p>Estimation des frais en cours...</p>
      )}
      {renderBoard()}
      {(gameOver || !board.some(row => row.some(cell => cell !== 0))) && (
        <button onClick={startGame} disabled={isLoading || fee === null}>
          {isLoading ? 'Paiement en cours...' : `Démarrer une nouvelle partie (${FEE_AMOUNT / LAMPORTS_PER_SOL} SOL + ${fee ? fee / LAMPORTS_PER_SOL : '?'} SOL de frais)`}
        </button>
      )}
      <button onClick={onGameEnd}>Retour à la sélection des jeux</button>
    </div>
  );
};

export default Tetris;