import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    console.log("🚀 Deploying InvoiceMarketplace...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "AVAX\n");

    // Deploy InvoiceMarketplace
    console.log("📄 Deploying InvoiceMarketplace contract...");
    const InvoiceMarketplace = await ethers.getContractFactory("InvoiceMarketplace");
    const marketplace = await InvoiceMarketplace.deploy();
    await marketplace.waitForDeployment();

    const marketplaceAddress = await marketplace.getAddress();
    console.log("✅ InvoiceMarketplace deployed to:", marketplaceAddress);
    console.log();

    // Save deployment info
    const deploymentInfo = {
        network: "avalanche-fuji",
        invoiceMarketplace: marketplaceAddress,
        deployer: deployer.address,
        deployedAt: new Date().toISOString(),
        blockNumber: await ethers.provider.getBlockNumber(),
    };

    // Save to contracts directory
    const contractsOutputPath = path.join(__dirname, "../deployment-info-marketplace.json");
    fs.writeFileSync(contractsOutputPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("📝 Deployment info saved to:", contractsOutputPath);

    // Save to frontend directory
    try {
        const frontendOutputPath = path.join(
            __dirname,
            "../../frontend/lib/contracts/marketplace.json"
        );
        fs.mkdirSync(path.dirname(frontendOutputPath), { recursive: true });
        fs.writeFileSync(frontendOutputPath, JSON.stringify(deploymentInfo, null, 2));
        console.log("📝 Deployment info saved to:", frontendOutputPath);
    } catch (error) {
        console.log("⚠️  Could not save to frontend directory");
    }

    console.log();
    console.log("=".repeat(60));
    console.log("🎉 DEPLOYMENT COMPLETE");
    console.log("=".repeat(60));
    console.log();
    console.log("📋 Next Steps:");
    console.log("1. Update .env with: MARKETPLACE_ADDRESS=" + marketplaceAddress);
    console.log("2. Verify contract on Snowtrace:");
    console.log("   npx hardhat verify --network fuji", marketplaceAddress);
    console.log("3. Update frontend with marketplace address");
    console.log();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:");
        console.error(error);
        process.exitCode = 1;
    });
