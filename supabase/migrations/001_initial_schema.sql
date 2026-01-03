-- ChaiTrade Supabase Schema
-- Manual setup required on Vercel deployment
-- Execute this SQL in Supabase SQL Editor

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE invoice_status AS ENUM (
  'Listed',
  'Funding',
  'Funded',
  'Paid',
  'Defaulted',
  'Cancelled'
);

CREATE TYPE credit_event_type AS ENUM (
  'payment_on_time',
  'payment_late',
  'default',
  'new_invoice'
);

-- ============================================
-- TABLES
-- ============================================

-- MSMEs (Micro, Small, and Medium Enterprises)
CREATE TABLE IF NOT EXISTS msmes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  gst_number TEXT,
  email TEXT,
  phone TEXT,
  credit_score INTEGER DEFAULT 650,
  on_chain_score INTEGER DEFAULT 0,
  total_invoices_created BIGINT DEFAULT 0,
  total_amount_funded NUMERIC DEFAULT 0,
  total_amount_repaid NUMERIC DEFAULT 0,
  reputation_score NUMERIC DEFAULT 0, -- 0-100
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices (Invoice NFTs)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_id BIGINT UNIQUE,
  msme_id UUID NOT NULL REFERENCES msmes(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL, -- MSME's wallet
  ipfs_cid TEXT NOT NULL,
  amount NUMERIC NOT NULL, -- In USDC (6 decimals)
  buyer_name TEXT NOT NULL,
  buyer_email TEXT,
  invoice_number TEXT,
  issue_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ NOT NULL,
  status invoice_status DEFAULT 'Listed',
  funded_amount NUMERIC DEFAULT 0,
  target_amount NUMERIC DEFAULT 0, -- 80% of amount
  interest_rate NUMERIC DEFAULT 18, -- 18% APR
  funding_deadline TIMESTAMPTZ NOT NULL,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investors
CREATE TABLE IF NOT EXISTS investors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT,
  total_invested NUMERIC DEFAULT 0,
  total_earned NUMERIC DEFAULT 0,
  total_returned NUMERIC DEFAULT 0,
  active_investments BIGINT DEFAULT 0,
  completed_investments BIGINT DEFAULT 0,
  reputation_score NUMERIC DEFAULT 0, -- 0-100
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investments (Funding records)
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL, -- In USDC
  interest_rate NUMERIC NOT NULL,
  status TEXT DEFAULT 'active', -- active, completed, defaulted
  return_amount NUMERIC DEFAULT 0,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  settled_at TIMESTAMPTZ
);

-- Credit Events (for score calculation)
CREATE TABLE IF NOT EXISTS credit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  msme_id UUID NOT NULL REFERENCES msmes(id) ON DELETE CASCADE,
  event_type credit_event_type NOT NULL,
  invoice_id UUID REFERENCES invoices(id),
  impact INTEGER DEFAULT 0, -- +10, -20, etc.
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ZK Proof Commitments
CREATE TABLE IF NOT EXISTS zk_commitments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  msme_id UUID NOT NULL REFERENCES msmes(id) ON DELETE CASCADE,
  commitment BYTEA NOT NULL, -- Hash of score + salt
  min_score_proven INTEGER, -- Minimum score proven
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Receipts
CREATE TABLE IF NOT EXISTS payment_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount_paid NUMERIC NOT NULL,
  principal_distributed NUMERIC DEFAULT 0,
  interest_distributed NUMERIC DEFAULT 0,
  paid_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- MSMEs
CREATE INDEX idx_msmes_wallet ON msmes(wallet_address);
CREATE INDEX idx_msmes_created ON msmes(created_at DESC);

-- Invoices
CREATE INDEX idx_invoices_msme ON invoices(msme_id);
CREATE INDEX idx_invoices_wallet ON invoices(wallet_address);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_token_id ON invoices(token_id);

-- Investors
CREATE INDEX idx_investors_wallet ON investors(wallet_address);
CREATE INDEX idx_investors_created ON investors(created_at DESC);

-- Investments
CREATE INDEX idx_investments_invoice ON investments(invoice_id);
CREATE INDEX idx_investments_investor ON investments(investor_id);
CREATE INDEX idx_investments_status ON investments(status);

-- Credit Events
CREATE INDEX idx_credit_events_msme ON credit_events(msme_id);
CREATE INDEX idx_credit_events_type ON credit_events(event_type);
CREATE INDEX idx_credit_events_date ON credit_events(created_at DESC);

-- ZK Commitments
CREATE INDEX idx_zk_commitments_msme ON zk_commitments(msme_id);
CREATE INDEX idx_zk_commitments_verified ON zk_commitments(is_verified);

