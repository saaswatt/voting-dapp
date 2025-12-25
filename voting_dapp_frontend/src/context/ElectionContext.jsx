import { createContext, useContext, useState } from "react";
import { setContractAddress as setGlobalContractAddress } from "../contract/config";

const ElectionContext = createContext(null);

export function ElectionProvider({ children }) {
  const [activeContractAddress, setActiveContractAddressState] = useState(null);

  const setActiveContractAddress = (address) => {
    setActiveContractAddressState(address);
    setGlobalContractAddress(address); // keep config.js in sync
  };

  return (
    <ElectionContext.Provider
      value={{
        activeContractAddress,
        setActiveContractAddress,
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
