import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

export async function payToPlayGame(wallet: any, connection: Connection, amount: number = 0.01) {
  if (!wallet.publicKey) {
    throw new Error("Wallet non connecté");
  }

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: new PublicKey("VOTRE_ADRESSE_DE_RECEPTION_ICI"), // Remplacez par l'adresse qui recevra les paiements
      lamports: amount * LAMPORTS_PER_SOL
    })
  );

  try {
    const signature = await wallet.sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, 'confirmed');
    console.log("Paiement effectué avec succès :", signature);
    return true;
  } catch (error) {
    console.error("Erreur lors du paiement :", error);
    throw error;
  }
}
