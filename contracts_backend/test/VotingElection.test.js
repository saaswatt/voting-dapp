import { expect } from "chai";
import hre from "hardhat";

const ONE_MINUTE = 60;

// helper to simulate blockchain time
async function increaseTime(seconds) {
  await hre.network.provider.send("evm_increaseTime", [seconds]);
  await hre.network.provider.send("evm_mine");
}

describe("VotingElection Contract", function () {
  let voting;
  let admin, voter1, voter2;

  beforeEach(async function () {
    [admin, voter1, voter2] = await hre.ethers.getSigners();

    const VotingElection =
      await hre.ethers.getContractFactory("VotingElection");

    voting = await VotingElection.deploy();
    await voting.deployed();
  });

  /* =====================================================
                        BASIC CHECKS
  ====================================================== */

  it("Should set the deployer as admin", async function () {
    expect(await voting.admin()).to.equal(admin.address);
  });

  it("Non-admin should NOT add candidate", async function () {
    await expect(
      voting.connect(voter1).addCandidate("Alice")
    ).to.be.revertedWith("Only admin allowed");
  });

  /* =====================================================
                    REGISTRATION LOGIC
  ====================================================== */

  it("Should NOT allow registration before registration starts", async function () {
    const identity = hre.ethers.utils.keccak256(
      hre.ethers.utils.toUtf8Bytes("user-1")
    );

    await expect(
      voting.connect(voter1).registerVoter(identity)
    ).to.be.revertedWith("Registration closed");
  });

  it("Should allow registration during registration phase", async function () {
    await voting.startRegistration(ONE_MINUTE);

    const identity = hre.ethers.utils.keccak256(
      hre.ethers.utils.toUtf8Bytes("user-2")
    );

    await expect(
      voting.connect(voter1).registerVoter(identity)
    ).to.emit(voting, "VoterRegistered");
  });

  it("Should NOT allow duplicate registration from same wallet", async function () {
    await voting.startRegistration(ONE_MINUTE);

    const identity = hre.ethers.utils.keccak256(
      hre.ethers.utils.toUtf8Bytes("user-3")
    );

    await voting.connect(voter1).registerVoter(identity);

    await expect(
      voting.connect(voter1).registerVoter(identity)
    ).to.be.revertedWith("Wallet already registered");
  });

  it("Should NOT allow same identity from different wallets", async function () {
    await voting.startRegistration(ONE_MINUTE);

    const identity = hre.ethers.utils.keccak256(
      hre.ethers.utils.toUtf8Bytes("same-person")
    );

    await voting.connect(voter1).registerVoter(identity);

    await expect(
      voting.connect(voter2).registerVoter(identity)
    ).to.be.revertedWith("Identity already used");
  });

  /* =====================================================
                        VOTING LOGIC
  ====================================================== */

  it("Should NOT allow voting before voting starts", async function () {
    await voting.addCandidate("Alice");

    await expect(
      voting.connect(voter1).vote(1)
    ).to.be.revertedWith("Voting not open");
  });

  it("Should allow registered voter to vote once", async function () {
    await voting.addCandidate("Alice");

    await voting.startRegistration(ONE_MINUTE);
    const identity = hre.ethers.utils.keccak256(
      hre.ethers.utils.toUtf8Bytes("voter")
    );
    await voting.connect(voter1).registerVoter(identity);

    await increaseTime(ONE_MINUTE + 1);
    await voting.startVoting(ONE_MINUTE);

    await expect(
      voting.connect(voter1).vote(1)
    ).to.emit(voting, "VoteCast");
  });

  it("Should NOT allow voter to vote twice", async function () {
    await voting.addCandidate("Alice");

    await voting.startRegistration(ONE_MINUTE);
    const identity = hre.ethers.utils.keccak256(
      hre.ethers.utils.toUtf8Bytes("double-vote")
    );
    await voting.connect(voter1).registerVoter(identity);

    await increaseTime(ONE_MINUTE + 1);
    await voting.startVoting(ONE_MINUTE);

    await voting.connect(voter1).vote(1);

    await expect(
      voting.connect(voter1).vote(1)
    ).to.be.revertedWith("Already voted");
  });

  /* =====================================================
                    ELECTION STATE FLOW
  ====================================================== */

  it("Should transition election states correctly", async function () {
    expect(await voting.currentState()).to.equal(0); // Created

    await voting.startRegistration(ONE_MINUTE);
    expect(await voting.currentState()).to.equal(1); // RegistrationOpen

    await increaseTime(ONE_MINUTE + 1);
    await voting.startVoting(ONE_MINUTE);
    expect(await voting.currentState()).to.equal(2); // VotingOpen

    await increaseTime(ONE_MINUTE + 1);
    await voting.endElection();
    expect(await voting.currentState()).to.equal(3); // Ended
  });
});
