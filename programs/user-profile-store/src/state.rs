use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct UserData {
    #[max_len(50)]
    pub name: String,
    #[max_len(50)]
    pub bio: String,
    pub age: i8,
}
