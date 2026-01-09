"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { parseUnits, encodePacked, keccak256, toHex, decodeEventLog } from "viem";
import { uploadToPinata } from "@/lib/pinata/upload";
import { generateCreditScoreProof, calculateCreditScore } from "@/lib/zk/generateProof";
import { createInvoice } from "@/lib/supabase/invoices";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { AVAX_TO_INR_RATE } from "@/lib/utils/currency";
import {
  CONTRACT_ADDRESSES,
  INVOICENFT_ABI,
  ZKCREDITOACLE_ABI,
  FUNDINGPOOL_ABI
} from "@/lib/contracts";

export interface InvoiceFormManualProps {
  onSuccess?: (invoiceData: any) => void;
}

export function InvoiceFormManual({ onSuccess }: InvoiceFormManualProps) {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const publicClient = usePublicClient();

  const [step, setStep] = useState<"form" | "zkproof" | "mint" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creditScore, setCreditScore] = useState<number | null>(null);
  const [ipfsCID, setIPFSCID] = useState<string | null>(null);
  const [zkProof, setZkProof] = useState<any>(null);
  const [nftTokenId, setNftTokenId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    amount: '',
    buyerName: '',
    sellerName: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: '',
  });

  if (!isConnected) {
    return (
      <div className="card">
        <p className="text-center text-light-gray">
          Please connect your wallet to enter invoice details.
        </p>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate form
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error('Please enter a valid invoice amount');
      }
      if (!formData.buyerName.trim()) {
        throw new Error('Please enter the buyer name');
      }
      if (!formData.dueDate) {
        throw new Error('Please enter a due date');
      }

      const dueDate = new Date(formData.dueDate);
      if (dueDate < new Date()) {
        throw new Error('Due date must be in the future');
      }

      // Step 1: Generate ZK proof of creditworthiness
      setStep("zkproof");
      const score = await calculateCreditScore(address!);
      setCreditScore(score);

      const minThreshold = 650; // Minimum credit score for funding
      const proof = await generateCreditScoreProof(
        score,
        minThreshold,
        '/zk/credit_score_range.wasm',
        '/zk/credit_score_range_final.zkey'
      );
      setZkProof(proof);
      console.log('✓ Generated ZK proof, score:', score);

      // Step 2: Commit credit score to oracle
      const commitmentBytes32 = toHex(BigInt(proof.commitment), { size: 32 });

      writeContract({
        address: CONTRACT_ADDRESSES.ZKCreditOracle as `0x${string}`,
        abi: ZKCREDITOACLE_ABI,
        functionName: 'commitCreditScore',
        args: [commitmentBytes32],
      });

      console.log('✓ Committed credit score to oracle');

      // Step 3: Mint Invoice NFT
      setStep("mint");

      // Create a simple invoice metadata object
      const metadata = {
        invoiceNumber: formData.invoiceNumber,
        amount: formData.amount,
        buyerName: formData.buyerName,
        sellerName: formData.sellerName,
        dueDate: formData.dueDate,
        description: formData.description,
        createdAt: new Date().toISOString(),
      };

      // Upload metadata to IPFS
      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      const metadataFile = new File([metadataBlob], 'invoice-metadata.json');
      
      const cid = await uploadToPinata(metadataFile, {
        invoiceNumber: formData.invoiceNumber,
        buyerName: formData.buyerName,
        amount: formData.amount,
        manualEntry: 'true',
      });
      setIPFSCID(cid);
      console.log('✓ Uploaded to IPFS:', cid);

      // Convert IPFS CID to bytes32
      const ipfsBytes32 = keccak256(encodePacked(['string'], [cid]));

      // Calculate funding deadline (7 days from now)
      const fundingDeadline = BigInt(Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60);

      // Convert due date to timestamp
      const dueTimestamp = BigInt(Math.floor(new Date(formData.dueDate).getTime() / 1000));

      // Convert INR amount to AVAX (1 AVAX = ₹3000), then to wei
      const amountInInr = parseFloat(formData.amount);
      const amountInAvax = amountInInr / AVAX_TO_INR_RATE;
      const amountWei = parseUnits(amountInAvax.toFixed(18), 18);

      writeContract({
        address: CONTRACT_ADDRESSES.InvoiceNFT as `0x${string}`,
        abi: INVOICENFT_ABI,
        functionName: 'mintInvoice',
        args: [
          address,
          amountWei,
          dueTimestamp,
          formData.buyerName,
          ipfsBytes32,
          fundingDeadline,
        ],
      });

      console.log('✓ Minting invoice NFT...');

    } catch (err) {
      console.error('Submission error:', err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setStep("form");
      setLoading(false);
    }
  };

  // Watch for transaction confirmation and extract token ID from event logs
  useEffect(() => {
    if (isConfirmed && step === "mint" && !nftTokenId && hash && publicClient) {
      (async () => {
        try {
          // Get transaction receipt
          const receipt = await publicClient.getTransactionReceipt({ hash });

          // Find InvoiceMinted event in logs
          let extractedTokenId: number | null = null;

          for (const log of receipt.logs) {
            try {
              const decoded = decodeEventLog({
                abi: INVOICENFT_ABI,
                data: log.data,
                topics: log.topics,
              });

              if (decoded.eventName === 'InvoiceMinted') {
                extractedTokenId = Number((decoded.args as any).tokenId);
                console.log('✓ Extracted token ID from InvoiceMinted event:', extractedTokenId);
                break;
              }
            } catch (err) {
              // Skip logs that don't match our ABI
              continue;
            }
          }

          // Fallback to timestamp if event parsing fails
          const tokenId = extractedTokenId !== null ? extractedTokenId : Date.now();
          if (extractedTokenId === null) {
            console.warn('Could not extract token ID from events, using fallback:', tokenId);
          }

          setNftTokenId(tokenId);

          if (isSupabaseConfigured) {
            await createInvoice({
              msme_address: address!.toLowerCase(),
              invoice_nft_id: tokenId,
              amount: parseFloat(formData.amount),
              buyer_name: formData.buyerName,
              due_date: formData.dueDate,
              ipfs_cid: ipfsCID || '',
              credit_score: creditScore || 0,
              status: 'pending',
            });
            console.log('✓ Saved to database');
          }

          setStep("success");
          setLoading(false);

          if (onSuccess) {
            onSuccess({
              ...formData,
              amount: parseFloat(formData.amount),
              ipfsCID,
              creditScore,
              nftTokenId: tokenId,
              address,
            });
          }
        } catch (err) {
          console.error('Database error:', err);
          setError('Invoice minted but failed to save to database');
          setLoading(false);
        }
      })();
    }
  }, [isConfirmed, step, nftTokenId, hash, publicClient, formData, ipfsCID, creditScore, address, onSuccess]);

  // Automatically create funding round after mint success
  useEffect(() => {
    if (step === "success" && nftTokenId && !isPending) {
      const timer = setTimeout(() => {
        const interestRate = 18; // 18% APR
        console.log(`Creating funding round for NFT #${nftTokenId}...`);

        writeContract({
          address: CONTRACT_ADDRESSES.FundingPool as `0x${string}`,
          abi: FUNDINGPOOL_ABI,
          functionName: 'createFundingRound',
          args: [BigInt(nftTokenId), BigInt(interestRate * 100)],
        });

        // Update database status to 'Listed'
        (async () => {
          try {
            const { getInvoiceByTokenId } = await import("@/lib/supabase/invoices");
            const { supabase } = await import("@/lib/supabase/client");

            const invoice = await getInvoiceByTokenId(nftTokenId);
            if (invoice?.id) {
              await (supabase as any)
                .from('invoices')
                .update({ status: 'Listed' })
                .eq('id', invoice.id);
              console.log('✓ Invoice status updated to Listed');
            }
          } catch (err) {
            console.error('Failed to update invoice status:', err);
          }
        })();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [step, nftTokenId, isPending, writeContract]);

  return (
    <div className="card space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2 text-off-white">Manual Invoice Entry</h3>
        <p className="text-base text-light-gray">
          Enter your invoice details manually. Your creditworthiness will be verified
          using zero-knowledge proofs without revealing sensitive information.
        </p>
      </div>

      {/* Form state */}
      {step === "form" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-light-gray mb-2">
                Invoice Number
              </label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleInputChange}
                placeholder="e.g., INV-1023"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-gray mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="e.g., 500000"
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-gray mb-2">
                Buyer Name *
              </label>
              <input
                type="text"
                name="buyerName"
                value={formData.buyerName}
                onChange={handleInputChange}
                placeholder="e.g., BigMart Retail Ltd."
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-gray mb-2">
                Your Company Name
              </label>
              <input
                type="text"
                name="sellerName"
                value={formData.sellerName}
                onChange={handleInputChange}
                placeholder="e.g., Sharma Traders Pvt. Ltd."
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-gray mb-2">
                Issue Date
              </label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleInputChange}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-gray mb-2">
                Due Date *
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-light-gray mb-2">
              Description / Notes
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="e.g., Industrial Packaging Boxes 500 units @ ₹800 each..."
              className="input"
              rows={3}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || isPending || isConfirming}
            className="btn-primary w-full"
          >
            {loading || isPending || isConfirming ? 'Processing...' : 'Submit Invoice & Create NFT'}
          </button>
        </form>
      )}

      {/* Loading state */}
      {(loading || isPending || isConfirming) && (
        <div className="text-center space-y-4 py-8">
          <div className="spinner mx-auto w-12 h-12 border-4"></div>
          <p className="text-light-gray text-lg font-medium">
            {step === "zkproof" && "Generating zero-knowledge proof..."}
            {step === "mint" && (isPending ? "Confirm transaction in wallet..." : "Minting invoice NFT on-chain...")}
          </p>
        </div>
      )}

      {/* Success state */}
      {step === "success" && (
        <div className="space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
            <p className="text-emerald-400 font-poppins font-semibold mb-2">
              ✓ Invoice Successfully Created
            </p>
            <div className="text-sm space-y-1 text-light-gray">
              <p>Amount: ₹{parseFloat(formData.amount).toLocaleString()}</p>
              <p>Buyer: {formData.buyerName}</p>
              <p>Due Date: {formData.dueDate}</p>
              <p>Credit Score: {creditScore}</p>
              <p>NFT Token ID: #{nftTokenId}</p>
              <p>IPFS CID: {ipfsCID?.substring(0, 20)}...</p>
            </div>
          </div>
          <button
            onClick={() => {
              const interestRate = 18;
              writeContract({
                address: CONTRACT_ADDRESSES.FundingPool as `0x${string}`,
                abi: FUNDINGPOOL_ABI,
                functionName: 'createFundingRound',
                args: [BigInt(nftTokenId!), BigInt(interestRate * 100)],
              });
            }}
            disabled={isPending || !nftTokenId}
            className="btn-primary w-full"
          >
            {isPending ? 'Creating Funding Round...' : 'List for Funding'}
          </button>
        </div>
      )}
    </div>
  );
}
