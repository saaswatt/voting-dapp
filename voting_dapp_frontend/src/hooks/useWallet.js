import { ethers } from "ethers";
import abi from "../contract/abi.json";
import { CONTRACT_ADDRESS } from "../contract/config";

// Allowed networks (local + sepolia)
const ALLOWED_CHAIN_IDS = [31337, 11155111]; // Hardhat, Sepolia

export async function getContract() {
  if (!window.ethereum) {
    throw new Error("MetaMask not found");
  }

  if (!CONTRACT_ADDRESS) {
    throw new Error("No active election. Admin must create a new election.");
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const network = await provider.getNetwork();

  if (!ALLOWED_CHAIN_IDS.includes(network.chainId)) {
    throw new Error(
      "Please connect MetaMask to Hardhat (31337) or Sepolia (11155111)"
    );
  }

  const signer = provider.getSigner();

  return new ethers.Contract(
    CONTRACT_ADDRESS,
    abi,
    signer
  );
}
