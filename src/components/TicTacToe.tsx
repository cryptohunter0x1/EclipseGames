import React, { useState, useEffect, useCallback } from 'react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Connection } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import '../components/TicTacToe.css';

// Assurez-vous de définir l'URL correcte pour le réseau Eclipse
const ECLIPSE_STAGING_URL = "https://staging-rpc.dev2.eclipsenetwork.xyz"; // Exemple d'URL

// Définition des montants de frais de transaction
const TRANSACTION_FEE = LAMPORTS_PER_SOL * 0.001; // Frais standards (0.001 SOL)
const RETAINED_FEE = TRANSACTION_FEE * 0.1; // 10% retenus par l'application
const TOTAL_FEE = TRANSACTION_FEE + RETAINED_FEE; // Frais totaux payés par le joueur

const FEE_RECEIVER = new PublicKey("3H8wsA5G3F4s2i8eCYdEhksZiuYDFiivp4DZJF58PTmQ"); // Adresse pour les 10%

interface TicTacToeProps {
  onGameEnd: () => void; // Fonction appelée à la fin du jeu
}

const TicTacToe: React.FC<TicTacToeProps> = ({ onGameEnd }) => {
  const { publicKey, sendTransaction, connected } = useWallet();
  const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [gameMessage, setGameMessage] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState('facile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = useCallback((i: number) => {
    if (gameOver || board[i] || !gameStarted || !xIsNext) return;

    const boardCopy = [...board];
    boardCopy[i] = 'X';
    setBoard(boardCopy);
    setXIsNext(false);

    const winner = calculateWinner(boardCopy);
    if (winner) {
      setGameOver(true);
      setGameMessage(`${winner} a gagné !`);
    } else if (boardCopy.every(square => square !== null)) {
      setGameOver(true);
      setGameMessage("Match nul !");
    }
  }, [board, gameOver, xIsNext, gameStarted]);

  const aiMove = useCallback(() => {
    if (gameOver || xIsNext) return;

    let depth;
    switch (difficulty) {
      case 'difficile':
        depth = 6;
        break;
      case 'moyen':
        depth = 3;
        break;
      default: // facile
        depth = 1;
    }

    const move = getBestMove(board, depth);
    const boardCopy = [...board];
    boardCopy[move] = 'O';
    setBoard(boardCopy);
    setXIsNext(true);

    const winner = calculateWinner(boardCopy);
    if (winner) {
      setGameOver(true);
      setGameMessage(`${winner} a gagné !`);
    } else if (boardCopy.every(square => square !== null)) {
      setGameOver(true);
      setGameMessage("Match nul !");
    }
  }, [board, gameOver, xIsNext, difficulty]);

  useEffect(() => {
    if (!xIsNext && !gameOver && gameStarted) {
      const timer = setTimeout(() => {
        aiMove();
      }, 500); // Délai de 500ms pour simuler la "réflexion" de l'IA
      return () => clearTimeout(timer);
    }
  }, [xIsNext, gameOver, gameStarted, aiMove]);

  const startGame = useCallback(async () => {
    if (!connected) {
      setError("Portefeuille non connecté. Veuillez vous connecter d'abord.");
      return;
    }

    if (!publicKey) {
      setError("Clé publique non disponible. Veuillez vous reconnecter.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const connection = new Connection(ECLIPSE_STAGING_URL, 'confirmed');
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: FEE_RECEIVER,
          lamports: TOTAL_FEE,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      setBoard(Array(9).fill(null));
      setXIsNext(true);
      setGameOver(false);
      setGameMessage('');
      setGameStarted(true);
    } catch (err) {
      console.error("Erreur lors du paiement :", err);
      if (err instanceof Error) {
        setError(`Erreur lors du paiement : ${err.message}`);
      } else {
        setError("Une erreur inattendue s'est produite lors du paiement.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, sendTransaction, connected]);

  const calculateWinner = (squares: Array<string | null>) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const getBestMove = (squares: Array<string | null>, depth: number): number => {
    let bestScore = -Infinity;
    let bestMove = -1;
    for (let i = 0; i < squares.length; i++) {
      if (squares[i] === null) {
        squares[i] = 'O';
        let score = minimax(squares, depth, false);
        squares[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  };

  const minimax = (squares: Array<string | null>, depth: number, isMaximizing: boolean): number => {
    const winner = calculateWinner(squares);
    if (winner === 'O') return 10;
    if (winner === 'X') return -10;
    if (squares.every(square => square !== null) || depth === 0) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < squares.length; i++) {
        if (squares[i] === null) {
          squares[i] = 'O';
          let score = minimax(squares, depth - 1, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < squares.length; i++) {
        if (squares[i] === null) {
          squares[i] = 'X';
          let score = minimax(squares, depth - 1, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  return (
    <div className="tic-tac-toe-game" style={{ 
      backgroundColor: '#30c050', 
      padding: '20px', 
      borderRadius: '10px', 
      maxWidth: '300px', 
      margin: 'auto',
      color: 'white',
      textAlign: 'center'
    }}>
      <h2>Tic-Tac-Toe</h2>
      
      <div className="game-rules" style={{ marginBottom: '20px' }}>
        <h3>Règles des frais :</h3>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li>Pas de frais d'entrée.</li>
          <li>Vous ne payez que les frais de transaction.</li>
          <li>10% des frais sont retenus par l'application.</li>
        </ul>
      </div>

      {!gameStarted ? (
        <button 
          onClick={startGame}
          disabled={isLoading || !connected}
          style={{ 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            padding: '10px 30px', 
            fontSize: '18px',
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          {isLoading ? 'Traitement...' : 'PLAY'}
        </button>
      ) : (
        <div className="board" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '5px', 
          margin: '20px auto',
          maxWidth: '240px'
        }}>
          {board.map((square, i) => {
            const isX = square === 'X';
            const isO = square === 'O';
            const backgroundColor = isX ? '#FF6B6B' : isO ? '#4ECDC4' : 'transparent';
            const textColor = isX || isO ? 'white' : 'transparent';
            
            return (
              <button
                key={i}
                onClick={() => handleClick(i)}
                style={{
                  width: '70px',
                  height: '70px',
                  fontSize: '32px',
                  fontWeight: 'bold',
                  backgroundColor: backgroundColor,
                  border: '2px solid white',
                  color: textColor,
                  cursor: square ? 'default' : 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                {square}
              </button>
            );
          })}
        </div>
      )}
      
      {gameStarted && (
        <p style={{ fontSize: '18px', marginBottom: '10px' }}>
          {gameMessage || `C'est au tour de ${xIsNext ? 'X' : 'O'}`}
        </p>
      )}
      
      {error && <p style={{ color: '#FF6B6B', marginTop: '10px' }}>{error}</p>}
      
      <select 
        value={difficulty} 
        onChange={(e) => setDifficulty(e.target.value)}
        style={{
          margin: '10px 0',
          padding: '5px'
        }}
      >
        <option value="facile">Facile</option>
        <option value="moyen">Moyen</option>
        <option value="difficile">Difficile</option>
      </select>
      
      <button 
        onClick={onGameEnd}
        style={{ 
          backgroundColor: '#f44336', 
          color: 'white', 
          padding: '10px 20px', 
          border: 'none', 
          borderRadius: '5px', 
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        Retour au menu
      </button>
    </div>
  );
};

export default TicTacToe;
