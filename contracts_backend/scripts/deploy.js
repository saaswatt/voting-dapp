const hre = require("hardhat");

/**
 * Deploys a NEW VotingElection contract.
 * This represents creation of a NEW election.
 * One deployment = one election.
 */
async function deployNewElection() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying new election with admin:", deployer.address);

  const VotingElection = await hre.ethers.getContractFactory("VotingElection");
  const votingElection = await VotingElection.deploy();

  await votingElection.deployed();

  console.log("✅ New VotingElection deployed at:", votingElection.address);

  // IMPORTANT:
  // Return the address so frontend can consume it
  return votingElection.address;
}

// If run directly from CLI (hardhat run)
if (require.main === module) {
  deployNewElection()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

// Export for frontend / admin-triggered usage
module.exports = {
  deployNewElection,
};
