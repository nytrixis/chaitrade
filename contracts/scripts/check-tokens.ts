import { ethers } from "hardhat";
import addresses from "../frontend/lib/contracts/addresses.json";

async function main() {
  console.log("🔍 Checking InvoiceNFT token state...\n");

  const invoiceNFT = await ethers.getContractAt("InvoiceNFT", addresses.invoiceNFT);

  console.log("Contract Address:", addresses.invoiceNFT);
  console.log("Network:", addresses.network, "Chain ID:", addresses.chainId);
  console.log();

  // Check ownership
  const owner = await invoiceNFT.owner();
  console.log("Contract Owner:", owner);
  console.log("Expected (FundingPool):", addresses.fundingPool);
  console.log("Owner Matches:", owner.toLowerCase() === addresses.fundingPool.toLowerCase());
  console.log();

  // Try to find all minted tokens
  console.log("Querying tokens 0-20...");
  const tokens: any[] = [];

  for (let i = 0; i < 20; i++) {
    try {
      const owner = await invoiceNFT.ownerOf(i);
      const invoice = await invoiceNFT.getInvoice(i);
      tokens.push({
        tokenId: i,
        owner,
        amount: ethers.formatEther(invoice.amount),
        buyerName: invoice.buyerName,
        status: invoice.status
      });
      console.log(`  Token ${i}: Owner=${owner.slice(0,8)}... Amount=${ethers.formatEther(invoice.amount)} AVAX`);
    } catch (err: any) {
      if (!err.message.includes("Invoice does not exist")) {
        console.log(`  Token ${i}: Error -`, err.message.split('\n')[0]);
      }
    }
  }

  console.log();
  console.log("✅ Total tokens found:", tokens.length);
  console.log();
  console.log("Token Details:");
  console.table(tokens);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
