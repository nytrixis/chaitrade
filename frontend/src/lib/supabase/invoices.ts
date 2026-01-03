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
  const { data, error } = await (supabase as any)
    .from('invoices')
    .select('*')
    .eq('msme_address', msmeAddress.toLowerCase())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching invoices:', error);
    throw new Error(`Failed to fetch invoices: ${error.message}`);
  }

  return data || [];
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
