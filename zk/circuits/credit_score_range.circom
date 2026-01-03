pragma circom 2.1.6;

include "node_modules/circomlib/circuits/comparators.circom";
include "node_modules/circomlib/circuits/poseidon.circom";

/**
 * Credit Score Range Proof Circuit
 *
 * Proves: creditScore > minThreshold WITHOUT revealing exact score
 *
 * Private inputs:
 *   - creditScore: Actual credit score (e.g., 850)
 *   - salt: Random value for commitment
 *
 * Public inputs:
 *   - commitment: Poseidon hash of (creditScore, salt)
 *   - minThreshold: Minimum required score (e.g., 700)
 *
 * Public outputs:
 *   - isValid: 1 if creditScore > minThreshold, else 0
 *
 * Usage:
 * 1. MSME computes: commitment = Poseidon(creditScore, salt)
 * 2. MSME generates ZK proof proving: commitment is valid AND creditScore > minThreshold
 * 3. Proof is verified on-chain by ZKCreditOracle contract
 * 4. If valid, MSME can request funding without revealing actual score
 */
template CreditScoreRange() {
    // Private inputs (only known to prover)
    signal input creditScore;
    signal input salt;

    // Public inputs (verifier and prover know these)
    signal input commitment;
    signal input minThreshold;

    // Public output
    signal output isValid;

    // 1. Verify commitment = Poseidon(creditScore, salt)
    component hasher = Poseidon(2);
    hasher.inputs[0] <== creditScore;
    hasher.inputs[1] <== salt;

    // Commitment must match
    commitment === hasher.out;

    // 2. Check if creditScore > minThreshold
    component greaterThan = GreaterThan(32); // 32-bit comparison (score 0-1023)
    greaterThan.in[0] <== creditScore;
    greaterThan.in[1] <== minThreshold;

    // 3. Output result (1 if score > threshold, 0 otherwise)
    isValid <== greaterThan.out;
}

component main {public [commitment, minThreshold]} = CreditScoreRange();
