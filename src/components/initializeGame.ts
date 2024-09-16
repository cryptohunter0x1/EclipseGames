import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import idl from './idl.json';

declare global {
  interface Window {
    solana: any;
  }
}

const idlData = idl as any;
const PROGRAM_ID = new PublicKey("GYLvUjL1JUjFfqVvEK4C8EKFMh93B1ZzrQsQceRDEHeB");

export const initializeGame = async () => {
  try {
    console.log("Début de l'initialisation du jeu");
    console.log("ID du programme utilisé:", PROGRAM_ID.toString());

    const connection = new Connection("https://testnet.dev2.eclipsenetwork.xyz");
    console.log("Connexion établie au réseau Eclipse testnet");

    const wallet = window.solana;
    if (!wallet) {
      throw new Error("Wallet non connecté");
    }
    console.log("Wallet trouvé");

    const provider = new AnchorProvider(
      connection, 
      wallet, 
      AnchorProvider.defaultOptions()
    );
    console.log("Provider créé");

    // Vérification supplémentaire de l'ID du programme dans l'IDL
    if (idlData.metadata && idlData.metadata.address) {
      if (idlData.metadata.address !== PROGRAM_ID.toString()) {
        console.warn("Attention: L'ID du programme dans l'IDL ne correspond pas à l'ID utilisé.");
      } else {
        console.log("ID du programme vérifié dans l'IDL");
      }
    }

    const program = new Program(idlData, PROGRAM_ID, provider);
    console.log("Programme initialisé avec l'ID:", PROGRAM_ID.toString());

    // Vérifiez le solde du wallet en ETH
    const balance = await connection.getBalance(wallet.publicKey);
    console.log("Solde du wallet:", balance / 1e9, "ETH");

    // Créez la transaction
    const tx = new Transaction();

    // Ajoutez l'instruction d'initialisation de votre programme
    const initInstruction = await program.methods.initialize()
      .accounts({
        user: wallet.publicKey,
        // Assurez-vous que tous les comptes nécessaires sont inclus ici
      })
      .instruction();

    tx.add(initInstruction);

    // Envoyez et confirmez la transaction
    const signature = await provider.sendAndConfirm(tx);
    console.log("Transaction envoyée et confirmée:", signature);

    console.log("Jeu initialisé avec succès");
  } catch (error) {
    console.error("Erreur détaillée lors de l'initialisation du jeu:", error);
    if (error instanceof Error) {
      console.error("Message d'erreur:", error.message);
      console.error("Stack trace:", error.stack);
    }
    throw error;
  }
};
