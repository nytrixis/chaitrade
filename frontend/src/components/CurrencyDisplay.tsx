"use client";

import { formatINR, formatAVAX, formatCombined, inrToAvax, avaxToInr } from "@/lib/utils/currency";

export interface CurrencyDisplayProps {
  /** Amount in INR (Indian Rupees) */
  inrAmount: number;
  /** Show detailed breakdown */
  showBreakdown?: boolean;
  /** Emphasize which currency (for clarity) */
  emphasize?: 'inr' | 'avax';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Display amounts in INR and AVAX
 * Simplified for Indian users - no USD/USDC confusion
 */
export function CurrencyDisplay({
  inrAmount,
  showBreakdown = false,
  emphasize = 'avax',
  className = ''
}: CurrencyDisplayProps) {
  const avaxAmount = inrToAvax(inrAmount);

  if (!showBreakdown) {
    // Compact mode: show INR (AVAX)
    return (
      <div className={`flex items-baseline gap-2 ${className}`}>
        <span className={emphasize === 'inr' ? 'text-lg font-bold' : 'text-sm text-light-gray'}>
          {formatINR(inrAmount)}
        </span>
        <span className="text-xs text-light-gray">=</span>
        <span className={emphasize === 'avax' ? 'text-lg font-bold text-sage-green-400' : 'text-sm text-light-gray'}>
          {formatAVAX(avaxAmount)}
        </span>
      </div>
    );
  }

  // Detailed breakdown mode
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-light-gray">Amount (INR)</span>
        <span className="text-lg font-bold">{formatINR(inrAmount)}</span>
      </div>

      <div className="flex items-center justify-between p-2 bg-dark-gray/30 rounded-lg border border-sage-green-500/20">
        <span className="text-sm text-sage-green-400">Blockchain Amount</span>
        <span className="text-lg font-bold text-sage-green-400">{formatAVAX(avaxAmount)}</span>
      </div>

      <p className="text-xs text-light-gray">
        💡 Pay using AVAX on Avalanche network (1 AVAX ≈ ₹3,000)
      </p>
    </div>
  );
}

/**
 * Display funding target (80% of invoice value)
 */
export function FundingTargetDisplay({
  inrAmount,
  className = ''
}: { inrAmount: number; className?: string }) {
  const targetInr = inrAmount * 0.8; // 80% funding
  const targetAvax = inrToAvax(targetInr);

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-light-gray">Funding Target (80%)</span>
        <span className="text-base font-semibold text-sage-green-400">
          {formatAVAX(targetAvax)}
        </span>
      </div>
      <div className="text-xs text-light-gray text-right">
        = {formatINR(targetInr)}
      </div>
    </div>
  );
}

/**
 * Show exchange rate info banner
 */
export function ExchangeRateBanner({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-dark-gray/50 border border-sage-green-500/20 rounded-lg p-3 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-xl">💱</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-off-white">
            Exchange Rate
          </p>
          <p className="text-xs text-light-gray">
            1 AVAX ≈ ₹3,000 INR on Avalanche network
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact AVAX display (for buttons, cards)
 */
export function CryptoAmount({
  inrAmount,
  prefix = '',
  className = ''
}: {
  inrAmount: number;
  prefix?: string;
  className?: string;
}) {
  const avaxAmount = inrToAvax(inrAmount);

  return (
    <span className={`font-mono font-bold text-sage-green-400 ${className}`}>
      {prefix}{formatAVAX(avaxAmount)}
    </span>
  );
}

/**
 * Show AVAX amount converted to INR
 */
export function AvaxToInrDisplay({
  avaxAmount,
  className = ''
}: {
  avaxAmount: number;
  className?: string;
}) {
  const inrAmount = avaxToInr(avaxAmount);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-lg font-bold text-sage-green-400">{formatAVAX(avaxAmount)}</span>
      <span className="text-xs text-light-gray">=</span>
      <span className="text-sm text-off-white">{formatINR(inrAmount)}</span>
    </div>
  );
}
