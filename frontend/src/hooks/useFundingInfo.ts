import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, FUNDINGPOOL_ABI } from '@/lib/contracts';
import { formatUnits } from 'viem';

const AVAX_TO_INR = 3000; // 1 AVAX = ₹3000

export function useFundingInfo(invoiceId: number | undefined) {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.FundingPool as `0x${string}`,
    abi: FUNDINGPOOL_ABI,
    functionName: 'getFundingInfo',
    args: invoiceId !== undefined ? [BigInt(invoiceId)] : undefined,
    query: {
      enabled: invoiceId !== undefined,
      refetchInterval: 5000, // Auto-refresh every 5 seconds
    },
  });

  if (!data || isLoading) {
    return {
      targetAmount: 0,
      raisedAmount: 0,
      targetAmountINR: 0,
      raisedAmountINR: 0,
      percentage: 0,
      interestRate: 0,
      deadline: 0,
      isActive: false,
      isSettled: false,
      investorCount: 0,
      isLoading: true,
      refetch,
    };
  }

  const [targetAmountWei, raisedAmountWei, interestRate, deadline, isActive, isSettled, investorCount] = data as [bigint, bigint, bigint, bigint, boolean, boolean, bigint];

  const targetAmountAVAX = Number(formatUnits(targetAmountWei, 18));
  const raisedAmountAVAX = Number(formatUnits(raisedAmountWei, 18));

  const percentage = targetAmountAVAX > 0 
    ? Math.min(Math.round((raisedAmountAVAX / targetAmountAVAX) * 100), 100) 
    : 0;

  return {
    targetAmount: targetAmountAVAX,
    raisedAmount: raisedAmountAVAX,
    targetAmountINR: Math.round(targetAmountAVAX * AVAX_TO_INR),
    raisedAmountINR: Math.round(raisedAmountAVAX * AVAX_TO_INR),
    percentage,
    interestRate: Number(interestRate) / 100, // Convert from basis points
    deadline: Number(deadline),
    isActive: isActive as boolean,
    isSettled: isSettled as boolean,
    investorCount: Number(investorCount),
    refetch,
    isLoading: false,
  };
}

// Helper function to format currency in INR
export function formatINR(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}
