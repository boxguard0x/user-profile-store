use crate::{errors::ProfileError, state::UserData, user_accounts::initialize::Initialize};
use anchor_lang::prelude::*;

pub fn initialize_user(ctx: Context<Initialize>, data: UserData) -> Result<()> {
    require!(
        data.age > 18 && !data.name.is_empty() && !data.bio.is_empty(),
        ProfileError::InvalidData
    );
    ctx.accounts.user_account.age = data.age;
    ctx.accounts.user_account.name = data.name;
    ctx.accounts.user_account.bio = data.bio;
    Ok(())
}
