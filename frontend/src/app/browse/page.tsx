"use client";

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { getActiveInvoices, Invoice } from '@/lib/supabase/invoices';
import { InvoiceCard, InvoiceCardSkeleton, InvoiceCardGrid, InvoiceCardEmpty } from '@/components/invoice/InvoiceCard';
import { CREDIT_SCORE_RANGES } from '@/lib/utils/constants';

type FilterStatus = 'all' | 'pending' | 'active' | 'funded';
type SortOption = 'newest' | 'amount-high' | 'amount-low' | 'score-high' | 'score-low' | 'due-soon';

export default function BrowsePage() {
  const { isConnected } = useAccount();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and sort states
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [minCreditScore, setMinCreditScore] = useState(0);
  const [maxAmount, setMaxAmount] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch invoices
  useEffect(() => {
    async function fetchInvoices() {
      try {
        setLoading(true);
        const data = await getActiveInvoices();
        setInvoices(data);
        setFilteredInvoices(data);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError('Failed to load invoices');
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...invoices];

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(inv => inv.status === filterStatus);
    }

    // Filter by credit score
    if (minCreditScore > 0) {
      result = result.filter(inv => inv.credit_score >= minCreditScore);
    }

    // Filter by max amount
    if (maxAmount !== null && maxAmount > 0) {
      result = result.filter(inv => inv.amount <= maxAmount);
    }

    // Filter by search query (buyer name or invoice number)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(inv =>
        inv.buyer_name.toLowerCase().includes(query) ||
        inv.invoice_nft_id.toString().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        break;
      case 'amount-high':
        result.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount-low':
        result.sort((a, b) => a.amount - b.amount);
        break;
      case 'score-high':
        result.sort((a, b) => b.credit_score - a.credit_score);
        break;
      case 'score-low':
        result.sort((a, b) => a.credit_score - b.credit_score);
        break;
      case 'due-soon':
        result.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
        break;
    }

    setFilteredInvoices(result);
  }, [invoices, filterStatus, minCreditScore, maxAmount, sortBy, searchQuery]);

  return (
    <div className="min-h-screen bg-charcoal py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-off-white mb-2">
            Investment Marketplace
          </h1>
          <p className="text-light-gray">
            Browse and invest in verified invoices from MSMEs across India
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="text-sm text-light-gray mb-1">Total Invoices</div>
            <div className="text-2xl font-bold text-off-white">{invoices.length}</div>
          </div>
          <div className="card">
            <div className="text-sm text-light-gray mb-1">Active</div>
            <div className="text-2xl font-bold text-blue-400">
              {invoices.filter(i => i.status === 'active').length}
            </div>
          </div>
          <div className="card">
            <div className="text-sm text-light-gray mb-1">Pending</div>
            <div className="text-2xl font-bold text-yellow-400">
              {invoices.filter(i => i.status === 'pending').length}
            </div>
          </div>
          <div className="card">
            <div className="text-sm text-light-gray mb-1">Avg Credit Score</div>
            <div className="text-2xl font-bold text-sage-green-400">
              {invoices.length > 0 ? Math.round(invoices.reduce((sum, i) => sum + i.credit_score, 0) / invoices.length) : 0}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-light-gray mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Buyer name or invoice ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-light-gray mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="input"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="funded">Funded</option>
              </select>
            </div>

            {/* Credit Score Filter */}
            <div>
              <label className="block text-sm font-medium text-light-gray mb-2">
                Min Credit Score
              </label>
              <select
                value={minCreditScore}
                onChange={(e) => setMinCreditScore(Number(e.target.value))}
                className="input"
              >
                <option value="0">Any</option>
                <option value={CREDIT_SCORE_RANGES.EXCELLENT}>Excellent (750+)</option>
                <option value={CREDIT_SCORE_RANGES.GOOD}>Good (700+)</option>
                <option value={CREDIT_SCORE_RANGES.FAIR}>Fair (650+)</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-light-gray mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="input"
              >
                <option value="newest">Newest First</option>
                <option value="amount-high">Amount (High to Low)</option>
                <option value="amount-low">Amount (Low to High)</option>
                <option value="score-high">Credit Score (High to Low)</option>
                <option value="score-low">Credit Score (Low to High)</option>
                <option value="due-soon">Due Date (Soonest First)</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(filterStatus !== 'all' || minCreditScore > 0 || searchQuery) && (
            <div className="mt-4 pt-4 border-t border-medium-gray/30">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-light-gray">Active filters:</span>
                {filterStatus !== 'all' && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                    Status: {filterStatus}
                  </span>
                )}
                {minCreditScore > 0 && (
                  <span className="px-3 py-1 bg-sage-green-500/20 text-sage-green-400 rounded-full text-sm">
                    Min Score: {minCreditScore}+
                  </span>
                )}
                {searchQuery && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                    Search: "{searchQuery}"
                  </span>
                )}
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setMinCreditScore(0);
                    setMaxAmount(null);
                    setSearchQuery('');
                  }}
                  className="text-sm text-sage-green-500 hover:text-sage-green-400"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-light-gray">
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </p>
          {!isConnected && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-2">
              <p className="text-yellow-400 text-sm">
                Connect your wallet to invest in invoices
              </p>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <InvoiceCardGrid>
            {[...Array(6)].map((_, i) => (
              <InvoiceCardSkeleton key={i} />
            ))}
          </InvoiceCardGrid>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-off-white mb-2">Error Loading Invoices</h3>
            <p className="text-light-gray mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredInvoices.length === 0 && invoices.length === 0 && (
          <InvoiceCardEmpty
            title="No Invoices Available"
            description="There are no invoices in the marketplace at this time. Check back soon!"
            icon="📊"
            action={
              <Link href="/msme" className="btn-primary inline-block">
                Create an Invoice
              </Link>
            }
          />
        )}

        {/* No Results State */}
        {!loading && !error && filteredInvoices.length === 0 && invoices.length > 0 && (
          <InvoiceCardEmpty
            title="No Matching Invoices"
            description="Try adjusting your filters or search query to find more invoices."
            icon="🔍"
            action={
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setMinCreditScore(0);
                  setMaxAmount(null);
                  setSearchQuery('');
                }}
                className="btn-primary"
              >
                Clear Filters
              </button>
            }
          />
        )}

        {/* Invoice Grid */}
        {!loading && !error && filteredInvoices.length > 0 && (
          <InvoiceCardGrid>
            {filteredInvoices.map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                fundingProgress={0} // This will be fetched from smart contract in next task
                showOwner={false}
              />
            ))}
          </InvoiceCardGrid>
        )}

        {/* Info Footer */}
        <div className="mt-12 card bg-dark-gray/50">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-semibold text-off-white mb-1">Secure Investments</h3>
              <p className="text-sm text-light-gray">
                All invoices are verified and secured by blockchain technology
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold text-off-white mb-1">ZK-Verified Credit</h3>
              <p className="text-sm text-light-gray">
                Credit scores verified using zero-knowledge proofs for privacy
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-semibold text-off-white mb-1">Attractive Returns</h3>
              <p className="text-sm text-light-gray">
                Earn competitive returns by funding verified MSMEs
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
