"use client";

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, FUNDINGPOOL_ABI } from '@/lib/contracts';
import { settlementOracle } from '@/lib/oracle/settlement';
import { formatCurrency } from '@/lib/utils/format';

export interface SettlementTriggerProps {
  invoiceId: number;
  invoiceAmount: number;
  isFullyFunded: boolean;
  dueDate: Date;
  onSuccess?: () => void;
}

export function SettlementTrigger({
  invoiceId,
  invoiceAmount,
  isFullyFunded,
  dueDate,
  onSuccess
}: SettlementTriggerProps) {
  const { writeContract, data: hash, isPending, isSuccess, isError, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const [settling, setSettling] = useState(false);
  const [settled, setSettled] = useState(false);
  const [distribution, setDistribution] = useState<any>(null);

  // Calculate if settlement is available
  const now = new Date();
  const isOverdue = now > dueDate;
  const canSettle = isFullyFunded; // Can settle once fully funded

  // Handle settlement trigger
  const handleTriggerSettlement = async () => {
    try {
      setSettling(true);

      // Use oracle to trigger settlement
      const result = await settlementOracle.triggerSettlement(
        invoiceId,
        invoiceAmount,
        (args: any) => writeContract({
          address: CONTRACT_ADDRESSES.FundingPool as `0x${string}`,
          abi: FUNDINGPOOL_ABI,
          ...args,
        })
      );

      if (result.success) {
        setDistribution(result.distribution);
      } else {
        console.error('Settlement failed:', result.error);
      }
    } catch (err) {
      console.error('Settlement error:', err);
    } finally {
      setSettling(false);
    }
  };

  // Handle successful settlement
  useEffect(() => {
    if (isConfirmed && distribution) {
      setSettled(true);
      if (onSuccess) {
        onSuccess();
      }
    }
  }, [isConfirmed, distribution, onSuccess]);

  // Already settled state
  if (settled || isConfirmed) {
    return (
      <div className="card bg-sage-green-500/10 border-sage-green-500/30">
        <div className="flex items-start gap-4">
          <div className="text-4xl">✅</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-sage-green-400 mb-2">
              Settlement Complete
            </h3>
            <p className="text-sm text-light-gray mb-4">
              Funds have been automatically distributed to all parties
            </p>

            {distribution && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-3 bg-dark-gray/50 rounded-lg">
                  <span className="text-light-gray">MSME Received</span>
                  <span className="text-sage-green-400 font-semibold">
                    {formatCurrency(distribution.msmeAmount, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-dark-gray/50 rounded-lg">
                  <span className="text-light-gray">Investor Principal</span>
                  <span className="text-blue-400 font-semibold">
                    {formatCurrency(distribution.investorAmount, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-dark-gray/50 rounded-lg">
                  <span className="text-light-gray">Interest Paid</span>
                  <span className="text-purple-400 font-semibold">
                    {formatCurrency(distribution.interestAmount, 0)}
                  </span>
                </div>
              </div>
            )}

            {hash && (
              <div className="mt-4 pt-4 border-t border-sage-green-500/20">
                <a
                  href={`https://testnet.snowtrace.io/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sage-green-500 hover:text-sage-green-400 font-mono"
                >
                  View transaction on Snowtrace →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Not ready for settlement
  if (!canSettle) {
    return (
      <div className="card bg-medium-gray/30">
        <div className="flex items-start gap-4">
          <div className="text-3xl">⏳</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-off-white mb-2">
              Waiting for Funding
            </h3>
            <p className="text-sm text-light-gray">
              Settlement will be available once the invoice is fully funded
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Ready for settlement
  return (
    <div className="card border-2 border-sage-green-500/30">
      <div className="mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="text-4xl">⚡</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-off-white mb-2">
              Buyer Payment Simulation
            </h3>
            <p className="text-sm text-light-gray">
              This simulates the buyer making payment and the oracle automatically triggering settlement
            </p>
          </div>
        </div>

        {/* Settlement Info */}
        <div className="bg-dark-gray/50 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-off-white mb-3">What Happens Next:</h4>
          <ol className="space-y-2 text-sm text-light-gray list-decimal list-inside">
            <li>Buyer payment is detected by oracle</li>
            <li>Smart contract automatically distributes funds</li>
            <li>MSME receives their portion (80%)</li>
            <li>Investors receive principal + interest (20% + APR)</li>
            <li>Invoice is marked as settled</li>
          </ol>
        </div>

        {/* Preview Distribution */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-blue-400 mb-3">Expected Distribution:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-light-gray">MSME (80%)</span>
              <span className="text-off-white font-semibold">
                {formatCurrency(invoiceAmount * 0.8, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-light-gray">Investors (20%)</span>
              <span className="text-off-white font-semibold">
                {formatCurrency(invoiceAmount * 0.2, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-light-gray">+ Interest (~18% APR)</span>
              <span className="text-sage-green-400 font-semibold">
                {formatCurrency((invoiceAmount * 0.2 * 0.18 * 60) / 365, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {isError && error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          <p className="text-red-400 text-sm">
            {error.message || 'Settlement failed. Please try again.'}
          </p>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={handleTriggerSettlement}
        disabled={settling || isPending || isConfirming}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {settling && '⏳ Preparing...'}
        {isPending && '🔐 Confirm in Wallet...'}
        {isConfirming && '⏳ Settling...'}
        {!settling && !isPending && !isConfirming && (
          <>
            <span>⚡</span>
            <span>Trigger Settlement</span>
          </>
        )}
      </button>

      <p className="text-xs text-center text-light-gray mt-3">
        This action is irreversible and will distribute all funds automatically
      </p>
    </div>
  );
}
