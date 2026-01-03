// SnarkJS is installed and available
// @ts-ignore - snarkjs doesn't have full TypeScript support
import * as snarkjs from 'snarkjs';

/**
 * Generate ZK proof of credit score range
 * Proves: creditScore > minThreshold WITHOUT revealing exact score
 * 
 * Uses SnarkJS with Circom circuit for production
 * Falls back to mock proofs if circuit files not available
 */
export async function generateCreditScoreProof(
  creditScore: number,
  minThreshold: number,
  wasmFile?: string,
  zkeyFile?: string
): Promise<{
  proof: any;
  publicSignals: string[];
  commitment: string;
}> {
  // 1. Generate random salt for commitment
  const salt = Math.floor(Math.random() * 2 ** 31);

  // 2. Create commitment hash (Poseidon-like)
  const commitment = hashCommitment(creditScore, salt);

  // 3. Try to generate real proof with SnarkJS
  if (snarkjs && wasmFile && zkeyFile) {
    try {
      // Real proof generation using Circom circuit
      const input = {
        creditScore: creditScore.toString(),
        salt: salt.toString(),
        minThreshold: minThreshold.toString(),
      };

      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        wasmFile,
        zkeyFile
      );

      return {
        proof: proof,
        publicSignals: publicSignals.map((s: any) => s.toString()),
        commitment: commitment.toString(),
      };
    } catch (error) {
      console.warn('Error generating real proof, falling back to mock:', error);
      // Fall through to mock implementation
    }
  }

  // Fallback: Mock proof with correct structure
  const mockProof = {
    pi_a: [
      '1234567890123456789012345678901234567890',
      '0987654321098765432109876543210987654321'
    ],
    pi_b: [
      ['1111111111111111111111111111111111111111', '2222222222222222222222222222222222222222'],
      ['3333333333333333333333333333333333333333', '4444444444444444444444444444444444444444']
    ],
    pi_c: [
      '5555555555555555555555555555555555555555',
      '6666666666666666666666666666666666666666'
    ]
  };

  const publicSignals = [
    commitment.toString(),
    minThreshold.toString(),
    (creditScore > minThreshold ? '1' : '0')
  ];

  return {
    proof: mockProof,
    publicSignals,
    commitment: commitment.toString(),
  };
}

/**
 * Simple hash for commitment (replace with Poseidon in production)
 */
function hashCommitment(score: number, salt: number): number {
  // This is a placeholder - use proper Poseidon hash in production
  const combined = `${score}${salt}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Calculate credit score (placeholder)
 * In production: integrate with credit bureau APIs, on-chain history, etc.
 */
export async function calculateCreditScore(address: string): Promise<number> {
  // TODO: Implement real credit scoring
  // Factors:
  // - Payment history on-chain
  // - GST compliance (from government APIs)
  // - Bank statement analysis
  // - Industry reputation

  console.log('Calculating credit score for:', address);

  // Placeholder: return random score 650-950
  return 650 + Math.floor(Math.random() * 300);
}

/**
 * Verify proof off-chain (for testing)
 */
export async function verifyProofOffchain(
  proof: any,
  publicSignals: string[],
  verificationKeyFile?: string
): Promise<boolean> {
  // If no verification key provided, do basic structural check
  if (!verificationKeyFile) {
    return publicSignals.length === 3 && proof.pi_a && proof.pi_b && proof.pi_c;
  }

  try {
    // Fetch verification key
    const response = await fetch(verificationKeyFile);
    const vk = await response.json();

    // Verify using SnarkJS
    const isValid = await snarkjs.groth16.verify(vk, publicSignals, proof);
    return isValid;
  } catch (error) {
    console.error('Error verifying proof:', error);
    return false;
  }
}
