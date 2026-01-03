#!/bin/bash

# ZK Circuit Compilation Script
# Generates Groth16 proofs for credit score verification

set -e

echo "🔧 Compiling ChaiTrade ZK Circuit..."
echo ""

CIRCUIT_NAME="credit_score_range"
PTAU_FILE="pot12_final.ptau"

# Check if circom is installed
if ! command -v circom &> /dev/null; then
    echo "❌ circom is not installed."
    echo "Install with: cargo install circom"
    exit 1
fi

# Step 1: Compile circuit
echo "1️⃣  Compiling circuit..."
circom ${CIRCUIT_NAME}.circom --r1cs --wasm --sym

# Step 2: Download PTAU file (if not exists)
if [ ! -f "${PTAU_FILE}" ]; then
    echo "2️⃣  Downloading PTAU file (large download ~600MB)..."
    echo "   This is used for generating ZK proofs"
    curl -o ${PTAU_FILE} https://hermez.s3-eu-west-1.amazonaws.com/pot12_final.ptau
fi

# Step 3: Generate zero-knowledge key
echo "3️⃣  Generating zero-knowledge key..."
snarkjs groth16 setup ${CIRCUIT_NAME}.r1cs ${PTAU_FILE} ${CIRCUIT_NAME}_0000.zkey

# Step 4: Contribute randomness (ceremony)
echo "4️⃣  Contributing to ceremony (add randomness)..."
snarkjs zkey contribute ${CIRCUIT_NAME}_0000.zkey ${CIRCUIT_NAME}_final.zkey --name="ChaiTrade MSK1" --entropy="$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)"

# Step 5: Export verification key
echo "5️⃣  Exporting verification key..."
snarkjs zkey export verificationkey ${CIRCUIT_NAME}_final.zkey verification_key.json

# Step 6: Generate Solidity verifier
echo "6️⃣  Generating Solidity verifier..."
snarkjs zkey export solidityverifier ${CIRCUIT_NAME}_final.zkey Groth16Verifier.sol

# Step 7: Generate JavaScript verifier
echo "7️⃣  Generating JavaScript verifier..."
snarkjs zkey export soliditycalldata verification_key.json

echo ""
echo "=".repeat(50)
echo "✅ Circuit compilation complete!"
echo "=".repeat(50)
echo ""
echo "📁 Generated files:"
echo "   • ${CIRCUIT_NAME}.r1cs - Circuit constraints"
echo "   • ${CIRCUIT_NAME}_${CIRCUIT_NAME}_js - WebAssembly witness"
echo "   • ${CIRCUIT_NAME}_final.zkey - Zero-knowledge key"
echo "   • verification_key.json - For verification"
echo "   • Groth16Verifier.sol - Smart contract verifier"
echo ""
echo "🎯 Next steps:"
echo "   1. Copy Groth16Verifier.sol to contracts/contracts/mocks/"
echo "   2. Copy verification_key.json to frontend/public/zk/"
echo "   3. Use web3.snarkjs in browser for proof generation"
