"use client";

import { calculateInvoiceRisk, getRiskCategoryColor, getRiskCategoryLabel, getRecommendationBadge } from '@/lib/risk/calculator';
import { Invoice } from '@/lib/supabase/invoices';

export interface RiskScoreCardProps {
  invoice: Invoice;
  className?: string;
}

export function RiskScoreCard({ invoice, className = '' }: RiskScoreCardProps) {
  const riskData = calculateInvoiceRisk(invoice);
  const riskColor = getRiskCategoryColor(riskData.category);
  const riskLabel = getRiskCategoryLabel(riskData.category);
  const recommendationBadge = getRecommendationBadge(riskData.recommendation);

  return (
    <div className={`card ${className}`}>
      <h3 className="text-xl font-bold text-off-white mb-4">Risk Assessment</h3>

      {/* Risk Score Display */}
      <div className="text-center p-6 bg-dark-gray/50 rounded-lg mb-6">
        <p className="text-sm text-light-gray mb-2">Risk Score</p>
        <div className={`text-6xl font-bold ${riskColor} mb-3`}>
          {riskData.score}
          <span className="text-2xl text-off-white/50">/10</span>
        </div>

        {/* Visual Score Bars */}
        <div className="flex items-center justify-center gap-1">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-10 rounded transition-all duration-300 ${
                i < Math.floor(riskData.score)
                  ? riskData.category === 'low'
                    ? 'bg-sage-green-500'
                    : riskData.category === 'medium'
                    ? 'bg-blue-500'
                    : riskData.category === 'high'
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
            {riskData.apr}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-light-gray">Default Risk</span>
          <span className="text-lg font-bold text-off-white">
            &lt;{riskData.defaultProbability}%
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
                  className="bg-sage-green-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (riskData.factors.amountRisk / 2) * 100)}%` }}
                />
              </div>
              <span className="text-off-white w-8 text-right">
                {riskData.factors.amountRisk.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-light-gray">Term Risk</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-medium-gray/30 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (riskData.factors.termRisk / 2) * 100)}%` }}
                />
              </div>
              <span className="text-off-white w-8 text-right">
                {riskData.factors.termRisk.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-light-gray">History Risk</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-medium-gray/30 rounded-full h-1.5">
                <div
                  className="bg-yellow-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (riskData.factors.historyRisk / 10) * 100)}%` }}
                />
              </div>
              <span className="text-off-white w-8 text-right">
                {riskData.factors.historyRisk.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-light-gray">Buyer Risk</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-medium-gray/30 rounded-full h-1.5">
                <div
                  className="bg-purple-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (riskData.factors.buyerRisk / 5) * 100)}%` }}
                />
              </div>
              <span className="text-off-white w-8 text-right">
                {riskData.factors.buyerRisk.toFixed(1)}
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
