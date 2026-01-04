/**
 * Custom hook for interacting with FundingPool contract
 */

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, FUNDINGPOOL_ABI } from '@/lib/contracts';

/**
 * Create funding round for an invoice
 */
export function useCreateFundingRound() {
  const { writeContract, data: hash, isPending, isSuccess, isError, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const createFundingRound = (invoiceId: bigint | number, interestRateBps: number) => {
    writeContract({
      address: CONTRACT_ADDRESSES.FundingPool as `0x${string}`,
      abi: FUNDINGPOOL_ABI,
      functionName: 'createFundingRound',
      args: [BigInt(invoiceId), BigInt(interestRateBps)],
    });
  };

  return {
    createFundingRound,
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
 * Invest in an invoice
 */
export function useInvest() {
  const { writeContract, data: hash, isPending, isSuccess, isError, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const invest = (invoiceId: bigint | number, amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.FundingPool as `0x${string}`,
      abi: FUNDINGPOOL_ABI,
      functionName: 'invest',
      args: [BigInt(invoiceId), amount],
    });
  };

  return {
    invest,
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
 * Settle invoice
 */
export function useSettleInvoice() {
  const { writeContract, data: hash, isPending, isSuccess, isError, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const settleInvoice = (invoiceId: bigint | number, amountReceived: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.FundingPool as `0x${string}`,
      abi: FUNDINGPOOL_ABI,
      functionName: 'settleInvoice',
      args: [BigInt(invoiceId), amountReceived],
    });
  };

  return {
    settleInvoice,
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
 * Get funding info for an invoice
 */
export function useFundingInfo(invoiceId: bigint | number | undefined) {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.FundingPool as `0x${string}`,
    abi: [
      {
        inputs: [{ name: 'invoiceId', type: 'uint256' }],
        name: 'getFundingInfo',
        outputs: [
          {
            components: [
              { name: 'totalFunded', type: 'uint256' },
              { name: 'interestRate', type: 'uint256' },
              { name: 'fundingDeadline', type: 'uint256' },
              { name: 'isActive', type: 'bool' },
              { name: 'isSettled', type: 'bool' },
            ],
            name: '',
            type: 'tuple',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'getFundingInfo',
    args: invoiceId !== undefined ? [BigInt(invoiceId)] : undefined,
  });

  return {
    fundingInfo: data as any,
    isError,
    isLoading,
    refetch,
  };
}

/**
 * Get investor list for an invoice
 */
export function useInvestors(invoiceId: bigint | number | undefined) {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.FundingPool as `0x${string}`,
    abi: [
      {
        inputs: [{ name: 'invoiceId', type: 'uint256' }],
        name: 'getInvestors',
        outputs: [{ name: '', type: 'address[]' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'getInvestors',
    args: invoiceId !== undefined ? [BigInt(invoiceId)] : undefined,
  });

  return {
    investors: (data as `0x${string}`[]) || [],
    isError,
    isLoading,
    refetch,
  };
}

/**
 * Get investment amount for a specific investor
 */
export function useInvestmentAmount(invoiceId: bigint | number | undefined, investor: `0x${string}` | undefined) {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.FundingPool as `0x${string}`,
    abi: [
      {
        inputs: [
          { name: 'invoiceId', type: 'uint256' },
          { name: 'investor', type: 'address' },
        ],
        name: 'getInvestmentAmount',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'getInvestmentAmount',
    args: invoiceId !== undefined && investor ? [BigInt(invoiceId), investor] : undefined,
  });

  return {
    amount: data as bigint | undefined,
    isError,
    isLoading,
  };
}
