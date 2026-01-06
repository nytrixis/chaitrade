import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * ChaiTrade v2 Deployment - Uses native AVAX instead of USDC
 * Run with: npx hardhat run scripts/deploy-avax.ts --network fuji
 */
async function main() {
  console.log("🚀 Deploying ChaiTrade v2 (AVAX native) to Avalanche Fuji...\n");

  const [deployer] = await ethers.getSigners();
  console.log(`📍 Deployer: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} AVAX\n`);

  if (balance < ethers.parseEther("0.5")) {
    console.log("⚠️  Low balance! Get AVAX from https://faucet.avax.network/\n");
  }

  // 1. Deploy Groth16 Verifier
  console.log("1️⃣  Deploying Groth16Verifier...");
  const Verifier = await ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log(`   ✅ Groth16Verifier: ${verifierAddress}\n`);

  // 2. Deploy ZKCreditOracle
  console.log("2️⃣  Deploying ZKCreditOracle...");
  const ZKCreditOracle = await ethers.getContractFactory("ZKCreditOracle");
  const creditOracle = await ZKCreditOracle.deploy(verifierAddress);
  await creditOracle.waitForDeployment();
  const creditOracleAddress = await creditOracle.getAddress();
  console.log(`   ✅ ZKCreditOracle: ${creditOracleAddress}\n`);

  // 3. Deploy InvoiceNFT
  console.log("3️⃣  Deploying InvoiceNFT...");
  const InvoiceNFT = await ethers.getContractFactory("InvoiceNFT");
  const invoiceNFT = await InvoiceNFT.deploy();
  await invoiceNFT.waitForDeployment();
  const invoiceNFTAddress = await invoiceNFT.getAddress();
  console.log(`   ✅ InvoiceNFT: ${invoiceNFTAddress}\n`);

  // 4. Deploy FundingPool (native AVAX version)
  console.log("4️⃣  Deploying FundingPool (AVAX native)...");
  const FundingPool = await ethers.getContractFactory("FundingPool");
  const fundingPool = await FundingPool.deploy(
    invoiceNFTAddress,
    creditOracleAddress,
    deployer.address // Fee collector
  );
  await fundingPool.waitForDeployment();
  const fundingPoolAddress = await fundingPool.getAddress();
  console.log(`   ✅ FundingPool: ${fundingPoolAddress}\n`);

  // 5. Grant permissions - InvoiceNFT ownership to FundingPool
  console.log("5️⃣  Setting up permissions...");
  const tx = await invoiceNFT.transferOwnership(fundingPoolAddress);
  await tx.wait();
  console.log("   ✅ InvoiceNFT ownership → FundingPool\n");

  // 6. Save addresses
  const addresses = {
    network: "fuji",
    chainId: 43113,
    deployer: deployer.address,
    verifier: verifierAddress,
    creditOracle: creditOracleAddress,
    invoiceNFT: invoiceNFTAddress,
    fundingPool: fundingPoolAddress,
    timestamp: new Date().toISOString(),
    version: "v2-avax-native",
  };

  // Save to contracts/frontend/lib/contracts
  const outputDir = path.join(__dirname, "../frontend/lib/contracts");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(outputDir, "addresses.json"),
    JSON.stringify(addresses, null, 2)
  );

  // Also output .env format for easy copy-paste
  console.log("=".repeat(60));
  console.log("✅ DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 Update your frontend/.env.local with:\n");
  console.log(`NEXT_PUBLIC_VERIFIER_ADDRESS=${verifierAddress}`);
  console.log(`NEXT_PUBLIC_CREDIT_ORACLE_ADDRESS=${creditOracleAddress}`);
  console.log(`NEXT_PUBLIC_INVOICE_NFT_ADDRESS=${invoiceNFTAddress}`);
  console.log(`NEXT_PUBLIC_FUNDING_POOL_ADDRESS=${fundingPoolAddress}`);
  console.log("\n🎯 Next steps:");
  console.log("   1. Copy the addresses above to frontend/.env.local");
  console.log("   2. Restart your frontend server (npm run dev)");
  console.log("   3. Test upload + invest flow");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
