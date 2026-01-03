/**
 * Contract addresses and ABIs for ChaiTrade
 */

// Default addresses (populate from deployment)
export const CONTRACT_ADDRESSES = {
  USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x',
  InvoiceNFT: process.env.NEXT_PUBLIC_INVOICE_NFT_ADDRESS || '0x',
  ZKCreditOracle: process.env.NEXT_PUBLIC_CREDIT_ORACLE_ADDRESS || '0x',
  FundingPool: process.env.NEXT_PUBLIC_FUNDING_POOL_ADDRESS || '0x',
};

// Mock ABI for development (full ABIs generated from Hardhat)
export const INVOICENFT_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'dueDate', type: 'uint256' },
      { name: 'buyerName', type: 'string' },
      { name: 'ipfsCID', type: 'bytes32' },
      { name: 'fundingDeadline', type: 'uint256' },
    ],
    name: 'mintInvoice',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getInvoice',
    outputs: [
      {
        components: [
          { name: 'amount', type: 'uint256' },
          { name: 'dueDate', type: 'uint256' },
          { name: 'buyer', type: 'address' },
          { name: 'buyerName', type: 'string' },
          { name: 'ipfsCID', type: 'bytes32' },
          { name: 'status', type: 'uint8' },
          { name: 'fundedAmount', type: 'uint256' },
          { name: 'fundingDeadline', type: 'uint256' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export const FUNDINGPOOL_ABI = [
  {
    inputs: [
      { name: 'invoiceId', type: 'uint256' },
      { name: 'interestRate', type: 'uint256' },
    ],
    name: 'createFundingRound',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'invoiceId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'invest',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'invoiceId', type: 'uint256' },
      { name: 'amountReceived', type: 'uint256' },
    ],
    name: 'settleInvoice',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export const ZKCREDITOACLE_ABI = [
  {
    inputs: [{ name: 'commitment', type: 'bytes32' }],
    name: 'commitCreditScore',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'msme', type: 'address' }],
    name: 'getCommitment',
    outputs: [
      { name: 'exists', type: 'bool' },
      { name: 'isVerified', type: 'bool' },
      { name: 'minScoreProven', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'msme', type: 'address' },
      { name: 'requestedAmount', type: 'uint256' },
    ],
    name: 'isCreditworthy',
    outputs: [
      { name: '', type: 'bool' },
      { name: '', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export const USDC_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];
