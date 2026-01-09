'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useContractRead, useContractWrite, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import Link from 'next/link';
import toast from 'react-hot-toast';

const MARKETPLACE_ADDRESS = '0x7aa72406aC064834175BD26Aea82eda40E23BCFa' as `0x${string}`;
const INVOICE_NFT_ADDRESS = process.env.NEXT_PUBLIC_INVOICE_NFT_ADDRESS as `0x${string}`;

// Simplified ABI
const MARKETPLACE_ABI = [
    {
        inputs: [
            { internalType: 'address', name: 'nftContract', type: 'address' },
            { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
        ],
        name: 'buyInvoice',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'nftContract', type: 'address' },
            { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
        ],
        name: 'getListing',
        outputs: [
            {
                components: [
                    { internalType: 'address', name: 'seller', type: 'address' },
                    { internalType: 'uint256', name: 'askingPrice', type: 'uint256' },
                    { internalType: 'uint256', name: 'faceValue', type: 'uint256' },
                    { internalType: 'uint256', name: 'daysToMaturity', type: 'uint256' },
                    { internalType: 'uint256', name: 'listedAt', type: 'uint256' },
                    { internalType: 'bool', name: 'isActive', type: 'bool' },
                ],
                internalType: 'struct InvoiceMarketplace.Listing',
                name: '',
                type: 'tuple',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
] as const;

interface Listing {
    tokenId: number;
    seller: string;
    askingPrice: bigint;
    faceValue: bigint;
    daysToMaturity: number;
    listedAt: number;
    isActive: boolean;
}

export default function MarketplacePage() {
    const { address, isConnected } = useAccount();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [buyingId, setBuyingId] = useState<number | null>(null);

    const { data: hash, writeContract, isPending } = useContractWrite();
    const { isSuccess } = useWaitForTransactionReceipt({ hash });

    // Mock listings - In production, fetch from events or subgraph
    useEffect(() => {
        // Simulate loading
        setTimeout(() => {
            setListings([
                // Mock data for demonstration
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const handleBuy = (tokenId: number, price: bigint) => {
        setBuyingId(tokenId);
        writeContract({
            address: MARKETPLACE_ADDRESS,
            abi: MARKETPLACE_ABI,
            functionName: 'buyInvoice',
            args: [INVOICE_NFT_ADDRESS, BigInt(tokenId)],
            value: price,
        });
    };

    const calculateYield = (faceValue: bigint, askingPrice: bigint, days: number) => {
        if (days === 0) return '0.00';
        const faceEth = parseFloat(formatEther(faceValue));
        const priceEth = parseFloat(formatEther(askingPrice));
        const profit = faceEth - priceEth;
        const yieldPercent = (profit / priceEth) * (365 / days) * 100;
        return yieldPercent.toFixed(2);
    };

    const calculateDiscount = (faceValue: bigint, askingPrice: bigint) => {
        const faceEth = parseFloat(formatEther(faceValue));
        const priceEth = parseFloat(formatEther(askingPrice));
        return (((faceEth - priceEth) / faceEth) * 100).toFixed(1);
    };

    if (isSuccess && buyingId) {
        setTimeout(() => {
            toast.success(`Invoice #${buyingId} purchased successfully!`);
            setBuyingId(null);
        }, 1000);
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Secondary Marketplace</h1>
                    <p className="text-gray-600">
                        Buy invoice NFTs from other investors for early exit or better yield
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Active Listings</p>
                        <p className="text-2xl font-bold">{listings.length}</p>
                    </div>
                    <div className="bg-white border rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Avg Discount</p>
                        <p className="text-2xl font-bold text-green-600">
                            {listings.length > 0
                                ? (
                                      listings.reduce(
                                          (sum, l) =>
                                              sum + parseFloat(calculateDiscount(l.faceValue, l.askingPrice)),
                                          0
                                      ) / listings.length
                                  ).toFixed(1)
                                : '0.0'}
                            %
                        </p>
                    </div>
                    <div className="bg-white border rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Avg Yield</p>
                        <p className="text-2xl font-bold text-purple-600">
                            {listings.length > 0
                                ? (
                                      listings.reduce(
                                          (sum, l) =>
                                              sum +
                                              parseFloat(
                                                  calculateYield(
                                                      l.faceValue,
                                                      l.askingPrice,
                                                      l.daysToMaturity
                                                  )
                                              ),
                                          0
                                      ) / listings.length
                                  ).toFixed(2)
                                : '0.00'}
                            % APR
                        </p>
                    </div>
                    <div className="bg-white border rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Total Volume</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {listings
                                .reduce((sum, l) => sum + parseFloat(formatEther(l.askingPrice)), 0)
                                .toFixed(2)}{' '}
                            AVAX
                        </p>
                    </div>
                </div>

                {/* Listings Grid */}
                {loading ? (
                    <div className="bg-white rounded-lg border p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading listings...</p>
                    </div>
                ) : listings.length === 0 ? (
                    <div className="bg-white rounded-lg border p-12 text-center">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400 mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                        <p className="font-semibold text-gray-900 mb-1">No listings yet</p>
                        <p className="text-sm text-gray-600">
                            Check back later or list your own invoice for sale
                        </p>
                        <Link
                            href="/portfolio"
                            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Go to Portfolio
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {listings.map((listing) => (
                            <div
                                key={listing.tokenId}
                                className="border rounded-lg p-6 space-y-4 bg-white hover:shadow-lg transition"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            Invoice #{listing.tokenId}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Face Value: {formatEther(listing.faceValue)} AVAX
                                        </p>
                                    </div>
                                    <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 font-semibold">
                                        {calculateDiscount(listing.faceValue, listing.askingPrice)}%
                                        OFF
                                    </span>
                                </div>

                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Asking Price</span>
                                        <span className="font-semibold">
                                            {formatEther(listing.askingPrice)} AVAX
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Implied Yield</span>
                                        <span className="text-lg font-bold text-green-600">
                                            {calculateYield(
                                                listing.faceValue,
                                                listing.askingPrice,
                                                listing.daysToMaturity
                                            )}
                                            % APR
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Days to Maturity</span>
                                        <span className="font-semibold">{listing.daysToMaturity} days</span>
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-3 rounded">
                                    <p className="text-xs text-gray-600 mb-1">Expected Return</p>
                                    <p className="text-lg font-bold text-blue-600">
                                        {formatEther(listing.faceValue)} AVAX
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Profit:{' '}
                                        {(
                                            parseFloat(formatEther(listing.faceValue)) -
                                            parseFloat(formatEther(listing.askingPrice))
                                        ).toFixed(2)}{' '}
                                        AVAX
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleBuy(listing.tokenId, listing.askingPrice)}
                                    disabled={!isConnected || isPending || buyingId === listing.tokenId}
                                    className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:opacity-50 font-semibold transition"
                                >
                                    {!isConnected
                                        ? 'Connect Wallet'
                                        : buyingId === listing.tokenId
                                        ? 'Buying...'
                                        : 'Buy Invoice'}
                                </button>

                                <div className="text-xs text-gray-500 text-center">
                                    Listed {new Date(listing.listedAt * 1000).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Info Panel */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-3">
                        Why Buy from Secondary Market?
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                        <li className="flex gap-2">
                            <span>💰</span>
                            <span>
                                <strong>Discounted Prices:</strong> Buy invoices below face value
                            </span>
                        </li>
                        <li className="flex gap-2">
                            <span>📈</span>
                            <span>
                                <strong>Higher Yields:</strong> Earn better returns than primary market
                            </span>
                        </li>
                        <li className="flex gap-2">
                            <span>⏱️</span>
                            <span>
                                <strong>Shorter Duration:</strong> Less time to maturity = faster returns
                            </span>
                        </li>
                        <li className="flex gap-2">
                            <span>🔒</span>
                            <span>
                                <strong>Same Security:</strong> Already funded invoices with proven track
                                record
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
