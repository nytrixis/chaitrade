"use client";

import { useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils/format';

interface DemoInvoice {
  id: number;
  amount: number;
  fundedAmount: number;
  buyerName: string;
  dueDate: Date;
  msmeAddress: string;
}

export default function SettlementDemoPage() {
  const [step, setStep] = useState<'intro' | 'payment_detected' | 'calculating' | 'settling' | 'success'>('intro');
  const [progress, setProgress] = useState(0);

  const demoInvoice: DemoInvoice = {
    id: 1234,
    amount: 500000,
    fundedAmount: 500000,
    buyerName: 'ABC Manufacturing Ltd',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    msmeAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  };

  const distribution = {
    msmeAmount: Math.round(demoInvoice.amount * 0.8), // 80% to MSME
    investorPrincipal: Math.round(demoInvoice.amount * 0.2), // 20% to investors
    investorInterest: Math.round(demoInvoice.amount * 0.2 * 0.18 * (60 / 365)), // 18% APR for 60 days
  };

  distribution.investorInterest = Math.round(distribution.investorPrincipal * 0.18 * (60 / 365));
  const totalToInvestors = distribution.investorPrincipal + distribution.investorInterest;

  const startSettlement = () => {
    setStep('payment_detected');
    setProgress(0);

    setTimeout(() => {
      setStep('calculating');
      setProgress(25);
    }, 2000);

    setTimeout(() => {
      setStep('settling');
      setProgress(50);
    }, 4000);

    setTimeout(() => {
      setProgress(75);
    }, 6000);

    setTimeout(() => {
      setStep('success');
      setProgress(100);
    }, 8000);
  };

  return (
    <div className="min-h-screen bg-charcoal py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-sage-green-500 hover:text-sage-green-400 mb-4 inline-block">
            ← Back to Home
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-off-white mb-2">Oracle Settlement Demo</h1>
            <p className="text-light-gray">See how ChaiTrade's oracle automatically settles invoices</p>
          </div>
        </div>

        {/* Intro Step */}
        {step === 'intro' && (
          <div className="max-w-4xl mx-auto">
            <div className="card mb-6">
              <h2 className="text-2xl font-bold text-off-white mb-4">How Oracle Settlement Works</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-off-white mb-1">Payment Detection</h3>
                    <p className="text-sm text-light-gray">
                      Oracle monitors the buyer's bank account and detects when the invoice is paid.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-400 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-off-white mb-1">Distribution Calculation</h3>
                    <p className="text-sm text-light-gray">
                      Smart contract calculates: 80% to MSME, 20% principal + interest to investors.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-sage-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sage-green-400 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-off-white mb-1">Automatic Transfer</h3>
                    <p className="text-sm text-light-gray">
                      Funds are distributed automatically via smart contract. No human intervention required.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-400 font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-off-white mb-1">On-Chain Verification</h3>
                    <p className="text-sm text-light-gray">
                      All transactions are recorded on Avalanche blockchain for full transparency.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Demo Invoice Card */}
            <div className="card mb-6">
              <h3 className="text-xl font-bold text-off-white mb-4">Demo Invoice Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-light-gray mb-1">Invoice ID</div>
                  <div className="text-off-white font-semibold">#{demoInvoice.id}</div>
                </div>
                <div>
                  <div className="text-sm text-light-gray mb-1">Total Amount</div>
                  <div className="text-off-white font-semibold">{formatCurrency(demoInvoice.amount)}</div>
                </div>
                <div>
                  <div className="text-sm text-light-gray mb-1">Buyer</div>
                  <div className="text-off-white font-semibold">{demoInvoice.buyerName}</div>
                </div>
                <div>
                  <div className="text-sm text-light-gray mb-1">Status</div>
                  <div className="text-sage-green-400 font-semibold">✓ Fully Funded</div>
                </div>
                <div>
                  <div className="text-sm text-light-gray mb-1">Due Date</div>
                  <div className="text-off-white font-semibold">{demoInvoice.dueDate.toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm text-light-gray mb-1">Days Past Due</div>
                  <div className="text-yellow-400 font-semibold">2 days</div>
                </div>
              </div>
            </div>

            {/* Expected Distribution */}
            <div className="card mb-6 bg-dark-gray/50">
              <h3 className="text-xl font-bold text-off-white mb-4">Expected Distribution</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-medium-gray/20">
                  <div>
                    <div className="text-off-white font-semibold">MSME (80%)</div>
                    <div className="text-xs text-light-gray">Immediate working capital</div>
                  </div>
                  <div className="text-sage-green-400 font-bold text-xl">
                    {formatCurrency(distribution.msmeAmount, 0)}
                  </div>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-medium-gray/20">
                  <div>
                    <div className="text-off-white font-semibold">Investors Principal (20%)</div>
                    <div className="text-xs text-light-gray">Original investment</div>
                  </div>
                  <div className="text-blue-400 font-bold text-xl">
                    {formatCurrency(distribution.investorPrincipal, 0)}
                  </div>
                </div>
                <div className="flex justify-between items-center py-3">
                  <div>
                    <div className="text-off-white font-semibold">Investors Interest (18% APR)</div>
                    <div className="text-xs text-light-gray">60-day return</div>
                  </div>
                  <div className="text-purple-400 font-bold text-xl">
                    {formatCurrency(distribution.investorInterest, 0)}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-medium-gray/20 flex justify-between items-center">
                <div className="text-off-white font-bold text-lg">Total to Investors</div>
                <div className="text-sage-green-400 font-bold text-2xl">
                  {formatCurrency(totalToInvestors, 0)}
                </div>
              </div>
            </div>

            <button
              onClick={startSettlement}
              className="btn-primary w-full text-lg py-4"
            >
              ⚡ Trigger Oracle Settlement
            </button>
          </div>
        )}

        {/* Settlement in Progress */}
        {(step === 'payment_detected' || step === 'calculating' || step === 'settling') && (
          <div className="max-w-4xl mx-auto">
            <div className="card mb-6">
              <h2 className="text-2xl font-bold text-off-white mb-6">Settlement in Progress</h2>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-light-gray">Overall Progress</span>
                  <span className="text-off-white font-semibold">{progress}%</span>
                </div>
                <div className="w-full bg-dark-gray rounded-full h-3">
                  <div
                    className="bg-sage-green-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-6">
                {/* Payment Detected */}
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                    step === 'payment_detected' ? 'border-blue-500 bg-blue-500/20' :
                    progress > 25 ? 'border-sage-green-500 bg-sage-green-500/20' :
                    'border-medium-gray bg-medium-gray/20'
                  }`}>
                    {progress > 25 ? (
                      <span className="text-sage-green-400">✓</span>
                    ) : (
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${
                      step === 'payment_detected' ? 'text-blue-400' :
                      progress > 25 ? 'text-sage-green-400' :
                      'text-light-gray'
                    }`}>
                      Payment Detected
                    </div>
                    <div className="text-sm text-light-gray">
                      Oracle verified buyer payment of {formatCurrency(demoInvoice.amount, 0)}
                    </div>
                  </div>
                </div>

                {/* Calculating Distribution */}
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                    step === 'calculating' ? 'border-purple-500 bg-purple-500/20' :
                    progress > 50 ? 'border-sage-green-500 bg-sage-green-500/20' :
                    'border-medium-gray bg-medium-gray/20'
                  }`}>
                    {progress > 50 ? (
                      <span className="text-sage-green-400">✓</span>
                    ) : step === 'calculating' ? (
                      <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span className="text-light-gray">○</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${
                      step === 'calculating' ? 'text-purple-400' :
                      progress > 50 ? 'text-sage-green-400' :
                      'text-light-gray'
                    }`}>
                      Calculating Distribution
                    </div>
                    <div className="text-sm text-light-gray">
                      MSME: {formatCurrency(distribution.msmeAmount, 0)} | Investors: {formatCurrency(totalToInvestors, 0)}
                    </div>
                  </div>
                </div>

                {/* Executing Transfers */}
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                    step === 'settling' ? 'border-sage-green-500 bg-sage-green-500/20' :
                    progress === 100 ? 'border-sage-green-500 bg-sage-green-500/20' :
                    'border-medium-gray bg-medium-gray/20'
                  }`}>
                    {progress === 100 ? (
                      <span className="text-sage-green-400">✓</span>
                    ) : step === 'settling' ? (
                      <div className="w-4 h-4 border-2 border-sage-green-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span className="text-light-gray">○</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${
                      step === 'settling' || progress === 100 ? 'text-sage-green-400' :
                      'text-light-gray'
                    }`}>
                      Executing Transfers
                    </div>
                    <div className="text-sm text-light-gray">
                      Distributing funds via smart contract
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex gap-3">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <h3 className="font-semibold text-blue-400 mb-1">Automated Process</h3>
                  <p className="text-sm text-light-gray">
                    This entire settlement process is automated by smart contracts. No manual intervention
                    is required. The oracle simply triggers the settlement function after verifying payment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="max-w-4xl mx-auto">
            <div className="card text-center mb-6">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-3xl font-bold text-sage-green-400 mb-2">Settlement Complete!</h2>
              <p className="text-light-gray mb-6">
                Funds have been distributed automatically via smart contract
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-sage-green-500/10 border border-sage-green-500/20 rounded-lg p-6 text-left">
                  <div className="text-sm text-light-gray mb-2">MSME Received</div>
                  <div className="text-3xl font-bold text-sage-green-400 mb-3">
                    {formatCurrency(distribution.msmeAmount, 0)}
                  </div>
                  <div className="text-xs text-light-gray">
                    80% of invoice amount for working capital
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 text-left">
                  <div className="text-sm text-light-gray mb-2">Investors Received</div>
                  <div className="text-3xl font-bold text-blue-400 mb-3">
                    {formatCurrency(totalToInvestors, 0)}
                  </div>
                  <div className="text-xs text-light-gray">
                    Principal + {formatCurrency(distribution.investorInterest, 0)} interest
                  </div>
                </div>
              </div>

              <div className="bg-dark-gray/50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-off-white mb-3">Transaction Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-light-gray">Transaction Hash</span>
                    <span className="font-mono text-sage-green-400 text-xs">0x742d35...95f0bEb</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-light-gray">Block Number</span>
                    <span className="text-off-white">12,456,789</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-light-gray">Gas Used</span>
                    <span className="text-off-white">0.0023 AVAX</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-light-gray">Settlement Time</span>
                    <span className="text-off-white">8.2 seconds</span>
                  </div>
                </div>

                <a
                  href="https://testnet.snowtrace.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sage-green-500 hover:text-sage-green-400 text-sm mt-3 inline-block"
                >
                  View on Snowtrace →
                </a>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setStep('intro');
                    setProgress(0);
                  }}
                  className="btn-secondary flex-1"
                >
                  Run Demo Again
                </button>
                <Link href="/browse" className="btn-primary flex-1">
                  Browse Live Invoices →
                </Link>
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <div className="flex gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="font-semibold text-purple-400 mb-1">Why This Matters</h3>
                  <p className="text-sm text-light-gray mb-2">
                    Traditional invoice financing takes 5-7 days for settlement and requires manual processing.
                    ChaiTrade settles in under 10 seconds with zero human intervention.
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                    <div className="bg-charcoal/50 rounded p-2">
                      <div className="text-light-gray mb-1">Traditional</div>
                      <div className="text-red-400 font-semibold">5-7 days</div>
                    </div>
                    <div className="bg-charcoal/50 rounded p-2">
                      <div className="text-light-gray mb-1">ChaiTrade</div>
                      <div className="text-sage-green-400 font-semibold">&lt; 10 seconds</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
