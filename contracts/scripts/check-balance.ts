import { ethers } from "hardhat";

async function main() {
  // Change this address to check any wallet
  const ADDRESS = process.env.CHECK_ADDRESS || "0xfF01A2491F19A0342f6B6b490D9ffDE0320306A1";
  
  const balance = await ethers.provider.getBalance(ADDRESS);
  
  console.log("=".repeat(50));
  console.log("🔍 Avalanche Fuji Balance Checker");
  console.log("=".repeat(50));
  console.log(`Address: ${ADDRESS}`);
  console.log(`Balance: ${ethers.formatEther(balance)} AVAX`);
  console.log("=".repeat(50));
  console.log("\n💡 To check a different address, run:");
  console.log(`   CHECK_ADDRESS=0xYourAddress npx hardhat run scripts/check-balance.ts --network fuji`);
}

main().catch(console.error);
