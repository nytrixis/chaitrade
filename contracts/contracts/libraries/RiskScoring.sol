// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RiskScoring
 * @dev Library for calculating dynamic risk scores and interest rates based on multiple factors
 * @notice Uses 6-factor risk model with weighted scoring
 */
library RiskScoring {
    /**
     * @dev Industry risk categories
     */
    enum IndustryRisk {
        LOW,    // IT, consulting, software (0 risk points)
        MEDIUM, // Textiles, manufacturing, retail (5 risk points)
        HIGH    // Construction, real estate, hospitality (10 risk points)
    }

    /**
     * @dev Input factors for risk calculation
     */
    struct RiskFactors {
        uint256 creditScore;        // 650-950 (30% weight)
        uint256 paymentHistory;     // 0-100 (% on-time payments) (30% weight)
        uint256 invoiceAge;         // days since issue (15% weight)
        uint256 buyerReputation;    // 0-100 (15% weight)
        uint256 invoiceAmount;      // in wei (10% weight)
        uint256 msmeRevenue;        // annual revenue in wei (10% weight)
        IndustryRisk industry;      // LOW/MEDIUM/HIGH (10% weight)
    }

    /**
     * @dev Output risk assessment
     */
    struct RiskScore {
        uint256 score;          // 0-100 (higher = riskier)
        uint256 interestRate;   // APR in basis points (e.g., 1800 = 18%)
        string rating;          // AAA, AA, A, BBB, BB, B, C
    }

    /**
     * @dev Calculate comprehensive risk score from multiple factors
     * @param factors Input risk factors
     * @return RiskScore with score, interest rate, and credit rating
     */
    function calculateRiskScore(RiskFactors memory factors)
        internal
        pure
        returns (RiskScore memory)
    {
        uint256 score = 0;

        // Factor 1: Credit Score (30% weight)
        // Map 650-950 to 0-30 risk points (inverse relationship)
        uint256 creditRisk;
        if (factors.creditScore >= 850) {
            creditRisk = 0;  // Excellent credit
        } else if (factors.creditScore >= 750) {
            creditRisk = 5;  // Very good credit
        } else if (factors.creditScore >= 700) {
            creditRisk = 10; // Good credit
        } else if (factors.creditScore >= 650) {
            creditRisk = 20; // Fair credit
        } else {
            creditRisk = 30; // Poor credit
        }
        score += creditRisk;

        // Factor 2: Payment History (30% weight)
        // 100% on-time = 0 risk, 0% on-time = 30 risk
        require(factors.paymentHistory <= 100, "Invalid payment history");
        uint256 historyRisk = ((100 - factors.paymentHistory) * 30) / 100;
        score += historyRisk;

        // Factor 3: Invoice Age (15% weight)
        // Fresh invoice (0-7 days) = 0 risk
        // Old invoice (90+ days) = 15 risk
        uint256 ageRisk;
        if (factors.invoiceAge > 90) {
            ageRisk = 15;  // Very old invoice
        } else if (factors.invoiceAge > 30) {
            ageRisk = 10;  // Old invoice
        } else if (factors.invoiceAge > 7) {
            ageRisk = 5;   // Slightly old
        } else {
            ageRisk = 0;   // Fresh invoice
        }
        score += ageRisk;

        // Factor 4: Buyer Reputation (15% weight)
        // 100 reputation = 0 risk, 0 reputation = 15 risk
        require(factors.buyerReputation <= 100, "Invalid buyer reputation");
        uint256 buyerRisk = ((100 - factors.buyerReputation) * 15) / 100;
        score += buyerRisk;

        // Factor 5: Size Ratio (10% weight)
        // Large invoice vs small revenue = risky
        require(factors.msmeRevenue > 0, "Invalid MSME revenue");
        uint256 sizeRatio = (factors.invoiceAmount * 100) / factors.msmeRevenue;
        uint256 sizeRisk;
        if (sizeRatio > 50) {
            sizeRisk = 10; // Invoice > 50% of annual revenue
        } else if (sizeRatio > 30) {
            sizeRisk = 5;  // Invoice > 30% of annual revenue
        } else {
            sizeRisk = 0;  // Invoice < 30% of annual revenue
        }
        score += sizeRisk;

        // Factor 6: Industry Risk (10% weight)
        uint256 industryRisk;
        if (factors.industry == IndustryRisk.HIGH) {
            industryRisk = 10; // High-risk industry
        } else if (factors.industry == IndustryRisk.MEDIUM) {
            industryRisk = 5;  // Medium-risk industry
        } else {
            industryRisk = 0;  // Low-risk industry
        }
        score += industryRisk;

        // Clamp score to 0-100
        if (score > 100) {
            score = 100;
        }

        // Calculate interest rate
        // Base rate: 8% (800 basis points)
        // Risk premium: +0.1% per risk point (10 basis points per point)
        // Range: 8% (score 0) to 18% (score 100)
        uint256 interestRate = 800 + (score * 10);

        // Determine credit rating
        string memory rating;
        if (score <= 10) {
            rating = "AAA"; // Exceptional quality
        } else if (score <= 20) {
            rating = "AA";  // Excellent quality
        } else if (score <= 35) {
            rating = "A";   // Good quality
        } else if (score <= 50) {
            rating = "BBB"; // Medium quality
        } else if (score <= 65) {
            rating = "BB";  // Speculative
        } else if (score <= 80) {
            rating = "B";   // Highly speculative
        } else {
            rating = "C";   // Substantial risk
        }

        return RiskScore(score, interestRate, rating);
    }

    /**
     * @dev Calculate interest rate from risk score
     * @param score Risk score (0-100)
     * @return uint256 Interest rate in basis points
     */
    function getInterestForScore(uint256 score) internal pure returns (uint256) {
        require(score <= 100, "Invalid score");
        return 800 + (score * 10); // 8% base + 0.1% per point
    }

    /**
     * @dev Get credit rating from risk score
     * @param score Risk score (0-100)
     * @return string Credit rating (AAA to C)
     */
    function getRatingForScore(uint256 score) internal pure returns (string memory) {
        require(score <= 100, "Invalid score");

        if (score <= 10) return "AAA";
        if (score <= 20) return "AA";
        if (score <= 35) return "A";
        if (score <= 50) return "BBB";
        if (score <= 65) return "BB";
        if (score <= 80) return "B";
        return "C";
    }

    /**
     * @dev Calculate expected default probability from risk score
     * @param score Risk score (0-100)
     * @return uint256 Default probability in basis points (0-10000)
     */
    function getDefaultProbability(uint256 score) internal pure returns (uint256) {
        require(score <= 100, "Invalid score");

        // Simple linear mapping: score 0 = 0.5% default, score 100 = 15% default
        // Formula: 50 + (score * 145) / 10
        return 50 + ((score * 145) / 10);
    }

    /**
     * @dev Validate risk factors before calculation
     * @param factors Risk factors to validate
     * @return bool True if all factors are valid
     */
    function validateFactors(RiskFactors memory factors) internal pure returns (bool) {
        if (factors.creditScore < 300 || factors.creditScore > 950) return false;
        if (factors.paymentHistory > 100) return false;
        if (factors.invoiceAge > 365) return false;
        if (factors.buyerReputation > 100) return false;
        if (factors.invoiceAmount == 0) return false;
        if (factors.msmeRevenue == 0) return false;
        if (uint256(factors.industry) > 2) return false; // MAX is HIGH (2)

        return true;
    }
}
