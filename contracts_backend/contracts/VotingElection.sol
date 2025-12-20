// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/*
    VotingElection
    - Admin controlled election
    - Registration + Voting phases
    - One wallet + one identity = one vote
*/

contract VotingElection {

    /* =====================================================
                            ADMIN
    ====================================================== */

    address public admin;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin allowed");
        _;
    }

    /* =====================================================
                        ELECTION STATE
    ====================================================== */

    enum ElectionState {
        Created,
        RegistrationOpen,
        VotingOpen,
        Ended
    }

    ElectionState public currentState;

    /* =====================================================
                            TIME
    ====================================================== */

    uint public registrationEndTime;
    uint public votingEndTime;

    /* =====================================================
                        IDENTITY SALT
    ====================================================== */

    // 🔐 Event-specific salt (on-chain)
    bytes32 public eventSalt;

    /* =====================================================
                        CANDIDATES
    ====================================================== */

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    uint public candidateCount;
    mapping(uint => Candidate) public candidates;

    /* =====================================================
                        VOTERS & IDENTITY
    ====================================================== */

    mapping(address => bool) public registered;
    mapping(address => bool) public hasVoted;

    mapping(bytes32 => bool) public usedIdentities;
    mapping(address => bytes32) public voterIdentity;

    /* =====================================================
                            EVENTS
    ====================================================== */

    event CandidateAdded(uint candidateId, string name);
    event RegistrationStarted(uint endTime);
    event VotingStarted(uint endTime);
    event VoterRegistered(address voter, bytes32 identityHash);
    event VoteCast(address voter, uint candidateId);
    event ElectionEnded();

    /* =====================================================
                        CONSTRUCTOR
    ====================================================== */

    constructor() {
        admin = msg.sender;
        currentState = ElectionState.Created;

        // unique salt per deployment
        eventSalt = keccak256(
            abi.encodePacked(block.timestamp, msg.sender)
        );
    }

    /* =====================================================
                    ADMIN FUNCTIONS
    ====================================================== */

    function addCandidate(string memory _name) external onlyAdmin {
        require(currentState == ElectionState.Created, "Cannot add candidates now");

        candidateCount++;
        candidates[candidateCount] = Candidate(candidateCount, _name, 0);

        emit CandidateAdded(candidateCount, _name);
    }

    function startRegistration(uint durationInSeconds) external onlyAdmin {
        require(currentState == ElectionState.Created, "Invalid state");

        currentState = ElectionState.RegistrationOpen;
        registrationEndTime = block.timestamp + durationInSeconds;

        emit RegistrationStarted(registrationEndTime);
    }

    function startVoting(uint durationInSeconds) external onlyAdmin {
        require(currentState == ElectionState.RegistrationOpen, "Registration not completed");
        require(block.timestamp >= registrationEndTime, "Registration still active");

        currentState = ElectionState.VotingOpen;
        votingEndTime = block.timestamp + durationInSeconds;

        emit VotingStarted(votingEndTime);
    }

    function endElection() external onlyAdmin {
        require(currentState == ElectionState.VotingOpen, "Voting not active");
        require(block.timestamp >= votingEndTime, "Voting still active");

        currentState = ElectionState.Ended;

        emit ElectionEnded();
    }

    /* =====================================================
                    VOTER FUNCTIONS
    ====================================================== */

    function registerVoter(bytes32 identityHash) external {
        require(currentState == ElectionState.RegistrationOpen, "Registration closed");
        require(block.timestamp <= registrationEndTime, "Registration time over");
        require(!registered[msg.sender], "Wallet already registered");
        require(!usedIdentities[identityHash], "Identity already used");

        registered[msg.sender] = true;
        usedIdentities[identityHash] = true;
        voterIdentity[msg.sender] = identityHash;

        emit VoterRegistered(msg.sender, identityHash);
    }

    function vote(uint candidateId) external {
        require(currentState == ElectionState.VotingOpen, "Voting not open");
        require(block.timestamp <= votingEndTime, "Voting time over");
        require(registered[msg.sender], "Not registered");
        require(!hasVoted[msg.sender], "Already voted");
        require(candidateId > 0 && candidateId <= candidateCount, "Invalid candidate");

        candidates[candidateId].voteCount++;
        hasVoted[msg.sender] = true;

        emit VoteCast(msg.sender, candidateId);
    }

    /* =====================================================
                    READ FUNCTIONS
    ====================================================== */

    function getCandidate(uint candidateId) external view returns (Candidate memory) {
        require(candidateId > 0 && candidateId <= candidateCount, "Invalid candidate");
        return candidates[candidateId];
    }
}
