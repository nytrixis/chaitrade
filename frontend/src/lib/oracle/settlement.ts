/**
 * Oracle Settlement Service
 * Handles automatic settlement of invoices when buyer payment is detected
 * This is the CRITICAL feature that demonstrates "no human in the loop"
 */

import { parseUnits } from 'viem';
import { createInvoice } from '@/lib/supabase/invoices';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export interface SettlementResult {
  success: boolean;
  hash?: string;
  error?: string;
  distribution?: {
    msmeAmount: number;
    investorAmount: number;
    interestAmount: number;
  };
}

/**
 * Oracle Settlement Service Class
 * In production, this would be a backend service monitoring blockchain events
 * For demo purposes, it's triggered manually
 */
export class SettlementOracle {
  /**
   * Trigger settlement for an invoice
   * This simulates the oracle detecting buyer payment and automatically settling
   */
  async triggerSettlement(
    invoiceId: number,
    paymentAmount: number,
    contractWrite: any // writeContract function from wagmi
  ): Promise<SettlementResult> {
    try {
      console.log(`[Oracle] Triggering settlement for invoice #${invoiceId}`);
      console.log(`[Oracle] Payment amount: ₹${paymentAmount.toLocaleString()}`);

      // Step 1: Validate payment amount
      if (paymentAmount <= 0) {
        throw new Error('Invalid payment amount');
      }

      // Step 2: Convert amount to wei (18 decimals)
      const paymentWei = parseUnits(paymentAmount.toString(), 18);

      // Step 3: Call smart contract settlement function
      console.log('[Oracle] Calling smart contract settleInvoice()...');

      const { hash } = await contractWrite({
        functionName: 'settleInvoice',
        args: [BigInt(invoiceId), paymentWei],
      });

      console.log(`[Oracle] Settlement transaction submitted: ${hash}`);

      // Step 4: Calculate distribution (for UI display)
      const distribution = this.calculateDistribution(paymentAmount);

      // Step 5: Log oracle event to database (if Supabase is configured)
      if (isSupabaseConfigured) {
        try {
          const { supabase } = await import('@/lib/supabase/client');

          await (supabase as any).from('oracle_events').insert({
            invoice_id: invoiceId,
            event_type: 'settlement_triggered',
            payload: {
              payment_amount: paymentAmount,
              tx_hash: hash,
              distribution,
            },
            processed: true,
          });

          console.log('[Oracle] Event logged to database');
        } catch (dbError) {
          console.warn('[Oracle] Failed to log to database:', dbError);
          // Don't fail the settlement if database logging fails
        }
      }

      return {
        success: true,
        hash,
        distribution,
      };
    } catch (error: any) {
      console.error('[Oracle] Settlement failed:', error);
      return {
        success: false,
        error: error.message || 'Settlement failed',
      };
    }
  }

  /**
   * Calculate how funds will be distributed
   * MSME gets 80% immediately, 20% goes to investors + interest
   */
  private calculateDistribution(totalAmount: number): {
    msmeAmount: number;
    investorAmount: number;
    interestAmount: number;
  } {
    // Assuming 80% goes to MSME, 20% covers investor principal + interest
    const msmeAmount = totalAmount * 0.8;

    // For simplicity, assume 18% APR on 20% of amount for ~60 days
    const investorPrincipal = totalAmount * 0.2;
    const interestAmount = investorPrincipal * 0.18 * (60 / 365); // ~60 day term
    const investorAmount = investorPrincipal + interestAmount;

    return {
      msmeAmount: Math.round(msmeAmount),
      investorAmount: Math.round(investorPrincipal),
      interestAmount: Math.round(interestAmount),
    };
  }

  /**
   * Monitor invoice for automatic settlement
   * In production, this would run as a backend service
   * For demo, we provide a manual trigger button
   */
  async monitorInvoice(
    invoiceId: number,
    onSettlement: (result: SettlementResult) => void
  ): Promise<() => void> {
    console.log(`[Oracle] Monitoring invoice #${invoiceId} for payment events`);

    // In production, this would:
    // 1. Watch for buyer payment to escrow contract
    // 2. Verify payment amount matches invoice
    // 3. Automatically trigger settlement
    // 4. Distribute funds proportionally to all investors

    // For demo purposes, we just return a cleanup function
    return () => {
      console.log(`[Oracle] Stopped monitoring invoice #${invoiceId}`);
    };
  }

  /**
   * Get settlement status for an invoice
   */
  async getSettlementStatus(invoiceId: number): Promise<{
    isSettled: boolean;
    settledAt?: string;
    txHash?: string;
    distribution?: any;
  }> {
    if (!isSupabaseConfigured) {
      return { isSettled: false };
    }

    try {
      const { supabase } = await import('@/lib/supabase/client');

      const { data: invoice } = await (supabase as any)
        .from('invoices')
        .select('status, settlement_triggered_at, settlement_tx_hash')
        .eq('invoice_nft_id', invoiceId)
        .single();

      if (!invoice) {
        return { isSettled: false };
      }

      return {
        isSettled: invoice.status === 'settled',
        settledAt: invoice.settlement_triggered_at,
        txHash: invoice.settlement_tx_hash,
      };
    } catch (error) {
      console.error('[Oracle] Failed to get settlement status:', error);
      return { isSettled: false };
    }
  }
}

/**
 * Singleton oracle instance
 */
export const settlementOracle = new SettlementOracle();
