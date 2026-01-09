"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useInvoiceFunding } from "@/hooks/useInvoiceFunding";

export interface FundingProgressProps {
  invoiceId: number;
  targetAmount?: number; // Optional fallback
  raisedAmount?: number; // Optional fallback
  interestRate?: number; // Optional fallback
  deadline?: Date; // Optional fallback
}

export function FundingProgress({
  invoiceId,
  targetAmount: fallbackTarget,
  raisedAmount: fallbackRaised,
  interestRate: fallbackInterestRate,
  deadline: fallbackDeadline,
}: FundingProgressProps) {
  const [investAmount, setInvestAmount] = useState("");
  const { isConnected } = useAccount();

  // Fetch real-time data from blockchain
  const {
    totalFundedInr,
    targetAmountInr,
    remainingInr,
    percentage,
    interestRate: blockchainInterestRate,
    deadline: blockchainDeadline,
    isLoading,
  } = useInvoiceFunding(invoiceId);

  // Use blockchain data if available, otherwise fallback to props
  const actualTarget = targetAmountInr || fallbackTarget || 0;
  const actualRaised = totalFundedInr || fallbackRaised || 0;
  const actualPercentage = isLoading ? 0 : percentage;
  const actualInterestRate = blockchainInterestRate || fallbackInterestRate || 18;
  const actualRemainingAmount = remainingInr || (actualTarget - actualRaised);

  const actualDeadline = blockchainDeadline
    ? new Date(blockchainDeadline * 1000)
    : fallbackDeadline || new Date();

  const daysLeft = Math.ceil(
    (actualDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const handleInvest = async () => {
    if (!investAmount || parseFloat(investAmount) <= 0) {
      alert("Enter a valid amount");
      return;
    }

    // TODO: Call smart contract
    console.log(`Investing ${investAmount} AVAX in invoice ${invoiceId}`);
  };

  return (
    <div className="card space-y-6 hover:border-emerald-500/30">
      <div>
        <h3 className="text-xl font-bold mb-2 text-off-white">Invoice #{invoiceId}</h3>
        <p className="text-sm text-light-gray">
          🌟 Community-powered funding in progress
        </p>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-sm mb-3">
          <span className="text-off-white font-medium">
            ₹{actualRaised.toLocaleString()} raised
          </span>
          <span className="text-light-gray">
            ₹{actualTarget.toLocaleString()} target
          </span>
        </div>
        <div className="w-full bg-medium-gray/30 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-4 rounded-full transition-all duration-500 shadow-lg"
            style={{ width: `${Math.min(actualPercentage, 100)}%` }}
          ></div>
        </div>
        <p className="text-base text-emerald-400 mt-3 font-bold">
          {Math.round(actualPercentage)}% funded
          {isLoading && <span className="text-xs text-light-gray ml-2">(updating...)</span>}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-dark-gray/50 rounded-lg p-4 border border-medium-gray/20">
          <p className="text-xs text-light-gray mb-2 font-medium">Interest Rate</p>
          <p className="text-2xl font-bold text-emerald-400">
            {actualInterestRate}%
          </p>
          <p className="text-xs text-light-gray mt-1">APR</p>
        </div>
        <div className="bg-dark-gray/50 rounded-lg p-4 border border-medium-gray/20">
          <p className="text-xs text-light-gray mb-2 font-medium">Time Left</p>
          <p className="text-2xl font-bold text-emerald-400">
            {daysLeft}
          </p>
          <p className="text-xs text-light-gray mt-1">days</p>
        </div>
      </div>

      {/* Investment form */}
      {isConnected ? (
        <div className="space-y-3">
          <input
            type="number"
            value={investAmount}
            onChange={(e) => setInvestAmount(e.target.value)}
            placeholder="Amount (AVAX)"
            className="input w-full"
          />
          <p className="text-xs text-light-gray">
            Remaining to fund: ₹{actualRemainingAmount.toLocaleString()}
          </p>
          <button
            onClick={handleInvest}
            className="btn-primary w-full"
            disabled={!investAmount}
          >
            Invest Now
          </button>
        </div>
      ) : (
        <p className="text-center text-light-gray text-sm">
          Connect wallet to invest
        </p>
      )}

      {/* Info */}
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
        <p className="text-sm text-light-gray flex items-start gap-2">
          <span className="text-emerald-400 flex-shrink-0">🔒</span>
          <span>Funds are held in smart contract escrow. Released only when invoice is paid by buyer.</span>
        </p>
      </div>
    </div>
  );
}
