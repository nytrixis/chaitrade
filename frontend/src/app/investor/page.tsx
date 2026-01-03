"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { FundingProgress } from "@/components/funding/FundingProgress";
import { InvestmentForm } from "@/components/funding/InvestmentForm";
import { ConnectButton } from "@/components/ConnectButton";

// Mark as dynamic to prevent static rendering with Wagmi hooks
export const dynamic = "force-dynamic";

interface FundingRound {
  id: string;
  invoiceId: number;
  targetAmount: number;
  raisedAmount: number;
  interestRate: number;
  deadline: Date;
  msmeBusinessName: string;
  buyerName: string;
}

export default function InvestorDashboard() {
  const { address, isConnected } = useAccount();
  const [fundingRounds, setFundingRounds] = useState<FundingRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isConnected && mounted) {
      // Load active funding rounds from Supabase
      (async () => {
        try {
          console.log("Loading funding rounds for investor:", address);
          const { getActiveInvoices } = await import("@/lib/supabase/invoices");
          const data = await getActiveInvoices();

          // Transform to match FundingRound interface
          const transformedRounds = data.map((inv: any) => ({
            id: inv.id,
            invoiceId: inv.invoice_nft_id,
            targetAmount: inv.amount * 0.8, // 80% funding
            raisedAmount: 0, // TODO: Fetch from smart contract
            interestRate: 18, // Default rate
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            msmeBusinessName: "MSME Business", // TODO: Add to database
            buyerName: inv.buyer_name,
          }));

          setFundingRounds(transformedRounds);
        } catch (error) {
          console.error("Error loading funding rounds:", error);
        } finally {
          setLoading(false);
        }
      })();
    } else if (mounted) {
      setLoading(false);
    }
  }, [isConnected, address, mounted]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center text-off-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-sage-green-500">ChaiTrade</span> Investor Portal
          </h1>
          <p className="text-light-gray mb-8">
            Connect your wallet to invest in invoices and earn returns
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-charcoal text-off-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">
            <span className="text-sage-green-500">ChaiTrade</span> Investor Portal
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-light-gray">Connected:</span>
            <code className="bg-dark-gray px-3 py-1 rounded-lg text-sage-green-400 font-mono text-sm">
              {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
            </code>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="card border-sage-green-500/20 hover:border-sage-green-500/40">
            <p className="text-light-gray text-sm mb-3 font-medium">Available Funding</p>
            <p className="text-4xl font-bold text-sage-green-400 mb-2">
              {fundingRounds.length}
            </p>
            <p className="text-xs text-light-gray">active campaigns</p>
          </div>
          <div className="card border-sage-green-500/20 hover:border-sage-green-500/40">
            <p className="text-light-gray text-sm mb-3 font-medium">Potential Returns</p>
            <p className="text-4xl font-bold text-sage-green-400 mb-2">
              18%
            </p>
            <p className="text-xs text-light-gray">average APR</p>
          </div>
          <div className="card border-sage-green-500/20 hover:border-sage-green-500/40">
            <p className="text-light-gray text-sm mb-3 font-medium">Min Investment</p>
            <p className="text-4xl font-bold text-sage-green-400 mb-2">
              ₹5k
            </p>
            <p className="text-xs text-light-gray">starting amount</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Funding Rounds */}
          <div className="md:col-span-2 space-y-6">
            {loading ? (
              <div className="text-center">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-light-gray">Loading funding rounds...</p>
              </div>
            ) : fundingRounds.length === 0 ? (
              <div className="card text-center">
                <p className="text-light-gray mb-4">
                  No active funding rounds at the moment. Check back soon!
                </p>
              </div>
            ) : (
              fundingRounds.map((round) => (
                <div
                  key={round.id}
                  onClick={() => setSelectedInvoice(round.id)}
                  className={`cursor-pointer transition ${
                    selectedInvoice === round.id
                      ? "ring-2 ring-sage-green-500"
                      : ""
                  }`}
                >
                  <FundingProgress
                    invoiceId={round.invoiceId}
                    targetAmount={round.targetAmount}
                    raisedAmount={round.raisedAmount}
                    interestRate={round.interestRate}
                    deadline={round.deadline}
                  />
                </div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {selectedInvoice ? (
              <>
                <InvestmentForm
                  invoiceId={parseInt(selectedInvoice)}
                  targetAmount={5000} // TODO: Get from selected invoice
                  interestRate={18}
                />
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="btn-secondary w-full"
                >
                  Clear Selection
                </button>
              </>
            ) : (
              <div className="card">
                <p className="text-light-gray text-sm">
                  👉 Select a funding round from the list to invest
                </p>
              </div>
            )}

            {/* Risk Disclosure */}
            <div className="card bg-dark-gray/50 border-yellow-500/20">
              <h3 className="font-semibold mb-3 text-yellow-400 flex items-center gap-2">
                <span>⚠️</span> Risk Disclosure
              </h3>
              <ul className="text-sm text-light-gray space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 flex-shrink-0">•</span>
                  <span>Invoice default risk - buyer may not pay</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 flex-shrink-0">•</span>
                  <span>MSME liquidity risk - business failure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 flex-shrink-0">•</span>
                  <span>Smart contract risk - code vulnerabilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 flex-shrink-0">•</span>
                  <span>Market risk - USDC/AVAX price fluctuation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
