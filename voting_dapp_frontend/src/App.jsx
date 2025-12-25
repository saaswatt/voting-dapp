import { useEffect, useState } from "react";
import WalletConnect from "./components/WalletConnect";
import AdminPanel from "./components/AdminPanel";
import VoterPanel from "./components/VoterPanel";
import { getContract } from "./hooks/useWallet";
import { useElectionContext } from "./context/ElectionContext";

function App() {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const { activeContractAddress } = useElectionContext();

  // Detect wallet account change
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setIsAdmin(false);
      } else {
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

  // Check admin role ONLY when an election exists
  useEffect(() => {
    let mounted = true;

    const checkAdmin = async () => {
      if (!account || !activeContractAddress) {
        if (mounted) setIsAdmin(false);
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
  }, [account, activeContractAddress]);

  return (
    <div>
      <h1>Voting DApp</h1>

      {!account ? (
        <WalletConnect setAccount={setAccount} />
      ) : (
        <>
          <p>Connected: {account}</p>

          {/* 🔓 BOOTSTRAP LOGIC */}
          {!activeContractAddress ? (
            <>
              <p>No active election. Admin must activate one.</p>
              <AdminPanel />
            </>
          ) : isAdmin ? (
            <AdminPanel />
          ) : (
            <VoterPanel />
          )}
        </>
      )}
    </div>
  );
}

export default App;
