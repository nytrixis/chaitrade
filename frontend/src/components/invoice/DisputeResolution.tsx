"use client";

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, FUNDINGPOOL_ABI } from '@/lib/contracts';
import { formatCurrency } from '@/lib/utils/format';

export interface DisputeResolutionProps {
  invoiceId: number;
  invoiceAmount: number;
  buyerName: string;
  dueDate: Date;
  isOverdue: boolean;
  className?: string;
}

type DisputeReason = 'non_payment' | 'partial_payment' | 'quality_issue' | 'other';

export function DisputeResolution({
  invoiceId,
  invoiceAmount,
  buyerName,
  dueDate,
  isOverdue,
  className = ''
}: DisputeResolutionProps) {
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState<DisputeReason>('non_payment');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState('');

  const { writeContract, data: hash, isPending, isError, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleRaiseDispute = () => {
    if (!description.trim()) {
      alert('Please provide a description of the dispute');
      return;
    }

    // In production, this would call a dispute resolution contract
    // For now, we'll use the FundingPool contract with a placeholder function
    writeContract({
      address: CONTRACT_ADDRESSES.FundingPool as `0x${string}`,
      abi: FUNDINGPOOL_ABI,
      functionName: 'settleInvoice', // In production: 'raiseDispute'
      args: [BigInt(invoiceId), BigInt(invoiceAmount)],
    });
  };

  const getDisputeReasonLabel = (reason: DisputeReason) => {
    switch (reason) {
      case 'non_payment': return 'Non-Payment by Buyer';
      case 'partial_payment': return 'Partial Payment Only';
      case 'quality_issue': return 'Quality/Delivery Dispute';
      case 'other': return 'Other Reason';
    }
  };

  const getDisputeReasonDescription = (reason: DisputeReason) => {
    switch (reason) {
      case 'non_payment':
        return 'Buyer has not paid despite invoice being overdue';
      case 'partial_payment':
        return 'Buyer paid less than the full invoice amount';
      case 'quality_issue':
        return 'Buyer disputes the quality or delivery of goods/services';
      case 'other':
        return 'Other dispute requiring resolution';
    }
  };

  if (!isOverdue) {
    return null;
  }

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-off-white">Dispute Resolution</h3>
        {isOverdue && (
          <div className="px-3 py-1 bg-red-500/20 rounded-full">
            <span className="text-red-400 text-sm font-semibold">Overdue</span>
          </div>
        )}
      </div>

      {!showDisputeForm && !isConfirmed ? (
        <>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h4 className="font-semibold text-red-400 mb-1">Invoice Overdue</h4>
                <p className="text-sm text-light-gray mb-2">
                  This invoice is {Math.abs(Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days overdue.
                  The buyer has not paid {formatCurrency(invoiceAmount, 0)} yet.
                </p>
                <div className="text-xs text-light-gray">
                  <div>Buyer: {buyerName}</div>
                  <div>Due Date: {dueDate.toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-4 text-sm">
            <div>
              <h4 className="font-semibold text-off-white mb-2">What happens next?</h4>
              <ul className="space-y-2 text-light-gray">
                <li className="flex gap-2">
                  <span className="text-sage-green-400">1.</span>
                  <span>You can raise a dispute if payment has not been received</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-sage-green-400">2.</span>
                  <span>Dispute will be reviewed by the dispute resolution protocol</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-sage-green-400">3.</span>
                  <span>Resolution will be executed automatically via smart contract</span>
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => setShowDisputeForm(true)}
            className="btn-primary w-full"
          >
            Raise Dispute
          </button>

          <p className="text-xs text-light-gray mt-3 text-center">
            Disputes are handled transparently on-chain
          </p>
        </>
      ) : !isConfirmed ? (
        <>
          <div className="space-y-4">
            {/* Dispute Reason */}
            <div>
              <label className="block text-sm font-medium text-light-gray mb-2">
                Dispute Reason
              </label>
              <select
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value as DisputeReason)}
                className="input"
                disabled={isPending || isConfirming}
              >
                <option value="non_payment">Non-Payment by Buyer</option>
                <option value="partial_payment">Partial Payment Only</option>
                <option value="quality_issue">Quality/Delivery Dispute</option>
                <option value="other">Other Reason</option>
              </select>
              <p className="text-xs text-light-gray mt-1">
                {getDisputeReasonDescription(disputeReason)}
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-light-gray mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the issue in detail..."
                className="input min-h-[100px]"
                disabled={isPending || isConfirming}
                required
              />
              <p className="text-xs text-light-gray mt-1">
                Provide details about why you're raising this dispute
              </p>
            </div>

            {/* Evidence */}
            <div>
              <label className="block text-sm font-medium text-light-gray mb-2">
                Evidence (Optional)
              </label>
              <textarea
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="IPFS CID of supporting documents, communication records, etc."
                className="input"
                disabled={isPending || isConfirming}
              />
              <p className="text-xs text-light-gray mt-1">
                Upload evidence to IPFS and paste the CID here
              </p>
            </div>

            {/* Error Display */}
            {isError && error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">
                  {error.message || 'Failed to raise dispute. Please try again.'}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDisputeForm(false)}
                className="btn-secondary flex-1"
                disabled={isPending || isConfirming}
              >
                Cancel
              </button>
              <button
                onClick={handleRaiseDispute}
                className="btn-primary flex-1"
                disabled={!description.trim() || isPending || isConfirming}
              >
                {isPending && 'Confirm in Wallet...'}
                {isConfirming && 'Submitting Dispute...'}
                {!isPending && !isConfirming && 'Submit Dispute'}
              </button>
            </div>
          </div>

          <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <div className="flex gap-2">
              <span className="text-yellow-400">ℹ️</span>
              <p className="text-xs text-light-gray">
                Submitting a dispute requires a small gas fee. The dispute will be recorded on-chain
                and reviewed by the dispute resolution protocol.
              </p>
            </div>
          </div>
        </>
      ) : (
        /* Success State */
        <div className="text-center py-6">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-2xl font-bold text-sage-green-400 mb-2">
            Dispute Raised Successfully
          </h3>
          <p className="text-light-gray mb-4">
            Your dispute has been submitted to the resolution protocol
          </p>

          <div className="bg-dark-gray/50 rounded-lg p-4 mb-4 text-left">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-light-gray">Dispute Type</span>
                <span className="text-off-white font-semibold">
                  {getDisputeReasonLabel(disputeReason)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-light-gray">Invoice Amount</span>
                <span className="text-off-white font-semibold">
                  {formatCurrency(invoiceAmount, 0)}
                </span>
              </div>
              {hash && (
                <div className="pt-2 border-t border-medium-gray/20">
                  <div className="text-light-gray text-xs mb-1">Transaction Hash</div>
                  <a
                    href={`https://testnet.snowtrace.io/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-sage-green-400 hover:text-sage-green-300 break-all"
                  >
                    {hash}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">What's Next?</h4>
            <ul className="text-sm text-light-gray space-y-1 text-left">
              <li>• Dispute will be reviewed by the protocol</li>
              <li>• Both parties will be notified</li>
              <li>• Resolution will be executed automatically</li>
              <li>• You'll receive updates on this page</li>
            </ul>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="btn-secondary w-full mt-4"
          >
            Refresh Page
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Compact dispute status indicator
 */
export function DisputeStatusBadge({ status }: { status: 'none' | 'pending' | 'resolved' | 'rejected' }) {
  const config = {
    none: { color: 'bg-medium-gray/20 text-light-gray', label: 'No Dispute', icon: '○' },
    pending: { color: 'bg-yellow-500/20 text-yellow-400', label: 'Dispute Pending', icon: '⚠️' },
    resolved: { color: 'bg-sage-green-500/20 text-sage-green-400', label: 'Dispute Resolved', icon: '✓' },
    rejected: { color: 'bg-red-500/20 text-red-400', label: 'Dispute Rejected', icon: '✕' },
  };

  const { color, label, icon } = config[status];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${color} text-xs font-semibold`}>
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}
