import { createContext, useContext, useEffect, useState } from "react";
import { getContract } from "../hooks/useWallet";

const ElectionContext = createContext(null);

export function ElectionProvider({ children }) {
  const [activeElectionId, setActiveElectionId] = useState(null);
  const [loadingElection, setLoadingElection] = useState(true);

  // 🔑 Load active election ID from blockchain
  useEffect(() => {
    const loadActiveElection = async () => {
      try {
        const contract = await getContract();
        const id = await contract.activeElectionId();

        const electionId = id.toNumber();
        if (electionId > 0) {
          setActiveElectionId(electionId);
        }
      } catch (err) {
        console.error("Failed to load active election ID", err);
      } finally {
        setLoadingElection(false);
      }
    };

    loadActiveElection();
  }, []);

  return (
    <ElectionContext.Provider
      value={{
        activeElectionId,
        setActiveElectionId,
        loadingElection,
      }}
    >
      {children}
    </ElectionContext.Provider>
  );
}

export function useElectionContext() {
  const context = useContext(ElectionContext);
  if (!context) {
    throw new Error(
      "useElectionContext must be used within an ElectionProvider"
    );
  }
  return context;
}
