import { ethers } from "hardhat";
import addresses from "../frontend/lib/contracts/addresses.json";

async function main() {
  console.log("🧪 Testing mintInvoiceAndCreateFunding call...\n");

  const [signer] = await ethers.getSigners();
  console.log("Signer:", signer.address);

  const fundingPool = await ethers.getContractAt("FundingPool", addresses.fundingPool);
  const creditOracle = await ethers.getContractAt("ZKCreditOracle", addresses.creditOracle);

  // Test with dummy data
  const amount = ethers.parseEther("1"); // 1 AVAX
  const dueDate = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days
  const buyerName = "Test Buyer";
  const ipfsHash = ethers.encodeBytes32String("QmTest");
  const fundingDeadline = Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60; // 14 days
  const interestRate = 1800;
  const commitment = ethers.encodeBytes32String("test");
  const minThreshold = 300;

  // Dummy ZK proof (will fail but let's see what error we get)
  const proof_a: [bigint, bigint] = [0n, 0n];
  const proof_b: [[bigint, bigint], [bigint, bigint]] = [[0n, 0n], [0n, 0n]];
  const proof_c: [bigint, bigint] = [0n, 0n];
  const publicInputs: [bigint, bigint, bigint] = [0n, 0n, 0n];

  console.log("Parameters:");
  console.log("  Amount:", ethers.formatEther(amount), "AVAX");
  console.log("  Due date:", new Date(dueDate * 1000).toLocaleDateString());
  console.log("  Funding deadline:", new Date(fundingDeadline * 1000).toLocaleDateString());
  console.log();

  try {
    console.log("Attempting to call mintInvoiceAndCreateFunding...");

    // Try to estimate gas first to see the actual error
    const gasEstimate = await fundingPool.mintInvoiceAndCreateFunding.estimateGas(
      amount,
      dueDate,
      buyerName,
      ipfsHash,
      fundingDeadline,
      interestRate,
      commitment,
      proof_a,
      proof_b,
      proof_c,
      publicInputs,
      minThreshold
    );

    console.log("✅ Gas estimate succeeded:", gasEstimate.toString());
    console.log("This means the call would work!");

  } catch (error: any) {
    console.log("❌ Call would fail with error:");
    console.log(error.message);

    // Try to extract the revert reason
    if (error.data) {
      console.log("\nRevert data:", error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
