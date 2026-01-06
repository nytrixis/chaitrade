"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { getInvoiceByTokenId, getInvoiceActivities } from '@/lib/supabase/invoices';
import { Invoice } from '@/lib/supabase/invoices';
import { CONTRACT_ADDRESSES, INVOICENFT_ABI, FUNDINGPOOL_ABI } from '@/lib/contracts';
import { FundingModal } from '@/components/invoice/FundingModal';
import { RiskScoreCard } from '@/components/invoice/RiskScoreCard';
import { ActivityTimeline, Activity } from '@/components/invoice/ActivityTimeline';
import { SettlementTrigger } from '@/components/invoice/SettlementTrigger';
import { formatCurrency, formatDate, formatAddress } from '@/lib/utils/format';
import Link from 'next/link';

interface Investor {
  address: string;
  amount: number;
  percentage: number;
  timestamp: Date;
}

export default function InvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFundingModal, setShowFundingModal] = useState(false);

  // Fetch invoice from smart contract
  const { data: onChainInvoice, isError: contractError, error: contractErrorDetails, refetch: refetchInvoice } = useReadContract({
    address: CONTRACT_ADDRESSES.InvoiceNFT as `0x${string}`,
    abi: INVOICENFT_ABI,
    functionName: 'getInvoice',
    args: id ? [BigInt(id as string)] : undefined,
    query: {
      enabled: !!id,
    },
  });

  // Debug logging
  useEffect(() => {
    if (contractError) {
      console.error('Contract error for invoice', id, ':', contractErrorDetails);
    }
    if (onChainInvoice) {
      console.log('✓ Loaded on-chain invoice', id, ':', onChainInvoice);
    }
  }, [contractError, contractErrorDetails, onChainInvoice, id]);

  // Fetch funding progress from FundingPool contract
  const { data: fundingData, refetch: refetchFunding } = useReadContract({
    address: CONTRACT_ADDRESSES.FundingPool as `0x${string}`,
    abi: FUNDINGPOOL_ABI,
    functionName: 'invoiceFunding',
    args: [BigInt(id as string)],
  });

  // Fetch invoice from database
  useEffect(() => {
    async function fetchInvoice() {
      try {
        setLoading(true);
        const data = await getInvoiceByTokenId(Number(id));

        if (!data) {
          setError('Invoice not found in database');
        } else {
          setInvoice(data);
        }

        // Fetch activities
        const activitiesData = await getInvoiceActivities(Number(id));
        setActivities(activitiesData);

      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError('Failed to load invoice');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchInvoice();
    }
  }, [id]);

  // Auto-refresh funding data every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchInvoice();
      refetchFunding();
    }, 10000);

    return () => clearInterval(interval);
  }, [refetchInvoice, refetchFunding]);

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="spinner mx-auto w-12 h-12 border-4"></div>
          <p className="text-light-gray">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  if (error || contractError) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="card max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-off-white mb-2">Invoice Not Found on Blockchain</h1>
          <p className="text-light-gray mb-4">{error || 'Could not load invoice from blockchain'}</p>

          {invoice && (
            <div className="bg-dark-gray/50 rounded-lg p-4 mb-4 text-left text-sm">
              <p className="text-yellow-400 mb-2">⚠️ Invoice exists in database but not on blockchain</p>
              <div className="space-y-1 text-light-gray">
                <p>Token ID: #{id}</p>
                <p>Amount: ₹{invoice.amount?.toLocaleString('en-IN')}</p>
                <p>Buyer: {invoice.buyer_name}</p>
                <p className="text-xs mt-2 text-yellow-400">
                  The blockchain transaction may still be processing. Please wait a few moments and refresh.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-center">
            <button onClick={() => window.location.reload()} className="btn-secondary">
              Refresh Page
            </button>
            <Link href="/browse" className="btn-primary inline-block">
              Browse Invoices
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice || !onChainInvoice) {
    return null;
  }

  // Parse on-chain data
  const onChainData = onChainInvoice as any;
  const invoiceAmountAvax = Number(formatUnits(onChainData.amount, 18)); // Amount in AVAX
  const invoiceAmount = invoice.amount || 0; // Use INR amount from database for display
  const dueDate = new Date(Number(onChainData.dueDate) * 1000);

  // Get funding data from FundingPool contract
  const fundingInfo = fundingData as any;
  const fundedAmountAvax = fundingInfo ? Number(formatUnits(fundingInfo.totalFunded, 18)) : 0;
  const fundedAmount = fundedAmountAvax; // For now, show AVAX amount (will convert to INR in future)
  const investorCount = fundingInfo ? Number(fundingInfo.investorCount) : 0;
  const isFullyFunded = fundingInfo ? fundingInfo.isFullyFunded : false;

  const fundingProgress = invoiceAmountAvax > 0 ? (fundedAmountAvax / invoiceAmountAvax) * 100 : 0;
  const buyerName = onChainData.buyerName;
  const status = ['pending', 'active', 'funded', 'settled', 'defaulted'][onChainData.status];

  // Calculate days until due
  const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isOwner = address?.toLowerCase() === invoice.msme_address?.toLowerCase();

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'funded': return 'bg-sage-green-500/20 text-sage-green-400';
      case 'active': return 'bg-blue-500/20 text-blue-400';
      case 'settled': return 'bg-purple-500/20 text-purple-400';
      case 'defaulted': return 'bg-red-500/20 text-red-400';
      default: return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  return (
    <div className="min-h-screen bg-charcoal py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/browse" className="text-sage-green-500 hover:text-sage-green-400 mb-2 inline-block">
              ← Back to Marketplace
            </Link>
            <h1 className="text-3xl font-bold text-off-white">Invoice NFT #{id}</h1>
            {isOwner && (
              <p className="text-sm text-sage-green-400 mt-1">👤 You own this invoice</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-light-gray mb-1">Status</div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(status)}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Header Card */}
            <div className="card">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-off-white mb-2">{formatCurrency(invoiceAmount)}</h2>
                  <p className="text-light-gray">Buyer: {buyerName}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-light-gray mb-1">Due Date</div>
                  <div className="text-lg font-semibold text-off-white">{formatDate(dueDate)}</div>
                  <div className={`text-sm ${
                    daysUntilDue < 0 ? 'text-red-400' :
                    daysUntilDue < 7 ? 'text-yellow-400' :
                    'text-sage-green-400'
                  }`}>
                    {daysUntilDue < 0
                      ? `${Math.abs(daysUntilDue)} days overdue`
                      : `${daysUntilDue} days remaining`
                    }
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-light-gray mb-1">MSME Address</div>
                  <div className="font-mono text-off-white text-xs">
                    {formatAddress(invoice.msme_address, 8, 6)}
                  </div>
                </div>
                <div>
                  <div className="text-light-gray mb-1">Invoice Number</div>
                  <div className="text-off-white font-semibold">
                    {invoice.invoice_number || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-light-gray mb-1">Interest Rate</div>
                  <div className="text-off-white font-semibold">
                    {invoice.estimated_apr || 18}% APR
                  </div>
                </div>
              </div>
            </div>

            {/* Funding Progress Card */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-off-white">Funding Progress</h3>
                <div className="text-sm text-light-gray">
                  {investorCount} {investorCount === 1 ? 'Investor' : 'Investors'}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-light-gray">Funded</span>
                  <span className="text-off-white font-semibold">
                    {formatCurrency(fundedAmount, 0)} / {formatCurrency(invoiceAmount, 0)}
                  </span>
                </div>
                <div className="w-full bg-dark-gray rounded-full h-3">
                  <div
                    className="bg-sage-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                  ></div>
                </div>
                <div className="text-right text-sm text-light-gray mt-1">
                  {fundingProgress.toFixed(1)}% Complete
                </div>
              </div>

              {!isFullyFunded && status === 'active' && (
                <button
                  onClick={() => setShowFundingModal(true)}
                  className="btn-primary w-full"
                  disabled={!isConnected || isOwner}
                >
                  {!isConnected
                    ? 'Connect Wallet to Invest'
                    : isOwner
                    ? 'You cannot invest in your own invoice'
                    : 'Invest in this Invoice'
                  }
                </button>
              )}

              {isFullyFunded && (
                <div className="bg-sage-green-500/10 border border-sage-green-500/20 rounded-lg p-4 text-center">
                  <p className="text-sage-green-400 font-semibold">✓ Fully Funded</p>
                  <p className="text-sm text-light-gray mt-1">This invoice has reached its funding goal</p>
                </div>
              )}

              {status === 'pending' && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
                  <p className="text-yellow-400 font-semibold">⏳ Pending Approval</p>
                  <p className="text-sm text-light-gray mt-1">This invoice is awaiting verification</p>
                </div>
              )}
            </div>

            {/* Investors List Card */}
            <div className="card">
              <h3 className="text-xl font-bold text-off-white mb-4">Investors</h3>

              {fundedAmount > 0 ? (
                <div className="space-y-3">
                  <div className="bg-dark-gray/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-light-gray text-sm mb-1">Total Investment</div>
                        <div className="text-off-white text-xl font-bold">
                          {formatCurrency(fundedAmount, 0)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-light-gray text-sm mb-1">Contributors</div>
                        <div className="text-sage-green-400 text-xl font-bold">
                          {investorCount}
                        </div>
                      </div>
                    </div>
                  </div>

                  {investors.length > 0 ? (
                    <div className="space-y-2">
                      {investors.map((investor, idx) => (
                        <div key={idx} className="bg-dark-gray/30 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-mono text-sm text-off-white">
                                {formatAddress(investor.address)}
                              </div>
                              <div className="text-xs text-light-gray mt-1">
                                {investor.timestamp.toLocaleString()}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-off-white font-semibold">
                                {formatCurrency(investor.amount, 0)}
                              </div>
                              <div className="text-xs text-sage-green-400">
                                {investor.percentage.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-light-gray text-center py-4">
                      Individual investor breakdown will be fetched from blockchain events
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-light-gray">
                  <div className="text-4xl mb-2">👥</div>
                  <p>No investors yet. Be the first to fund this invoice!</p>
                </div>
              )}
            </div>

            {/* Activity Timeline */}
            <ActivityTimeline
              invoiceId={Number(id)}
              activities={activities}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Risk Score Card */}
            <RiskScoreCard invoice={invoice} />

            {/* Settlement Trigger (if funded) */}
            {isFullyFunded && (
              <SettlementTrigger
                invoiceId={Number(id)}
                invoiceAmount={invoiceAmount}
                isFullyFunded={isFullyFunded}
                dueDate={dueDate}
              />
            )}

            {/* Asset Details Card */}
            <div className="card">
              <h3 className="text-xl font-bold text-off-white mb-4">Asset Details</h3>

              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-light-gray mb-1">Token ID</div>
                  <div className="font-mono text-off-white">#{id}</div>
                </div>

                <div>
                  <div className="text-light-gray mb-1">IPFS Document</div>
                  {invoice.ipfs_cid ? (
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${invoice.ipfs_cid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sage-green-500 hover:text-sage-green-400 text-xs break-all inline-flex items-center gap-1"
                    >
                      <span>View Invoice</span>
                      <span>→</span>
                    </a>
                  ) : (
                    <span className="text-light-gray text-xs">Not available</span>
                  )}
                </div>

                <div>
                  <div className="text-light-gray mb-1">Blockchain</div>
                  <div className="text-off-white">Avalanche Fuji Testnet</div>
                </div>

                <div>
                  <div className="text-light-gray mb-1">NFT Contract</div>
                  <a
                    href={`https://testnet.snowtrace.io/address/${CONTRACT_ADDRESSES.InvoiceNFT}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sage-green-500 hover:text-sage-green-400 font-mono text-xs break-all"
                  >
                    {formatAddress(CONTRACT_ADDRESSES.InvoiceNFT)}
                  </a>
                </div>

                <div>
                  <div className="text-light-gray mb-1">Funding Pool</div>
                  <a
                    href={`https://testnet.snowtrace.io/address/${CONTRACT_ADDRESSES.FundingPool}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sage-green-500 hover:text-sage-green-400 font-mono text-xs break-all"
                  >
                    {formatAddress(CONTRACT_ADDRESSES.FundingPool)}
                  </a>
                </div>
              </div>
            </div>

            {/* ZK Proof Status */}
            {invoice.zk_proof_cid && (
              <div className="card">
                <h3 className="text-xl font-bold text-off-white mb-4">ZK Verification</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-sage-green-500/20 flex items-center justify-center">
                    <span className="text-xl">✓</span>
                  </div>
                  <div>
                    <div className="text-off-white font-semibold">Credit Score Verified</div>
                    <div className="text-xs text-light-gray">Zero-knowledge proof</div>
                  </div>
                </div>
                <p className="text-xs text-light-gray">
                  Credit score verified using zero-knowledge proofs to protect MSME privacy
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Funding Modal */}
      {showFundingModal && (
        <FundingModal
          invoiceId={Number(id)}
          invoiceAmount={invoiceAmount}
          currentlyFunded={fundedAmount}
          interestRate={invoice.estimated_apr || 18}
          onClose={() => setShowFundingModal(false)}
          onSuccess={() => {
            // Refetch data after successful investment
            refetchInvoice();
            refetchFunding();
            setShowFundingModal(false);
          }}
        />
      )}
    </div>
  );
}
