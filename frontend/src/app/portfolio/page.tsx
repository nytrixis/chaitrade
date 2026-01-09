"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ConnectButton } from "@/components/ConnectButton";
import { getInvoicesByMSME, Invoice } from "@/lib/supabase/invoices";
import { getInvestmentsByInvestor, Investment } from "@/lib/supabase/investments";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { formatAVAX, avaxToInr } from "@/lib/utils/currency";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useInvoiceFunding } from "@/hooks/useInvoiceFunding";

type TabType = "msme" | "investor";

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<TabType>("msme");
  const [msmeInvoices, setMsmeInvoices] = useState<Invoice[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!address) return;

      setLoading(true);
      try {
        const [invoices, investorData] = await Promise.all([
          getInvoicesByMSME(address),
          getInvestmentsByInvestor(address)
        ]);
        setMsmeInvoices(invoices);
        setInvestments(investorData);
      } catch (error) {
        console.error("Error fetching portfolio data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (isConnected && address) {
      fetchData();
    }
  }, [address, isConnected]);

  // Calculate MSME stats
  const msmeStats = {
    totalInvoices: msmeInvoices.length,
    totalValue: msmeInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0),
    funded: msmeInvoices.filter(inv => inv.status === "funded").length,
    pending: msmeInvoices.filter(inv => inv.status === "active" || inv.status === "pending").length,
    settled: msmeInvoices.filter(inv => inv.status === "settled").length,
  };

  // Calculate Investor stats
  const investorStats = {
    totalInvestments: investments.length,
    totalInvested: investments.reduce((sum, inv) => sum + (inv.amount || 0), 0),
    activeInvestments: investments.filter(inv => inv.status === "active").length,
    expectedReturns: investments.reduce((sum, inv) => {
      const principal = inv.amount || 0;
      const interestRate = inv.interest_rate || 18;
      const interest = (principal * interestRate * 60) / (365 * 100); // 60 days
      return sum + principal + interest;
    }, 0),
  };

  // Pie chart data for MSME status distribution
  const msmeChartData = [
    { name: 'Funded', value: msmeStats.funded, color: '#3d8b68' },
    { name: 'Active', value: msmeStats.pending, color: '#3b82f6' },
    { name: 'Settled', value: msmeStats.settled, color: '#8b5cf6' },
  ].filter(item => item.value > 0);

  // Bar chart data for investments
  const investmentChartData = investments.slice(0, 5).map(inv => ({
    name: `#${inv.invoice_id}`,
    amount: inv.amount || 0,
  }));

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-charcoal text-off-white pb-24">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl mb-6">👛</div>
            <h1 className="text-4xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-light-gray mb-8">
              Connect your wallet to view your portfolio of invoices and investments.
            </p>
            <ConnectButton />
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-charcoal text-off-white pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-b from-dark-gray to-charcoal py-12 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <motion.div
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold mb-2">
                <span className="text-emerald-500">My</span> Portfolio
              </h1>
              <p className="text-light-gray">
                Track all your invoices and investments in one place
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("msme")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "msme"
                ? "bg-emerald-500 text-charcoal shadow-lg shadow-emerald-500/20"
                : "bg-dark-gray text-light-gray hover:bg-dark-gray/80"
            }`}
          >
            💼 MSME (My Invoices)
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("investor")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "investor"
                ? "bg-emerald-500 text-charcoal shadow-lg shadow-emerald-500/20"
                : "bg-dark-gray text-light-gray hover:bg-dark-gray/80"
            }`}
          >
            📈 Investor (My Investments)
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {/* MSME Tab Content */}
          {activeTab === "msme" && (
            <motion.div
              key="msme"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatsCard label="Total Invoices" value={msmeStats.totalInvoices} color="sage-green" delay={0} />
                <StatsCard label="Total Value" value={formatCurrency(msmeStats.totalValue)} color="sage-green" delay={0.1} />
                <StatsCard label="Funded" value={msmeStats.funded} color="sage-green" delay={0.2} />
                <StatsCard label="Awaiting Funding" value={msmeStats.pending} color="yellow" delay={0.3} />
              </div>

              {/* Charts Section */}
              {msmeInvoices.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Status Distribution Pie Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="card"
                  >
                    <h3 className="text-lg font-semibold mb-4 text-off-white">Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={msmeChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                          {msmeChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #3d8b68',
                            borderRadius: '8px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-4 flex-wrap">
                      {msmeChartData.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-light-gray">{item.name}: {item.value}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Funding Progress Overview */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="card"
                  >
                    <h3 className="text-lg font-semibold mb-4 text-off-white">Funding Overview</h3>
                    <div className="space-y-4">
                      {msmeInvoices.slice(0, 3).map((invoice, index) => (
                        <InvoiceFundingProgress key={invoice.id} invoice={invoice} delay={0.6 + index * 0.1} />
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Invoice List */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="spinner mx-auto mb-4"></div>
                  <p className="text-light-gray">Loading invoices...</p>
                </div>
              ) : msmeInvoices.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card text-center py-12">
                  <div className="text-5xl mb-4">📄</div>
                  <h3 className="text-xl font-semibold mb-2">No Invoices Yet</h3>
                  <p className="text-light-gray mb-6">Start by uploading your first invoice to get funded.</p>
                  <Link href="/msme" className="btn-primary">Upload Invoice</Link>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {msmeInvoices.map((invoice, index) => (
                    <InvoiceListItem key={invoice.id} invoice={invoice} delay={0.7 + index * 0.05} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Investor Tab Content */}
          {activeTab === "investor" && (
            <motion.div key="investor" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatsCard label="Total Investments" value={investorStats.totalInvestments} color="sage-green" delay={0} />
                <StatsCard
                  label="Total Invested"
                  value={formatAVAX(investorStats.totalInvested)}
                  subtitle={formatCurrency(avaxToInr(investorStats.totalInvested))}
                  color="sage-green"
                  delay={0.1}
                />
                <StatsCard label="Active" value={investorStats.activeInvestments} color="blue" delay={0.2} />
                <StatsCard
                  label="Expected Returns"
                  value={formatAVAX(investorStats.expectedReturns)}
                  subtitle={formatCurrency(avaxToInr(investorStats.expectedReturns))}
                  color="purple"
                  delay={0.3}
                />
              </div>

              {/* Investment Chart */}
              {investments.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-off-white">Top Investments</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={investmentChartData}>
                      <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #3d8b68', borderRadius: '8px' }}
                        formatter={(value) => value ? formatAVAX(Number(value)) : '0 AVAX'}
                      />
                      <Bar dataKey="amount" fill="#3d8b68" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {/* Investments List */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="spinner mx-auto mb-4"></div>
                  <p className="text-light-gray">Loading investments...</p>
                </div>
              ) : investments.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card text-center py-12">
                  <div className="text-5xl mb-4">💰</div>
                  <h3 className="text-xl font-semibold mb-2">No Investments Yet</h3>
                  <p className="text-light-gray mb-6">Start investing in invoices to earn returns.</p>
                  <Link href="/browse" className="btn-primary">Browse Invoices</Link>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {investments.map((investment, index) => (
                    <InvestmentListItem key={investment.id} investment={investment} delay={0.5 + index * 0.05} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function StatsCard({ label, value, color, delay, subtitle }: { label: string; value: string | number; color: string; delay: number; subtitle?: string }) {
  const colorClasses: Record<string, string> = {
    'sage-green': 'text-emerald-500 from-emerald-500/10 to-emerald-500/5',
    'yellow': 'text-yellow-400 from-yellow-500/10 to-yellow-500/5',
    'blue': 'text-blue-400 from-blue-500/10 to-blue-500/5',
    'purple': 'text-purple-400 from-purple-500/10 to-purple-500/5',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`card text-center bg-gradient-to-br ${colorClasses[color]}`}
    >
      <p className={`text-3xl font-bold ${colorClasses[color].split(' ')[0]}`}>{value}</p>
      {subtitle && <p className="text-xs text-light-gray mt-1">{subtitle}</p>}
      <p className="text-sm text-light-gray mt-1">{label}</p>
    </motion.div>
  );
}

function InvoiceFundingProgress({ invoice, delay }: { invoice: Invoice; delay: number }) {
  const { percentage, targetAmountInr, totalFundedInr } = useInvoiceFunding(invoice.invoice_nft_id);

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }} className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-light-gray">Invoice #{invoice.invoice_nft_id}</span>
        <span className="text-off-white font-semibold">{percentage.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-dark-gray rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: "easeOut" }}
          className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full"
        />
      </div>
      <div className="flex justify-between text-xs text-light-gray">
        <span>₹{totalFundedInr.toLocaleString('en-IN')}</span>
        <span>₹{targetAmountInr.toLocaleString('en-IN')}</span>
      </div>
    </motion.div>
  );
}

function InvoiceListItem({ invoice, delay }: { invoice: Invoice; delay: number }) {
  return (
    <Link href={`/invoice/${invoice.invoice_nft_id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(61, 139, 104, 0.2)" }}
        className="card flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-mono text-emerald-400">#{invoice.invoice_nft_id}</span>
            <StatusBadge status={invoice.status} />
          </div>
          <h4 className="font-semibold text-off-white">{invoice.buyer_name}</h4>
          <p className="text-sm text-light-gray">Due: {formatDate(invoice.due_date)}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-500">{formatCurrency(invoice.amount)}</p>
          <p className="text-xs text-light-gray">Invoice Value</p>
        </div>
      </motion.div>
    </Link>
  );
}

function InvestmentListItem({ investment, delay }: { investment: Investment; delay: number }) {
  const principal = investment.amount || 0;
  const interestRate = investment.interest_rate || 18;
  const interest = (principal * interestRate * 60) / (365 * 100);
  const totalReturn = principal + interest;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(61, 139, 104, 0.2)" }}
      className="card flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-mono text-emerald-400">Invoice #{investment.invoice_id}</span>
          <StatusBadge status={investment.status || "active"} />
        </div>
        <p className="text-sm text-light-gray">Invested on: {formatDate(investment.timestamp || '')}</p>
        <p className="text-xs text-light-gray mt-1">Interest Rate: {interestRate}% APR</p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-emerald-500">{formatAVAX(investment.amount)}</p>
        <p className="text-xs text-light-gray">≈ {formatCurrency(avaxToInr(investment.amount))}</p>
        <p className="text-xs text-light-gray mt-1">Investment Amount</p>
        <p className="text-sm text-purple-400 mt-1">Expected: {formatAVAX(totalReturn)}</p>
        <p className="text-xs text-purple-300">≈ {formatCurrency(avaxToInr(totalReturn))}</p>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-blue-500/20 text-blue-400",
    pending: "bg-yellow-500/20 text-yellow-400",
    funded: "bg-emerald-500/20 text-emerald-400",
    settled: "bg-purple-500/20 text-purple-400",
    defaulted: "bg-red-500/20 text-red-400",
  };

  return (
    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.active}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </motion.span>
  );
}
