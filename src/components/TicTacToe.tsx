import React, { useState, useEffect } from 'react';
import { PublicKey, Connection } from '@solana/web3.js';
import { Program, AnchorProvider, web3, Idl } from '@project-serum/anchor';

// Remplacez ceci par votre véritable IDL plus tard
const IDL: Idl = {
  version: "0.1.0",
  name: "tic_tac_toe",
  instructions: []
};

const programID = new PublicKey('2b9zH5CkDZJaydK9EfCfWvixkBqaF69ux2pNbr667rLE');

interface TicTacToeProps {
  onGameEnd: () => void;
  wallet: any; // Instance de Salmon Wallet
  walletAddress: string;
}

interface GameState {
  board: number[][];
  turn: number;
  winner: number | null;
}

const TicTacToe: React.FC<TicTacToeProps> = ({ onGameEnd, wallet, walletAddress }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [selectedGlass, setSelectedGlass] = useState<number | null>(null);

  const glasses = ['🥛', '🥛', '🥛', '🥛', '🥛', '🥛', '🥛', '🥛', '🥛'];

  useEffect(() => {
    initializeGame();
  }, []);

  const getProvider = () => {
    const connection = new Connection('https://testnet.dev2.eclipsenetwork.xyz');
    const provider = new AnchorProvider(
      connection, 
      wallet, 
      AnchorProvider.defaultOptions()
    );
    return provider;
  }

  const initializeGame = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedGlass(null);

    try {
      const provider = getProvider();
      const program = new Program(IDL, programID, provider);

      const [gameStatePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("game_state"), new PublicKey(walletAddress).toBuffer()],
        program.programId
      );

      await program.methods.initializeGame()
        .accounts({
          gameState: gameStatePDA,
          player: new PublicKey(walletAddress),
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      const gameState = await program.account.gameState.fetch(gameStatePDA);
      setGameState(gameState as unknown as GameState);
    } catch (error) {
      console.error("Erreur lors de l'initialisation du jeu:", error);
      setError("Impossible d'initialiser le jeu");
    } finally {
      setLoading(false);
    }
  };

  const handleGlassClick = async (index: number) => {
    if (loading || selectedGlass !== null || !gameState) return;

    setLoading(true);
    setError(null);
    setSelectedGlass(index);

    try {
      const provider = getProvider();
      const program = new Program(IDL, programID, provider);

      const [gameStatePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("game_state"), new PublicKey(walletAddress).toBuffer()],
        program.programId
      );

      await program.methods.makeMove(index)
        .accounts({
          gameState: gameStatePDA,
          player: new PublicKey(walletAddress),
        })
        .rpc();

      const updatedGameState = await program.account.gameState.fetch(gameStatePDA);
      const typedGameState = updatedGameState as unknown as GameState;
      setGameState(typedGameState);

      if (typedGameState.winner === 1) {
        setResult("Vous avez gagné ! Le verre n'était pas empoisonné.");
      } else if (typedGameState.winner === 2) {
        setResult("Vous avez perdu ! Le verre était empoisonné.");
      }
    } catch (error) {
      console.error("Erreur lors du choix du verre:", error);
      setError("Impossible de choisir le verre");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tic-tac-toe-game">
      <h1>Tic Tac Toe (Chomping Glass)</h1>
      <p>Choisissez un verre. Certains sont empoisonnés !</p>
      <div className="glasses-container">
        {glasses.map((glass, index) => (
          <button
            key={index}
            className={`glass ${selectedGlass === index ? 'selected' : ''}`}
            onClick={() => handleGlassClick(index)}
            disabled={loading || selectedGlass !== null}
          >
            {glass}
          </button>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
      {result && <p className="result">{result}</p>}
      <button onClick={initializeGame} disabled={loading}>Nouvelle partie</button>
      <button onClick={onGameEnd} disabled={loading}>Retour à la sélection des jeux</button>
    </div>
  );
};

export default TicTacToe;
