"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import toast from "react-hot-toast";
import { CONTRACT_ADDRESSES, FUNDINGPOOL_ABI } from "@/lib/contracts";
import { formatAVAX, formatINR, inrToAvax, validateInvestmentAmount, calculateReturns } from "@/lib/utils/currency";

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
  const [step, setStep] = useState<"input" | "invest" | "success">("input");
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

    const avaxAmount = parseFloat(amount);
    const remainingAvax = inrToAvax(targetAmount); // Simplified - in real app, fetch actual remaining from contract

    // Validate amount
    const validation = validateInvestmentAmount(avaxAmount, remainingAvax);
    if (!validation.valid) {
      setError(validation.error || "Invalid amount");
      return;
    }

    setError(null);

    try {
      const amountInWei = parseUnits(amount, 18); // AVAX has 18 decimals
      console.log(`Investing ${amount} AVAX in invoice ${invoiceId} from ${address}`);

      setStep("invest");
      writeContract({
        address: CONTRACT_ADDRESSES.FundingPool as `0x${string}`,
        abi: FUNDINGPOOL_ABI,
        functionName: 'invest',
        args: [BigInt(invoiceId)],
        value: amountInWei, // Send AVAX with transaction
      });

      console.log('✓ Investment transaction sent');

    } catch (err) {
      console.error("Investment failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Investment failed";
      setError(errorMessage);
      toast.error(errorMessage);
      setStep("input");
    }
  };

  // Watch for investment confirmation and save to database
  useEffect(() => {
    if (isConfirmed && step === "invest") {
      // Save to database
      (async () => {
        try {
          const { recordInvestment } = await import("@/lib/supabase/investments");
          const { getInvoiceByTokenId } = await import("@/lib/supabase/invoices");

          // Get invoice UUID from token ID
          const invoice = await getInvoiceByTokenId(invoiceId);

          if (invoice && invoice.id && address) {
            await recordInvestment(
              invoice.id,
              address as string,
              parseFloat(amount),
              interestRate
            );
            console.log("✓ Investment saved to database");
          }
          toast.success(`Investment of ${amount} AVAX confirmed!`);
        } catch (error) {
          console.error("Failed to save investment to database:", error);
          toast.error("Investment confirmed but failed to save to database");
        }
      })();

      setStep("success");
      const timer = setTimeout(() => {
        setAmount("");
        setStep("input");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, step, invoiceId, address, amount, interestRate]);

  // Calculate returns in AVAX
  const avaxAmount = parseFloat(amount || "0");
  const returns = calculateReturns(avaxAmount, interestRate, 60); // 60 days default

  return (
    <form onSubmit={handleInvest} className="card space-y-5 border-emerald-500/20">
      <div>
        <h3 className="text-xl font-bold mb-2 text-off-white">Make Investment</h3>
        <p className="text-xs text-light-gray mb-4">
          💎 Invest using AVAX on Avalanche network
        </p>

        <label className="block text-sm font-semibold mb-3 text-light-gray">
          Investment Amount (AVAX)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g., 0.1 (min: 0.001)"
          step="0.001"
          min="0.001"
          className="input w-full text-lg"
          disabled={isPending || isConfirming}
        />
        <p className="text-xs text-light-gray mt-2">
          1 AVAX ≈ {formatINR(3000)} • Target: {formatINR(targetAmount)} ({formatAVAX(inrToAvax(targetAmount))})
        </p>
      </div>

      {amount && avaxAmount > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
          <p className="text-base font-bold text-emerald-400 mb-3">
            💰 Estimated Returns (60 days)
          </p>
          <div className="text-sm text-light-gray space-y-2">
            <div className="flex justify-between">
              <span>Investment:</span>
              <span className="text-off-white font-semibold">{formatAVAX(returns.principal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-light-gray">({formatINR(returns.principalINR)})</span>
            </div>
            <div className="flex justify-between">
              <span>Interest ({interestRate}% APR):</span>
              <span className="text-emerald-400 font-semibold">{formatAVAX(returns.interest)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-light-gray">({formatINR(returns.interestINR)})</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-emerald-500/20">
              <span>Total Return:</span>
              <span className="text-emerald-400 font-bold">{formatAVAX(returns.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-light-gray">({formatINR(returns.totalINR)})</span>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!amount || parseFloat(amount) < 0.001 || isPending || isConfirming || !isConnected || step === "success"}
        className="btn-primary w-full"
      >
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
