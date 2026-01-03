# ZK Circuit Setup Guide

This directory contains the Zero-Knowledge proof circuits for ChaiTrade's private credit scoring.

## What This Does

The `credit_score_range.circom` circuit proves that an MSME's credit score is above a certain threshold WITHOUT revealing the actual score.

**Example:**
- MSME has score of 750
- Wants to borrow ₹50L (requires score > 700)
- Generates ZK proof: "I know a score > 700" (without revealing 750)
- Proof is verified on-chain
- Investors see ✅ Verified, but NOT the actual score

## Installation

### Prerequisites

```bash
# Install Rust (for circom)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install circom (Rust-based circuit compiler)
git clone https://github.com/iden3/circom.git
cd circom
cargo build --release
cargo install --path circom
```

### Compile Circuit

```bash
cd zk/scripts
chmod +x compile.sh
./compile.sh
```

This will:
1. Compile the Circom circuit
2. Download the PTAU file (~600MB)
3. Generate zero-knowledge keys
4. Create Solidity verifier contract
5. Export verification keys for browser use

## Files

| File | Purpose |
|------|---------|
| `circuits/credit_score_range.circom` | Circom circuit definition |
| `scripts/compile.sh` | Compilation script |
| `credit_score_range.r1cs` | Circuit constraints (generated) |
| `credit_score_range_js/` | WebAssembly witness gen (generated) |
| `credit_score_range_final.zkey` | Zero-knowledge key (generated) |
| `verification_key.json` | For on-chain verification (generated) |
| `Groth16Verifier.sol` | Smart contract verifier (generated) |

## Browser Integration

### 1. Install SnarkJS

```bash
cd frontend
npm install snarkjs
```

### 2. Generate Proof

```typescript
import { groth16 } from "snarkjs";

const proof = await groth16.fullProve(
  {
    creditScore: 750,      // Private: MSME's actual score
    salt: "0x1234...",     // Private: random salt
  },
  "credit_score_range_js/credit_score_range.wasm",
  "credit_score_range_final.zkey"
);

// proof.proof - Use for on-chain verification
// proof.publicSignals - [commitment, minThreshold, isValid]
```

### 3. Verify On-Chain

```solidity
creditOracle.verifyScoreProof(
  proof.proof.pi_a,
  proof.proof.pi_b,
  proof.proof.pi_c,
  proof.publicSignals,
  700  // minThreshold
);
```

## Security Notes

⚠️ **For Production:**
- Run proper ceremony with community contributors
- Use trusted PTAU file from SnarkJS/Ethereum community
- Audit circuit logic and constraints
- Test with real-world credit scores

## Resources

- [Circom Documentation](https://docs.circom.io/)
- [SnarkJS GitHub](https://github.com/iden3/snarkjs)
- [ZK Proof Concepts](https://en.wikipedia.org/wiki/Zero-knowledge_proof)
