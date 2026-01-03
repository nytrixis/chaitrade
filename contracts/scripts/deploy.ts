import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Deploying ChaiTrade contracts to Avalanche Fuji...\n");

  // 1. Deploy mock USDC (for testnet only)
  console.log("1️⃣  Deploying MockUSDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log(`   ✅ MockUSDC deployed to: ${usdcAddress}\n`);

  // 2. Deploy Groth16 Verifier (placeholder for MVP)
  console.log("2️⃣  Deploying Groth16Verifier...");
  const Verifier = await ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log(`   ✅ Groth16Verifier deployed to: ${verifierAddress}\n`);

  // 3. Deploy ZKCreditOracle
  console.log("3️⃣  Deploying ZKCreditOracle...");
  const ZKCreditOracle = await ethers.getContractFactory("ZKCreditOracle");
  const creditOracle = await ZKCreditOracle.deploy(verifierAddress);
  await creditOracle.waitForDeployment();
  const creditOracleAddress = await creditOracle.getAddress();
  console.log(`   ✅ ZKCreditOracle deployed to: ${creditOracleAddress}\n`);

  // 4. Deploy InvoiceNFT
  console.log("4️⃣  Deploying InvoiceNFT...");
  const InvoiceNFT = await ethers.getContractFactory("InvoiceNFT");
  const invoiceNFT = await InvoiceNFT.deploy();
  await invoiceNFT.waitForDeployment();
  const invoiceNFTAddress = await invoiceNFT.getAddress();
  console.log(`   ✅ InvoiceNFT deployed to: ${invoiceNFTAddress}\n`);

  // 5. Deploy FundingPool
  console.log("5️⃣  Deploying FundingPool...");
  const [deployer] = await ethers.getSigners();
  const FundingPool = await ethers.getContractFactory("FundingPool");
  const fundingPool = await FundingPool.deploy(
    usdcAddress,
    invoiceNFTAddress,
    creditOracleAddress,
    deployer.address // Fee collector (change for production)
  );
  await fundingPool.waitForDeployment();
  const fundingPoolAddress = await fundingPool.getAddress();
  console.log(`   ✅ FundingPool deployed to: ${fundingPoolAddress}\n`);

  // 6. Grant permissions
  console.log("6️⃣  Setting up permissions...");
  const tx = await invoiceNFT.transferOwnership(fundingPoolAddress);
  await tx.wait();
  console.log("   ✅ InvoiceNFT ownership transferred to FundingPool\n");

  // 7. Save addresses to file
  const addresses = {
    network: "fuji",
    chainId: 43113,
    deployer: deployer.address,
    usdc: usdcAddress,
    verifier: verifierAddress,
    creditOracle: creditOracleAddress,
    invoiceNFT: invoiceNFTAddress,
    fundingPool: fundingPoolAddress,
    timestamp: new Date().toISOString(),
  };

  const outputDir = path.join(__dirname, "../frontend/lib/contracts");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, "addresses.json"),
    JSON.stringify(addresses, null, 2)
  );

  console.log("📝 Contract addresses saved to frontend/lib/contracts/addresses.json\n");
  console.log("=".repeat(60));
  console.log("✅ DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 Summary:");
  console.log(`   Network: Avalanche Fuji Testnet (43113)`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   USDC: ${usdcAddress}`);
  console.log(`   Verifier: ${verifierAddress}`);
  console.log(`   ZKCreditOracle: ${creditOracleAddress}`);
  console.log(`   InvoiceNFT: ${invoiceNFTAddress}`);
  console.log(`   FundingPool: ${fundingPoolAddress}`);
  console.log("\n🎯 Next steps:");
  console.log("   1. Verify contracts on Snowtrace:");
  console.log(`      npx hardhat verify --network fuji ${fundingPoolAddress} ${usdcAddress} ${invoiceNFTAddress} ${creditOracleAddress} ${deployer.address}`);
  console.log("   2. Fund test wallets with USDC:");
  console.log(`      Call MockUSDC.faucet() from frontend`);
  console.log("   3. Deploy frontend with contract addresses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
