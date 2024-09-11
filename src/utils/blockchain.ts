import { parseEther } from 'ethers';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export const ECLIPSE_RPC_URL = 'https://staging-rpc.dev2.eclipsenetwork.xyz';
export const ETH_FEE_AMOUNT = parseEther("0.001");
export const SOL_FEE_AMOUNT = 0.01 * LAMPORTS_PER_SOL;
export const ETH_FEE_RECEIVER = 'G8HmTzVXDECMWTonnZ7extvQytvWFDnhngiwo4squDb1';
export const SOL_FEE_RECEIVER = new PublicKey('3hhyWcsVjchWy5zuNFJvjskgcZ8WDuuvWDuSyr3GQoUe');

// Ajoutez ici d'autres fonctions utilitaires liées à la blockchain si nécessaire