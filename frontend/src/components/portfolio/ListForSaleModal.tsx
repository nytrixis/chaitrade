'use client';

import { useState } from 'react';
import { useContractWrite, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import toast from 'react-hot-toast';

const MARKETPLACE_ADDRESS = '0x7aa72406aC064834175BD26Aea82eda40E23BCFa' as `0x${string}`;
const INVOICE_NFT_ADDRESS = process.env.NEXT_PUBLIC_INVOICE_NFT_ADDRESS as `0x${string}`;

const ERC721_ABI = [
    {
        inputs: [
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
        ],
        name: 'approve',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
] as const;

const MARKETPLACE_ABI = [
    {
        inputs: [
            { internalType: 'address', name: 'nftContract', type: 'address' },
            { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
            { internalType: 'uint256', name: 'askingPrice', type: 'uint256' },
            { internalType: 'uint256', name: 'faceValue', type: 'uint256' },
            { internalType: 'uint256', name: 'daysToMaturity', type: 'uint256' },
        ],
        name: 'listInvoice',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
] as const;

interface ListForSaleModalProps {
    invoiceId: number;
    faceValue: bigint;
    daysToMaturity: number;
    onClose: () => void;
}

export function ListForSaleModal({
    invoiceId,
    faceValue,
    daysToMaturity,
    onClose,
}: ListForSaleModalProps) {
    const [askingPrice, setAskingPrice] = useState('');
    const [step, setStep] = useState<'price' | 'approve' | 'list'>('price');

    const faceValueEth = parseFloat(formatEther(faceValue));
    const askingPriceNum = parseFloat(askingPrice || '0');
    const discount =
        askingPriceNum > 0 ? (((faceValueEth - askingPriceNum) / faceValueEth) * 100).toFixed(1) : '0.0';

    // Calculate implied yield for buyer
    const impliedYield =
        askingPriceNum > 0 && daysToMaturity > 0
            ? (((faceValueEth - askingPriceNum) / askingPriceNum) * (365 / daysToMaturity) * 100).toFixed(
                  2
              )
            : '0.00';

    const { data: approveHash, writeContract: approve, isPending: isApproving } = useContractWrite();
    const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

    const { data: listHash, writeContract: list, isPending: isListing } = useContractWrite();
    const { isSuccess: listSuccess } = useWaitForTransactionReceipt({ hash: listHash });

    const handleApprove = () => {
        approve({
            address: INVOICE_NFT_ADDRESS,
            abi: ERC721_ABI,
            functionName: 'approve',
            args: [MARKETPLACE_ADDRESS, BigInt(invoiceId)],
        });
    };

    const handleList = () => {
        list({
            address: MARKETPLACE_ADDRESS,
            abi: MARKETPLACE_ABI,
            functionName: 'listInvoice',
            args: [
                INVOICE_NFT_ADDRESS,
                BigInt(invoiceId),
                parseEther(askingPrice),
                faceValue,
                BigInt(daysToMaturity),
            ],
        });
    };

    if (approveSuccess && step === 'approve') {
        setTimeout(() => {
            setStep('list');
            toast.success('Marketplace approved! Now list your invoice.');
        }, 500);
    }

    if (listSuccess) {
        setTimeout(() => {
            toast.success('Invoice listed successfully!');
            onClose();
        }, 500);
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">List Invoice for Sale</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded">
                        <p className="text-sm text-gray-600 mb-1">Invoice Details</p>
                        <p className="font-semibold">Invoice #{invoiceId}</p>
                        <p className="text-sm text-gray-600">
                            Face Value: {faceValueEth.toFixed(2)} AVAX
                        </p>
                        <p className="text-sm text-gray-600">Matures in: {daysToMaturity} days</p>
                    </div>

                    {step === 'price' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Asking Price (AVAX)
                                </label>
                                <input
                                    type="text"
                                    value={askingPrice}
                                    onChange={(e) => setAskingPrice(e.target.value)}
                                    placeholder={`Max: ${faceValueEth.toFixed(2)}`}
                                    className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Set a price lower than face value to attract buyers
                                </p>
                            </div>

                            {askingPriceNum > 0 && askingPriceNum < faceValueEth && (
                                <div className="bg-blue-50 p-4 rounded">
                                    <p className="text-sm text-gray-600 mb-2">Buyer Will See:</p>
                                    <div className="space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-sm">Discount:</span>
                                            <span className="font-semibold text-green-600">
                                                {discount}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm">Implied Yield:</span>
                                            <span className="font-semibold text-purple-600">
                                                {impliedYield}% APR
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm">Your Proceeds:</span>
                                            <span className="font-semibold">
                                                {askingPriceNum.toFixed(2)} AVAX
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {step === 'approve' && (
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                            <p className="text-sm font-medium text-yellow-900 mb-1">
                                Step 1: Approve Marketplace
                            </p>
                            <p className="text-xs text-yellow-700">
                                One-time approval to let the marketplace transfer your NFT when sold
                            </p>
                        </div>
                    )}

                    {step === 'list' && (
                        <div className="bg-green-50 border border-green-200 p-4 rounded">
                            <p className="text-sm font-medium text-green-900 mb-1">
                                Step 2: List on Marketplace
                            </p>
                            <p className="text-xs text-green-700">
                                Your invoice will be visible to all buyers
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-gray-300 text-gray-700 p-3 rounded hover:bg-gray-50 font-semibold"
                    >
                        Cancel
                    </button>
                    {step === 'price' && (
                        <button
                            onClick={() => setStep('approve')}
                            disabled={!askingPrice || askingPriceNum >= faceValueEth || askingPriceNum <= 0}
                            className="flex-1 bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                            Continue
                        </button>
                    )}
                    {step === 'approve' && (
                        <button
                            onClick={handleApprove}
                            disabled={isApproving}
                            className="flex-1 bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:opacity-50 font-semibold"
                        >
                            {isApproving ? 'Approving...' : 'Approve Marketplace'}
                        </button>
                    )}
                    {step === 'list' && (
                        <button
                            onClick={handleList}
                            disabled={isListing}
                            className="flex-1 bg-green-600 text-white p-3 rounded hover:bg-green-700 disabled:opacity-50 font-semibold"
                        >
                            {isListing ? 'Listing...' : 'List for Sale'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
