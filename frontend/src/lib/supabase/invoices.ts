import { supabase } from './client';

export interface Invoice {
  id?: string;
  msme_address: string;
  invoice_nft_id: number;
  amount: number;
  buyer_name: string;
  due_date: string;
  ipfs_cid: string;
  credit_score: number;
  status: 'pending' | 'active' | 'funded' | 'settled';
  created_at?: string;

  // Optional fields
  invoice_number?: string;
  zk_proof_cid?: string;

  // Risk scoring fields
  risk_score?: number;
  risk_category?: 'low' | 'medium' | 'high' | 'very_high';
  estimated_apr?: number;
  default_probability?: number;

  // Settlement fields
  settlement_triggered_at?: string;
  settlement_tx_hash?: string;
  oracle_verified?: boolean;
  oracle_verified_at?: string;
  settlement_amount?: number;
  settlement_distribution?: any;

  // Payment tracking
  payment_received_at?: string;
  payment_amount?: number;
  payment_tx_hash?: string;

  // Buyer history for risk calculation
  buyer_previous_invoices?: number;
  buyer_on_time_payments?: number;
  buyer_total_funded?: number;
}

/**
 * Store invoice data in Supabase
 */
export async function createInvoice(invoice: Omit<Invoice, 'id' | 'created_at'>): Promise<Invoice> {
  const { data, error } = await (supabase as any)
    .from('invoices')
    .insert([invoice])
    .select()
    .single();

  if (error) {
    console.error('Error creating invoice:', error);
    throw new Error(`Failed to store invoice: ${error.message}`);
  }

  return data;
}

/**
 * Get invoices for a specific MSME
 */
export async function getInvoicesByMSME(msmeAddress: string): Promise<Invoice[]> {
  // Some Supabase schemas may use 'msme_address' or 'msme' as the column name.
  // Try the standard column first, then fall back to alternate names to avoid runtime 400 errors.
  try {
    let res = await (supabase as any)
      .from('invoices')
      .select('*')
      .eq('msme_address', msmeAddress.toLowerCase())
      .order('created_at', { ascending: false });

    if (res.error) {
      // Try fallback column name 'msme'
      console.warn('msme_address query failed, attempting fallback column msme', res.error);
      res = await (supabase as any)
        .from('invoices')
        .select('*')
        .eq('msme', msmeAddress.toLowerCase())
        .order('created_at', { ascending: false });
    }

    if (res.error) {
      console.error('Error fetching invoices after fallbacks:', res.error);
      throw new Error(`Failed to fetch invoices: ${res.error.message}`);
    }

    return res.data || [];
  } catch (err: any) {
    console.error('Unexpected error fetching invoices:', err);
    throw err;
  }
}

/**
 * Get all active invoices (for investors)
 */
export async function getActiveInvoices(): Promise<Invoice[]> {
  const { data, error } = await (supabase as any)
    .from('invoices')
    .select('*')
    .in('status', ['active', 'pending'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching active invoices:', error);
    throw new Error(`Failed to fetch active invoices: ${error.message}`);
  }

  return data || [];
}

/**
 * Get invoice by database ID
 */
export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const { data, error } = await (supabase as any)
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching invoice by ID:', error);
    return null;
  }

  return data;
}

/**
 * Get invoice by NFT token ID
 */
export async function getInvoiceByTokenId(tokenId: number): Promise<Invoice | null> {
  const { data, error } = await (supabase as any)
    .from('invoices')
    .select('*')
    .eq('invoice_nft_id', tokenId)
    .single();

  if (error) {
    console.error('Error fetching invoice by token ID:', error);
    return null;
  }

  return data;
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(
  invoiceId: string,
  status: Invoice['status']
): Promise<void> {
  const { error } = await (supabase as any)
    .from('invoices')
    .update({ status })
    .eq('id', invoiceId);

  if (error) {
    console.error('Error updating invoice status:', error);
    throw new Error(`Failed to update invoice: ${error.message}`);
  }
}

/**
 * Get activity log for an invoice by token ID
 */
export async function getInvoiceActivities(tokenId: number): Promise<any[]> {
  // First get the invoice ID from token ID
  const invoice = await getInvoiceByTokenId(tokenId);
  if (!invoice || !invoice.id) {
    return [];
  }

  const { data, error } = await (supabase as any)
    .from('activity_log')
    .select('*')
    .eq('invoice_id', invoice.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching invoice activities:', error);
    return [];
  }

  return data || [];
}
