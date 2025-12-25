import { useState } from "react";
import { getContract } from "../hooks/useWallet";
import { useElectionContext } from "../context/ElectionContext";

export default function AdminPanel() {
  const [candidateName, setCandidateName] = useState("");
  const [duration, setDuration] = useState("");
  const [newElectionAddress, setNewElectionAddress] = useState("");

  const { setActiveContractAddress } = useElectionContext();

  // ✅ NEW ELECTION (MANUAL ADDRESS SET)
  const setNewElection = () => {
    if (!newElectionAddress) {
      alert("Please enter a contract address");
      return;
    }

    setActiveContractAddress(newElectionAddress);
    alert("New election activated");
    setNewElectionAddress("");
  };

  // Existing admin actions (unchanged)
  const addCandidate = async () => {
    const contract = await getContract();
    const tx = await contract.addCandidate(candidateName);
    await tx.wait();
    alert("Candidate added");
  };

  const startRegistration = async () => {
    const contract = await getContract();
    const tx = await contract.startRegistration(Number(duration));
    await tx.wait();
    alert("Registration started");
  };

  const startVoting = async () => {
    const contract = await getContract();
    const tx = await contract.startVoting(Number(duration));
    await tx.wait();
    alert("Voting started");
  };

  const endElection = async () => {
    const contract = await getContract();
    const tx = await contract.endElection();
    await tx.wait();
    alert("Election ended");
  };

  return (
    <div>
      <h2>Admin Panel</h2>

      {/* ✅ NEW ELECTION INPUT */}
      <h3>Activate New Election</h3>
      <input
        placeholder="Deployed Contract Address"
        value={newElectionAddress}
        onChange={(e) => setNewElectionAddress(e.target.value)}
      />
      <button onClick={setNewElection}>
        Set Active Election
      </button>

      <hr />

      <input
        placeholder="Candidate name"
        value={candidateName}
        onChange={(e) => setCandidateName(e.target.value)}
      />
      <button onClick={addCandidate}>Add Candidate</button>

      <br /><br />

      <input
        placeholder="Duration (seconds)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />
      <button onClick={startRegistration}>Start Registration</button>
      <button onClick={startVoting}>Start Voting</button>

      <br /><br />

      <button onClick={endElection}>End Election</button>
    </div>
  );
}
