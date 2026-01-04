"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { parseUnits, encodePacked, keccak256, toHex, decodeEventLog } from "viem";
import { uploadToPinata } from "@/lib/pinata/upload";
import { extractInvoiceData, validateInvoiceData } from "@/lib/ai/ocr";
import { generateCreditScoreProof, calculateCreditScore } from "@/lib/zk/generateProof";
import { createInvoice } from "@/lib/supabase/invoices";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  CONTRACT_ADDRESSES,
  INVOICENFT_ABI,
  ZKCREDITOACLE_ABI,
  FUNDINGPOOL_ABI
} from "@/lib/contracts";

export interface InvoiceUploadProps {
  onSuccess?: (invoiceData: any) => void;
}

export function InvoiceUpload({ onSuccess }: InvoiceUploadProps) {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const publicClient = usePublicClient();

  const [step, setStep] = useState<"upload" | "extract" | "zkproof" | "mint" | "success">(
    "upload"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [mintHash, setMintHash] = useState<string | null>(null);
  const [creditScore, setCreditScore] = useState<number | null>(null);
  const [ipfsCID, setIPFSCID] = useState<string | null>(null);
  const [zkProof, setZkProof] = useState<any>(null);
  const [nftTokenId, setNftTokenId] = useState<number | null>(null);

  if (!isConnected) {
    return (
      <div className="card">
        <p className="text-center text-light-gray">
          Please connect your wallet to upload an invoice.
        </p>
      </div>
    );
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type - Support both images and PDFs
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('⚠️ Please upload a valid invoice file (JPG, PNG, or PDF)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: OCR extraction
      setStep("extract");
      const extracted = await extractInvoiceData(file);

      // Validate
      const { valid, errors } = validateInvoiceData(extracted);
      if (!valid) {
        throw new Error(`Validation failed: ${errors.join(", ")}`);
      }

      setInvoiceData(extracted);

      // Step 2: Upload to IPFS
      const cid = await uploadToPinata(file, {
        invoiceNumber: extracted.invoiceNumber,
        buyerName: extracted.buyerName,
        amount: extracted.amount.toString(),
      });
      setIPFSCID(cid);
      console.log('✓ Uploaded to IPFS:', cid);

      // Step 3: Generate ZK proof of creditworthiness
      setStep("zkproof");
      const score = await calculateCreditScore(address!);
      setCreditScore(score);

      const minThreshold = 650; // Minimum credit score for funding
      const proof = await generateCreditScoreProof(score, minThreshold);
      setZkProof(proof);
      console.log('✓ Generated ZK proof, score:', score);

      // Step 4: Commit credit score to oracle
      const commitmentBytes32 = toHex(BigInt(proof.commitment), { size: 32 });
      writeContract({
        address: CONTRACT_ADDRESSES.ZKCreditOracle as `0x${string}`,
        abi: ZKCREDITOACLE_ABI,
        functionName: 'commitCreditScore',
        args: [commitmentBytes32],
      });

      console.log('✓ Committed credit score to oracle');

      // Step 5: Mint Invoice NFT
      setStep("mint");

      // Convert IPFS CID to bytes32
      const ipfsBytes32 = keccak256(encodePacked(['string'], [cid]));

      // Calculate funding deadline (7 days from now)
      const fundingDeadline = BigInt(Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60);

      // Convert due date to timestamp
      const dueTimestamp = BigInt(Math.floor(new Date(extracted.dueDate).getTime() / 1000));

      // Convert amount to wei (assuming INR, using 18 decimals)
      const amountWei = parseUnits(extracted.amount.toString(), 18);

      writeContract({
        address: CONTRACT_ADDRESSES.InvoiceNFT as `0x${string}`,
        abi: INVOICENFT_ABI,
        functionName: 'mintInvoice',
        args: [
          address,
          amountWei,
          dueTimestamp,
          extracted.buyerName,
          ipfsBytes32,
          fundingDeadline,
        ],
      });

      console.log('✓ Minting invoice NFT...');

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setStep("upload");
      setLoading(false);
    }
  };

  // Watch for transaction confirmation - use the hash from useWriteContract
  useEffect(() => {
    console.log('Transaction state updated:', {
      step,
      hash,
      isConfirmed,
      nftTokenId,
      isPending,
    });

    if (isConfirmed && step === "mint" && !nftTokenId && hash && publicClient) {
      console.log('Mint transaction confirmed:', hash);
      // Transaction confirmed - extract token ID from event logs
      (async () => {
        try {
          // Get transaction receipt
          const receipt = await publicClient.getTransactionReceipt({ hash });
          console.log('Transaction receipt:', receipt);

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
          console.log('Setting token ID:', tokenId);

          if (isSupabaseConfigured && invoiceData && ipfsCID) {
            console.log('Saving invoice to database:', {
              msme_address: address!.toLowerCase(),
              invoice_nft_id: tokenId,
              amount: invoiceData.amount,
              buyer_name: invoiceData.buyerName,
              due_date: invoiceData.dueDate,
              ipfs_cid: ipfsCID,
              credit_score: creditScore || 0,
              status: 'pending',
            });
            await createInvoice({
              msme_address: address!.toLowerCase(),
              invoice_nft_id: tokenId,
              amount: invoiceData.amount,
              buyer_name: invoiceData.buyerName,
              due_date: invoiceData.dueDate,
              ipfs_cid: ipfsCID,
              credit_score: creditScore || 0,
              status: 'pending',
            });
            console.log('✓ Saved to database');
          } else {
            console.warn('Supabase not configured or missing data:', {
              isSupabaseConfigured,
              hasInvoiceData: !!invoiceData,
              hasIPFSCID: !!ipfsCID,
            });
          }

          setStep("success");
          setLoading(false);

          if (onSuccess) {
            onSuccess({
              ...invoiceData,
              ipfsCID,
              creditScore,
              nftTokenId: tokenId,
              address,
            });
          }
        } catch (err) {
          console.error('Database error:', err);
          setError(`Invoice minted (tx: ${hash}) but failed to save to database: ${err instanceof Error ? err.message : 'Unknown error'}`);
          setLoading(false);
          // Still show success to user since on-chain mint succeeded
          setStep("success");
        }
      })();
    }
  }, [isConfirmed, step, nftTokenId, hash, invoiceData, ipfsCID, address, creditScore, onSuccess, publicClient]);

  return (
    <div className="card space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2 text-off-white">Upload Invoice</h3>
        <p className="text-base text-light-gray">
          Upload an invoice image. We'll extract the details and verify
          your creditworthiness using zero-knowledge proofs.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-between text-sm">
        <div
          className={`text-center flex-1 transition-all ${
            step === "upload" ? "text-sage-green-500" : "text-light-gray"
          }`}
        >
          <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mx-auto mb-2 font-semibold ${
            step === "upload" ? "border-sage-green-500 bg-sage-green-500/20" : "border-current"
          }`}>
            1
          </div>
          <span className="font-medium">Upload</span>
        </div>
        <div className={`flex-1 h-1 mx-2 transition-colors ${
          ["extract", "zkproof", "success"].includes(step) ? "bg-sage-green-500" : "bg-medium-gray/20"
        }`}></div>
        <div
          className={`text-center flex-1 transition-all ${
            step === "extract" ? "text-sage-green-500" : "text-light-gray"
          }`}
        >
          <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mx-auto mb-2 font-semibold ${
            step === "extract" ? "border-sage-green-500 bg-sage-green-500/20" : "border-current"
          }`}>
            2
          </div>
          <span className="font-medium">Extract</span>
        </div>
        <div className={`flex-1 h-1 mx-2 transition-colors ${
          ["zkproof", "success"].includes(step) ? "bg-sage-green-500" : "bg-medium-gray/20"
        }`}></div>
        <div
          className={`text-center flex-1 transition-all ${
            step === "zkproof" ? "text-sage-green-500" : "text-light-gray"
          }`}
        >
          <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mx-auto mb-2 font-semibold ${
            step === "zkproof" ? "border-sage-green-500 bg-sage-green-500/20" : "border-current"
          }`}>
            3
          </div>
          <span className="font-medium">ZK Proof</span>
        </div>
        <div className={`flex-1 h-1 mx-2 transition-colors ${
          step === "success" ? "bg-sage-green-500" : "bg-medium-gray/20"
        }`}></div>
        <div
          className={`text-center flex-1 transition-all ${
            step === "success" ? "text-sage-green-500" : "text-light-gray"
          }`}
        >
          <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mx-auto mb-2 font-semibold ${
            step === "success" ? "border-sage-green-500 bg-sage-green-500/20" : "border-current"
          }`}>
            ✓
          </div>
          <span className="font-medium">Success</span>
        </div>
      </div>

      {/* Upload section */}
      {step === "upload" && (
        <div>
          <label className="block border-2 border-dashed border-medium-gray/50 rounded-xl p-12 text-center cursor-pointer hover:border-sage-green-500 hover:bg-sage-green-500/5 transition-all">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".jpg,.jpeg,.png,.pdf"
              disabled={loading}
              className="hidden"
            />
            <div className="text-6xl mb-4">📄</div>
            <p className="font-semibold text-lg mb-2 text-off-white">
              Drop your invoice here
            </p>
            <p className="text-base text-light-gray">
              or click to browse (JPG, PNG, or PDF)
            </p>
          </label>
        </div>
      )}

      {/* Loading state */}
      {(loading || isPending || isConfirming) && (
        <div className="text-center space-y-4 py-8">
          <div className="spinner mx-auto w-12 h-12 border-4"></div>
          <p className="text-light-gray text-lg font-medium">
            {step === "extract" && "Extracting invoice details with OCR..."}
            {step === "zkproof" && "Generating zero-knowledge proof..."}
            {step === "mint" && (isPending ? "Confirm transaction in wallet..." : "Minting invoice NFT on-chain...")}
          </p>
        </div>
      )}

      {/* Success state */}
      {step === "success" && invoiceData && (
        <div className="space-y-4">
          <div className="bg-sage-green-500/10 border border-sage-green-500/20 rounded-lg p-4">
            <p className="text-sage-green-400 font-poppins font-semibold mb-2">
              ✓ Invoice Successfully Processed
            </p>
            <div className="text-sm space-y-1 text-light-gray">
              <p>Amount: ₹{invoiceData.amount.toLocaleString()}</p>
              <p>Buyer: {invoiceData.buyerName}</p>
              <p>Due Date: {invoiceData.dueDate}</p>
              <p>Credit Score: {creditScore}</p>
              <p>NFT Token ID: #{nftTokenId}</p>
              <p>IPFS CID: {ipfsCID?.substring(0, 20)}...</p>
            </div>
          </div>
          <button
            onClick={() => {
              // Create funding round on the FundingPool contract
              const interestRate = 18; // 18% APR - could be dynamic based on credit score
              writeContract({
                address: CONTRACT_ADDRESSES.FundingPool as `0x${string}`,
                abi: FUNDINGPOOL_ABI,
                functionName: 'createFundingRound',
                args: [BigInt(nftTokenId!), BigInt(interestRate * 100)], // Interest rate in basis points
              });
            }}
            disabled={isPending || !nftTokenId}
            className="btn-primary w-full"
          >
            {isPending ? 'Creating Funding Round...' : 'List for Funding'}
          </button>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
