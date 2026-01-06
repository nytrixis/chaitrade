-- Create credit_score_history table to track MSME credit scores over time
-- This enables historical credit analysis and trend detection

CREATE TABLE IF NOT EXISTS credit_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  msme_address TEXT NOT NULL,
  credit_score INTEGER NOT NULL CHECK (credit_score >= 300 AND credit_score <= 850),
  invoice_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Foreign key to invoices table
  CONSTRAINT fk_invoice
    FOREIGN KEY (invoice_id)
    REFERENCES invoices(id)
    ON DELETE CASCADE
);

-- Create index for faster queries by MSME address
CREATE INDEX IF NOT EXISTS idx_credit_history_msme
  ON credit_score_history(msme_address);

-- Create index for faster queries by invoice
CREATE INDEX IF NOT EXISTS idx_credit_history_invoice
  ON credit_score_history(invoice_id);

-- Create index for time-based queries
CREATE INDEX IF NOT EXISTS idx_credit_history_created_at
  ON credit_score_history(created_at DESC);

-- Add comment explaining the table
COMMENT ON TABLE credit_score_history IS
  'Stores historical credit scores for MSMEs to enable trend analysis and enhanced scoring';

COMMENT ON COLUMN credit_score_history.msme_address IS
  'Ethereum address of the MSME (lowercase)';

COMMENT ON COLUMN credit_score_history.credit_score IS
  'Credit score at time of invoice creation (300-850 range)';

COMMENT ON COLUMN credit_score_history.invoice_id IS
  'Reference to the invoice that generated this credit score';

-- Grant permissions (adjust based on your RLS policies)
-- ALTER TABLE credit_score_history ENABLE ROW LEVEL SECURITY;

-- Example RLS policy: Allow users to view their own credit history
-- CREATE POLICY "Users can view own credit history"
--   ON credit_score_history
--   FOR SELECT
--   USING (msme_address = lower(auth.jwt() ->> 'wallet_address'));
