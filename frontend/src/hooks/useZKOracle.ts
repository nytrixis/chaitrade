/**
 * Custom hook for interacting with ZKCreditOracle contract
 */

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, ZKCREDITOACLE_ABI } from '@/lib/contracts';

/**
 * Commit credit score to oracle
 */
export function useCommitCreditScore() {
  const { writeContract, data: hash, isPending, isSuccess, isError, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const commitCreditScore = (commitment: `0x${string}`) => {
    writeContract({
      address: CONTRACT_ADDRESSES.ZKCreditOracle as `0x${string}`,
      abi: ZKCREDITOACLE_ABI,
      functionName: 'commitCreditScore',
      args: [commitment],
    });
  };

  return {
    commitCreditScore,
    hash,
    isPending,
    isSuccess,
    isError,
    isConfirming,
    isConfirmed,
    error,
  };
}

/**
 * Get commitment for an MSME address
 */
export function useGetCommitment(msmeAddress: `0x${string}` | undefined) {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.ZKCreditOracle as `0x${string}`,
    abi: ZKCREDITOACLE_ABI,
    functionName: 'getCommitment',
    args: msmeAddress ? [msmeAddress] : undefined,
  });

  return {
    commitment: data as any,
    isError,
    isLoading,
    refetch,
  };
}

/**
 * Check if MSME is creditworthy for a requested amount
 */
export function useIsCreditworthy(msmeAddress: `0x${string}` | undefined, requestedAmount: bigint | undefined) {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.ZKCreditOracle as `0x${string}`,
    abi: ZKCREDITOACLE_ABI,
    functionName: 'isCreditworthy',
    args: msmeAddress && requestedAmount !== undefined ? [msmeAddress, requestedAmount] : undefined,
  });

  const result = data as any;

  return {
    isCreditworthy: result ? result[0] as boolean : false,
    maxAmount: result ? result[1] as bigint : BigInt(0),
    isError,
    isLoading,
  };
}

/**
 * Verify ZK proof
 */
export function useVerifyProof() {
  const { writeContract, data: hash, isPending, isSuccess, isError, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const verifyProof = (
    msme: `0x${string}`,
    minScore: number,
    proof: readonly bigint[]
  ) => {
    writeContract({
      address: CONTRACT_ADDRESSES.ZKCreditOracle as `0x${string}`,
      abi: [
        {
          inputs: [
            { name: 'msme', type: 'address' },
            { name: 'minScore', type: 'uint256' },
            { name: 'proof', type: 'uint256[]' },
          ],
          name: 'verifyProof',
          outputs: [{ name: '', type: 'bool' }],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      functionName: 'verifyProof',
      args: [msme, BigInt(minScore), proof],
    });
  };

  return {
    verifyProof,
    hash,
    isPending,
    isSuccess,
    isError,
    isConfirming,
    isConfirmed,
    error,
  };
}
