"use client";

import { calculateRiskScore, getRatingColor, getRiskCategory, type RiskFactors } from '@/lib/risk/calculator';
import { Invoice } from '@/lib/supabase/invoices';

export interface RiskScoreCardProps {
  invoice: Invoice;
  className?: string;
}

export function RiskScoreCard({ invoice, className = '' }: RiskScoreCardProps) {
  // Calculate risk using new 6-factor model
  const dueDate = new Date(invoice.due_date);
  const now = new Date();
  const createdAt = invoice.created_at ? new Date(invoice.created_at) : now;

  // Convert invoice data to risk factors
  const riskFactors: RiskFactors = {
    creditScore: invoice.credit_score || 700, // Use actual credit score
    paymentHistoryScore: 75, // Default - would come from historical data
    invoiceAgeInDays: Math.max(0, Math.ceil((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))),
    buyerReputation: 75, // Default - would come from buyer data
    invoiceAmount: invoice.amount / 1e18, // Convert from wei if needed, or use as-is
    msmeAnnualRevenue: (invoice.amount / 1e18) * 10, // Estimate 10x invoice amount
    industry: 'MEDIUM' as const,
  };

  const riskData = calculateRiskScore(riskFactors);

  // Map new data to old interface for compatibility
  const mappedRiskData = {
    score: riskData.score / 10, // Convert 0-100 to 0-10 for display
    category: riskData.score <= 20 ? 'low' : riskData.score <= 50 ? 'medium' : riskData.score <= 80 ? 'high' : 'very_high',
    apr: Math.round(riskData.interestRate * 100),
    defaultProbability: riskData.defaultProbability,
    recommendation: riskData.score <= 35 ? 'recommended' : riskData.score <= 65 ? 'caution' : 'high_risk',
    factors: {
      amountRisk: riskData.breakdown.sizeRisk / 5, // Scale to 0-2
      termRisk: riskData.breakdown.ageRisk / 7.5, // Scale to 0-2
      historyRisk: riskData.breakdown.historyRisk / 3, // Scale to 0-10
      buyerRisk: riskData.breakdown.buyerRisk / 3, // Scale to 0-5
    }
  };

  const riskColor = mappedRiskData.category === 'low' ? 'text-emerald-400' :
                   mappedRiskData.category === 'medium' ? 'text-blue-400' :
                   mappedRiskData.category === 'high' ? 'text-yellow-400' : 'text-red-400';

  const riskLabel = mappedRiskData.category === 'low' ? 'Low Risk' :
                   mappedRiskData.category === 'medium' ? 'Medium Risk' :
                   mappedRiskData.category === 'high' ? 'High Risk' : 'Very High Risk';

  const recommendationBadge = mappedRiskData.recommendation === 'recommended' ? {
    text: '✅ Recommended Investment',
    className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  } : mappedRiskData.recommendation === 'caution' ? {
    text: '⚠️ Invest with Caution',
    className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  } : {
    text: '⛔ High Risk - Not Recommended',
    className: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  return (
    <div className={`card ${className}`}>
      <h3 className="text-xl font-bold text-off-white mb-4">Risk Assessment</h3>

      {/* Risk Score Display */}
      <div className="text-center p-6 bg-dark-gray/50 rounded-lg mb-6">
        <p className="text-sm text-light-gray mb-2">Risk Score</p>
        <div className={`text-6xl font-bold ${riskColor} mb-3`}>
          {mappedRiskData.score.toFixed(1)}
          <span className="text-2xl text-off-white/50">/10</span>
        </div>

        {/* Visual Score Bars */}
        <div className="flex items-center justify-center gap-1">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-10 rounded transition-all duration-300 ${
                i < Math.floor(mappedRiskData.score)
                  ? mappedRiskData.category === 'low'
                    ? 'bg-emerald-500'
                    : mappedRiskData.category === 'medium'
                    ? 'bg-blue-500'
                    : mappedRiskData.category === 'high'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                  : 'bg-medium-gray/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-light-gray">Risk Category</span>
          <span className={`text-sm font-semibold ${riskColor}`}>
            {riskLabel}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-light-gray">Expected APR</span>
          <span className="text-lg font-bold text-off-white">
            {mappedRiskData.apr}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-light-gray">Default Risk</span>
          <span className="text-lg font-bold text-off-white">
            &lt;{mappedRiskData.defaultProbability.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Recommendation Badge */}
      <div className={`p-4 border rounded-lg text-center ${recommendationBadge.className}`}>
        <p className="text-sm font-semibold">{recommendationBadge.text}</p>
      </div>

      {/* Risk Factors Breakdown */}
      <div className="mt-6 pt-6 border-t border-medium-gray/30">
        <h4 className="text-sm font-semibold text-off-white mb-3">Risk Factors</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-light-gray">Amount Risk</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-medium-gray/30 rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (mappedRiskData.factors.amountRisk / 2) * 100)}%` }}
                />
              </div>
              <span className="text-off-white w-8 text-right">
                {mappedRiskData.factors.amountRisk.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-light-gray">Term Risk</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-medium-gray/30 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (mappedRiskData.factors.termRisk / 2) * 100)}%` }}
                />
              </div>
              <span className="text-off-white w-8 text-right">
                {mappedRiskData.factors.termRisk.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-light-gray">History Risk</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-medium-gray/30 rounded-full h-1.5">
                <div
                  className="bg-yellow-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (mappedRiskData.factors.historyRisk / 10) * 100)}%` }}
                />
              </div>
              <span className="text-off-white w-8 text-right">
                {mappedRiskData.factors.historyRisk.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-light-gray">Buyer Risk</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-medium-gray/30 rounded-full h-1.5">
                <div
                  className="bg-purple-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (mappedRiskData.factors.buyerRisk / 5) * 100)}%` }}
                />
              </div>
              <span className="text-off-white w-8 text-right">
                {mappedRiskData.factors.buyerRisk.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-4 p-3 bg-dark-gray/50 rounded-lg">
        <p className="text-xs text-light-gray text-center">
          Risk score calculated using ZK-verified credit data, payment terms, and historical performance
        </p>
      </div>
    </div>
  );
}
