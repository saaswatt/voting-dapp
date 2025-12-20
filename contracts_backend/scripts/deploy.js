const hre = require("hardhat");

async function main() {
  const VotingElection = await hre.ethers.getContractFactory("VotingElection");
  const voting = await VotingElection.deploy();

  await voting.deployed();

  console.log("VotingElection deployed to:", voting.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
