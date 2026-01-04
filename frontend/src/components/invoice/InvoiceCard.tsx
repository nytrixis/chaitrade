"use client";

import Link from 'next/link';
import { Invoice } from '@/lib/supabase/invoices';
import { formatCurrency, formatDate, formatDaysUntilDue, formatAddress } from '@/lib/utils/format';
import { INVOICE_STATUS_COLORS } from '@/lib/utils/constants';

export interface InvoiceCardProps {
  invoice: Invoice;
  fundingProgress?: number;
  showOwner?: boolean;
  className?: string;
}

export function InvoiceCard({
  invoice,
  fundingProgress = 0,
  showOwner = false,
  className = ''
}: InvoiceCardProps) {
  const dueDate = new Date(invoice.due_date);
  const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntilDue < 0;
  const isUrgent = daysUntilDue >= 0 && daysUntilDue < 7;

  // Determine status color
  const statusColor = INVOICE_STATUS_COLORS[invoice.status] || 'bg-gray-500/20 text-gray-400';

  // Calculate risk indicator
  const getRiskColor = (score: number) => {
    if (score >= 750) return 'text-sage-green-400';
    if (score >= 700) return 'text-blue-400';
    if (score >= 650) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Link
      href={`/invoice/${invoice.invoice_nft_id}`}
      className={`block ${className}`}
    >
      <div className="card hover:border-sage-green-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-sage-green-500/10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-off-white">
                {formatCurrency(invoice.amount, 0)}
              </h3>
              <div className={`px-2 py-0.5 rounded text-xs font-semibold ${statusColor}`}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </div>
            </div>
            <p className="text-sm text-light-gray">NFT #{invoice.invoice_nft_id}</p>
          </div>

          {/* Credit Score Badge */}
          <div className="text-right">
            <div className="text-xs text-light-gray mb-1">Credit Score</div>
            <div className={`text-2xl font-bold ${getRiskColor(invoice.credit_score)}`}>
              {invoice.credit_score}
            </div>
          </div>
        </div>

        {/* Buyer Info */}
        <div className="mb-4 pb-4 border-b border-medium-gray/30">
          <div className="text-xs text-light-gray mb-1">Buyer</div>
          <div className="text-sm text-off-white font-medium truncate">
            {invoice.buyer_name}
          </div>
        </div>

        {/* Due Date */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-light-gray">Due Date</span>
            <span className="text-off-white font-medium">{formatDate(dueDate)}</span>
          </div>
          <div className={`text-xs mt-1 ${
            isOverdue ? 'text-red-400' :
            isUrgent ? 'text-yellow-400' :
            'text-sage-green-400'
          }`}>
            {formatDaysUntilDue(dueDate)}
          </div>
        </div>

        {/* Funding Progress */}
        {invoice.status !== 'pending' && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-light-gray">Funding Progress</span>
              <span className="text-off-white font-semibold">
                {fundingProgress.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-dark-gray rounded-full h-2">
              <div
                className="bg-sage-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(fundingProgress, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Owner/MSME Address */}
        {showOwner && (
          <div className="pt-3 border-t border-medium-gray/30">
            <div className="text-xs text-light-gray mb-1">MSME Address</div>
            <div className="text-xs font-mono text-off-white">
              {formatAddress(invoice.msme_address, 8, 6)}
            </div>
          </div>
        )}

        {/* IPFS Link */}
        {invoice.ipfs_cid && (
          <div className="pt-3 border-t border-medium-gray/30 mt-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-light-gray">📄 Invoice Document</span>
              <span className="text-sage-green-500 hover:text-sage-green-400">
                View on IPFS →
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

/**
 * Skeleton loader for InvoiceCard
 */
export function InvoiceCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`card ${className}`}>
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="h-6 bg-dark-gray rounded w-32 mb-2"></div>
            <div className="h-4 bg-dark-gray rounded w-20"></div>
          </div>
          <div className="text-right">
            <div className="h-3 bg-dark-gray rounded w-16 mb-1"></div>
            <div className="h-7 bg-dark-gray rounded w-12"></div>
          </div>
        </div>

        {/* Buyer */}
        <div className="mb-4 pb-4 border-b border-medium-gray/30">
          <div className="h-3 bg-dark-gray rounded w-12 mb-2"></div>
          <div className="h-4 bg-dark-gray rounded w-40"></div>
        </div>

        {/* Due Date */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 bg-dark-gray rounded w-16"></div>
            <div className="h-4 bg-dark-gray rounded w-24"></div>
          </div>
          <div className="h-3 bg-dark-gray rounded w-28"></div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 bg-dark-gray rounded w-28"></div>
            <div className="h-4 bg-dark-gray rounded w-12"></div>
          </div>
          <div className="h-2 bg-dark-gray rounded w-full"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Grid container for invoice cards
 */
export function InvoiceCardGrid({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Empty state for invoice lists
 */
export function InvoiceCardEmpty({
  title = "No Invoices Found",
  description = "There are no invoices to display at this time.",
  icon = "📄",
  action
}: {
  title?: string;
  description?: string;
  icon?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-off-white mb-2">{title}</h3>
      <p className="text-light-gray mb-6">{description}</p>
      {action}
    </div>
  );
}
