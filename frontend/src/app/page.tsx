"use client";

import { useState } from "react";
import { ConnectButton } from "@/components/ConnectButton";

export default function Home() {
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  const faqs = [
    {
      id: "faq-1",
      q: "How does zero-knowledge proof protect my business data?",
      a: "ZK proofs verify your creditworthiness without revealing sensitive financial details. Investors only see a cryptographic proof that you meet credit requirements, not your actual data."
    },
    {
      id: "faq-2",
      q: "How quickly will I receive funding?",
      a: "MSMEs receive 80% funding within 24-48 hours of invoice listing. The remaining 20% is released when the buyer pays the invoice."
    },
    {
      id: "faq-3",
      q: "What happens if the buyer doesn't pay?",
      a: "The invoice is secured on-chain via NFT. If the buyer defaults, the smart contract handles disputes transparently. Insurance options are available for additional protection."
    },
    {
      id: "faq-4",
      q: "Are there any hidden fees?",
      a: "No hidden fees. We charge a 2-3% platform fee on funded invoices. Investors pay 0% fees on returns. Full transparency in all transactions."
    },
  ];

  const stats = [
    { label: "Active Investors", value: "2,400+" },
    { label: "Invoices Funded", value: "₹12.5Cr+" },
    { label: "Average APR", value: "24%" },
    { label: "Success Rate", value: "99.8%" },
  ];

  return (
    <main className="min-h-screen bg-charcoal text-off-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-charcoal/95 backdrop-blur border-b border-medium-gray/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sage-green-500 rounded-lg flex items-center justify-center font-bold text-charcoal">₹</div>
            <h1 className="text-xl font-bold text-sage-green-500">ChaiTrade</h1>
          </div>
          <nav className="hidden md:flex gap-8 items-center">
            <a href="#features" className="text-light-gray hover:text-sage-green-400 transition">Features</a>
            <a href="#how-it-works" className="text-light-gray hover:text-sage-green-400 transition">How It Works</a>
            <a href="#faq" className="text-light-gray hover:text-sage-green-400 transition">FAQ</a>
            <ConnectButton />
          </nav>
          <div className="md:hidden">
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-32 px-4 bg-gradient-to-b from-dark-gray to-charcoal">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-6 inline-block px-4 py-2 bg-sage-green-500/10 border border-sage-green-500/30 rounded-full">
            <p className="text-sage-green-400 text-sm font-semibold">Powered by Zero-Knowledge Proofs</p>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            Invoice Financing <span className="text-sage-green-500">Made Simple</span>
          </h1>
          <p className="text-xl text-light-gray mb-8 max-w-2xl mx-auto leading-relaxed">
            Get instant funding for your business invoices. MSMEs receive 80% upfront. Investors earn 18-36% returns. All secured by blockchain and privacy-protected cryptography.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/msme" className="btn-primary px-8 py-4 text-lg">
              💼 Dashboard for MSMEs
            </a>
            <a href="/investor" className="btn-secondary px-8 py-4 text-lg">
              📈 Start Investing
            </a>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-medium-gray/20">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-sage-green-500 mb-1">{stat.value}</p>
                <p className="text-sm text-light-gray">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose ChaiTrade?</h2>
            <p className="text-light-gray text-lg max-w-2xl mx-auto">Enterprise-grade invoice financing with privacy, transparency, and speed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="card group hover:border-sage-green-500/50 transition">
              <div className="text-4xl mb-4 group-hover:scale-110 transition">🔐</div>
              <h3 className="text-xl font-semibold mb-3">Zero-Knowledge Privacy</h3>
              <p className="text-light-gray">Prove creditworthiness without revealing confidential business data. Your information stays private.</p>
            </div>

            {/* Feature Card 2 */}
            <div className="card group hover:border-sage-green-500/50 transition">
              <div className="text-4xl mb-4 group-hover:scale-110 transition">⚡</div>
              <h3 className="text-xl font-semibold mb-3">Lightning-Fast Funding</h3>
              <p className="text-light-gray">Receive 80% of invoice value within 24-48 hours. No lengthy approvals or credit checks.</p>
            </div>

            {/* Feature Card 3 */}
            <div className="card group hover:border-sage-green-500/50 transition">
              <div className="text-4xl mb-4 group-hover:scale-110 transition">⛓️</div>
              <h3 className="text-xl font-semibold mb-3">Blockchain-Secured</h3>
              <p className="text-light-gray">Invoices are NFTs on Avalanche. Transparent, immutable, and auditable on-chain.</p>
            </div>

            {/* Feature Card 4 */}
            <div className="card group hover:border-sage-green-500/50 transition">
              <div className="text-4xl mb-4 group-hover:scale-110 transition">📊</div>
              <h3 className="text-xl font-semibold mb-3">High Returns</h3>
              <p className="text-light-gray">Investors earn 18-36% APR on real asset-backed invoices with low default risk.</p>
            </div>

            {/* Feature Card 5 */}
            <div className="card group hover:border-sage-green-500/50 transition">
              <div className="text-4xl mb-4 group-hover:scale-110 transition">✅</div>
              <h3 className="text-xl font-semibold mb-3">No Hidden Fees</h3>
              <p className="text-light-gray">Transparent 2-3% platform fee. No surprise costs. Investors pay 0% on returns.</p>
            </div>

            {/* Feature Card 6 */}
            <div className="card group hover:border-sage-green-500/50 transition">
              <div className="text-4xl mb-4 group-hover:scale-110 transition">🌍</div>
              <h3 className="text-xl font-semibold mb-3">Global Access</h3>
              <p className="text-light-gray">Borderless financing for MSMEs and investors. Trade across regions seamlessly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 bg-dark-gray">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-light-gray text-lg">A transparent, 4-step process to fund your invoices.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="relative">
              <div className="card text-center">
                <div className="w-12 h-12 bg-sage-green-500/20 border-2 border-sage-green-500 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-sage-green-500">1</div>
                <h3 className="text-lg font-semibold mb-2">Upload Invoice</h3>
                <p className="text-sm text-light-gray">Submit your invoice as PDF or image. We use OCR to extract details automatically.</p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-1 bg-sage-green-500/30"></div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="card text-center">
                <div className="w-12 h-12 bg-sage-green-500/20 border-2 border-sage-green-500 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-sage-green-500">2</div>
                <h3 className="text-lg font-semibold mb-2">ZK Verification</h3>
                <p className="text-sm text-light-gray">Generate a zero-knowledge proof of creditworthiness. Your data stays private.</p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-1 bg-sage-green-500/30"></div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="card text-center">
                <div className="w-12 h-12 bg-sage-green-500/20 border-2 border-sage-green-500 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-sage-green-500">3</div>
                <h3 className="text-lg font-semibold mb-2">Mint NFT</h3>
                <p className="text-sm text-light-gray">Your invoice becomes an NFT on-chain. Fully transparent and verifiable.</p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-1 bg-sage-green-500/30"></div>
            </div>

            {/* Step 4 */}
            <div className="card text-center">
              <div className="w-12 h-12 bg-sage-green-500/20 border-2 border-sage-green-500 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-sage-green-500">4</div>
              <h3 className="text-lg font-semibold mb-2">Get Funded</h3>
              <p className="text-sm text-light-gray">Receive 80% instantly. Rest when buyer pays. Investors earn returns.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Enterprise-Grade Security</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <h4 className="font-semibold">Smart Contract Audited</h4>
                    <p className="text-sm text-light-gray">All contracts verified by security experts.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-2xl">📜</span>
                  <div>
                    <h4 className="font-semibold">On-Chain Transparency</h4>
                    <p className="text-sm text-light-gray">Every transaction verifiable on Avalanche blockchain.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <h4 className="font-semibold">Data Privacy</h4>
                    <p className="text-sm text-light-gray">Zero-knowledge proofs ensure your business data stays confidential.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-2xl">🏦</span>
                  <div>
                    <h4 className="font-semibold">Regulatory Compliant</h4>
                    <p className="text-sm text-light-gray">Built with global financial standards in mind.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-dark-gray border border-medium-gray/20 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-6">Technology Stack</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-medium-gray/20">
                  <span className="text-light-gray">Blockchain</span>
                  <span className="font-semibold">Avalanche C-Chain</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-medium-gray/20">
                  <span className="text-light-gray">Smart Contracts</span>
                  <span className="font-semibold">Solidity 0.8.20</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-medium-gray/20">
                  <span className="text-light-gray">ZK Proofs</span>
                  <span className="font-semibold">Groth16 (Circom)</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-medium-gray/20">
                  <span className="text-light-gray">Storage</span>
                  <span className="font-semibold">IPFS + Pinata</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-light-gray">Frontend</span>
                  <span className="font-semibold">Next.js 14</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Enforcement Section */}
      <section className="py-24 px-4 bg-charcoal">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="mb-4 inline-block px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full">
              <p className="text-red-400 text-sm font-semibold">Built-in System Enforcement</p>
            </div>
            <h2 className="text-4xl font-bold mb-4">No Human Intervention Required</h2>
            <p className="text-light-gray text-lg max-w-2xl mx-auto">
              Our smart contracts enforce all rules automatically. No middlemen. No manual approvals. No delays.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Auto-verified Credit */}
            <div className="card bg-dark-gray/50 border-2 border-sage-green-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-sage-green-500/20 flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
                <h3 className="font-bold text-lg text-sage-green-400">Auto-Verified Credit</h3>
              </div>
              <p className="text-sm text-light-gray mb-4">
                Zero-knowledge proofs verify creditworthiness instantly. No manual underwriting or credit checks.
              </p>
              <div className="bg-charcoal/50 rounded-lg p-3 text-xs font-mono text-sage-green-400">
                if (!zkProof.verify()) revert();
              </div>
            </div>

            {/* Enforced Funding Lock */}
            <div className="card bg-dark-gray/50 border-2 border-blue-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="font-bold text-lg text-blue-400">Enforced Funding Lock</h3>
              </div>
              <p className="text-sm text-light-gray mb-4">
                Investor funds are locked in smart contracts until settlement. No one can withdraw early.
              </p>
              <div className="bg-charcoal/50 rounded-lg p-3 text-xs font-mono text-blue-400">
                require(block.timestamp &gt;= dueDate);
              </div>
            </div>

            {/* Automatic Settlement */}
            <div className="card bg-dark-gray/50 border-2 border-purple-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-bold text-lg text-purple-400">Automatic Settlement</h3>
              </div>
              <p className="text-sm text-light-gray mb-4">
                Oracle detects payment and triggers distribution. 80% to MSME, 20% + interest to investors.
              </p>
              <div className="bg-charcoal/50 rounded-lg p-3 text-xs font-mono text-purple-400">
                oracle.settleInvoice(payment);
              </div>
            </div>

            {/* Fraud Protection */}
            <div className="card bg-dark-gray/50 border-2 border-red-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h3 className="font-bold text-lg text-red-400">Fraud Protection</h3>
              </div>
              <p className="text-sm text-light-gray mb-4">
                Smart contracts prevent double-spending, fake invoices, and unauthorized withdrawals.
              </p>
              <div className="bg-charcoal/50 rounded-lg p-3 text-xs font-mono text-red-400">
                require(!invoice.settled);
              </div>
            </div>
          </div>

          {/* Key Point */}
          <div className="mt-12 card bg-gradient-to-r from-sage-green-500/10 to-blue-500/10 border-2 border-sage-green-500/30">
            <div className="flex items-start gap-4">
              <span className="text-4xl">⚠️</span>
              <div>
                <h3 className="text-xl font-bold text-off-white mb-2">The ChaiTrade Guarantee</h3>
                <p className="text-light-gray mb-4">
                  <strong className="text-sage-green-400">100% of all business logic runs on-chain.</strong> No admin wallets. No pause functions. No emergency withdrawals. Once deployed, the system operates autonomously according to the rules encoded in smart contracts.
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-sage-green-400">✓</span>
                    <span className="text-off-white">No manual approvals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sage-green-400">✓</span>
                    <span className="text-off-white">No fund custody</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sage-green-400">✓</span>
                    <span className="text-off-white">No human bottlenecks</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 bg-dark-gray">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-light-gray">Have questions? We've got answers.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="card">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === faq.id ? null : faq.id)}
                  className="w-full text-left flex items-center justify-between hover:text-sage-green-400 transition"
                >
                  <h3 className="font-semibold text-lg">{faq.q}</h3>
                  <span className={`text-2xl transition-transform ${activeAccordion === faq.id ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </button>
                {activeAccordion === faq.id && (
                  <p className="text-light-gray mt-4 pt-4 border-t border-medium-gray/20">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-sage-green-500/20 to-dark-gray border-t border-sage-green-500/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Business Finance?</h2>
          <p className="text-xl text-light-gray mb-10">Join thousands of MSMEs and investors on ChaiTrade. Get started in minutes.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/msme" className="btn-primary px-8 py-4">
              Get Funded as MSME
            </a>
            <a href="/investor" className="btn-secondary px-8 py-4">
              Start Investing
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-medium-gray/20 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-sage-green-500 rounded text-charcoal flex items-center justify-center text-sm font-bold">₹</span>
                ChaiTrade
              </h4>
              <p className="text-sm text-light-gray">Privacy-preserving invoice financing for emerging markets.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="text-sm text-light-gray space-y-2">
                <li><a href="#features" className="hover:text-sage-green-400 transition">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-sage-green-400 transition">How It Works</a></li>
                <li><a href="#" className="hover:text-sage-green-400 transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="text-sm text-light-gray space-y-2">
                <li><a href="#" className="hover:text-sage-green-400 transition">Docs</a></li>
                <li><a href="#" className="hover:text-sage-green-400 transition">API</a></li>
                <li><a href="#" className="hover:text-sage-green-400 transition">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="text-sm text-light-gray space-y-2">
                <li><a href="#" className="hover:text-sage-green-400 transition">Privacy</a></li>
                <li><a href="#" className="hover:text-sage-green-400 transition">Terms</a></li>
                <li><a href="#" className="hover:text-sage-green-400 transition">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-medium-gray/20 pt-8 text-center text-sm text-light-gray">
            <p>© 2026 ChaiTrade. All rights reserved. Built with privacy and transparency.</p>
            <p className="mt-2">Smart Contracts deployed on Avalanche Fuji Testnet (Chain ID: 43113)</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
