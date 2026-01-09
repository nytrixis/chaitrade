import { RiskScore, getRatingColor, getRiskCategory } from '@/lib/risk/calculator';

interface RiskScoreDisplayProps {
    riskScore: RiskScore;
    showDetails?: boolean;
}

export function RiskScoreDisplay({ riskScore, showDetails = true }: RiskScoreDisplayProps) {
    return (
        <div className="border rounded-lg p-6 space-y-6 bg-white">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Risk Assessment</h3>
                    <p className="text-sm text-gray-600">
                        Algorithmic evaluation based on 6 factors
                    </p>
                </div>
                <div className="text-right">
                    <div
                        className={`text-3xl font-bold px-4 py-2 rounded ${getRatingColor(
                            riskScore.rating
                        )}`}
                    >
                        {riskScore.rating}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{riskScore.score}/100 risk points</p>
                </div>
            </div>

            {/* Interest Rate Display */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded">
                    <p className="text-sm text-gray-600">Interest Rate</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {(riskScore.interestRate * 100).toFixed(2)}%
                    </p>
                    <p className="text-xs text-gray-500">APR</p>
                </div>

                <div className="bg-purple-50 p-4 rounded">
                    <p className="text-sm text-gray-600">Investor Return</p>
                    <p className="text-2xl font-bold text-purple-600">
                        {((riskScore.interestRate * 0.95) * 100).toFixed(2)}%
                    </p>
                    <p className="text-xs text-gray-500">After 5% platform fee</p>
                </div>
            </div>

            {/* Risk Category Badge */}
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <span className="text-sm font-medium text-gray-700">Risk Category</span>
                <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        riskScore.score <= 20
                            ? 'bg-green-100 text-green-700'
                            : riskScore.score <= 50
                            ? 'bg-yellow-100 text-yellow-700'
                            : riskScore.score <= 80
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                    }`}
                >
                    {getRiskCategory(riskScore.score)}
                </span>
            </div>

            {showDetails && (
                <>
                    {/* Risk Breakdown */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Risk Factor Breakdown</h4>
                        {Object.entries(riskScore.breakdown).map(([factor, value]) => {
                            const percentage = value;
                            const label = factor
                                .replace('Risk', '')
                                .replace(/([A-Z])/g, ' $1')
                                .trim();
                            const maxValue =
                                factor === 'creditRisk' || factor === 'historyRisk'
                                    ? 30
                                    : factor === 'ageRisk' || factor === 'buyerRisk'
                                    ? 15
                                    : 10;

                            return (
                                <div key={factor} className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 w-32 capitalize">
                                        {label}:
                                    </span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${
                                                percentage <= maxValue * 0.3
                                                    ? 'bg-green-500'
                                                    : percentage <= maxValue * 0.6
                                                    ? 'bg-yellow-500'
                                                    : 'bg-red-500'
                                            }`}
                                            style={{ width: `${(percentage / maxValue) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium w-12 text-right">
                                        {value}/{maxValue}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Default Probability */}
                    <div className="bg-orange-50 border border-orange-200 rounded p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-semibold text-orange-900">
                                    Default Probability
                                </p>
                                <p className="text-xs text-orange-700">
                                    Estimated risk of non-payment
                                </p>
                            </div>
                            <p className="text-2xl font-bold text-orange-600">
                                {riskScore.defaultProbability.toFixed(2)}%
                            </p>
                        </div>
                    </div>

                    {/* Explanation */}
                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                        <p className="font-semibold mb-1">How is this calculated?</p>
                        <p>
                            Risk score combines 6 factors: Credit Score (30%), Payment History
                            (30%), Invoice Age (15%), Buyer Reputation (15%), Invoice Size (10%),
                            and Industry (10%). Interest rate = 8% base + 0.1% per risk point (range
                            8-18%).
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}

// Compact version for cards
export function RiskScoreCompact({ riskScore }: { riskScore: RiskScore }) {
    return (
        <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded font-bold ${getRatingColor(riskScore.rating)}`}>
                {riskScore.rating}
            </div>
            <div className="text-sm">
                <p className="font-semibold">{(riskScore.interestRate * 100).toFixed(1)}% APR</p>
                <p className="text-xs text-gray-500">{getRiskCategory(riskScore.score)}</p>
            </div>
        </div>
    );
}
