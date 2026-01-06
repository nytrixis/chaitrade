// Run this to verify contract addresses are loaded correctly
// Usage: node verify-contracts.js

require('dotenv').config({ path: '.env.local' });

console.log('\n🔍 Verifying Contract Addresses...\n');

const addresses = {
  'FundingPool': process.env.NEXT_PUBLIC_FUNDING_POOL_ADDRESS,
  'InvoiceNFT': process.env.NEXT_PUBLIC_INVOICE_NFT_ADDRESS,
  'ZKCreditOracle': process.env.NEXT_PUBLIC_CREDIT_ORACLE_ADDRESS,
  'Verifier': process.env.NEXT_PUBLIC_VERIFIER_ADDRESS,
};

const expectedV4 = {
  'FundingPool': '0x0792041ADC2D45C404170D0180835F8ca37aC3E8',
  'InvoiceNFT': '0xd0f0Ec621494E0c1185A7541B632c5Acc5036aaB',
  'ZKCreditOracle': '0x504a083FA4fC289364fb940d7193b7155e733501',
  'Verifier': '0xDa31dE4C30ce6370e664e8d487c30F17B384EA9a',
};

let allCorrect = true;

for (const [name, address] of Object.entries(addresses)) {
  const expected = expectedV4[name];
  const isCorrect = address?.toLowerCase() === expected.toLowerCase();

  console.log(`${isCorrect ? '✅' : '❌'} ${name}`);
  console.log(`   Loaded:   ${address || 'MISSING'}`);
  console.log(`   Expected: ${expected}`);
  console.log();

  if (!isCorrect) allCorrect = false;
}

if (allCorrect) {
  console.log('🎉 All contract addresses are correct (v4)!\n');
  console.log('If your app still has issues:');
  console.log('1. Kill dev server (Ctrl+C)');
  console.log('2. rm -rf .next');
  console.log('3. npm run dev\n');
} else {
  console.log('❌ Contract addresses are WRONG!\n');
  console.log('Fix:');
  console.log('1. Check .env.local has v4 addresses');
  console.log('2. Restart dev server');
  console.log('3. Run this script again\n');
}
