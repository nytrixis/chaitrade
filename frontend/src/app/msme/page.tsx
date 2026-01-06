"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { InvoiceUpload } from "@/components/invoice/InvoiceUpload";
import { InvoiceFormManual } from "@/components/invoice/InvoiceFormManual";
import { ConnectButton } from "@/components/ConnectButton";

// Mark as dynamic to prevent static rendering with Wagmi hooks
export const dynamic = "force-dynamic";

export default function MSMEDashboard() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"upload" | "manual">("upload");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        </div>

        {/* Content */}
        {activeTab === "upload" && (
          <div className="max-w-2xl">
            <InvoiceUpload
              onSuccess={(data) => {
                console.log("Invoice uploaded:", data);
                // Redirect to browse page after successful upload
                window.location.href = `/invoice/${data.nftTokenId}`;
              }}
            />
          </div>
        )}

        {activeTab === "manual" && (
          <div className="max-w-2xl">
            <InvoiceFormManual
              onSuccess={(data) => {
                console.log("Invoice created:", data);
                // Redirect to portfolio after successful creation
                window.location.href = "/portfolio";
              }}
            />
          </div>
        )}

        {/* Quick links */}
        <div className="mt-12 pt-8 border-t border-medium-gray/20">
          <p className="text-light-gray text-sm mb-4">View your invoices and investments in your portfolio:</p>
          <a 
            href="/portfolio" 
            className="inline-flex items-center gap-2 text-sage-green-400 hover:text-sage-green-300 transition-colors"
          >
            Go to Portfolio →
          </a>
        </div>
      </div>
    </main>
  );
}
