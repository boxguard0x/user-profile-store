use crate::{errors::ProfileError, user_accounts::delete::Delete};
use anchor_lang::prelude::*;

pub fn delete_user(ctx: Context<Delete>, confirm_deletion: bool) -> Result<()> {
    require!(confirm_deletion, ProfileError::FailedToDeleteAccount);
    msg!(
        "User account deleted for signer: {:?}",
        ctx.accounts.signer.key()
    );
    Ok(())
}
