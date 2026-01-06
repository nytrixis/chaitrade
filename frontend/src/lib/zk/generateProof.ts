// @ts-ignore - snarkjs doesn't have full TypeScript support
import * as snarkjs from 'snarkjs';

let poseidonInstance: any = null;

async function getPoseidon() {
  if (!poseidonInstance) {
    const { buildPoseidon } = await import('circomlibjs');
    poseidonInstance = await buildPoseidon();
  }
  return poseidonInstance;
}

export async function calculatePoseidonCommitment(
  creditScore: number,
  salt: bigint
): Promise<bigint> {
  const poseidon = await getPoseidon();
  const hash = poseidon([BigInt(creditScore), salt]);
  return poseidon.F.toObject(hash);
}

export async function generateCreditScoreProof(
  creditScore: number,
  minThreshold: number,
  wasmFile: string = '/zk/credit_score_range.wasm',
  zkeyFile: string = '/zk/credit_score_range_final.zkey'
): Promise<{
  proof: any;
  publicSignals: [string, string, string];
  commitment: bigint;
  salt: bigint;
  formattedForContract: {
    proof_a: [bigint, bigint];
    proof_b: [[bigint, bigint], [bigint, bigint]];
    proof_c: [bigint, bigint];
    publicInputs: [bigint, bigint, bigint];
  };
}> {
  console.log('Generating ZK proof for credit score:', creditScore, '> threshold:', minThreshold);

  const saltArray = new Uint8Array(32);
  crypto.getRandomValues(saltArray);
  const salt = BigInt('0x' + Array.from(saltArray).map(b => b.toString(16).padStart(2, '0')).join(''));

  const commitment = await calculatePoseidonCommitment(creditScore, salt);
  console.log('Poseidon commitment:', commitment.toString());

  const circuitInputs = {
    creditScore: creditScore.toString(),
    salt: salt.toString(),
    commitment: commitment.toString(),
    minThreshold: minThreshold.toString(),
  };

  console.log('Circuit inputs:', circuitInputs);

  try {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      circuitInputs,
      wasmFile,
      zkeyFile
    );

    console.log('Proof generated successfully');
    console.log('Public signals:', publicSignals);

    const formattedForContract = {
      proof_a: [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])] as [bigint, bigint],
      proof_b: [
        [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
        [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
      ] as [[bigint, bigint], [bigint, bigint]],
      proof_c: [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])] as [bigint, bigint],
      publicInputs: [
        BigInt(publicSignals[0]),
        BigInt(publicSignals[1]),
        BigInt(publicSignals[2]),
      ] as [bigint, bigint, bigint],
    };

    return {
      proof,
      publicSignals: publicSignals as [string, string, string],
      commitment,
      salt,
      formattedForContract,
    };
  } catch (error) {
    console.error('Error generating ZK proof:', error);
    throw new Error('Failed to generate ZK proof: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

export async function calculateCreditScore(address: string): Promise<number> {
  console.log('Calculating deterministic credit score for:', address);

  const normalizedAddress = address.toLowerCase().replace('0x', '');

  const hexCounts: Record<string, number> = {};
  for (const char of normalizedAddress) {
    hexCounts[char] = (hexCounts[char] || 0) + 1;
  }

  let entropy = 0;
  const totalChars = normalizedAddress.length;
  for (const count of Object.values(hexCounts)) {
    const probability = count / totalChars;
    entropy -= probability * Math.log2(probability);
  }

  const normalizedEntropy = Math.min(entropy / 4, 1);
  const entropyScore = normalizedEntropy * 120;

  const hasMixedCase = address !== address.toLowerCase() && address !== address.toUpperCase();
  const checksumScore = hasMixedCase ? 90 : 60;

  const firstSegment = normalizedAddress.substring(0, 10);
  const lastSegment = normalizedAddress.substring(30);
  const uniqueFirst = new Set(firstSegment).size;
  const uniqueLast = new Set(lastSegment).size;
  const patternScore = ((uniqueFirst + uniqueLast) / 20) * 60;

  let numericCount = 0;
  for (const char of normalizedAddress) {
    if (char >= '0' && char <= '9') numericCount++;
  }
  const numericRatio = numericCount / totalChars;
  const balanceScore = (1 - Math.abs(numericRatio - 0.5) * 2) * 30;

  const baseScore = 650;
  const variableScore = entropyScore + checksumScore + patternScore + balanceScore;
  const finalScore = Math.round(baseScore + variableScore);
  const clampedScore = Math.max(650, Math.min(950, finalScore));

  console.log('Credit score breakdown:', {
    address,
    entropy: Math.round(entropyScore),
    checksum: checksumScore,
    pattern: Math.round(patternScore),
    balance: Math.round(balanceScore),
    total: clampedScore
  });

  return clampedScore;
}

export async function verifyProofOffchain(
  proof: any,
  publicSignals: string[],
  verificationKeyPath: string = '/zk/verification_key.json'
): Promise<boolean> {
  try {
    const response = await fetch(verificationKeyPath);
    const vk = await response.json();
    const isValid = await snarkjs.groth16.verify(vk, publicSignals, proof);
    console.log('Off-chain verification result:', isValid);
    return isValid;
  } catch (error) {
    console.error('Error verifying proof off-chain:', error);
    return false;
  }
}

export function commitmentToBytes32(commitment: bigint): `0x${string}` {
  return `0x${commitment.toString(16).padStart(64, '0')}` as `0x${string}`;
}
