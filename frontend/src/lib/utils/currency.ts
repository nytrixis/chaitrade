/**
 * Currency utilities for ChaiTrade
 * Handles INR (display) and AVAX (blockchain) conversions
 *
 * Currency Flow:
 * - Users see amounts in INR (Indian Rupees)
 * - Smart contracts use AVAX (18 decimals)
 * - 1 AVAX ≈ ₹3,000 INR (for demo, hardcoded)
 */

// Exchange rates (hardcoded for demo - in production, fetch from Chainlink oracle)
export const AVAX_TO_INR_RATE = 3000; // 1 AVAX = ₹3,000 INR
export const INR_TO_AVAX_RATE = 1 / AVAX_TO_INR_RATE; // 1 INR = 0.000333 AVAX

// Minimum amounts
export const MIN_INVOICE_INR = 1000; // ₹1,000
export const MIN_INVESTMENT_INR = 100; // ₹100 (lowered for demo)
export const MIN_INVESTMENT_AVAX = 0.001; // 0.001 AVAX minimum

/**
 * Convert INR to AVAX
 */
export function inrToAvax(inr: number): number {
  return inr * INR_TO_AVAX_RATE;
}

/**
 * Convert AVAX to INR
 */
export function avaxToInr(avax: number): number {
  return avax * AVAX_TO_INR_RATE;
}

/**
 * Format INR with Indian number system (lakhs, crores)
 * Examples: ₹5,00,000 | ₹1,25,000 | ₹10,00,00,000
 */
export function formatINR(amount: number, decimals: number = 0): string {
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `₹${formatted}`;
}

/**
 * Format AVAX with appropriate decimals
 * Examples: 0.001 AVAX | 1.234 AVAX | 100.00 AVAX
 */
export function formatAVAX(amount: number): string {
  // Show more decimals for small amounts
  const decimals = amount < 0.01 ? 6 : amount < 1 ? 4 : 2;
  return `${amount.toFixed(decimals)} AVAX`;
}

/**
 * Format combined display: INR (AVAX)
 * Example: ₹5,00,000 (1.67 AVAX)
 */
export function formatCombined(inrAmount: number): string {
  const avaxAmount = inrToAvax(inrAmount);
  return `${formatINR(inrAmount, 0)} (${formatAVAX(avaxAmount)})`;
}

/**
 * Parse user input to AVAX (handles both INR and AVAX inputs)
 */
export function parseToAvax(input: string, assumeINR: boolean = true): number {
  const num = parseFloat(input.replace(/[,₹]/g, ''));
  if (isNaN(num)) return 0;

  // If input looks like AVAX (has decimal < 1 or explicitly small)
  if (!assumeINR || num < 1) {
    return num;
  }

  // Otherwise assume INR and convert
  return inrToAvax(num);
}

/**
 * Format currency for display (primary display currency)
 * Defaults to INR for Indian users
 */
export function formatCurrency(amount: number, decimals: number = 2): string {
  return formatINR(amount, decimals);
}

/**
 * Validate investment amount
 */
export function validateInvestmentAmount(
  avaxAmount: number,
  remainingAvax: number
): { valid: boolean; error?: string } {
  if (avaxAmount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }

  if (avaxAmount < MIN_INVESTMENT_AVAX) {
    return {
      valid: false,
      error: `Minimum investment is ${formatAVAX(MIN_INVESTMENT_AVAX)} (₹${Math.round(avaxToInr(MIN_INVESTMENT_AVAX))})`
    };
  }

  if (avaxAmount > remainingAvax) {
    return {
      valid: false,
      error: `Maximum investment is ${formatAVAX(remainingAvax)} (remaining amount)`
    };
  }

  return { valid: true };
}

/**
 * Calculate interest returns in AVAX
 */
export function calculateReturns(
  principalAvax: number,
  aprPercent: number,
  daysHeld: number = 60
): {
  principal: number;
  interest: number;
  total: number;
  principalINR: number;
  interestINR: number;
  totalINR: number;
} {
  const dailyRate = aprPercent / 365 / 100;
  const interest = principalAvax * dailyRate * daysHeld;
  const total = principalAvax + interest;

  return {
    principal: principalAvax,
    interest,
    total,
    principalINR: avaxToInr(principalAvax),
    interestINR: avaxToInr(interest),
    totalINR: avaxToInr(total),
  };
}
