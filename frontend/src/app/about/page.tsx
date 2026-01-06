"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-charcoal text-off-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-dark-gray to-charcoal py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-4 inline-block px-4 py-2 bg-sage-green-500/10 border border-sage-green-500/30 rounded-full">
            <p className="text-sage-green-400 text-sm font-semibold">About ChaiTrade</p>
          </div>
          <h1 className="text-5xl font-bold mb-6">
            Revolutionizing <span className="text-sage-green-500">MSME Financing</span>
          </h1>
          <p className="text-xl text-light-gray max-w-2xl mx-auto">
            ChaiTrade is a privacy-preserving invoice financing platform built on Avalanche, 
            empowering MSMEs with instant funding while protecting sensitive business data.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-light-gray mb-4 leading-relaxed">
                Small and medium enterprises are the backbone of the global economy, yet they face 
                significant challenges accessing working capital. Traditional financing options are 
                slow, expensive, and often require exposing sensitive business information.
              </p>
              <p className="text-light-gray leading-relaxed">
                ChaiTrade bridges this gap by leveraging blockchain technology and zero-knowledge 
                proofs to create a transparent, efficient, and privacy-preserving marketplace 
                for invoice financing.
              </p>
            </div>
            <div className="card bg-dark-gray/50">
              <h3 className="text-xl font-semibold mb-4 text-sage-green-400">Key Benefits</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-sage-green-500 mt-1">✓</span>
                  <span className="text-light-gray">80% funding within 24-48 hours</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sage-green-500 mt-1">✓</span>
                  <span className="text-light-gray">Zero-knowledge privacy for business data</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sage-green-500 mt-1">✓</span>
                  <span className="text-light-gray">Transparent, immutable on-chain records</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sage-green-500 mt-1">✓</span>
                  <span className="text-light-gray">18-36% APR for investors</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sage-green-500 mt-1">✓</span>
                  <span className="text-light-gray">Low 2-3% platform fees, no hidden costs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-dark-gray/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">How ChaiTrade Works</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* For MSMEs */}
            <div className="card">
              <h3 className="text-xl font-semibold mb-6 text-sage-green-400">For MSMEs</h3>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-sage-green-500/20 border border-sage-green-500 rounded-full flex items-center justify-center text-sm font-bold text-sage-green-500">1</span>
                  <div>
                    <h4 className="font-medium">Upload Invoice</h4>
                    <p className="text-sm text-light-gray">Submit your invoice as PDF or image. OCR extracts details automatically.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-sage-green-500/20 border border-sage-green-500 rounded-full flex items-center justify-center text-sm font-bold text-sage-green-500">2</span>
                  <div>
                    <h4 className="font-medium">ZK Verification</h4>
                    <p className="text-sm text-light-gray">Generate a zero-knowledge proof of your creditworthiness without exposing data.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-sage-green-500/20 border border-sage-green-500 rounded-full flex items-center justify-center text-sm font-bold text-sage-green-500">3</span>
                  <div>
                    <h4 className="font-medium">Receive Funding</h4>
                    <p className="text-sm text-light-gray">Get 80% of invoice value instantly when funding target is reached.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-sage-green-500/20 border border-sage-green-500 rounded-full flex items-center justify-center text-sm font-bold text-sage-green-500">4</span>
                  <div>
                    <h4 className="font-medium">Settle Invoice</h4>
                    <p className="text-sm text-light-gray">When buyer pays, settle the invoice and release remaining escrow.</p>
                  </div>
                </li>
              </ol>
            </div>

            {/* For Investors */}
            <div className="card">
              <h3 className="text-xl font-semibold mb-6 text-sage-green-400">For Investors</h3>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-sage-green-500/20 border border-sage-green-500 rounded-full flex items-center justify-center text-sm font-bold text-sage-green-500">1</span>
                  <div>
                    <h4 className="font-medium">Browse Invoices</h4>
                    <p className="text-sm text-light-gray">Explore verified invoices with ZK-proven credit scores and risk tiers.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-sage-green-500/20 border border-sage-green-500 rounded-full flex items-center justify-center text-sm font-bold text-sage-green-500">2</span>
                  <div>
                    <h4 className="font-medium">Invest AVAX</h4>
                    <p className="text-sm text-light-gray">Fund invoices with any amount. Diversify across multiple opportunities.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-sage-green-500/20 border border-sage-green-500 rounded-full flex items-center justify-center text-sm font-bold text-sage-green-500">3</span>
                  <div>
                    <h4 className="font-medium">Track Portfolio</h4>
                    <p className="text-sm text-light-gray">Monitor your investments in real-time with on-chain transparency.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-sage-green-500/20 border border-sage-green-500 rounded-full flex items-center justify-center text-sm font-bold text-sage-green-500">4</span>
                  <div>
                    <h4 className="font-medium">Earn Returns</h4>
                    <p className="text-sm text-light-gray">Receive principal + interest when invoice is settled. 18-36% APR typical.</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Technology Stack</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="card text-center">
              <div className="text-3xl mb-3">⛓️</div>
              <h4 className="font-semibold mb-1">Avalanche</h4>
              <p className="text-xs text-light-gray">C-Chain (Fuji Testnet)</p>
            </div>
            <div className="card text-center">
              <div className="text-3xl mb-3">🔐</div>
              <h4 className="font-semibold mb-1">Groth16</h4>
              <p className="text-xs text-light-gray">ZK-SNARK Proofs</p>
            </div>
            <div className="card text-center">
              <div className="text-3xl mb-3">📜</div>
              <h4 className="font-semibold mb-1">Solidity</h4>
              <p className="text-xs text-light-gray">Smart Contracts</p>
            </div>
            <div className="card text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h4 className="font-semibold mb-1">Next.js</h4>
              <p className="text-xs text-light-gray">React Framework</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-light-gray mb-8 max-w-xl mx-auto">
            Join the future of MSME financing. Get funded or start investing today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/msme" className="btn-primary px-8 py-4">
              💼 I&apos;m an MSME
            </Link>
            <Link href="/investor" className="btn-secondary px-8 py-4">
              📈 I&apos;m an Investor
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
