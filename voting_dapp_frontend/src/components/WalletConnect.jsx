import { ethers } from "ethers";

function WalletConnect({ setAccount }) {
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setAccount(accounts[0]);
    } catch (err) {
      console.error("User rejected connection", err);
    }
  };

  return (
    <button onClick={connectWallet}>
      Connect Wallet
    </button>
  );
}

export default WalletConnect;
