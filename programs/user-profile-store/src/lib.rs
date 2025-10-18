// src/lib.rs
use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;
pub mod user_accounts;

pub use user_accounts::*;

declare_id!("9FqErgBJTXfQmbUr1RPdUyQafkH1raJ2sghLZCW28vgm");

#[program]
pub mod user_profile_store {
    use super::*;

    pub fn initialize_user(ctx: Context<Initialize>, data: state::UserData) -> Result<()> {
        instructions::initialize_user(ctx, data)
    }

    pub fn update_user(
        ctx: Context<Update>,
        name: Option<String>,
        bio: Option<String>,
        age: Option<i8>,
    ) -> Result<()> {
        instructions::update_user(ctx, name, bio, age)
    }

    pub fn delete_user(ctx: Context<Delete>, confirm_deletion: bool) -> Result<()> {
        instructions::delete_user(ctx, confirm_deletion)
    }
}
