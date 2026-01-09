/**
 * Risk Scoring Calculator
 * Mirrors the Solidity RiskScoring library for frontend calculations
 */

export type IndustryRisk = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskFactors {
    creditScore: number;           // 650-950
    paymentHistoryScore: number;   // 0-100 (% on-time payments)
    invoiceAgeInDays: number;      // Days since invoice issue
    buyerReputation: number;       // 0-100
    invoiceAmount: number;         // in ETH/AVAX
    msmeAnnualRevenue: number;     // in ETH/AVAX
    industry: IndustryRisk;
}

export interface RiskScore {
    score: number;          // 0-100 (higher = riskier)
    interestRate: number;   // APR as decimal (e.g., 0.18 = 18%)
    rating: string;         // AAA, AA, A, BBB, BB, B, C
    breakdown: {
        creditRisk: number;
        historyRisk: number;
        ageRisk: number;
        buyerRisk: number;
        sizeRisk: number;
        industryRisk: number;
    };
    defaultProbability: number; // Estimated default probability (%)
}

/**
 * Calculate comprehensive risk score from multiple factors
 * @param factors Input risk factors
 * @returns Risk score with rating and interest rate
 */
export function calculateRiskScore(factors: RiskFactors): RiskScore {
    let score = 0;
    const breakdown = {
        creditRisk: 0,
        historyRisk: 0,
        ageRisk: 0,
        buyerRisk: 0,
        sizeRisk: 0,
        industryRisk: 0,
    };

    // Factor 1: Credit Score (30% weight)
    // Map 650-950 to 0-30 risk points (inverse)
    if (factors.creditScore >= 850) {
        breakdown.creditRisk = 0;  // Excellent
    } else if (factors.creditScore >= 750) {
        breakdown.creditRisk = 5;  // Very good
    } else if (factors.creditScore >= 700) {
        breakdown.creditRisk = 10; // Good
    } else if (factors.creditScore >= 650) {
        breakdown.creditRisk = 20; // Fair
    } else {
        breakdown.creditRisk = 30; // Poor
    }

    // Factor 2: Payment History (30% weight)
    // 100% on-time = 0 risk, 0% on-time = 30 risk
    breakdown.historyRisk = Math.round(((100 - factors.paymentHistoryScore) * 30) / 100);

    // Factor 3: Invoice Age (15% weight)
    // Fresh invoice (0-7 days) = 0 risk
    // Old invoice (90+ days) = 15 risk
    if (factors.invoiceAgeInDays > 90) {
        breakdown.ageRisk = 15; // Very old
    } else if (factors.invoiceAgeInDays > 30) {
        breakdown.ageRisk = 10; // Old
    } else if (factors.invoiceAgeInDays > 7) {
        breakdown.ageRisk = 5;  // Slightly old
    } else {
        breakdown.ageRisk = 0;  // Fresh
    }

    // Factor 4: Buyer Reputation (15% weight)
    // 100 reputation = 0 risk, 0 reputation = 15 risk
    breakdown.buyerRisk = Math.round(((100 - factors.buyerReputation) * 15) / 100);

    // Factor 5: Size Ratio (10% weight)
    // Large invoice vs small revenue = risky
    const sizeRatio = (factors.invoiceAmount / factors.msmeAnnualRevenue) * 100;
    if (sizeRatio > 50) {
        breakdown.sizeRisk = 10; // Invoice > 50% of revenue
    } else if (sizeRatio > 30) {
        breakdown.sizeRisk = 5;  // Invoice > 30% of revenue
    } else {
        breakdown.sizeRisk = 0;  // Invoice < 30% of revenue
    }

    // Factor 6: Industry Risk (10% weight)
    breakdown.industryRisk =
        factors.industry === 'HIGH' ? 10 :
        factors.industry === 'MEDIUM' ? 5 : 0;

    // Sum all risks
    score = Object.values(breakdown).reduce((a, b) => a + b, 0);
    score = Math.min(score, 100);

    // Calculate interest rate
    // Base rate: 8% (0.08)
    // Risk premium: +0.1% per risk point (0.001 per point)
    // Range: 8% (score 0) to 18% (score 100)
    const interestRate = 0.08 + (score * 0.001);

    // Determine credit rating
    let rating: string;
    if (score <= 10) {
        rating = 'AAA'; // Exceptional quality
    } else if (score <= 20) {
        rating = 'AA';  // Excellent quality
    } else if (score <= 35) {
        rating = 'A';   // Good quality
    } else if (score <= 50) {
        rating = 'BBB'; // Medium quality
    } else if (score <= 65) {
        rating = 'BB';  // Speculative
    } else if (score <= 80) {
        rating = 'B';   // Highly speculative
    } else {
        rating = 'C';   // Substantial risk
    }

    // Calculate default probability (0.5% to 15%)
    const defaultProbability = 0.5 + ((score * 14.5) / 100);

    return {
        score,
        interestRate,
        rating,
        breakdown,
        defaultProbability,
    };
}

