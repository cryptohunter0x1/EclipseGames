import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { TicTacToeContract } from "../target/types/tic_tac_toe_contract";

describe("tic_tac_toe_contract", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.TicTacToeContract as Program<TicTacToeContract>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
