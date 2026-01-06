"use client";

import { useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { parseUnits, encodePacked, keccak256, decodeEventLog } from "viem";
import { uploadToPinata } from "@/lib/pinata/upload";
import { extractInvoiceData, validateInvoiceData } from "@/lib/ai/ocr";
import { generateCreditScoreProof, calculateCreditScore, commitmentToBytes32 } from "@/lib/zk/generateProof";
import { createInvoice, getInvoicesByMSME } from "@/lib/supabase/invoices";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { AVAX_TO_INR_RATE } from "@/lib/utils/currency";
import toast from "react-hot-toast";
import { ConnectButton } from "@/components/ConnectButton";
import {
  CONTRACT_ADDRESSES,
  INVOICENFT_ABI,
  FUNDINGPOOL_ABI
} from "@/lib/contracts";

export interface InvoiceUploadProps {
  onSuccess?: (invoiceData: any) => void;
  onUploadSuccess?: (invoiceData: any) => void;
  onManualEntry?: () => void;
}

type Step = "upload" | "extract" | "zkproof" | "mint" | "success";

export function InvoiceUpload({ onSuccess, onUploadSuccess, onManualEntry }: InvoiceUploadProps) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [step, setStep] = useState<Step>("upload");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [creditScore, setCreditScore] = useState<number | null>(null);
  const [nftTokenId, setNftTokenId] = useState<number | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!walletClient || !publicClient || !address) {
      setError('Please connect your wallet first');
      toast.error('Please connect your wallet to upload');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid invoice file (JPG, PNG, or PDF)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setStep("extract");
      setStatusMessage("Extracting invoice data...");
      const extracted = await extractInvoiceData(file);
      const { valid, errors } = validateInvoiceData(extracted);
      if (!valid) {
        throw new Error('Validation failed: ' + errors.join(", "));
      }
      setInvoiceData(extracted);
      console.log('✓ Extracted invoice data:', extracted);

      setStatusMessage("Uploading to IPFS...");
      const ipfsCID = await uploadToPinata(file, {
        invoiceNumber: extracted.invoiceNumber,
        buyerName: extracted.buyerName,
        amount: extracted.amount.toString(),
      });
      console.log('✓ Uploaded to IPFS:', ipfsCID);

      setStep("zkproof");
      setStatusMessage("Generating zero-knowledge proof...");
      const score = await calculateCreditScore(address);
      setCreditScore(score);
      const minThreshold = 650;

      const zkProof = await generateCreditScoreProof(
        score,
        minThreshold,
        '/zk/credit_score_range.wasm',
        '/zk/credit_score_range_final.zkey'
      );
      console.log('✓ Generated ZK proof, score:', score);

      setStep("mint");
      setStatusMessage("Creating invoice on blockchain (1 confirmation)...");

      const ipfsBytes32 = keccak256(encodePacked(['string'], [ipfsCID]));
      const fundingDeadline = BigInt(Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60);
      const dueTimestamp = BigInt(Math.floor(new Date(extracted.dueDate).getTime() / 1000));
      const amountInAvax = extracted.amount / AVAX_TO_INR_RATE;
      const amountWei = parseUnits(amountInAvax.toFixed(18), 18);
      const commitmentBytes32 = commitmentToBytes32(zkProof.commitment);
      const { formattedForContract } = zkProof;
      const interestRate = 1800;

      const txHash = await walletClient.writeContract({
        address: CONTRACT_ADDRESSES.FundingPool as `0x${string}`,
        abi: FUNDINGPOOL_ABI,
        functionName: 'mintInvoiceAndCreateFunding',
        args: [
          amountWei,
          dueTimestamp,
          extracted.buyerName,
          ipfsBytes32,
          fundingDeadline,
          BigInt(interestRate),
          commitmentBytes32,
          formattedForContract.proof_a,
          formattedForContract.proof_b,
          formattedForContract.proof_c,
          formattedForContract.publicInputs,
          BigInt(minThreshold),
        ],
      });
      console.log('✓ Batch transaction sent:', txHash);

      setStatusMessage("Waiting for confirmation...");
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log('Receipt status:', receipt.status, 'logs:', receipt.logs.length);

      if (receipt.status === 'reverted') {
        console.error('❌ Transaction reverted!');
        throw new Error('Transaction failed on blockchain');
      }

      let tokenId: number | null = null;
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: FUNDINGPOOL_ABI,
            data: log.data,
            topics: log.topics,
          });
          if (decoded.eventName === 'FundingRoundCreated') {
            tokenId = Number((decoded.args as any).invoiceId);
            console.log('✓ Found event, invoiceId:', tokenId);
            break;
          }
        } catch {
          try {
            const decoded = decodeEventLog({
              abi: INVOICENFT_ABI,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === 'InvoiceMinted') {
              tokenId = Number((decoded.args as any).tokenId);
              console.log('✓ Found event, tokenId:', tokenId);
              break;
            }
          } catch { continue; }
        }
      }

      if (tokenId === null) {
        console.warn('⚠️  No events emitted, querying blockchain to find the newly minted token...');

        // The transaction succeeded, so an NFT was minted
        // We need to find which token ID by checking which tokens this address owns
        try {
          // Strategy: Find all tokens owned by this address and identify the newest one
          const ownedTokenIds: number[] = [];

          // Check token IDs from 0 to 99 (should be more than enough)
          for (let i = 0; i < 100; i++) {
            try {
              const owner = await publicClient.readContract({
                address: CONTRACT_ADDRESSES.InvoiceNFT as `0x${string}`,
                abi: INVOICENFT_ABI,
                functionName: 'ownerOf',
                args: [BigInt(i)],
              }) as `0x${string}`;

              if (owner.toLowerCase() === address.toLowerCase()) {
                ownedTokenIds.push(i);
              }
            } catch {
              // Token doesn't exist or query failed, continue
              continue;
            }
          }

          console.log('✓ Found tokens owned by address:', ownedTokenIds);

          if (ownedTokenIds.length === 0) {
            throw new Error('No tokens found for this address after minting');
          }

          // The newest token is the one with the highest ID
          tokenId = Math.max(...ownedTokenIds);
          console.log('✓ Using most recent token ID:', tokenId);

        } catch (fallbackError) {
          console.error('Blockchain query failed:', fallbackError);
          throw new Error('Could not determine invoice ID from blockchain');
        }
      }

      setNftTokenId(tokenId);
      console.log('✓ Invoice ID:', tokenId);

      setStatusMessage("Saving to database...");
      if (isSupabaseConfigured) {
        const savedInvoice = await createInvoice({
          msme_address: address.toLowerCase(),
          invoice_nft_id: tokenId,
          amount: extracted.amount,
          buyer_name: extracted.buyerName,
          due_date: extracted.dueDate,
          ipfs_cid: ipfsCID,
          credit_score: score,
          status: 'active',
        });
        console.log('✓ Saved to database');

        // ✅ Credit score history - Uncomment after running SQL migration
        // try {
        //   const { saveCreditScoreHistory, calculateEnhancedCreditScore } = await import('@/lib/supabase/credit-history');
        //   const enhancedScore = await calculateEnhancedCreditScore(score, address);
        //   await saveCreditScoreHistory(address, enhancedScore, savedInvoice.id!);
        //   console.log('✓ Credit score history saved');
        // } catch (historyError) {
        //   console.error('Failed to save credit score history:', historyError);
        // }
      }

      setStep("success");
      setStatusMessage("");
      setLoading(false);

      toast.success(`Invoice #${tokenId} created successfully!`, { duration: 5000 });

      const successData = {
        ...extracted,
        ipfsCID,
        creditScore: score,
        nftTokenId: tokenId,
        address,
      };

      if (onSuccess) onSuccess(successData);
      if (onUploadSuccess) onUploadSuccess(successData);

    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      toast.error(`Upload failed: ${errorMessage}`);
      setStep("upload");
      setLoading(false);
    }
  };

  const getStepNumber = (s: Step): number => {
    const steps: Step[] = ["upload", "extract", "zkproof", "mint", "success"];
    return steps.indexOf(s) + 1;
  };

  return (
    <div className="card space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2 text-off-white">Upload Invoice</h3>
        <p className="text-base text-light-gray">
          Upload an invoice image. We'll extract the details and verify your creditworthiness using zero-knowledge proofs.
        </p>
      </div>

      {!isConnected && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 text-center">
          <p className="text-yellow-400 mb-4">Please connect your wallet to upload invoices</p>
          <ConnectButton />
        </div>
      )}

      {isConnected && (
        <>
          {loading && (
            <div className="bg-sage-green-500/10 border border-sage-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sage-green-500"></div>
                <span className="text-sage-green-400 font-semibold">Step {getStepNumber(step)} of 5</span>
              </div>
              <p className="text-light-gray text-sm mb-2">{statusMessage}</p>
              {step === "mint" && (
                <p className="text-xs text-light-gray/70 italic">
                  💡 Please confirm the transaction in your wallet. This single transaction creates your invoice and opens funding.
                </p>
              )}
            </div>
          )}

          {step === "success" && (
            <div className="bg-sage-green-500/20 border border-sage-green-500/50 rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">✅</div>
              <h4 className="text-xl font-bold text-sage-green-400 mb-2">Invoice Listed Successfully!</h4>
              <p className="text-light-gray">NFT #{nftTokenId} is now available for funding on the marketplace.</p>
              <p className="text-sm text-light-gray mt-2">Credit Score: {creditScore}</p>
              <button
                onClick={() => { setStep("upload"); setNftTokenId(null); setInvoiceData(null); }}
                className="btn-secondary mt-4"
              >
                Upload Another Invoice
              </button>
            </div>
          )}

          {step === "upload" && !loading && (
            <div className="border-2 border-dashed border-medium-gray rounded-lg p-8 text-center hover:border-sage-green-500/50 transition-colors">
              <input
                type="file"
                id="invoice-upload"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="invoice-upload" className="cursor-pointer block">
                <div className="text-4xl mb-4">📄</div>
                <p className="text-lg font-semibold text-off-white mb-2">Click to upload invoice</p>
                <p className="text-sm text-light-gray">Supports JPG, PNG, or PDF files</p>
              </label>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => { setError(null); setStep("upload"); }}
                className="text-sm text-red-400 underline mt-2"
              >
                Try again
              </button>
            </div>
          )}

          {onManualEntry && step === "upload" && !loading && (
            <div className="text-center pt-4 border-t border-medium-gray/30">
              <button
                onClick={onManualEntry}
                className="text-sage-green-500 hover:text-sage-green-400 text-sm"
              >
                Or enter invoice details manually →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