/**
 * Get interest rate from risk score
 * @param score Risk score (0-100)
 * @returns Interest rate as decimal
 */
export function getInterestForScore(score: number): number {
    return 0.08 + (score * 0.001);
}

/**
 * Get credit rating from risk score
 * @param score Risk score (0-100)
 * @returns Credit rating string
 */
export function getRatingForScore(score: number): string {
    if (score <= 10) return 'AAA';
    if (score <= 20) return 'AA';
    if (score <= 35) return 'A';
    if (score <= 50) return 'BBB';
    if (score <= 65) return 'BB';
    if (score <= 80) return 'B';
    return 'C';
}

/**
 * Get rating color for UI display
 * @param rating Credit rating
 * @returns Tailwind color classes
 */
export function getRatingColor(rating: string): string {
    if (rating.startsWith('AAA')) return 'text-green-700 bg-green-50';
    if (rating.startsWith('AA')) return 'text-green-600 bg-green-50';
    if (rating.startsWith('A')) return 'text-lime-600 bg-lime-50';
    if (rating === 'BBB') return 'text-yellow-600 bg-yellow-50';
    if (rating.startsWith('BB')) return 'text-orange-600 bg-orange-50';
    if (rating === 'B') return 'text-red-600 bg-red-50';
    return 'text-red-700 bg-red-100';
}

/**
 * Get risk category from score
 * @param score Risk score (0-100)
 * @returns Risk category string
 */
export function getRiskCategory(score: number): string {
    if (score <= 20) return 'Low Risk';
    if (score <= 50) return 'Medium Risk';
    if (score <= 80) return 'High Risk';
    return 'Critical Risk';
}

/**
 * Validate risk factors
 * @param factors Risk factors to validate
 * @returns True if valid, error message if invalid
 */
export function validateRiskFactors(factors: RiskFactors): { valid: boolean; error?: string } {
    if (factors.creditScore < 300 || factors.creditScore > 950) {
        return { valid: false, error: 'Credit score must be between 300 and 950' };
    }
    if (factors.paymentHistoryScore < 0 || factors.paymentHistoryScore > 100) {
        return { valid: false, error: 'Payment history must be between 0 and 100' };
    }
    if (factors.invoiceAgeInDays < 0 || factors.invoiceAgeInDays > 365) {
        return { valid: false, error: 'Invoice age must be between 0 and 365 days' };
    }
    if (factors.buyerReputation < 0 || factors.buyerReputation > 100) {
        return { valid: false, error: 'Buyer reputation must be between 0 and 100' };
    }
    if (factors.invoiceAmount <= 0) {
        return { valid: false, error: 'Invoice amount must be positive' };
    }
    if (factors.msmeAnnualRevenue <= 0) {
        return { valid: false, error: 'MSME revenue must be positive' };
    }
    if (!['LOW', 'MEDIUM', 'HIGH'].includes(factors.industry)) {
        return { valid: false, error: 'Industry must be LOW, MEDIUM, or HIGH' };
    }

    return { valid: true };
}

/**
 * Convert risk factors to Solidity format for contract calls
 * @param factors Risk factors
 * @returns Tuple compatible with contract
 */
export function riskFactorsToContractFormat(factors: RiskFactors) {
    return {
        creditScore: BigInt(factors.creditScore),
        paymentHistory: BigInt(factors.paymentHistoryScore),
        invoiceAge: BigInt(factors.invoiceAgeInDays),
        buyerReputation: BigInt(factors.buyerReputation),
        invoiceAmount: BigInt(0), // Set by contract
        msmeRevenue: BigInt(Math.floor(factors.msmeAnnualRevenue * 1e18)), // Convert to wei
        industry: factors.industry === 'LOW' ? 0 : factors.industry === 'MEDIUM' ? 1 : 2,
    };
}

/**
 * Calculate expected returns for investors
 * @param principal Investment amount in AVAX
 * @param interestRate APR as decimal (e.g., 0.18)
 * @param daysToMaturity Days until invoice due date
 * @param platformFee Platform fee as decimal (e.g., 0.05)
 * @returns Expected return object
 */
export function calculateExpectedReturns(
    principal: number,
    interestRate: number,
    daysToMaturity: number,
    platformFee: number = 0.05
) {
    // Simple interest calculation
    const interest = (principal * interestRate * daysToMaturity) / 365;
    const platformFeeAmount = interest * platformFee;
    const netInterest = interest - platformFeeAmount;
    const totalReturn = principal + netInterest;

    return {
        principal,
        grossInterest: interest,
        platformFeeAmount,
        netInterest,
        totalReturn,
        roi: ((netInterest / principal) * 100).toFixed(2) + '%',
        apr: (interestRate * 100).toFixed(2) + '%',
    };
}
