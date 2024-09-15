import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './TicTacToe.css';
import { Connection } from '@solana/web3.js';
import styles from './TicTacToe.module.css';  // Ajoutez cette ligne
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface TicTacToeProps {
  onGameEnd: () => void;
  walletAddress: string;
  provider: any; // Vous pouvez spécifier un type plus précis si nécessaire
}

const TicTacToe: React.FC<TicTacToeProps> = ({ onGameEnd, walletAddress, provider }) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [isAITurn, setIsAITurn] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameMessage, setGameMessage] = useState('');

  const handlePayAndStart = async () => {
    if (!publicKey) {
      setError("Portefeuille non connecté");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey("ADRESSE_DU_TRESOR_DU_JEU"), // Remplacez par l'adresse réelle du trésor du jeu
          lamports: LAMPORTS_PER_SOL * 0.001 // 0.001 SOL
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      console.log("Transaction confirmée:", signature);
      setGameStarted(true);
      setBoard(Array(9).fill(null));
      setXIsNext(true);
      setIsAITurn(false);
      setGameOver(false);
      setGameMessage('');
    } catch (err) {
      console.error("Erreur lors de la transaction:", err);
      setError("La transaction a échoué. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = (i: number) => {
    if (!gameStarted || calculateWinner(board) || board[i] || isAITurn || gameOver) return;
    const boardCopy = [...board];
    boardCopy[i] = 'X';
    setBoard(boardCopy);
    
    const winner = calculateWinner(boardCopy);
    if (winner) {
      setGameOver(true);
      setGameMessage("Félicitations ! Vous avez gagné. Bienvenue sur le réseau Eclipse !");
      handleWinningReward();
    } else if (boardCopy.every(square => square !== null)) {
      setGameMessage("Match nul ! La partie continue avec un nouveau plateau.");
      setTimeout(() => {
        setBoard(Array(9).fill(null));
        setGameMessage('');
      }, 2000);
    } else {
      setXIsNext(false);
      setIsAITurn(true);
    }
  };

  const handleWinningReward = async () => {
    try {
      // Ici, vous implémenterez la logique pour rembourser le joueur
      console.log("Remboursement de la partie simulé");
      alert("Vous avez été remboursé pour votre victoire !");
    } catch (error) {
      console.error("Erreur lors du remboursement:", error);
      alert("Erreur lors du remboursement. Veuillez contacter le support.");
    }
  };

  useEffect(() => {
    if (isAITurn && !calculateWinner(board) && !gameOver) {
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board);
        if (aiMove !== -1) {
          const boardCopy = [...board];
          boardCopy[aiMove] = 'O';
          setBoard(boardCopy);
          setXIsNext(true);
          
          const winner = calculateWinner(boardCopy);
          if (winner) {
            setGameOver(true);
            setGameMessage("Game Over! L'IA a gagné.");
          } else if (boardCopy.every(square => square !== null)) {
            setGameMessage("Match nul ! La partie continue avec un nouveau plateau.");
            setTimeout(() => {
              setBoard(Array(9).fill(null));
              setGameMessage('');
            }, 2000);
          }
        }
        setIsAITurn(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isAITurn, board, gameOver]);

  let status;
  if (gameOver) {
    status = gameMessage;
  } else if (gameMessage) {
    status = gameMessage;
  } else if (isAITurn) {
    status = "L'IA réfléchit...";
  } else {
    status = "Votre tour";
  }

  return (
    <div className="tic-tac-toe">
      {!gameStarted ? (
        <button onClick={handlePayAndStart} disabled={isLoading || !publicKey}>
          {isLoading ? "Transaction en cours..." : "Payer 0.001 SOL et commencer"}
        </button>
      ) : (
        <>
          <div className="status">{status}</div>
          <div className="board">
            {board.map((square, index) => (
              <button key={index} className="square" onClick={() => handleClick(index)}>
                {square}
              </button>
            ))}
          </div>
          {gameOver && (
            <button onClick={handlePayAndStart}>Nouvelle partie</button>
          )}
        </>
      )}
      {error && <p style={{color: 'red'}}>{error}</p>}
      <button onClick={onGameEnd}>Retour au menu</button>
    </div>
  );
};

function calculateWinner(squares: Array<string | null>): string | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function getAIMove(board: Array<string | null>): number {
  // Vérifier d'abord si l'IA peut gagner
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const boardCopy = [...board];
      boardCopy[i] = 'O';
      if (calculateWinner(boardCopy) === 'O') {
        return i;
      }
    }
  }
  
  // Ensuite, bloquer le joueur s'il peut gagner
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const boardCopy = [...board];
      boardCopy[i] = 'X';
      if (calculateWinner(boardCopy) === 'X') {
        return i;
      }
    }
  }
  
  // Sinon, choisir un coup aléatoire
  const availableMoves = board.reduce((acc, cell, index) => {
    if (cell === null) acc.push(index);
    return acc;
  }, [] as number[]);

  if (availableMoves.length === 0) return -1;
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

const TicTacToeGame = TicTacToe; // Si vous voulez garder le nom TicTacToeGame
export default TicTacToe;
