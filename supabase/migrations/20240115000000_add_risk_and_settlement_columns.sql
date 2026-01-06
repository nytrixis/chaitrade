-- Add risk scoring and settlement columns to invoices table
-- Migration: Add risk scoring and oracle settlement support

-- Add risk scoring columns
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS risk_score DECIMAL(3,1) CHECK (risk_score >= 1 AND risk_score <= 10),
ADD COLUMN IF NOT EXISTS risk_category VARCHAR(20) CHECK (risk_category IN ('low', 'medium', 'high', 'very_high')),
ADD COLUMN IF NOT EXISTS estimated_apr DECIMAL(5,2) CHECK (estimated_apr >= 0 AND estimated_apr <= 100),
ADD COLUMN IF NOT EXISTS default_probability DECIMAL(5,2) CHECK (default_probability >= 0 AND default_probability <= 100);

-- Add settlement tracking columns
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS settlement_triggered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS settlement_tx_hash VARCHAR(66),
ADD COLUMN IF NOT EXISTS oracle_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS oracle_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS settlement_amount DECIMAL(20,2),
ADD COLUMN IF NOT EXISTS settlement_distribution JSONB;

-- Add payment tracking columns
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS payment_received_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(20,2),
ADD COLUMN IF NOT EXISTS payment_tx_hash VARCHAR(66);

-- Add buyer credit history columns for risk calculation
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS buyer_previous_invoices INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS buyer_on_time_payments INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS buyer_total_funded DECIMAL(20,2) DEFAULT 0;

-- Create index for faster risk-based queries
CREATE INDEX IF NOT EXISTS idx_invoices_risk_score ON invoices(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_risk_category ON invoices(risk_category);
CREATE INDEX IF NOT EXISTS idx_invoices_oracle_verified ON invoices(oracle_verified);
CREATE INDEX IF NOT EXISTS idx_invoices_settlement_status ON invoices(settlement_triggered_at) WHERE settlement_triggered_at IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN invoices.risk_score IS 'Risk score from 1 (highest risk) to 10 (lowest risk)';
COMMENT ON COLUMN invoices.risk_category IS 'Risk category: low, medium, high, very_high';
COMMENT ON COLUMN invoices.estimated_apr IS 'Estimated annual percentage rate based on risk';
COMMENT ON COLUMN invoices.default_probability IS 'Estimated probability of default (0-100%)';
COMMENT ON COLUMN invoices.settlement_triggered_at IS 'Timestamp when oracle triggered settlement';
COMMENT ON COLUMN invoices.settlement_tx_hash IS 'Transaction hash of settlement on blockchain';
COMMENT ON COLUMN invoices.oracle_verified IS 'Whether oracle has verified payment receipt';
COMMENT ON COLUMN invoices.settlement_distribution IS 'JSON object with MSME and investor distribution amounts';
