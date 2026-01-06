/**
 * Hook to fetch real-time invoice funding data from blockchain
 */

import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, FUNDINGPOOL_ABI } from '@/lib/contracts';
import { formatUnits } from 'viem';
import { avaxToInr } from '@/lib/utils/currency';

export function useInvoiceFunding(invoiceId: number | undefined) {
  // Validate invoiceId is a valid number
  const validInvoiceId = typeof invoiceId === 'number' && !isNaN(invoiceId) && invoiceId >= 0;
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.FundingPool as `0x${string}`,
    abi: FUNDINGPOOL_ABI,
    functionName: 'fundingRounds',
    args: validInvoiceId ? [BigInt(invoiceId)] : undefined,
    query: {
      refetchInterval: 10000, // Auto-refresh every 10 seconds
      enabled: validInvoiceId,
    }
  });

  // Parse funding data from contract
  // fundingRounds returns: (invoiceId, targetAmount, raisedAmount, interestRate, deadline, isActive, isSettled)
  const targetAmountAvax = data ? Number(formatUnits((data as any)[1] as bigint, 18)) : 0;
  const totalFundedAvax = data ? Number(formatUnits((data as any)[2] as bigint, 18)) : 0;
  const interestRate = data ? Number((data as any)[3]) / 100 : 18; // Convert from basis points
  const deadline = data ? Number((data as any)[4]) : 0;
  const isActive = data ? Boolean((data as any)[5]) : false;
  const isSettled = data ? Boolean((data as any)[6]) : false;

  // Convert to INR for display
  const totalFundedInr = avaxToInr(totalFundedAvax);
  const targetAmountInr = avaxToInr(targetAmountAvax);
  const remainingAvax = targetAmountAvax - totalFundedAvax;
  const remainingInr = targetAmountInr - totalFundedInr;

  // Calculate percentage
  const percentage = targetAmountAvax > 0 ? (totalFundedAvax / targetAmountAvax) * 100 : 0;

  return {
    // Raw blockchain data
    totalFundedAvax,
    targetAmountAvax,
    remainingAvax,
    interestRate,
    deadline,
    isActive,
    isSettled,

    // INR conversions
    totalFundedInr,
    targetAmountInr,
    remainingInr,

    // Calculated values
    percentage: Math.min(percentage, 100),
    isFunded: percentage >= 100,

    // State
    isLoading,
    error,
    refetch,
  };
}
