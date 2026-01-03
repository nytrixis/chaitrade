"use client";

import { ConnectButton } from "@/components/ConnectButton";

export default function Home() {
  return (
    <main className="min-h-screen bg-charcoal text-off-white">
      <header className="sticky top-0 z-50 bg-charcoal/95 backdrop-blur-sm border-b border-medium-gray/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-sage-green-500">ChaiTrade</h1>
          <div className="flex items-center gap-6">
            <nav className="flex gap-6">
              <a href="/msme" className="text-off-white hover:text-sage-green-400 transition-colors font-medium">MSME</a>
              <a href="/investor" className="text-off-white hover:text-sage-green-400 transition-colors font-medium">Investor</a>
            </nav>
            <ConnectButton />
          </div>
        </div>
      </header>

      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-sage-green-500">ChaiTrade</span>
          </h1>
          <p className="text-xl sm:text-2xl text-off-white font-medium mb-6 leading-relaxed">Community-Powered Invoice Financing with Zero-Knowledge Privacy</p>
          <p className="text-lg text-light-gray mb-10 max-w-2xl mx-auto">Get instant funding for business invoices. MSMEs receive 80% immediately, while community investors earn 18-36% returns.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <a href="/msme" className="btn-primary text-lg">Dashboard for MSMEs</a>
            <a href="/investor" className="btn-secondary text-lg">Invest & Earn Returns</a>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-gray">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-light-gray mb-16 text-lg max-w-2xl mx-auto">Three simple steps to unlock liquidity from your invoices</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center hover:border-sage-green-500/30 transition-all">
              <div className="text-5xl mb-4">📄</div>
              <h3 className="text-2xl font-bold mb-3 text-off-white">Upload Invoice</h3>
              <p className="text-light-gray leading-relaxed">MSMEs upload invoices and create NFT representations on-chain automatically.</p>
            </div>
            <div className="card text-center hover:border-sage-green-500/30 transition-all">
              <div className="text-5xl mb-4">🔐</div>
              <h3 className="text-2xl font-bold mb-3 text-off-white">ZK Credit Proof</h3>
              <p className="text-light-gray leading-relaxed">Generate zero-knowledge proofs of creditworthiness without revealing sensitive data.</p>
            </div>
            <div className="card text-center hover:border-sage-green-500/30 transition-all">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-2xl font-bold mb-3 text-off-white">Get Funded</h3>
              <p className="text-light-gray leading-relaxed">Community investors fund your invoice. Receive 80% instantly, 20% on payment.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Built For Everyone</h2>
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
            <div className="card">
              <h3 className="text-3xl font-bold mb-6 text-sage-green-400">For MSMEs</h3>
              <ul className="space-y-6">
                <li className="flex gap-4 items-start">
                  <span className="text-sage-green-500 font-bold text-2xl flex-shrink-0">✓</span>
                  <div>
                    <strong className="text-lg text-off-white">80% Instant Funding</strong>
                    <p className="text-light-gray mt-1">Get money within minutes of invoice verification</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="text-sage-green-500 font-bold text-2xl flex-shrink-0">✓</span>
                  <div>
                    <strong className="text-lg text-off-white">Build Portable Credit</strong>
                    <p className="text-light-gray mt-1">On-chain credit scores that follow you everywhere</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="text-sage-green-500 font-bold text-2xl flex-shrink-0">✓</span>
                  <div>
                    <strong className="text-lg text-off-white">Privacy Preserved</strong>
                    <p className="text-light-gray mt-1">Zero-knowledge proofs protect your sensitive data</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="card">
              <h3 className="text-3xl font-bold mb-6 text-sage-green-400">For Investors</h3>
              <ul className="space-y-6">
                <li className="flex gap-4 items-start">
                  <span className="text-sage-green-500 font-bold text-2xl flex-shrink-0">✓</span>
                  <div>
                    <strong className="text-lg text-off-white">18-36% APR Returns</strong>
                    <p className="text-light-gray mt-1">Competitive emerging market returns on verified invoices</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="text-sage-green-500 font-bold text-2xl flex-shrink-0">✓</span>
                  <div>
                    <strong className="text-lg text-off-white">Real Assets Backing</strong>
                    <p className="text-light-gray mt-1">Every investment backed by verified business invoices</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="text-sage-green-500 font-bold text-2xl flex-shrink-0">✓</span>
                  <div>
                    <strong className="text-lg text-off-white">Transparent & Secure</strong>
                    <p className="text-light-gray mt-1">Smart contracts ensure trustless execution</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-dark-gray/50 border-t border-medium-gray/20">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform MSME Financing?</h2>
          <p className="text-light-gray mb-8">Join the community. Deployed on Avalanche Fuji testnet.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/msme" className="btn-primary">I'm an MSME</a>
            <a href="/investor" className="btn-primary">I'm an Investor</a>
          </div>
        </div>
      </section>

      <footer className="border-t border-medium-gray/20 py-6 text-center text-light-gray text-sm">
        <div className="max-w-7xl mx-auto">
          <p>ChaiTrade © 2026 | Privacy-Preserving Invoice Financing</p>
          <p className="mt-2">Smart Contracts: Avalanche Fuji Testnet (43113)</p>
        </div>
      </footer>
    </main>
  );
}
