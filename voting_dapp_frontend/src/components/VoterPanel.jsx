import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getContract } from "../hooks/useWallet";

const STATES = ["Created", "Registration Open", "Voting Open", "Ended"];

export default function VoterPanel() {
  const [regNo, setRegNo] = useState("");
  const [name, setName] = useState("");
  const [candidateId, setCandidateId] = useState("");

  const [candidates, setCandidates] = useState([]);
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadElectionData();
  }, []);

  const loadElectionData = async () => {
    try {
      const contract = await getContract();

      const currentState = await contract.currentState();
      setState(STATES[currentState]);

      const count = await contract.candidateCount();
      const temp = [];

      for (let i = 1; i <= count; i++) {
        const c = await contract.getCandidate(i);
        temp.push({
          id: c.id.toNumber(),
          name: c.name,
          votes: c.voteCount.toNumber(),
        });
      }

      setCandidates(temp);
    } catch (err) {
      console.error(err);
      setError("Failed to load election data");
    } finally {
      setLoading(false);
    }
  };

  const validateInput = () => {
    return (
      regNo.length === 10 &&
      regNo.startsWith("22") &&
      name.trim().length > 0
    );
  };

  const register = async () => {
    try {
      setError("");

      if (!validateInput()) {
        setError("Invalid registration number or name");
        return;
      }

      const contract = await getContract();

      // 🔐 Fetch event-specific salt from blockchain
      const salt = await contract.eventSalt();

      const identityHash = ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ["string", "string", "bytes32"],
          [
            regNo.trim(),
            name.trim().toLowerCase(),
            salt,
          ]
        )
      );

      const tx = await contract.registerVoter(identityHash);
      await tx.wait();

      alert("Registration successful");
      setRegNo("");
      setName("");
    } catch (err) {
      console.error(err);
      setError(err.reason || "Registration failed");
    }
  };

  const vote = async () => {
    try {
      setError("");

      if (!candidateId) {
        setError("Please enter candidate ID");
        return;
      }

      const contract = await getContract();
      const tx = await contract.vote(Number(candidateId));
      await tx.wait();

      alert("Vote cast successfully");
      setCandidateId("");

      // Refresh results if voting ends soon
      loadElectionData();
    } catch (err) {
      console.error(err);
      setError(err.reason || "Voting failed");
    }
  };

  if (loading) return <p>Loading election data...</p>;

  return (
    <div>
      <h2>Voter Panel</h2>

      <p>
        <strong>Election Status:</strong> {state}
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h3>Candidates</h3>
      {candidates.length === 0 && <p>No candidates added yet</p>}
      {candidates.map((c) => (
        <p key={c.id}>
          {c.id}. {c.name}
        </p>
      ))}

      {state === "Registration Open" && (
        <>
          <h3>Register</h3>

          <input
            placeholder="Registration Number"
            value={regNo}
            onChange={(e) => setRegNo(e.target.value)}
          />

          <input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button onClick={register}>Register</button>
        </>
      )}

      {state === "Voting Open" && (
        <>
          <h3>Vote</h3>

          <input
            placeholder="Candidate ID"
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
          />

          <button onClick={vote}>Vote</button>
        </>
      )}

      {state === "Ended" && (
        <>
          <h3>Results</h3>
          {candidates.map((c) => (
            <p key={c.id}>
              {c.name}: {c.votes} votes
            </p>
          ))}
        </>
      )}
    </div>
  );
}
