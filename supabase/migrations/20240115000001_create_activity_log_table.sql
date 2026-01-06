-- Create activity_log table for timeline tracking
-- This table stores all important events related to invoices

CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  actor_wallet VARCHAR(42),
  tx_hash VARCHAR(66),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_action_type CHECK (
    action_type IN (
      'invoice_created',
      'invoice_uploaded',
      'nft_minted',
      'zk_proof_generated',
      'funding_received',
      'funding_partial',
      'fully_funded',
      'settlement_triggered',
      'oracle_verified',
      'invoice_settled',
      'payment_received',
      'default',
      'dispute_raised',
      'dispute_resolved'
    )
  )
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_activity_log_invoice_id ON activity_log(invoice_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action_type ON activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_actor_wallet ON activity_log(actor_wallet);

-- Add Row Level Security (RLS)
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read activity logs
CREATE POLICY "Anyone can read activity logs"
  ON activity_log
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users can insert activity logs
CREATE POLICY "Authenticated users can insert activity logs"
  ON activity_log
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Add comments
COMMENT ON TABLE activity_log IS 'Timeline of all activities related to invoices';
COMMENT ON COLUMN activity_log.action_type IS 'Type of action performed';
COMMENT ON COLUMN activity_log.description IS 'Human-readable description of the action';
COMMENT ON COLUMN activity_log.actor_wallet IS 'Wallet address of the actor who performed the action';
COMMENT ON COLUMN activity_log.tx_hash IS 'Blockchain transaction hash if applicable';
COMMENT ON COLUMN activity_log.metadata IS 'Additional data related to the action (e.g., amount, NFT ID)';

-- Function to automatically create activity log entries
CREATE OR REPLACE FUNCTION log_invoice_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Log invoice creation
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_log (invoice_id, action_type, description, actor_wallet, metadata)
    VALUES (
      NEW.id,
      'invoice_created',
      'Invoice uploaded and created',
      NEW.msme_address,
      jsonb_build_object(
        'amount', NEW.amount,
        'buyer_name', NEW.buyer_name,
        'invoice_nft_id', NEW.invoice_nft_id
      )
    );
  END IF;

  -- Log status changes
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'active' THEN
      INSERT INTO activity_log (invoice_id, action_type, description, metadata)
      VALUES (
        NEW.id,
        'nft_minted',
        'Invoice NFT minted and activated',
        jsonb_build_object('nft_id', NEW.invoice_nft_id)
      );
    ELSIF NEW.status = 'funded' THEN
      INSERT INTO activity_log (invoice_id, action_type, description, metadata)
      VALUES (
        NEW.id,
        'fully_funded',
        'Invoice fully funded by investors',
        jsonb_build_object('amount', NEW.amount)
      );
    ELSIF NEW.status = 'settled' THEN
      INSERT INTO activity_log (invoice_id, action_type, description, tx_hash, metadata)
      VALUES (
        NEW.id,
        'invoice_settled',
        'Invoice settled and funds distributed',
        NEW.settlement_tx_hash,
        NEW.settlement_distribution
      );
    END IF;
  END IF;

  -- Log oracle verification
  IF TG_OP = 'UPDATE' AND OLD.oracle_verified IS DISTINCT FROM NEW.oracle_verified AND NEW.oracle_verified = TRUE THEN
    INSERT INTO activity_log (invoice_id, action_type, description, metadata)
    VALUES (
      NEW.id,
      'oracle_verified',
      'Payment verified by oracle',
      jsonb_build_object(
        'payment_amount', NEW.payment_amount,
        'payment_tx_hash', NEW.payment_tx_hash
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic activity logging
DROP TRIGGER IF EXISTS trigger_log_invoice_activity ON invoices;
CREATE TRIGGER trigger_log_invoice_activity
  AFTER INSERT OR UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION log_invoice_activity();
