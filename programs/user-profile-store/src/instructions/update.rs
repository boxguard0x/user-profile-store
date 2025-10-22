use crate::{errors::ProfileError, user_accounts::update::Update};
use anchor_lang::prelude::*;

pub fn update_user(
    ctx: Context<Update>,
    name: Option<String>,
    bio: Option<String>,
    age: Option<i8>,
) -> Result<()> {
    if let Some(name_value) = name {
        require!(!name_value.is_empty(), ProfileError::EmptyName);
        require!(name_value.len() <= 50, ProfileError::NameTooLong);
        ctx.accounts.user_account.name = name_value;
    }
    if let Some(bio_value) = bio {
        require!(!bio_value.is_empty(), ProfileError::EmptyBio);
        require!(bio_value.len() <= 50, ProfileError::BioTooLong);
        ctx.accounts.user_account.bio = bio_value;
    }

    if let Some(age_value) = age {
        require!(age_value > 18, ProfileError::InvalidAge);
        ctx.accounts.user_account.age = age_value;
    }
    /*
    match name {
        Some(t) => ctx.accounts.user_account.name = t,
        None => (),
    }

    match bio {
        Some(t) => ctx.accounts.user_account.bio = t,
        None => (),
    }

    match age {
        Some(t) => {
            require!(t > 18, ProfileError::InvalidAge);
            ctx.accounts.user_account.age = t
        },
        None => (),
    }
    */
    Ok(())
}
