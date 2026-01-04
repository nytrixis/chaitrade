/**
 * Custom hook for interacting with InvoiceNFT contract
 */

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, INVOICENFT_ABI } from '@/lib/contracts';

/**
 * Read invoice data from contract
 */
export function useInvoiceNFT(tokenId: bigint | number | undefined) {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.InvoiceNFT as `0x${string}`,
    abi: INVOICENFT_ABI,
    functionName: 'getInvoice',
    args: tokenId !== undefined ? [BigInt(tokenId)] : undefined,
  });

  return {
    invoice: data as any,
    isError,
    isLoading,
    refetch,
  };
}

/**
 * Mint invoice NFT
 */
export function useMintInvoice() {
  const { writeContract, data: hash, isPending, isSuccess, isError, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const mintInvoice = (params: {
    to: `0x${string}`;
    amount: bigint;
    dueDate: bigint;
    buyerName: string;
    ipfsCID: `0x${string}`;
    fundingDeadline: bigint;
  }) => {
    writeContract({
      address: CONTRACT_ADDRESSES.InvoiceNFT as `0x${string}`,
      abi: INVOICENFT_ABI,
      functionName: 'mintInvoice',
      args: [
        params.to,
        params.amount,
        params.dueDate,
        params.buyerName,
        params.ipfsCID,
        params.fundingDeadline,
      ],
    });
  };

  return {
    mintInvoice,
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
 * Get owner of invoice NFT
 */
export function useInvoiceOwner(tokenId: bigint | number | undefined) {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.InvoiceNFT as `0x${string}`,
    abi: [
      {
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        name: 'ownerOf',
        outputs: [{ name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'ownerOf',
    args: tokenId !== undefined ? [BigInt(tokenId)] : undefined,
  });

  return {
    owner: data as `0x${string}` | undefined,
    isError,
    isLoading,
  };
}

/**
 * Get total supply of invoice NFTs
 */
export function useInvoiceTotalSupply() {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.InvoiceNFT as `0x${string}`,
    abi: [
      {
        inputs: [],
        name: 'totalSupply',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'totalSupply',
  });

  return {
    totalSupply: data ? Number(data) : 0,
    isError,
    isLoading,
  };
}
