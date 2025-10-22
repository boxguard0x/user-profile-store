use anchor_lang::prelude::*;

#[error_code]
pub enum ProfileError {
    #[msg("Some messge")]
    InvalidAge,

    #[msg("Invalid data: age must be over 18 and name/bio cannot be empty")]
    InvalidData,

    #[msg("Name must not be empty")]
    EmptyName,
    #[msg("Bio must not be empty")]
    EmptyBio,
    #[msg("Failed to delete user account")]
    FailedToDeleteAccount,
    #[msg("The provided name is too long")]
    NameTooLong,
    #[msg("The provided bio is too long")]
    BioTooLong,
}
