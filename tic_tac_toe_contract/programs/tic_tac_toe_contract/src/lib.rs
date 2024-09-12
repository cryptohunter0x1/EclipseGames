#![allow(unstable_features)]

use anchor_lang::prelude::*;

declare_id!("2b9zH5CkDZJaydK9EfCfWvixkBqaF69ux2pNbr667rLE");

#[program]
pub mod tic_tac_toe_contract {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
