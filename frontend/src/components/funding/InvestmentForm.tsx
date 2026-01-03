"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { CONTRACT_ADDRESSES, USDC_ABI, FUNDINGPOOL_ABI } from "@/lib/contracts";

export interface InvestmentFormProps {
  invoiceId: number;
  targetAmount: number;
  interestRate: number;
}

export function InvestmentForm({
  invoiceId,
  targetAmount,
  interestRate,
}: InvestmentFormProps) {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"input" | "approve" | "invest" | "success">("input");
  const [error, setError] = useState<string | null>(null);

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      setError("Enter a valid amount");
      return;
    }

    if (!isConnected || !address) {
      setError("Connect wallet first");
      return;
    }

    setError(null);

    try {
      const amountInUSDC = parseUnits(amount, 6); // USDC has 6 decimals
      console.log(`Investing ${amount} USDC in invoice ${invoiceId} from ${address}`);

      // Step 1: Approve USDC spending
      setStep("approve");
      writeContract({
        address: CONTRACT_ADDRESSES.USDC as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.FundingPool as `0x${string}`, amountInUSDC],
      });

      console.log('✓ USDC approval requested');

    } catch (err) {
      console.error("Investment failed:", err);
      setError(err instanceof Error ? err.message : "Investment failed");
      setStep("input");
    }
  };

  // Watch for approval confirmation, then invest
  if (isConfirmed && step === "approve") {
    setStep("invest");

    const amountInUSDC = parseUnits(amount, 6);
    writeContract({
      address: CONTRACT_ADDRESSES.FundingPool as `0x${string}`,
      abi: FUNDINGPOOL_ABI,
      functionName: 'invest',
      args: [BigInt(invoiceId), amountInUSDC],
    });

    console.log('✓ Investment transaction sent');
  }

  // Watch for investment confirmation
  if (isConfirmed && step === "invest") {
    setStep("success");
    setTimeout(() => {
      setAmount("");
      setStep("input");
    }, 3000);
  }

  const estimatedReturn =
    (parseFloat(amount || "0") * interestRate) / 100 / 12; // Monthly estimate

  return (
    <form onSubmit={handleInvest} className="card space-y-5 border-sage-green-500/20">
      <div>
        <h3 className="text-xl font-bold mb-4 text-off-white">Make Investment</h3>
        <label className="block text-sm font-semibold mb-3 text-light-gray">
          Investment Amount (USDC)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g., 5000"
          step="0.01"
          min="0"
          className="input w-full text-lg"
          disabled={isPending || isConfirming}
        />
        <p className="text-xs text-light-gray mt-2">
          Target amount: ₹{targetAmount.toLocaleString()}
        </p>
      </div>

      {amount && (
        <div className="bg-sage-green-500/10 border border-sage-green-500/20 rounded-lg p-4">
          <p className="text-base font-bold text-sage-green-400 mb-3">
            💰 Estimated Returns
          </p>
          <div className="text-sm text-light-gray space-y-2">
            <div className="flex justify-between">
              <span>Investment:</span>
              <span className="text-off-white font-semibold">₹{parseFloat(amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Interest Rate:</span>
              <span className="text-off-white font-semibold">{interestRate}% APR</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-sage-green-500/20">
              <span>Monthly Estimate:</span>
              <span className="text-sage-green-400 font-bold">₹{estimatedReturn.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!amount || isPending || isConfirming || !isConnected || step === "success"}
        className="btn-primary w-full"
      >
        {step === "approve" && isPending && "Approve USDC in Wallet..."}
        {step === "approve" && isConfirming && "Approving USDC..."}
        {step === "invest" && isPending && "Confirm Investment in Wallet..."}
        {step === "invest" && isConfirming && "Investing..."}
        {step === "success" && "✓ Investment Successful!"}
        {step === "input" && "Invest Now"}
      </button>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {!isConnected && (
        <p className="text-center text-light-gray text-sm">
          Please connect your wallet to invest
        </p>
      )}
    </form>
  );
}
