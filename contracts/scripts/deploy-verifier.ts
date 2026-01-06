import { ethers } from "hardhat";

/**
 * Deploy only the Groth16Verifier contract
 * This replaces the placeholder verifier with the real one generated from our circuit
 */
async function main() {
  console.log("🚀 Deploying Groth16Verifier to Avalanche Fuji...\n");

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${ethers.formatEther(balance)} AVAX\n`);

  // Deploy Groth16 Verifier
  console.log("Deploying Groth16Verifier...");
  const Verifier = await ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();

  console.log(`✅ Groth16Verifier deployed to: ${verifierAddress}\n`);
  console.log("=".repeat(60));
  console.log("✅ DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 Next steps:");
  console.log("   1. Update ZKCreditOracle to use this verifier address");
  console.log("   2. Add this address to frontend/.env.local:");
  console.log(`      NEXT_PUBLIC_VERIFIER_ADDRESS=${verifierAddress}`);
  console.log("   3. Verify contract on Snowtrace:");
  console.log(`      npx hardhat verify --network fuji ${verifierAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
