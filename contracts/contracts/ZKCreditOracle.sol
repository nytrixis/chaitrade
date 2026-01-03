// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IVerifier.sol";

/**
 * @title ZKCreditOracle
 * @dev Allows MSMEs to prove creditworthiness WITHOUT revealing exact score
 *
 * How it works:
 * 1. MSME computes credit score off-chain (based on payment history, GST data, etc.)
 * 2. Generates ZK proof: "I know data that produces score > 700"
 * 3. Commits hash of score to blockchain
 * 4. When requesting funding, proves score > threshold via ZK proof
 * 5. Investors see ✅ verified, but NOT actual score
 */
contract ZKCreditOracle {
    // Groth16 verifier contract (deployed separately)
    IVerifier public immutable verifier;

    struct CreditCommitment {
        bytes32 commitment;      // Merkle root of credit data
        uint256 timestamp;       // When committed
        bool isVerified;         // Has proof been verified?
        uint256 minScoreProven;  // Minimum score proven (e.g., 700)
    }

    mapping(address => CreditCommitment) public commitments;

    // Minimum score required for different funding tiers
    uint256 public constant TIER_BASIC = 650;    // Can fund up to ₹5L
    uint256 public constant TIER_STANDARD = 700; // Can fund up to ₹20L
    uint256 public constant TIER_PREMIUM = 800;  // Can fund up to ₹1Cr

    // Events
    event CommitmentSubmitted(address indexed msme, bytes32 commitment);
    event ProofVerified(address indexed msme, uint256 minScore);

    constructor(address _verifier) {
        verifier = IVerifier(_verifier);
    }

    /**
     * @dev MSME commits to their credit score
     * @param commitment Merkle root of credit data (hash of score + salt)
     *
     * Off-chain calculation:
     * commitment = keccak256(abi.encodePacked(creditScore, salt))
     */
    function commitCreditScore(bytes32 commitment) external {
        require(commitment != bytes32(0), "Invalid commitment");

        commitments[msg.sender] = CreditCommitment({
            commitment: commitment,
            timestamp: block.timestamp,
            isVerified: false,
            minScoreProven: 0
        });

        emit CommitmentSubmitted(msg.sender, commitment);
    }

    /**
     * @dev Verify ZK proof that committed score > minScore
     * @param proof_a ZK proof component A
     * @param proof_b ZK proof component B
     * @param proof_c ZK proof component C
     * @param publicInputs Public signals from circuit
     * @param minScore Minimum score to prove (e.g., 700)
     *
     * Public inputs expected:
     * [0] = commitment (same as committed earlier)
     * [1] = minScore
     * [2] = isValid (1 if score > minScore, 0 otherwise)
     */
    function verifyScoreProof(
        uint[2] memory proof_a,
        uint[2][2] memory proof_b,
        uint[2] memory proof_c,
        uint[3] memory publicInputs,
        uint256 minScore
    ) external returns (bool) {
        CreditCommitment storage commitment = commitments[msg.sender];
        require(commitment.commitment != bytes32(0), "No commitment found");

        // Verify commitment matches
        require(uint256(commitment.commitment) == publicInputs[0],
                "Commitment mismatch");

        // Verify minScore matches
        require(minScore == publicInputs[1], "MinScore mismatch");

        // Verify proof
        bool isValid = verifier.verifyProof(proof_a, proof_b, proof_c, publicInputs);
        require(isValid, "Invalid proof");

        // Proof output should be 1 (score > minScore)
        require(publicInputs[2] == 1, "Score below threshold");

        // Update commitment
        commitment.isVerified = true;
        commitment.minScoreProven = minScore;

        emit ProofVerified(msg.sender, minScore);
        return true;
    }

    /**
     * @dev Check if MSME is creditworthy for given amount
     * @param msme MSME address
     * @param requestedAmount Amount MSME wants to fund (USDC, 6 decimals)
     * @return bool Whether MSME is creditworthy
     * @return uint256 Required minimum score
     */
    function isCreditworthy(address msme, uint256 requestedAmount)
        external
        view
        returns (bool, uint256)
    {
        CreditCommitment memory commitment = commitments[msme];

        if (!commitment.isVerified) {
            return (false, 0);
        }

        // Determine tier based on amount
        uint256 requiredScore;
        if (requestedAmount <= 5_000_000 * 10**6) { // ₹5L
            requiredScore = TIER_BASIC;
        } else if (requestedAmount <= 20_000_000 * 10**6) { // ₹20L
            requiredScore = TIER_STANDARD;
        } else {
            requiredScore = TIER_PREMIUM;
        }

        return (commitment.minScoreProven >= requiredScore, requiredScore);
    }

    /**
     * @dev Get commitment details (for UI display)
     */
    function getCommitment(address msme)
        external
        view
        returns (
            bool exists,
            bool isVerified,
            uint256 minScoreProven,
            uint256 timestamp
        )
    {
        CreditCommitment memory commitment = commitments[msme];
        return (
            commitment.commitment != bytes32(0),
            commitment.isVerified,
            commitment.minScoreProven,
            commitment.timestamp
        );
    }
}
