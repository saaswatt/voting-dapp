// config.js

// This will hold the ACTIVE election contract address.
// It is intentionally NOT hardcoded.
export let CONTRACT_ADDRESS = null;

// Called when admin deploys a new election
export const setContractAddress = (address) => {
  CONTRACT_ADDRESS = address;
};
