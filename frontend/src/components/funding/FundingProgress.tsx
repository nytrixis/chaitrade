"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

export interface FundingProgressProps {
  invoiceId: number;
  targetAmount: number;
  raisedAmount: number;
  interestRate: number;
  deadline: Date;
}

export function FundingProgress({
  invoiceId,
  targetAmount,
  raisedAmount,
  interestRate,
  deadline,
}: FundingProgressProps) {
  const [investAmount, setInvestAmount] = useState("");
  const { isConnected } = useAccount();

  const percentage = (raisedAmount / targetAmount) * 100;
  const remainingAmount = targetAmount - raisedAmount;
  const daysLeft = Math.ceil(
    (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const handleInvest = async () => {
    if (!investAmount || parseFloat(investAmount) <= 0) {
      alert("Enter a valid amount");
      return;
    }

    // TODO: Call smart contract
    console.log(`Investing ${investAmount} USDC in invoice ${invoiceId}`);
  };

  return (
    <div className="card space-y-6 hover:border-sage-green-500/30">
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
            ₹{raisedAmount.toLocaleString()} raised
          </span>
          <span className="text-light-gray">
            ₹{targetAmount.toLocaleString()} target
          </span>
        </div>
        <div className="w-full bg-medium-gray/30 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-sage-green-500 to-sage-green-400 h-4 rounded-full transition-all duration-500 shadow-lg"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
        <p className="text-base text-sage-green-400 mt-3 font-bold">
          {Math.round(percentage)}% funded
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-dark-gray/50 rounded-lg p-4 border border-medium-gray/20">
          <p className="text-xs text-light-gray mb-2 font-medium">Interest Rate</p>
          <p className="text-2xl font-bold text-sage-green-400">
            {interestRate}%
          </p>
          <p className="text-xs text-light-gray mt-1">APR</p>
        </div>
        <div className="bg-dark-gray/50 rounded-lg p-4 border border-medium-gray/20">
          <p className="text-xs text-light-gray mb-2 font-medium">Time Left</p>
          <p className="text-2xl font-bold text-sage-green-400">
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
            placeholder="Amount (USDC)"
            className="input w-full"
          />
          <p className="text-xs text-light-gray">
            Remaining to fund: ₹{remainingAmount.toLocaleString()}
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
      <div className="bg-sage-green-500/5 border border-sage-green-500/20 rounded-lg p-4">
        <p className="text-sm text-light-gray flex items-start gap-2">
          <span className="text-sage-green-400 flex-shrink-0">🔒</span>
          <span>Funds are held in smart contract escrow. Released only when invoice is paid by buyer.</span>
        </p>
      </div>
    </div>
  );
}
