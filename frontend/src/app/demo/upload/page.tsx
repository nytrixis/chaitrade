"use client";

import { useState } from 'react';
import Link from 'next/link';
import { InvoiceUpload } from '@/components/invoice/InvoiceUpload';
import { ZKProofProgress } from '@/components/invoice/ZKProofProgress';

export default function UploadDemoPage() {
  const [step, setStep] = useState<'intro' | 'upload' | 'zk_proof' | 'success'>('intro');
  const [uploadedInvoice, setUploadedInvoice] = useState<any>(null);
  const [zkProofCid, setZkProofCid] = useState<string | null>(null);

  const handleUploadSuccess = (invoice: any) => {
    setUploadedInvoice(invoice);
    setStep('zk_proof');
  };

  const handleZKProofComplete = (proofCid: string) => {
    setZkProofCid(proofCid);
    setTimeout(() => {
      setStep('success');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-charcoal py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-sage-green-500 hover:text-sage-green-400 mb-4 inline-block">
            ← Back to Home
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-off-white mb-2">Upload Demo</h1>
              <p className="text-light-gray">Experience ChaiTrade's AI-powered invoice processing</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-sm ${
                step === 'intro' ? 'bg-blue-500/20 text-blue-400' :
                step === 'upload' ? 'bg-blue-500/20 text-blue-400' :
                'bg-sage-green-500/20 text-sage-green-400'
              }`}>
                1. Upload
              </div>
              <div className="w-8 h-0.5 bg-medium-gray"></div>
              <div className={`px-3 py-1 rounded-full text-sm ${
                step === 'zk_proof' ? 'bg-blue-500/20 text-blue-400' :
                step === 'success' ? 'bg-sage-green-500/20 text-sage-green-400' :
                'bg-medium-gray/20 text-light-gray'
              }`}>
                2. ZK Proof
              </div>
              <div className="w-8 h-0.5 bg-medium-gray"></div>
              <div className={`px-3 py-1 rounded-full text-sm ${
                step === 'success' ? 'bg-sage-green-500/20 text-sage-green-400' :
                'bg-medium-gray/20 text-light-gray'
              }`}>
                3. Complete
              </div>
            </div>
          </div>
        </div>

        {/* Intro Step */}
        {step === 'intro' && (
          <div className="max-w-4xl mx-auto">
            <div className="card mb-6">
              <h2 className="text-2xl font-bold text-off-white mb-4">How It Works</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-sage-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sage-green-400 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-off-white mb-1">Upload Your Invoice</h3>
                    <p className="text-sm text-light-gray">
                      Upload a PDF or image of your invoice. Our AI will extract all relevant information automatically using OCR technology.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-sage-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sage-green-400 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-off-white mb-1">AI Extracts Data</h3>
                    <p className="text-sm text-light-gray">
                      Our AI reads your invoice and extracts: amount, buyer name, due date, invoice number, and other key fields.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-sage-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sage-green-400 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-off-white mb-1">Zero-Knowledge Proof</h3>
                    <p className="text-sm text-light-gray">
                      A ZK proof is generated to verify your credit score without revealing sensitive business data.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-sage-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sage-green-400 font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-off-white mb-1">Mint as NFT</h3>
                    <p className="text-sm text-light-gray">
                      Your invoice is minted as an NFT on Avalanche blockchain and listed for investors to fund.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="card bg-blue-500/10 border-blue-500/20">
                <div className="text-3xl mb-2">🤖</div>
                <h3 className="font-semibold text-blue-400 mb-1">AI-Powered OCR</h3>
                <p className="text-sm text-light-gray">
                  Extract data from any invoice format automatically
                </p>
              </div>

              <div className="card bg-purple-500/10 border-purple-500/20">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-semibold text-purple-400 mb-1">Instant Processing</h3>
                <p className="text-sm text-light-gray">
                  Complete upload to blockchain in under 60 seconds
                </p>
              </div>

              <div className="card bg-sage-green-500/10 border-sage-green-500/20">
                <div className="text-3xl mb-2">🔒</div>
                <h3 className="font-semibold text-sage-green-400 mb-1">Privacy Protected</h3>
                <p className="text-sm text-light-gray">
                  ZK proofs keep your business data confidential
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep('upload')}
              className="btn-primary w-full text-lg py-4"
            >
              Start Upload Demo →
            </button>
          </div>
        )}

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="max-w-4xl mx-auto">
            <div className="card mb-6">
              <h2 className="text-2xl font-bold text-off-white mb-4">Upload Your Invoice</h2>
              <p className="text-light-gray mb-6">
                Upload a PDF or image file. Our AI will automatically extract all invoice details.
              </p>

              <InvoiceUpload
                onUploadSuccess={handleUploadSuccess}
                onManualEntry={() => {
                  // In demo, just simulate upload
                  const mockInvoice = {
                    amount: 500000,
                    buyer_name: 'Demo Buyer Corp',
                    due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
                    ipfs_cid: 'QmDemo...',
                    credit_score: 750,
                  };
                  handleUploadSuccess(mockInvoice);
                }}
              />
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h3 className="font-semibold text-yellow-400 mb-1">Demo Tip</h3>
                  <p className="text-sm text-light-gray">
                    Try uploading a sample invoice (PDF or image format) to see our OCR in action.
                    The AI will extract: amount, buyer name, invoice number, and dates automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ZK Proof Step */}
        {step === 'zk_proof' && uploadedInvoice && (
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-xl font-bold text-off-white mb-4">Extracted Data</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-medium-gray/20">
                    <span className="text-light-gray">Amount</span>
                    <span className="text-off-white font-semibold">
                      ₹{uploadedInvoice.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-medium-gray/20">
                    <span className="text-light-gray">Buyer Name</span>
                    <span className="text-off-white font-semibold">{uploadedInvoice.buyer_name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-medium-gray/20">
                    <span className="text-light-gray">Due Date</span>
                    <span className="text-off-white font-semibold">
                      {new Date(uploadedInvoice.due_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-light-gray">Credit Score</span>
                    <span className="text-sage-green-400 font-semibold">{uploadedInvoice.credit_score}</span>
                  </div>
                </div>

                <div className="mt-6 bg-sage-green-500/10 border border-sage-green-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sage-green-400">✓</span>
                    <span className="text-sm font-semibold text-sage-green-400">OCR Extraction Complete</span>
                  </div>
                  <p className="text-xs text-light-gray">
                    All invoice fields successfully extracted and validated
                  </p>
                </div>
              </div>

              <ZKProofProgress
                creditScore={uploadedInvoice.credit_score}
                onComplete={handleZKProofComplete}
              />
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && uploadedInvoice && zkProofCid && (
          <div className="max-w-4xl mx-auto">
            <div className="card text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-sage-green-400 mb-2">Upload Complete!</h2>
              <p className="text-light-gray mb-6">
                Your invoice has been processed and is ready to be minted as an NFT
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="bg-dark-gray/50 rounded-lg p-4 text-left">
                  <div className="text-sm text-light-gray mb-2">Invoice Amount</div>
                  <div className="text-2xl font-bold text-off-white">
                    ₹{uploadedInvoice.amount.toLocaleString()}
                  </div>
                </div>

                <div className="bg-dark-gray/50 rounded-lg p-4 text-left">
                  <div className="text-sm text-light-gray mb-2">Credit Score</div>
                  <div className="text-2xl font-bold text-sage-green-400">
                    {uploadedInvoice.credit_score}
                  </div>
                </div>
              </div>

              <div className="bg-sage-green-500/10 border border-sage-green-500/20 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-sage-green-400 mb-3">✓ Processing Complete</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-sage-green-400">✓</span>
                    <span className="text-light-gray">Invoice data extracted via OCR</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sage-green-400">✓</span>
                    <span className="text-light-gray">Document uploaded to IPFS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sage-green-400">✓</span>
                    <span className="text-light-gray">Zero-knowledge proof generated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sage-green-400">✓</span>
                    <span className="text-light-gray">Credit score verified privately</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setStep('intro');
                    setUploadedInvoice(null);
                    setZkProofCid(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Try Again
                </button>
                <Link href="/msme" className="btn-primary flex-1">
                  Go to MSME Dashboard →
                </Link>
              </div>
            </div>

            <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex gap-3">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <h3 className="font-semibold text-blue-400 mb-1">Next Steps</h3>
                  <p className="text-sm text-light-gray">
                    In production, this invoice would now be minted as an NFT on Avalanche blockchain
                    and listed on the marketplace for investors to fund. The entire process takes less
                    than 60 seconds from upload to listing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
