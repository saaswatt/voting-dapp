import { useEffect, useState } from "react";
import WalletConnect from "./components/WalletConnect";
import AdminPanel from "./components/AdminPanel";
import VoterPanel from "./components/VoterPanel";
import { getContract } from "./hooks/useWallet";

function App() {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  //Detect wallet account change
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // Wallet disconnected
        setAccount(null);
        setIsAdmin(false);
      } else {
        // Wallet switched
        setAccount(accounts[0]);
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener(
        "accountsChanged",
        handleAccountsChanged
      );
    };
  }, []);

  //Check admin role whenever account changes
  useEffect(() => {
    let mounted = true;

    const checkAdmin = async () => {
      if (!account) {
        setIsAdmin(false);
        return;
      }

      try {
        const contract = await getContract();
        const admin = await contract.admin();
        if (mounted) {
          setIsAdmin(admin.toLowerCase() === account.toLowerCase());
        }
      } catch (err) {
        console.error(err);
        if (mounted) setIsAdmin(false);
      }
    };

    checkAdmin();

    return () => {
      mounted = false;
    };
  }, [account]);

  return (
    <div>
      <h1>Voting DApp</h1>

      {!account ? (
        <WalletConnect setAccount={setAccount} />
      ) : (
        <>
          <p>Connected: {account}</p>
          {isAdmin ? <AdminPanel /> : <VoterPanel />}
        </>
      )}
    </div>
  );
}

export default App;
