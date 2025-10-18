use crate::{constants::USER_PROFILE_SEED, state::UserData};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(
        mut,
        seeds = [USER_PROFILE_SEED, signer.key().as_ref()], 
        bump
    )]
    pub user_account: Account<'info, UserData>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}