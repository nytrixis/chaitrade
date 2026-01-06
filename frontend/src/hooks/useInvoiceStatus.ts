import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, FUNDINGPOOL_ABI } from '@/lib/contracts';

export type InvoiceStatus = 'pending' | 'active' | 'funding' | 'funded' | 'settled' | 'defaulted';

/**
 * Get real-time invoice status from blockchain
 * This is the source of truth for invoice status, not the database
 */
export function useInvoiceStatus(invoiceId: number | undefined) {
  const validInvoiceId = invoiceId !== undefined && invoiceId >= 0;

  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.FundingPool as `0x${string}`,
    abi: FUNDINGPOOL_ABI,
    functionName: 'fundingRounds',
    args: validInvoiceId ? [BigInt(invoiceId)] : undefined,
    query: {
      enabled: validInvoiceId,
      refetchInterval: 10000, // Refresh every 10 seconds
    },
  });

  // Parse funding round data to determine status
  const getStatus = (): InvoiceStatus => {
    if (!data) return 'pending';

    // fundingRounds returns: (invoiceId, targetAmount, raisedAmount, interestRate, isActive, isSettled, deadline, investors[])
    const [, targetAmount, raisedAmount, , isActive, isSettled] = data as [
      bigint,
      bigint,
      bigint,
      bigint,
      boolean,
      boolean,
      bigint,
      string[]
    ];

    // Determine status based on blockchain state
    if (isSettled) {
      return 'settled';
    }

    if (isActive) {
      // Check if fully funded
      if (raisedAmount >= targetAmount && targetAmount > 0n) {
        return 'funded';
      }
      return 'active';
    }

    // If not active and not settled, still in funding preparation
    if (targetAmount > 0n) {
      return 'funding';
    }

    return 'pending';
  };

  const status = getStatus();

  return {
    status,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: InvoiceStatus): string {
  const labels: Record<InvoiceStatus, string> = {
    pending: 'Pending Approval',
    active: 'Active - Seeking Funding',
    funding: 'Funding Round Created',
    funded: 'Fully Funded',
    settled: 'Settled',
    defaulted: 'Defaulted',
  };

  return labels[status] || status;
}

/**
 * Get status badge color
 */
export function getStatusColor(status: InvoiceStatus): string {
  const colors: Record<InvoiceStatus, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    active: 'bg-blue-500/20 text-blue-400',
    funding: 'bg-purple-500/20 text-purple-400',
    funded: 'bg-sage-green-500/20 text-sage-green-400',
    settled: 'bg-green-500/20 text-green-400',
    defaulted: 'bg-red-500/20 text-red-400',
  };

  return colors[status] || 'bg-gray-500/20 text-gray-400';
}
