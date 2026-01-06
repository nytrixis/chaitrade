"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { useInvest } from '@/hooks/useFundingPool';
import { useInvoiceFunding } from '@/hooks/useInvoiceFunding';
import { formatCurrency } from '@/lib/utils/format';
import { formatAVAX, formatINR, inrToAvax, calculateReturns } from '@/lib/utils/currency';
import { isValidInvestmentAmount } from '@/lib/utils/validation';

export interface FundingModalProps {
  invoiceId: number;
  invoiceAmount: number;
  currentlyFunded: number;
  interestRate?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export function FundingModal({
  invoiceId,
  invoiceAmount,
  currentlyFunded,
  interestRate = 18,
  onClose,
  onSuccess
}: FundingModalProps) {
  const { address, isConnected } = useAccount();
  const { invest, isPending, isConfirming, isConfirmed, isError, error } = useInvest();

  // Fetch real-time funding data from blockchain
  const {
    totalFundedInr,
    totalFundedAvax,
    targetAmountAvax,
    remainingInr,
    remainingAvax,
    percentage: fundingProgress,
    refetch
  } = useInvoiceFunding(invoiceId);

  const [amount, setAmount] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Use blockchain data if available, otherwise fallback to props
  const actualCurrentlyFunded = totalFundedInr || currentlyFunded;
  const actualRemainingAmount = remainingInr || (invoiceAmount - currentlyFunded);
  const actualProgress = fundingProgress || ((currentlyFunded / invoiceAmount) * 100);

  // AVAX amounts for validation and calculations
  const invoiceAmountAvax = targetAmountAvax || inrToAvax(invoiceAmount);
  const fundedAmountAvax = totalFundedAvax || 0;

  // Validate amount on change (amount is now in AVAX)
  useEffect(() => {
    if (!amount) {
      setValidationError(null);
      return;
    }

    const numAmount = parseFloat(amount);
    const remainingAvaxAmount = invoiceAmountAvax - fundedAmountAvax;
    const validation = isValidInvestmentAmount(numAmount, invoiceAmountAvax, fundedAmountAvax);

    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid amount');
    } else if (numAmount > remainingAvaxAmount) {
      setValidationError(`Amount exceeds remaining ${remainingAvaxAmount.toFixed(3)} AVAX`);
    } else {
      setValidationError(null);
    }
  }, [amount, invoiceAmountAvax, fundedAmountAvax]);

