"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { calculateRiskScore } from "@/lib/risk/calculator";

interface EnhancedInvoiceCardProps {
  invoice: {
    id: number;
    amount: number;
    buyer_name: string;
    credit_score: number;
    due_date: string;
    status: string;
    funded_percentage?: number;
  };
  index?: number;
}

export function EnhancedInvoiceCard({ invoice, index = 0 }: EnhancedInvoiceCardProps) {
  // Calculate risk score
  const riskFactors = {
    creditScore: invoice.credit_score || 700,
    paymentHistoryScore: 75,
    invoiceAgeInDays: 5,
    buyerReputation: 75,
    invoiceAmount: invoice.amount,
    msmeAnnualRevenue: invoice.amount * 10,
    industry: 'MEDIUM' as const,
  };

  const riskScore = calculateRiskScore(riskFactors);

  // Calculate days to maturity
  const daysToMaturity = Math.ceil(
    (new Date(invoice.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'funding':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'funded':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'settled':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    }
  };

  // Risk rating color
  const getRiskColor = (rating: string) => {
    if (rating.startsWith('AA')) return 'text-emerald-400';
    if (rating.startsWith('A')) return 'text-blue-400';
    if (rating.startsWith('B')) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative"
    >
      {/* Card */}
      <div className="relative h-full backdrop-blur-sm bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 hover:border-white/[0.12] transition-all duration-500 hover:bg-white/[0.05]">
        {/* Subtle glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 rounded-2xl transition-all duration-700 opacity-0 group-hover:opacity-100 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-white mb-1">
                Invoice #{invoice.id}
              </h3>
              <p className="text-sm text-gray-500">{invoice.buyer_name}</p>
            </div>
            <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${getStatusColor(invoice.status)}`}>
              {invoice.status.toUpperCase()}
            </span>
          </div>

          {/* Amount - Clean display */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Amount</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white">
                ₹{(invoice.amount / 100000).toFixed(2)}
              </span>
              <span className="text-sm text-gray-400">Lakh</span>
            </div>
          </div>

          {/* Stats - Compact grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-2.5">
              <p className="text-xs text-gray-500 mb-0.5">APR</p>
              <p className="text-sm font-semibold text-blue-400">
                {(riskScore.interestRate * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-2.5">
              <p className="text-xs text-gray-500 mb-0.5">Rating</p>
              <p className={`text-sm font-semibold ${getRiskColor(riskScore.rating)}`}>
                {riskScore.rating}
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-2.5">
              <p className="text-xs text-gray-500 mb-0.5">Days</p>
              <p className="text-sm font-semibold text-purple-400">
                {daysToMaturity}
              </p>
            </div>
          </div>

          {/* Progress bar if funding */}
          {invoice.status === 'funding' && invoice.funded_percentage !== undefined && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Progress</span>
                <span>{invoice.funded_percentage}%</span>
              </div>
              <div className="h-1 w-full bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${invoice.funded_percentage}%` }}
                  transition={{ duration: 1, delay: 0.3 + index * 0.05 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                />
              </div>
            </div>
          )}

          {/* CTA Button - Clean and clickable */}
          <Link href={`/invoice/${invoice.id}`} className="block">
            <button className="w-full px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.08] hover:border-white/[0.15] text-white text-sm font-medium transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/20">
              View Details
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
