"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { useInvest } from '@/hooks/useFundingPool';
import { formatCurrency } from '@/lib/utils/format';
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

  const [amount, setAmount] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const remainingAmount = invoiceAmount - currentlyFunded;
  const fundingProgress = (currentlyFunded / invoiceAmount) * 100;

  // Validate amount on change
  useEffect(() => {
    if (!amount) {
      setValidationError(null);
      return;
    }

    const numAmount = parseFloat(amount);
    const validation = isValidInvestmentAmount(numAmount, invoiceAmount, currentlyFunded);

    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid amount');
    } else {
      setValidationError(null);
    }
  }, [amount, invoiceAmount, currentlyFunded]);

  // Handle successful investment
  useEffect(() => {
    if (isConfirmed) {
      if (onSuccess) {
        onSuccess();
      }
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, [isConfirmed, onSuccess, onClose]);

  const handleInvest = () => {
    if (!amount || validationError) return;

    const amountWei = parseUnits(amount, 18);
    invest(invoiceId, amountWei);
  };

  const setPercentage = (percentage: number) => {
    const calculatedAmount = (remainingAmount * percentage) / 100;
    setAmount(calculatedAmount.toFixed(0));
  };

  // Calculate potential returns
  const potentialReturns = amount ? parseFloat(amount) * (interestRate / 100) : 0;
  const totalReturn = amount ? parseFloat(amount) + potentialReturns : 0;

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
                </div>
                <div>
                  <div className="text-light-gray mb-1">Interest Rate</div>
                  <div className="text-off-white font-semibold">{interestRate}% APR</div>
                </div>
                <div>
                  <div className="text-light-gray mb-1">Already Funded</div>
                  <div className="text-off-white font-semibold">
                    {formatCurrency(currentlyFunded, 0)}
                  </div>
                </div>
                <div>
                  <div className="text-light-gray mb-1">Remaining</div>
                  <div className="text-sage-green-400 font-semibold">
                    {formatCurrency(remainingAmount, 0)}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-light-gray">Progress</span>
                  <span className="text-off-white">{fundingProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-charcoal rounded-full h-2">
                  <div
                    className="bg-sage-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${fundingProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-light-gray mb-2">
                Investment Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., 50000"
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
                  Estimated Returns
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-light-gray">Investment</span>
                    <span className="text-off-white font-semibold">
                      {formatCurrency(parseFloat(amount), 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-light-gray">Interest ({interestRate}%)</span>
                    <span className="text-sage-green-400 font-semibold">
                      {formatCurrency(potentialReturns, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-sage-green-500/20">
                    <span className="text-off-white font-semibold">Total Return</span>
                    <span className="text-sage-green-400 font-bold text-lg">
                      {formatCurrency(totalReturn, 0)}
                    </span>
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
              You have successfully invested {formatCurrency(parseFloat(amount), 0)} in this invoice.
            </p>
            <div className="bg-sage-green-500/10 border border-sage-green-500/20 rounded-lg p-4 mb-6">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-light-gray">Expected Returns</span>
                  <span className="text-sage-green-400 font-semibold">
                    {formatCurrency(potentialReturns, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-light-gray">Total Payout</span>
                  <span className="text-sage-green-400 font-bold">
                    {formatCurrency(totalReturn, 0)}
                  </span>
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
