/**
 * Investment-related database operations
 */

import { supabase } from './client';

export interface Investment {
  id?: string;
  invoice_id: string;
  investor_id: string;
  amount: number;
  interest_rate: number;
  status: string;
  return_amount?: number;
  timestamp?: string;
  settled_at?: string;
  created_at?: string;
}

/**
 * Get or create investor record
 */
export async function getOrCreateInvestor(walletAddress: string) {
  try {
    const { data: existing, error: findError } = await (supabase as any)
      .from('investors')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (existing && !findError) {
      return { data: existing, error: null };
    }

    const { data, error } = await (supabase as any)
      .from('investors')
      .insert({
        wallet_address: walletAddress.toLowerCase(),
        total_invested: 0,
        total_earned: 0,
        total_returned: 0,
        active_investments: 0,
        completed_investments: 0,
        reputation_score: 0,
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error getting/creating investor:', error);
    return { data: null, error };
  }
}

/**
 * Record a new investment
 */
export async function recordInvestment(
  invoiceId: string,
  walletAddress: string,
  amountAvax: number,
  interestRate: number
) {
  try {
    const { data: investor, error: investorError } = await getOrCreateInvestor(walletAddress);

    if (investorError || !investor) {
      throw new Error('Failed to get/create investor');
    }

    const dailyRate = interestRate / 365 / 100;
    const interest = amountAvax * dailyRate * 60;
    const returnAmount = amountAvax + interest;

    const { data, error } = await (supabase as any)
      .from('investments')
      .insert({
        invoice_id: invoiceId,
        investor_id: investor.id,
        amount: amountAvax,
        interest_rate: interestRate,
        status: 'active',
        return_amount: returnAmount,
      })
      .select()
      .single();

    if (error) throw error;

    await (supabase as any)
      .from('investors')
      .update({
        total_invested: investor.total_invested + amountAvax,
        active_investments: investor.active_investments + 1,
      })
      .eq('id', investor.id);

    const { data: invoice } = await (supabase as any)
      .from('invoices')
      .select('funded_amount')
      .eq('id', invoiceId)
      .single();

    if (invoice) {
      await (supabase as any)
        .from('invoices')
        .update({
          funded_amount: (invoice.funded_amount || 0) + amountAvax,
        })
        .eq('id', invoiceId);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error recording investment:', error);
    return { data: null, error };
  }
}

/**
 * Get investments for an invoice
 */
export async function getInvoiceInvestments(invoiceId: string) {
  try {
    const { data, error } = await (supabase as any)
      .from('investments')
      .select('*, investor:investors(wallet_address, reputation_score)')
      .eq('invoice_id', invoiceId)
      .order('timestamp', { ascending: false });

    return { data, error };
  } catch (error) {
    console.error('Error fetching investments:', error);
    return { data: null, error };
  }
}

/**
 * Get investor's investments
 */
export async function getInvestorInvestments(walletAddress: string) {
  try {
    const { data: investor } = await (supabase as any)
      .from('investors')
      .select('id')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (!investor) {
      return { data: [], error: null };
    }

    const { data, error } = await (supabase as any)
      .from('investments')
      .select('*, invoice:invoices(amount, buyer_name, due_date, status)')
      .eq('investor_id', investor.id)
      .order('timestamp', { ascending: false });

    return { data, error };
  } catch (error) {
    console.error('Error fetching investor investments:', error);
    return { data: null, error };
  }
}

/**
 * Get investments by investor wallet address (simplified)
 */
export async function getInvestmentsByInvestor(walletAddress: string): Promise<Investment[]> {
  try {
    const { data, error } = await getInvestorInvestments(walletAddress);
    if (error || !data) return [];
    return data as Investment[];
  } catch (error) {
    console.error('Error fetching investments by investor:', error);
    return [];
  }
}
