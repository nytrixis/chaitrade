/**
 * Risk scoring system for invoice financing
 * Calculates risk based on multiple factors
 */

export interface RiskFactors {
  invoiceAmount: number;
  paymentTermsDays: number;
  msmeRepaymentRate: number;
  buyerRating: number;
  msmeAge?: number; // in months
  previousDefaults?: number;
}

export interface RiskResult {
  score: number; // 1-10 (10 = safest)
  category: 'low' | 'medium' | 'high' | 'very_high';
  apr: number; // Interest rate %
  defaultProbability: number; // 0-10%
  recommendation: 'recommended' | 'caution' | 'high_risk';
  factors: {
    amountRisk: number;
    termRisk: number;
    historyRisk: number;
    buyerRisk: number;
  };
}

/**
 * Calculate comprehensive risk score for an invoice
 */
export function calculateRiskScore(factors: RiskFactors): RiskResult {
  let score = 10; // Start at maximum (safest)

  // Track individual risk components
  const riskComponents = {
    amountRisk: 0,
    termRisk: 0,
    historyRisk: 0,
    buyerRisk: 0,
  };

  // ==========================================
  // Factor 1: Invoice Amount Risk
  // ==========================================
  // Higher amounts = slightly higher risk
  if (factors.invoiceAmount > 10000000) { // > 1 Cr
    riskComponents.amountRisk = 1.5;
  } else if (factors.invoiceAmount > 5000000) { // > 50L
    riskComponents.amountRisk = 1.0;
  } else if (factors.invoiceAmount > 1000000) { // > 10L
    riskComponents.amountRisk = 0.5;
  } else {
    riskComponents.amountRisk = 0;
  }

  // ==========================================
  // Factor 2: Payment Terms Risk
  // ==========================================
  // Longer payment terms = higher risk
  if (factors.paymentTermsDays > 180) {
    riskComponents.termRisk = 2.0;
  } else if (factors.paymentTermsDays > 120) {
    riskComponents.termRisk = 1.5;
  } else if (factors.paymentTermsDays > 90) {
    riskComponents.termRisk = 1.0;
  } else if (factors.paymentTermsDays > 60) {
    riskComponents.termRisk = 0.5;
  } else {
    riskComponents.termRisk = 0;
  }

  // ==========================================
  // Factor 3: MSME Repayment History (MOST IMPORTANT)
  // ==========================================
  // Repayment rate: 0-100 (percentage of on-time payments)
  const repaymentScore = factors.msmeRepaymentRate / 10; // Convert to 0-10 scale
  riskComponents.historyRisk = 10 - repaymentScore;

  // Bonus for perfect repayment
  if (factors.msmeRepaymentRate >= 95) {
    riskComponents.historyRisk -= 1;
  }

  // Penalty for defaults
  if (factors.previousDefaults && factors.previousDefaults > 0) {
    riskComponents.historyRisk += factors.previousDefaults * 0.5;
  }

  // ==========================================
  // Factor 4: Buyer Reputation/Rating
  // ==========================================
  // Buyer rating: 0-10 (creditworthiness of the buyer)
  const buyerScore = factors.buyerRating / 10; // Normalize to 0-1
  riskComponents.buyerRisk = (10 - factors.buyerRating) * 0.5;

  // ==========================================
  // Factor 5: MSME Age (Optional)
  // ==========================================
  if (factors.msmeAge !== undefined) {
    if (factors.msmeAge < 6) {
      // Very new MSMEs are riskier
      riskComponents.historyRisk += 1;
    } else if (factors.msmeAge < 12) {
      riskComponents.historyRisk += 0.5;
    }
  }

  // ==========================================
  // Calculate Weighted Score
  // ==========================================
  // Weights: History (50%), Buyer (25%), Terms (15%), Amount (10%)
  const totalRisk =
    riskComponents.historyRisk * 0.5 +
    riskComponents.buyerRisk * 0.25 +
    riskComponents.termRisk * 0.15 +
    riskComponents.amountRisk * 0.1;

  score = Math.max(1, Math.min(10, 10 - totalRisk));

  // ==========================================
  // Determine Risk Category
  // ==========================================
  let category: 'low' | 'medium' | 'high' | 'very_high';
  if (score >= 8) {
    category = 'low';
  } else if (score >= 6) {
    category = 'medium';
  } else if (score >= 4) {
    category = 'high';
  } else {
    category = 'very_high';
  }

  // ==========================================
  // Calculate APR (inverse relationship with score)
  // ==========================================
  // Score 10 = 18% APR
  // Score 1 = 36% APR
  const apr = Math.round(36 - (score * 1.8));

  // ==========================================
  // Calculate Default Probability
  // ==========================================
  // Score 10 = 0.5% default risk
  // Score 1 = 10% default risk
  const defaultProbability = Number(((10 - score) * 1.05).toFixed(2));

  // ==========================================
  // Generate Recommendation
  // ==========================================
  let recommendation: 'recommended' | 'caution' | 'high_risk';
  if (category === 'low') {
    recommendation = 'recommended';
  } else if (category === 'medium') {
    recommendation = 'caution';
  } else {
    recommendation = 'high_risk';
  }

  return {
    score: Number(score.toFixed(1)),
    category,
    apr,
    defaultProbability,
    recommendation,
    factors: riskComponents,
  };
}

/**
 * Calculate risk score from invoice data
 */
export function calculateInvoiceRisk(invoice: {
  amount: number;
  due_date: string;
  credit_score: number;
  msme_address: string;
}): RiskResult {
  // Calculate payment terms from due date
  const dueDate = new Date(invoice.due_date);
  const now = new Date();
  const paymentTermsDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Mock buyer rating (in production, this would come from buyer credit data)
  const buyerRating = 7.5;

  // Mock MSME repayment rate (in production, this would come from credit history)
  // For now, use credit score as proxy
  const msmeRepaymentRate = Math.min(100, (invoice.credit_score / 900) * 100);

  const factors: RiskFactors = {
    invoiceAmount: invoice.amount,
    paymentTermsDays: Math.max(1, paymentTermsDays),
    msmeRepaymentRate,
    buyerRating,
  };

  return calculateRiskScore(factors);
}

/**
 * Get risk category color for UI
 */
export function getRiskCategoryColor(category: RiskResult['category']): string {
  switch (category) {
    case 'low':
      return 'text-sage-green-400';
    case 'medium':
      return 'text-blue-400';
    case 'high':
      return 'text-yellow-400';
    case 'very_high':
      return 'text-red-400';
  }
}

/**
 * Get risk category label
 */
export function getRiskCategoryLabel(category: RiskResult['category']): string {
  switch (category) {
    case 'low':
      return 'Low Risk';
    case 'medium':
      return 'Medium Risk';
    case 'high':
      return 'High Risk';
    case 'very_high':
      return 'Very High Risk';
  }
}

/**
 * Get recommendation badge variant
 */
export function getRecommendationBadge(recommendation: RiskResult['recommendation']): {
  text: string;
  className: string;
} {
  switch (recommendation) {
    case 'recommended':
      return {
        text: '✅ Recommended Investment',
        className: 'bg-sage-green-500/20 text-sage-green-400 border-sage-green-500/30',
      };
    case 'caution':
      return {
        text: '⚠️ Invest with Caution',
        className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      };
    case 'high_risk':
      return {
        text: '⛔ High Risk - Not Recommended',
        className: 'bg-red-500/20 text-red-400 border-red-500/30',
      };
  }
}