  // Handle successful investment
  useEffect(() => {
    if (isConfirmed) {
      // Refetch blockchain data to update UI
      refetch();

      // Save to database
      (async () => {
        try {
          const { recordInvestment } = await import("@/lib/supabase/investments");
          const { getInvoiceByTokenId } = await import("@/lib/supabase/invoices");

          const invoice = await getInvoiceByTokenId(invoiceId);

          if (invoice && invoice.id && address) {
            await recordInvestment(
              invoice.id,
              address,
              parseFloat(amount),
              interestRate
            );
            console.log("✓ Investment saved to database");
          }
        } catch (error) {
          console.error("Failed to save investment to database:", error);
        }
      })();

      if (onSuccess) {
        onSuccess();
      }
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, [isConfirmed, onSuccess, onClose, refetch, invoiceId, address, amount, interestRate]);

  const handleInvest = () => {
    if (!amount || validationError) return;

    const amountWei = parseUnits(amount, 18);
    invest(invoiceId, amountWei);
  };

  const setPercentage = (percentage: number) => {
    // Calculate percentage of remaining AVAX amount
    const remainingAvax = invoiceAmountAvax - fundedAmountAvax;
    const calculatedAmount = (remainingAvax * percentage) / 100;
    setAmount(calculatedAmount.toFixed(3)); // 3 decimal places for AVAX
  };

  // Calculate potential returns - amount is now in AVAX directly
  const amountAvax = parseFloat(amount || "0");
  const amountInr = amountAvax * 3000; // Convert AVAX to INR for display (3000 INR per AVAX)
  const returns = calculateReturns(amountAvax, interestRate, 60);

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="card max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-off-white">Invest in Invoice</h2>
          <button
            onClick={onClose}
            className="text-light-gray hover:text-off-white transition-colors"
            disabled={isPending || isConfirming}
          >
            ✕
          </button>
        </div>

        {!isConfirmed ? (
          <>
            {/* Invoice Info */}
            <div className="bg-dark-gray/50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-light-gray mb-1">Invoice Amount</div>
                  <div className="text-off-white font-semibold">
                    {formatCurrency(invoiceAmount, 0)}
                  </div>
                  <div className="text-xs text-light-gray">
                    ({formatAVAX(inrToAvax(invoiceAmount))})
                  </div>
                </div>
                <div>
                  <div className="text-light-gray mb-1">Interest Rate</div>
                  <div className="text-off-white font-semibold">{interestRate}% APR</div>
                </div>
                <div>
                  <div className="text-light-gray mb-1">Already Funded</div>
                  <div className="text-off-white font-semibold">
                    {formatCurrency(actualCurrentlyFunded, 0)}
                  </div>
                </div>
                <div>
                  <div className="text-light-gray mb-1">Remaining</div>
                  <div className="text-sage-green-400 font-semibold">
                    {formatCurrency(actualRemainingAmount, 0)}
                  </div>
                  <div className="text-xs text-light-gray">
                    ({formatAVAX(inrToAvax(actualRemainingAmount))})
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-light-gray">Progress</span>
                  <span className="text-off-white">{actualProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-charcoal rounded-full h-2">
                  <div
                    className="bg-sage-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${actualProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-light-gray mb-2">
                Investment Amount (AVAX)
              </label>
              <input
                type="number"
                step="0.001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., 0.1"
                className="input"
                disabled={isPending || isConfirming}
              />
              {validationError && (
                <p className="text-red-400 text-sm mt-2">{validationError}</p>
              )}

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2 mt-3">
                <button
                  onClick={() => setPercentage(25)}
                  className="btn-secondary text-sm py-2"
                  disabled={isPending || isConfirming}
                >
                  25%
                </button>
                <button
                  onClick={() => setPercentage(50)}
                  className="btn-secondary text-sm py-2"
                  disabled={isPending || isConfirming}
                >
                  50%
                </button>
                <button
                  onClick={() => setPercentage(75)}
                  className="btn-secondary text-sm py-2"
                  disabled={isPending || isConfirming}
                >
                  75%
                </button>
                <button
                  onClick={() => setPercentage(100)}
                  className="btn-secondary text-sm py-2"
                  disabled={isPending || isConfirming}
                >
                  100%
                </button>
              </div>
            </div>

            {/* Estimated Returns */}
            {amount && !validationError && (
              <div className="bg-sage-green-500/10 border border-sage-green-500/20 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-sage-green-400 mb-3">
                  Estimated Returns (60 days)
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-light-gray">Investment</span>
                    <div className="text-right">
                      <div className="text-off-white font-semibold">
                        {formatCurrency(amountInr, 0)}
                      </div>
                      <div className="text-xs text-light-gray">
                        ({formatAVAX(amountAvax)})
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-light-gray">Interest ({interestRate}% APR)</span>
                    <div className="text-right">
                      <div className="text-sage-green-400 font-semibold">
                        {formatINR(returns.interestINR)}
                      </div>
                      <div className="text-xs text-light-gray">
                        ({formatAVAX(returns.interest)})
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-sage-green-500/20">
                    <span className="text-off-white font-semibold">Total Return</span>
                    <div className="text-right">
                      <div className="text-sage-green-400 font-bold text-lg">
                        {formatINR(returns.totalINR)}
                      </div>
                      <div className="text-xs text-light-gray">
                        ({formatAVAX(returns.total)})
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {isError && error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                <p className="text-red-400 text-sm">
                  {error.message || 'Transaction failed. Please try again.'}
                </p>
              </div>
            )}

            {/* Wallet Connection Check */}
            {!isConnected && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                <p className="text-yellow-400 text-sm">
                  Please connect your wallet to invest in this invoice.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="btn-secondary flex-1"
                disabled={isPending || isConfirming}
              >
                Cancel
              </button>
              <button
                onClick={handleInvest}
                className="btn-primary flex-1"
                disabled={!isConnected || !amount || !!validationError || isPending || isConfirming}
              >
                {isPending && 'Confirm in Wallet...'}
                {isConfirming && 'Confirming...'}
                {!isPending && !isConfirming && 'Invest Now'}
              </button>
            </div>

            {/* Info */}
            <p className="text-xs text-light-gray mt-4 text-center">
              Your investment will be locked until the invoice is settled. Returns are paid
              after settlement.
            </p>
          </>
        ) : (
          /* Success State */
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-sage-green-400 mb-2">
              Investment Successful!
            </h3>
            <p className="text-light-gray mb-4">
              You have successfully invested {formatCurrency(amountInr, 0)} ({formatAVAX(amountAvax)}) in this invoice.
            </p>
            <div className="bg-sage-green-500/10 border border-sage-green-500/20 rounded-lg p-4 mb-6">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-light-gray">Expected Interest</span>
                  <div className="text-right">
                    <div className="text-sage-green-400 font-semibold">
                      {formatINR(returns.interestINR)}
                    </div>
                    <div className="text-xs text-light-gray">
                      ({formatAVAX(returns.interest)})
                    </div>
                  </div>
                </div>
                <div className="flex justify-between pt-2 border-t border-sage-green-500/20">
                  <span className="text-light-gray">Total Payout</span>
                  <div className="text-right">
                    <div className="text-sage-green-400 font-bold">
                      {formatINR(returns.totalINR)}
                    </div>
                    <div className="text-xs text-light-gray">
                      ({formatAVAX(returns.total)})
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="btn-primary">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
