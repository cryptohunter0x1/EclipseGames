import React, { useState, useEffect, useCallback } from 'react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Connection } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import './TicTacToe.css';

interface TicTacToeProps {
  onGameEnd: () => void;
  provider: Connection;
}

const TicTacToe: React.FC<TicTacToeProps> = ({ onGameEnd, provider }) => {
  const { publicKey, sendTransaction } = useWallet();
  const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [gameMessage, setGameMessage] = useState('');
  const [isAITurn, setIsAITurn] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [isLoading, setIsLoading] = useState(false);

  // Transaction pour commencer une nouvelle partie
  const handlePayAndStart = useCallback(async () => {
    if (!publicKey) {
      setGameMessage("Veuillez connecter votre portefeuille.");
      return;
    }

    setIsLoading(true);
    setGameMessage("Transaction en cours...");

    try {
      const { blockhash, lastValidBlockHeight } = await provider.getLatestBlockhash('finalized');
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: publicKey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey("3H8wsA5G3F4s2i8eCYdEhksZiuYDFiivp4DZJF58PTmQ"), // Remplacez par l'adresse du destinataire
          lamports: LAMPORTS_PER_SOL * 0.001,
        })
      );

      const signature = await sendTransaction(transaction, provider);
      await provider.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      setGameMessage("Transaction réussie ! Commencez à jouer.");
      resetGame();
    } catch (err: any) {
      setGameMessage(`Erreur de transaction : ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [provider, publicKey, sendTransaction]);

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setGameOver(false);
    setGameMessage('');
    setXIsNext(true);
    setIsAITurn(false);
  }, []);

  const handleClick = useCallback((i: number) => {
    if (gameOver || board[i] || isAITurn) return;

    const boardCopy = [...board];
    boardCopy[i] = 'X';
    setBoard(boardCopy);
    setXIsNext(false);

    const winner = calculateWinner(boardCopy);
    if (winner) {
      setGameOver(true);
      setGameMessage(`Félicitations ! ${winner} a gagné.`);
      return;
    }

    if (boardCopy.every(square => square !== null)) {
      setGameOver(true);
      setGameMessage("Match nul !");
      return;
    }

    setIsAITurn(true);
  }, [board, gameOver, isAITurn]);

  useEffect(() => {
    if (isAITurn && !gameOver) {
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board, difficulty);
        if (aiMove !== -1) {
          const boardCopy = [...board];
          boardCopy[aiMove] = 'O';
          setBoard(boardCopy);
          setXIsNext(true);

          const winner = calculateWinner(boardCopy);
          if (winner) {
            setGameOver(true);
            setGameMessage("L'IA a gagné !");
          } else if (boardCopy.every(square => square !== null)) {
            setGameOver(true);
            setGameMessage("Match nul !");
          }
        }
        setIsAITurn(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isAITurn, board, gameOver, difficulty]);

  return (
    <div className="tic-tac-toe-game">
      <h2>Tic-Tac-Toe</h2>
      {!gameOver && !isLoading ? (
        <>
          <p className="status">{gameMessage || `C'est au tour de ${xIsNext ? 'X' : 'O'}`}</p>
          <div className="board">
            {board.map((square, i) => (
              <button
                key={i}
                className={`square ${square ? 'filled' : ''}`}
                onClick={() => handleClick(i)}
              >
                {square}
              </button>
            ))}
          </div>

          <div className="difficulty-selection">
            <label>Choisir la difficulté :</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="easy">Facile</option>
              <option value="medium">Moyen</option>
              <option value="hard">Difficile</option>
            </select>
          </div>

          <button className="button" onClick={handlePayAndStart} disabled={isLoading}>
            {isLoading ? "Transaction en cours..." : "Nouvelle Partie (0.001 SOL)"}
          </button>
        </>
      ) : (
        <h2 className="game-over">{gameMessage}</h2>
      )}

      {gameOver && (
        <>
          <button className="button" onClick={handlePayAndStart} disabled={isLoading}>
            {isLoading ? "Transaction en cours..." : "Nouvelle Partie (0.001 SOL)"}
          </button>
        </>
      )}

      <button className="button" onClick={onGameEnd}>Retour au menu</button>
    </div>
  );
};

function calculateWinner(squares: Array<string | null>): string | null {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (let [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function getAIMove(board: Array<string | null>, difficulty: string): number {
  const emptyIndices = board
    .map((value, index) => (value === null ? index : -1))
    .filter(index => index !== -1);

  if (difficulty === 'easy') {
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  if (difficulty === 'medium' || difficulty === 'hard') {
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  return -1;
}

export default TicTacToe;
