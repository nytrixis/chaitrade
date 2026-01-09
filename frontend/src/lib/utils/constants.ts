/**
 * Application constants for ChaiTrade
 */

// Invoice Status
export const INVOICE_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  FUNDED: 'funded',
  SETTLED: 'settled',
  DEFAULTED: 'defaulted',
} as const;

export type InvoiceStatus = typeof INVOICE_STATUS[keyof typeof INVOICE_STATUS];

// Invoice Status Labels
export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  [INVOICE_STATUS.PENDING]: 'Pending',
  [INVOICE_STATUS.ACTIVE]: 'Active',
  [INVOICE_STATUS.FUNDED]: 'Fully Funded',
  [INVOICE_STATUS.SETTLED]: 'Settled',
  [INVOICE_STATUS.DEFAULTED]: 'Defaulted',
};

// Invoice Status Colors (Tailwind classes)
export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  [INVOICE_STATUS.PENDING]: 'bg-yellow-500/20 text-yellow-400',
  [INVOICE_STATUS.ACTIVE]: 'bg-blue-500/20 text-blue-400',
  [INVOICE_STATUS.FUNDED]: 'bg-emerald-500/20 text-emerald-400',
  [INVOICE_STATUS.SETTLED]: 'bg-purple-500/20 text-purple-400',
  [INVOICE_STATUS.DEFAULTED]: 'bg-red-500/20 text-red-400',
};

// Credit Score Ranges
export const CREDIT_SCORE_RANGES = {
  MIN: 300,
  MAX: 900,
  EXCELLENT: 750,
  GOOD: 700,
  FAIR: 650,
  POOR: 600,
} as const;

// Credit Score Labels
export const CREDIT_SCORE_LABELS = {
  EXCELLENT: 'Excellent',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
  VERY_POOR: 'Very Poor',
} as const;

// Risk Level
export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  VERY_HIGH: 'very_high',
} as const;

export type RiskLevel = typeof RISK_LEVELS[keyof typeof RISK_LEVELS];

// Risk Level Colors
export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  [RISK_LEVELS.LOW]: 'text-emerald-400',
  [RISK_LEVELS.MEDIUM]: 'text-blue-400',
  [RISK_LEVELS.HIGH]: 'text-yellow-400',
  [RISK_LEVELS.VERY_HIGH]: 'text-red-400',
};

// Invoice Amount Limits (in INR)
export const AMOUNT_LIMITS = {
  MIN_INVOICE: 1000,
  MAX_INVOICE: 100000000, // 10 Crore
  MIN_INVESTMENT: 1000,
} as const;

// Interest Rate Limits (in percentage)
export const INTEREST_RATE_LIMITS = {
  MIN: 0,
  MAX: 50,
  DEFAULT: 18,
} as const;

// Time Constants
export const TIME_CONSTANTS = {
  MAX_DUE_DATE_DAYS: 365, // 1 year
  FUNDING_DEADLINE_DAYS: 7,
  SETTLEMENT_GRACE_PERIOD_DAYS: 3,
} as const;

// Blockchain Constants
export const BLOCKCHAIN = {
  CHAIN_ID: 43113, // Avalanche Fuji Testnet
  CHAIN_NAME: 'Avalanche Fuji Testnet',
  EXPLORER_URL: 'https://testnet.snowtrace.io',
  RPC_URL: 'https://api.avax-test.network/ext/bc/C/rpc',
} as const;

// IPFS/Pinata Constants
export const IPFS = {
  GATEWAY_URL: 'https://gateway.pinata.cloud/ipfs',
  PINATA_API_URL: 'https://api.pinata.cloud',
} as const;

// UI Constants
export const UI = {
  TOAST_DURATION: 5000, // ms
  LOADING_DEBOUNCE: 300, // ms
  PAGINATION_PAGE_SIZE: 10,
  MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
  INSUFFICIENT_FUNDS: 'Insufficient funds in your wallet',
  TRANSACTION_REJECTED: 'Transaction was rejected by user',
  NETWORK_ERROR: 'Network error. Please try again',
  INVALID_INVOICE: 'Invalid invoice data',
  INVOICE_NOT_FOUND: 'Invoice not found',
  UPLOAD_FAILED: 'Failed to upload file',
  OCR_FAILED: 'Failed to extract invoice data',
  DATABASE_ERROR: 'Database error. Please try again',
  CONTRACT_ERROR: 'Smart contract error. Please try again',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  INVOICE_CREATED: 'Invoice created successfully',
  INVESTMENT_SUCCESSFUL: 'Investment successful',
  SETTLEMENT_TRIGGERED: 'Settlement triggered successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
} as const;

// Navigation Routes
export const ROUTES = {
  HOME: '/',
  MSME_DASHBOARD: '/msme',
  INVESTOR_DASHBOARD: '/investor',
  INVOICE_DETAIL: '/invoice',
  BROWSE_INVOICES: '/browse',
  DEMO_UPLOAD: '/demo/upload',
  DEMO_SETTLEMENT: '/demo/settlement',
} as const;

// Activity Types
export const ACTIVITY_TYPES = {
  INVOICE_CREATED: 'invoice_created',
  FUNDING_RECEIVED: 'funding_received',
  FULLY_FUNDED: 'fully_funded',
  SETTLEMENT_TRIGGERED: 'settlement_triggered',
  INVOICE_SETTLED: 'invoice_settled',
  PAYMENT_RECEIVED: 'payment_received',
  DEFAULT: 'default',
} as const;

export type ActivityType = typeof ACTIVITY_TYPES[keyof typeof ACTIVITY_TYPES];

// Activity Icons
export const ACTIVITY_ICONS: Record<ActivityType, string> = {
  [ACTIVITY_TYPES.INVOICE_CREATED]: '📄',
  [ACTIVITY_TYPES.FUNDING_RECEIVED]: '💰',
  [ACTIVITY_TYPES.FULLY_FUNDED]: '✓',
  [ACTIVITY_TYPES.SETTLEMENT_TRIGGERED]: '⚡',
  [ACTIVITY_TYPES.INVOICE_SETTLED]: '✅',
  [ACTIVITY_TYPES.PAYMENT_RECEIVED]: '💸',
  [ACTIVITY_TYPES.DEFAULT]: '⚠️',
};

// ZK Proof Constants
export const ZK_PROOF = {
  MIN_CREDIT_THRESHOLD: 650,
  VERIFICATION_TIMEOUT: 30000, // ms
} as const;

// Contract Function Names
export const CONTRACT_FUNCTIONS = {
  MINT_INVOICE: 'mintInvoice',
  CREATE_FUNDING_ROUND: 'createFundingRound',
  INVEST: 'invest',
  SETTLE_INVOICE: 'settleInvoice',
  COMMIT_CREDIT_SCORE: 'commitCreditScore',
  GET_INVOICE: 'getInvoice',
  GET_FUNDING_INFO: 'getFundingInfo',
  IS_CREDITWORTHY: 'isCreditworthy',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  WALLET_CONNECTED: 'chaitrade_wallet_connected',
  USER_PREFERENCES: 'chaitrade_user_preferences',
  LAST_VISITED: 'chaitrade_last_visited',
} as const;

// Feature Flags
export const FEATURES = {
  ENABLE_ORACLE_SETTLEMENT: true,
  ENABLE_MULTI_INVESTOR: true,
  ENABLE_DISPUTE_RESOLUTION: false, // Coming soon
  ENABLE_SECONDARY_MARKET: false, // Coming soon
  ENABLE_ANALYTICS: true,
} as const;
