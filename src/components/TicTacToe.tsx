import React, { useState, useEffect } from 'react';
import { PublicKey, Connection } from '@solana/web3.js';
import { Program, AnchorProvider, web3, Idl } from '@project-serum/anchor';
import idl from './idl.json'; // Assurez-vous que ce fichier existe

const programID = new PublicKey('Votre_ID_de_Programme');

interface TicTacToeProps {
  onGameEnd: () => void;
  wallet: any; // Instance de Salmon Wallet
}

interface GameAccount {
  glasses: number[] | Uint8Array;
  result: string;
}

function convertToGameAccount(account: any): GameAccount {
  return {
    glasses: Array.isArray(account.glasses) ? account.glasses : Array.from(account.glasses),
    result: account.result || '',
  };
}

const TicTacToe: React.FC<TicTacToeProps> = ({ onGameEnd, wallet }) => {
  const [glasses, setGlasses] = useState<number[]>([]);
  const [selectedGlass, setSelectedGlass] = useState<number | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeGame();
  }, []);

  const getProvider = () => {
    const connection = new Connection('https://testnet.dev2.eclipsenetwork.xyz');
    const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
    return provider;
  }

  const initializeGame = async () => {
    setLoading(true);
    try {
      const provider = getProvider();
      const program = new Program(idl as Idl, programID, provider);

      const [gamePublicKey] = await PublicKey.findProgramAddress(
        [Buffer.from('game'), provider.wallet.publicKey.toBuffer()],
        program.programId
      );

      await program.methods.initializeGame()
        .accounts({
          game: gamePublicKey,
          player: provider.wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      const fetchedAccount = await program.account.game.fetch(gamePublicKey);
      const gameAccount = convertToGameAccount(fetchedAccount);
      setGlasses(gameAccount.glasses as number[]);
    } catch (err) {
      console.error("Erreur lors de l'initialisation du jeu:", err);
      setError("Erreur lors de l'initialisation du jeu");
    } finally {
      setLoading(false);
    }
  };

  const handleGlassClick = async (index: number) => {
    if (loading || selectedGlass !== null) return;

    setLoading(true);
    setError(null);

    try {
      const provider = getProvider();
      const program = new Program(idl as Idl, programID, provider);

      const [gamePublicKey] = await PublicKey.findProgramAddress(
        [Buffer.from('game'), provider.wallet.publicKey.toBuffer()],
        program.programId
      );

      await program.methods.playTurn(index)
        .accounts({
          game: gamePublicKey,
          player: provider.wallet.publicKey,
        })
        .rpc();

      const fetchedAccount = await program.account.game.fetch(gamePublicKey);
      const updatedGame = convertToGameAccount(fetchedAccount);
      setGlasses(updatedGame.glasses as number[]);
      setSelectedGlass(index);
      setResult(updatedGame.result);
    } catch (err) {
      console.error("Erreur lors du tour:", err);
      setError("Erreur lors du tour");
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