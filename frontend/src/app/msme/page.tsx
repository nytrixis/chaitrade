"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { InvoiceUpload } from "@/components/invoice/InvoiceUpload";
import { InvoiceFormManual } from "@/components/invoice/InvoiceFormManual";
import { FundingProgress } from "@/components/funding/FundingProgress";
import { ConnectButton } from "@/components/ConnectButton";

// Mark as dynamic to prevent static rendering with Wagmi hooks
export const dynamic = "force-dynamic";

interface Invoice {
  id: string;
  amount: number;
  buyerName: string;
  dueDate: Date;
  status: string;
  fundedAmount: number;
  interestRate: number;
  fundingDeadline: Date;
}

export default function MSMEDashboard() {
  const { address, isConnected } = useAccount();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upload" | "manual" | "invoices">("upload");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isConnected && mounted && address) {
      // Load invoices from Supabase
      (async () => {
        try {
          console.log("Loading invoices for:", address);
          const { getInvoicesByMSME } = await import("@/lib/supabase/invoices");
          const data = await getInvoicesByMSME(address);

          // Transform to match Invoice interface
          const transformedInvoices = data.map((inv: any) => ({
            id: inv.id,
            amount: inv.amount,
            buyerName: inv.buyer_name,
            dueDate: new Date(inv.due_date),
            status: inv.status,
            fundedAmount: 0, // TODO: Fetch from smart contract
            interestRate: 18, // Default rate
            fundingDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          }));

          setInvoices(transformedInvoices);
        } catch (error) {
          console.error("Error loading invoices:", error);
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
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-off-white">
            <span className="text-sage-green-500">ChaiTrade</span> MSME Dashboard
          </h1>
          <p className="text-light-gray mb-8">
            Connect your wallet to access your invoice funding dashboard
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
            <span className="text-sage-green-500">ChaiTrade</span> MSME Dashboard
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-light-gray">Connected:</span>
            <code className="bg-dark-gray px-3 py-1 rounded-lg text-sage-green-400 font-mono text-sm">
              {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
            </code>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-10 border-b border-medium-gray/20 pb-1 flex-wrap">
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
              activeTab === "upload"
                ? "bg-sage-green-500 text-charcoal shadow-lg"
                : "bg-dark-gray text-light-gray hover:text-off-white hover:bg-dark-gray/70"
            }`}
          >
            📤 Upload Image
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
              activeTab === "manual"
                ? "bg-sage-green-500 text-charcoal shadow-lg"
                : "bg-dark-gray text-light-gray hover:text-off-white hover:bg-dark-gray/70"
            }`}
          >
            ✏️ Enter Manually
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
              activeTab === "invoices"
                ? "bg-sage-green-500 text-charcoal shadow-lg"
                : "bg-dark-gray text-light-gray hover:text-off-white hover:bg-dark-gray/70"
            }`}
          >
            📋 My Invoices
          </button>
        </div>

        {/* Content */}
        {activeTab === "upload" && (
          <div className="max-w-2xl">
            <InvoiceUpload
              onSuccess={(data) => {
                console.log("Invoice uploaded:", data);
                setActiveTab("invoices");
              }}
            />
          </div>
        )}

        {activeTab === "manual" && (
          <div className="max-w-2xl">
            <InvoiceFormManual
              onSuccess={(data) => {
                console.log("Invoice created:", data);
                setActiveTab("invoices");
              }}
            />
          </div>
        )}

        {activeTab === "invoices" && (
          <div>
            {loading ? (
              <div className="text-center">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-light-gray">Loading invoices...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="bg-dark-gray border border-medium-gray/20 rounded-xl p-6">
                <p className="text-light-gray text-center mb-4">
                  No invoices yet. Upload an invoice or enter details manually above!
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {invoices.map((invoice) => (
                  <FundingProgress
                    key={invoice.id}
                    invoiceId={parseInt(invoice.id)}
                    targetAmount={invoice.amount * 0.8}
                    raisedAmount={invoice.fundedAmount}
                    interestRate={invoice.interestRate}
                    deadline={invoice.fundingDeadline}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
