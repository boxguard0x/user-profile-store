import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { UserProfileStore } from "../target/types/user_profile_store";
import {
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Connection,
  clusterApiUrl,
} from "@solana/web3.js";
import { assert } from "chai";

describe("user-profile-store", () => {
  // Configure the client to use the local cluster.
  let provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  let wallet = provider.wallet;

  const program = anchor.workspace
    .userProfileStore as Program<UserProfileStore>;

  const getUserPda = async (signer: anchor.web3.PublicKey) => {
    const [pda, bump] = await PublicKey.findProgramAddressSync(
      [Buffer.from("user-profile"), signer.toBuffer()],
      program.programId
    );

    return { pda, bump };
  };

  afterEach(async () => {
    const { pda } = await getUserPda(wallet.publicKey);
    try {
      await program.methods
        .deleteUser(true)
        .accounts({
          // @ts-ignore
          userAccount: pda,
          signer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    } catch (error) {
      // Ignore errors if the account doesn't exist
    }
  });

  it("Is initialized!", async () => {
    let signer = wallet;
    const { pda, bump } = await getUserPda(signer.publicKey);
    let user = {
      name: "Fake name",
      age: 30,
      bio: "A lot of stuff that was said",
    };
    const tx = await program.methods.initializeUser(user).rpc();

    const pdaData = await program.account.userData.fetch(pda);
    assert.equal(
      pdaData.name,
      user.name,
      "Name and stuff should be equal and shii"
    );
  });

  it("Initializes user with maximum string lengths", async () => {
    const signer = wallet;
    const { pda } = await getUserPda(signer.publicKey);
    const maxString = "A".repeat(50); // 50 characters
    const user = {
      name: maxString,
      bio: maxString,
      age: 30,
    };

    await program.methods.initializeUser(user).rpc();

    const pdaData = await program.account.userData.fetch(pda);
    assert.equal(pdaData.name, maxString, "Name should match max length");
    assert.equal(pdaData.bio, maxString, "Bio should match max length");
    assert.equal(pdaData.age, user.age, "Age should match");
  });
  it("Fails to initialize with oversized strings", async () => {
    const signer = wallet;
    const { pda } = await getUserPda(signer.publicKey);
    const maxString = "A".repeat(51); // 50 characters
    const user = {
      name: maxString,
      bio: maxString,
      age: 30,
    };
    try {
      await program.methods.initializeUser(user).rpc();
      assert.fail("Should have failed with oversized name");
    } catch (error) {
      assert(
        error.error.errorCode.code === "AccountDidNotSerialize" &&
          error.error.errorCode.number === 3004,
        "Expected AccountDidNotSerialize error with code 3004"
      );
    }
  });

  it("Fails to initialize with invalid age", async () => {
    const signer = wallet;
    const { pda } = await getUserPda(signer.publicKey);
    const maxString = "A".repeat(50); // 50 characters
    const user = {
      name: maxString,
      bio: maxString,
      age: 11,
    };
    try {
      await program.methods.initializeUser(user).rpc();
      assert.fail("Should Fail with invalid age");
    } catch (error) {
      assert(
        error.error.errorMessage.includes("age must be over 18"),
        "Should Fail with invalid age"
      );
    }
  });
  it("Fails to re-initialize existing user account", async () => {
    const signer = wallet;
    const { pda } = await getUserPda(signer.publicKey);
    const maxString = "A".repeat(50); // 50 characters
    const user = {
      name: maxString,
      bio: maxString,
      age: 19,
    };
    try {
      await program.methods.initializeUser(user).rpc();
      await program.methods.initializeUser(user).rpc();
      assert.fail("Should not run again since the first one went thrroung");
    } catch (error) {
      let logs = error.transactionLogs;
      assert(
        logs.some((line) => line.includes("already in use")),
        "Should show an already in use error"
      );
    }
  });

  // Update Tests
  it("Updates all user fields", async () => {
    const signer = wallet;
    const { pda } = await getUserPda(signer.publicKey);
    const initialUser = {
      name: "John Doe",
      bio: "Software developer",
      age: 25,
    };
    await program.methods.initializeUser(initialUser).rpc();

    const updatedUser = {
      name: "Jane Doe",
      bio: "Senior developer",
      age: 30,
    };
    await program.methods
      .updateUser(updatedUser.name, updatedUser.bio, updatedUser.age)
      .rpc();

    const pdaData = await program.account.userData.fetch(pda);
    assert.equal(pdaData.name, updatedUser.name, "Name should be updated");
    assert.equal(pdaData.bio, updatedUser.bio, "Bio should be updated");
    assert.equal(pdaData.age, updatedUser.age, "Age should be updated");
  });
  it("Updates only name field", async () => {
    const signer = wallet;
    const { pda } = await getUserPda(signer.publicKey);
    const initialUser = {
      name: "John Doe",
      bio: "Software developer",
      age: 25,
    };
    await program.methods.initializeUser(initialUser).rpc();

    const newName = "Jane Doe";
    await program.methods.updateUser(newName, null, null).rpc();

    const pdaData = await program.account.userData.fetch(pda);
    assert.equal(pdaData.name, newName, "Name should be updated");
    assert.equal(pdaData.bio, initialUser.bio, "Bio should remain unchanged");
    assert.equal(pdaData.age, initialUser.age, "Age should remain unchanged");
  });

  it("Updates with maximum string lengths", async () => {
    const signer = wallet;
    const { pda } = await getUserPda(signer.publicKey);
    const initialUser = {
      name: "John Doe",
      bio: "Software developer",
      age: 25,
    };
    await program.methods.initializeUser(initialUser).rpc();

    const maxString = "A".repeat(50);
    await program.methods.updateUser(maxString, maxString, null).rpc();

    const pdaData = await program.account.userData.fetch(pda);
    assert.equal(pdaData.name, maxString, "Name should match max length");
    assert.equal(pdaData.bio, maxString, "Bio should match max length");
    assert.equal(pdaData.age, initialUser.age, "Age should remain unchanged");
  });

  it("Fails to update with oversized strings", async () => {
    const signer = wallet;
    const { pda } = await getUserPda(signer.publicKey);
    const initialUser = {
      name: "John Doe",
      bio: "Software developer",
      age: 25,
    };
    await program.methods.initializeUser(initialUser).rpc();

    try {
      await program.methods.updateUser("A".repeat(51), null, null).rpc();
      assert.fail("Should have failed with oversized name");
    } catch (error) {
      assert.include(error.toString(), "is too long.");
    }
  });

  it("Fails to update non-existent user account", async () => {
    try {
      await program.methods.updateUser("Jane Doe", null, null).rpc();
      assert.fail("Should have failed on non-existent account");
    } catch (error) {
      assert.include(
        error.toString(),
        "AccountNotInitialized",
        "Expected account not initialized error"
      );
    }
  });

  // Deletion Tests
  it("Deletes user account successfully", async () => {
    const signer = wallet;
    const { pda } = await getUserPda(signer.publicKey);
    const user = {
      name: "John Doe",
      bio: "Software developer",
      age: 25,
    };
    await program.methods.initializeUser(user).rpc();

    await program.methods.deleteUser(true).rpc();

    try {
      await program.account.userData.fetch(pda);
      assert.fail("Account should have been deleted");
    } catch (error) {
      assert.include(
        error.toString(),
        "Account does not exist",
        "Expected account not initialized error"
      );
    }
  });

  it("Fails to delete without confirmation", async () => {
    const signer = wallet;
    const { pda } = await getUserPda(signer.publicKey);
    const user = {
      name: "John Doe",
      bio: "Software developer",
      age: 25,
    };
    await program.methods.initializeUser(user).rpc();

    try {
      await program.methods.deleteUser(false).rpc();
      assert.fail("Should have failed without confirmation");
    } catch (error) {
      assert.equal(
        error.error.errorCode.code,
        "FailedToDeleteAccount",
        "Expected program error"
      );
    }

    const pdaData = await program.account.userData.fetch(pda);
    assert.equal(pdaData.name, user.name, "Account should still exist");
  });
  it("Fails to delete non-existent user account", async () => {
    const signer = wallet;
    try {
      await program.methods.deleteUser(true).rpc();
      assert.fail("Should have failed on non-existent account");
    } catch (error) {
      assert.include(
        error.toString(),
        "AccountNotInitialized",
        "Expected account not initialized error"
      );
    }
  });

  it("Does not initialize with empty strings", async () => {
    const signer = wallet;
    const { pda } = await getUserPda(signer.publicKey);
    const user = {
      name: "",
      bio: "",
      age: 25,
    };

    try {
      await program.methods.initializeUser(user).rpc();

      assert.fail("Should not initialize with empty bio or name ");
    } catch (error) {
      assert.include(
        error.toString(),
        "Invalid data: age must be over 18 and name/bio cannot be empty.",
        "Should show invalid data error "
      );
    }
  });
});
