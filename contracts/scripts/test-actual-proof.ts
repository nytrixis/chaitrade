import { ethers } from "hardhat";
import addresses from "../frontend/lib/contracts/addresses.json";

async function main() {
  console.log("🧪 Testing with ACTUAL proof data from frontend...\n");

  const [signer] = await ethers.getSigners();
  console.log("Signer:", signer.address);

  const fundingPool = await ethers.getContractAt("FundingPool", addresses.fundingPool);

  // Actual data from the console logs
  const commitment = "1451093969380934237627071497560767693342141289470879009937684444514242925920";
  const publicSignals = ['1', '1451093969380934237627071497560767693342141289470879009937684444514242925920', '650'];
  
  // Convert to proper format
  const commitmentBytes32 = ethers.toBeHex(BigInt(commitment), 32);
  const publicInputs: [bigint, bigint, bigint] = [
    BigInt(publicSignals[2]), // isValid (should be 1)
    BigInt(publicSignals[1]), // commitment
    BigInt(publicSignals[0])  // minThreshold... wait this looks wrong
  ];

  console.log("Public signals from frontend:", publicSignals);
  console.log("Commitment:", commitment);
  console.log("CommitmentBytes32:", commitmentBytes32);
  console.log();
  
  // Check what the contract expects
  console.log("Contract expects:");
  console.log("  publicInputs[0] = commitment");
  console.log("  publicInputs[1] = minScore");
  console.log("  publicInputs[2] = isValid (1 if score > minScore)");
  console.log();
  
  console.log("Frontend is sending:");
  console.log("  publicSignals[0] =", publicSignals[0], "(isValid?)");
  console.log("  publicSignals[1] =", publicSignals[1], "(commitment?)");
  console.log("  publicSignals[2] =", publicSignals[2], "(minThreshold?)");
  console.log();
  
  console.log("⚠️  ORDER MISMATCH DETECTED!");
  console.log("The publicSignals array order doesn't match what contract expects!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