-- Payment Receipts
CREATE INDEX idx_payment_receipts_invoice ON payment_receipts(invoice_id);
CREATE INDEX idx_payment_receipts_date ON payment_receipts(paid_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE msmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE zk_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_receipts ENABLE ROW LEVEL SECURITY;

-- MSMEs: Users can only see their own MSME record
CREATE POLICY "msmes_own_record" ON msmes
  FOR SELECT USING (auth.jwt() ->> 'wallet_address' = wallet_address);

CREATE POLICY "msmes_insert_own" ON msmes
  FOR INSERT WITH CHECK (auth.jwt() ->> 'wallet_address' = wallet_address);

CREATE POLICY "msmes_update_own" ON msmes
  FOR UPDATE USING (auth.jwt() ->> 'wallet_address' = wallet_address);

-- Invoices: Public read, MSME can update own
CREATE POLICY "invoices_public_read" ON invoices
  FOR SELECT USING (true);

CREATE POLICY "invoices_msme_write" ON invoices
  FOR INSERT WITH CHECK (
    wallet_address = auth.jwt() ->> 'wallet_address'
  );

CREATE POLICY "invoices_msme_update" ON invoices
  FOR UPDATE USING (
    wallet_address = auth.jwt() ->> 'wallet_address'
  );

-- Investors: Users can only see their own
CREATE POLICY "investors_own_record" ON investors
  FOR SELECT USING (auth.jwt() ->> 'wallet_address' = wallet_address);

CREATE POLICY "investors_insert_own" ON investors
  FOR INSERT WITH CHECK (auth.jwt() ->> 'wallet_address' = wallet_address);

CREATE POLICY "investors_update_own" ON investors
  FOR UPDATE USING (auth.jwt() ->> 'wallet_address' = wallet_address);

-- Investments: Users can see their own investments + public stats
CREATE POLICY "investments_own_read" ON investments
  FOR SELECT USING (
    investor_id IN (
      SELECT id FROM investors 
      WHERE wallet_address = auth.jwt() ->> 'wallet_address'
    )
    OR true -- Also allow public read for stats
  );

-- Credit Events: Public read, system write only
CREATE POLICY "credit_events_read" ON credit_events
  FOR SELECT USING (true);

-- ZK Commitments: Users can only see their own
CREATE POLICY "zk_commitments_own" ON zk_commitments
  FOR SELECT USING (
    msme_id IN (
      SELECT id FROM msmes 
      WHERE wallet_address = auth.jwt() ->> 'wallet_address'
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update credit score based on payment events
CREATE OR REPLACE FUNCTION update_credit_score()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.event_type = 'payment_on_time' THEN
    UPDATE msmes SET credit_score = credit_score + 10 WHERE id = NEW.msme_id;
  ELSIF NEW.event_type = 'payment_late' THEN
    UPDATE msmes SET credit_score = credit_score - 5 WHERE id = NEW.msme_id;
  ELSIF NEW.event_type = 'default' THEN
    UPDATE msmes SET credit_score = credit_score - 50 WHERE id = NEW.msme_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER credit_score_trigger
AFTER INSERT ON credit_events
FOR EACH ROW EXECUTE FUNCTION update_credit_score();

-- Update invoice status to Paid
CREATE OR REPLACE FUNCTION mark_invoice_paid()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invoices 
  SET status = 'Paid'
  WHERE id = NEW.invoice_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_trigger
AFTER INSERT ON payment_receipts
FOR EACH ROW EXECUTE FUNCTION mark_invoice_paid();

-- ============================================
-- VIEWS (Optional - for common queries)
-- ============================================

-- Active funding rounds
CREATE OR REPLACE VIEW active_funding_rounds AS
SELECT
  i.id,
  i.token_id,
  i.msme_id,
  m.business_name,
  m.wallet_address,
  i.amount,
  i.funded_amount,
  i.target_amount,
  (i.funded_amount / NULLIF(i.target_amount, 0) * 100) as funding_percentage,
  i.interest_rate,
  i.funding_deadline,
  EXTRACT(DAY FROM i.funding_deadline - NOW()) as days_left
FROM invoices i
JOIN msmes m ON i.msme_id = m.id
WHERE i.status = 'Funding' AND i.funding_deadline > NOW();

-- Investor portfolio
CREATE OR REPLACE VIEW investor_portfolio AS
SELECT
  inv.id,
  inv.wallet_address,
  COUNT(DISTINCT i.id) as active_investments,
  SUM(i.amount) as total_invested,
  SUM(CASE WHEN i.status = 'Paid' THEN i.return_amount ELSE 0 END) as total_earned,
  AVG(i.interest_rate) as avg_return_rate
FROM investors inv
LEFT JOIN investments i ON inv.id = i.investor_id
GROUP BY inv.id, inv.wallet_address;

-- MSME financial summary
CREATE OR REPLACE VIEW msme_financial_summary AS
SELECT
  m.id,
  m.wallet_address,
  m.business_name,
  COUNT(DISTINCT i.id) as total_invoices,
  SUM(i.amount) as total_value,
  SUM(i.funded_amount) as total_funded,
  COUNT(DISTINCT CASE WHEN i.status = 'Paid' THEN i.id END) as invoices_repaid,
  COUNT(DISTINCT CASE WHEN i.status = 'Funding' THEN i.id END) as invoices_funding,
  m.credit_score
FROM msmes m
LEFT JOIN invoices i ON m.id = i.msme_id
GROUP BY m.id, m.wallet_address, m.business_name, m.credit_score;

-- ============================================
-- INITIAL DATA (optional)
-- ============================================

-- Insert sample MSME for testing
-- INSERT INTO msmes (wallet_address, business_name, gst_number, email)
-- VALUES ('0x1234567890123456789012345678901234567890', 'Test MSME', 'GSTNO123', 'test@example.com');

-- ============================================
-- NOTES
-- ============================================

/*
Setup Instructions:
1. Create Supabase project at https://supabase.com
2. Go to SQL Editor
3. Create new query
4. Copy-paste this entire script
5. Run it
6. Configure authentication (Google/Wallet signing)
7. Update environment variables in frontend
8. Enable appropriate RLS policies based on your auth method

Schema Design Notes:
- wallet_address is stored as TEXT (not the auth UUID)
- invoice token_id maps to NFT token ID on Avalanche
- credit_score ranges 650-950
- amounts stored as NUMERIC for precision (6 decimals for USDC)
- RLS policies use auth.jwt() - configure based on your auth method
- Triggers automatically update scores and statuses
*/
