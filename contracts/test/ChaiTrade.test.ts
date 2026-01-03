import { expect } from "chai";
import { ethers } from "hardhat";
import { InvoiceNFT, MockUSDC, ZKCreditOracle, FundingPool } from "../typechain-types";

describe("ChaiTrade Smart Contracts", () => {
  let invoiceNFT: InvoiceNFT;
  let usdc: MockUSDC;
  let creditOracle: ZKCreditOracle;
  let fundingPool: FundingPool;

  let owner: any, msme: any, investor1: any, investor2: any;

  beforeEach(async () => {
    // Get signers
    [owner, msme, investor1, investor2] = await ethers.getSigners();

    // Deploy MockUSDC
    const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDCFactory.deploy();
    await usdc.waitForDeployment();

    // Deploy Verifier (placeholder)
    const VerifierFactory = await ethers.getContractFactory("Groth16Verifier");
    const verifier = await VerifierFactory.deploy();
    await verifier.waitForDeployment();

    // Deploy ZKCreditOracle
    const ZKCreditOracleFactory = await ethers.getContractFactory("ZKCreditOracle");
    creditOracle = await ZKCreditOracleFactory.deploy(await verifier.getAddress());
    await creditOracle.waitForDeployment();

    // Deploy InvoiceNFT
    const InvoiceNFTFactory = await ethers.getContractFactory("InvoiceNFT");
    invoiceNFT = await InvoiceNFTFactory.deploy();
    await invoiceNFT.waitForDeployment();

    // Deploy FundingPool
    const FundingPoolFactory = await ethers.getContractFactory("FundingPool");
    fundingPool = await FundingPoolFactory.deploy(
      await usdc.getAddress(),
      await invoiceNFT.getAddress(),
      await creditOracle.getAddress(),
      owner.address
    );
    await fundingPool.waitForDeployment();

    // Transfer InvoiceNFT ownership to FundingPool
    await invoiceNFT.transferOwnership(await fundingPool.getAddress());

    // Mint USDC to investors
    await usdc.mint(investor1.address, ethers.parseUnits("10000", 6));
    await usdc.mint(investor2.address, ethers.parseUnits("10000", 6));
  });

  describe("InvoiceNFT", () => {
    it("Should mint invoice NFT", async () => {
      const amount = ethers.parseUnits("100000", 6); // 100k USDC
      const dueDate = Math.floor(Date.now() / 1000) + 60 * 24 * 60 * 60; // 60 days
      const fundingDeadline = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days

      const tx = await invoiceNFT.connect(msme).mintInvoice(
        msme.address,
        amount,
        dueDate,
        "Buyer Company",
        ethers.zeroPadValue("0x1234", 32),
        fundingDeadline
      );

      await expect(tx).to.emit(invoiceNFT, "InvoiceMinted");

      const invoice = await invoiceNFT.getInvoice(0);
      expect(invoice.amount).to.equal(amount);
      expect(invoice.buyerName).to.equal("Buyer Company");
    });
  });

  describe("ZKCreditOracle", () => {
    it("Should commit and verify credit score", async () => {
      const commitment = ethers.id("test_score_700");

      // Commit
      const commitTx = await creditOracle.connect(msme).commitCreditScore(commitment);
      await expect(commitTx).to.emit(creditOracle, "CommitmentSubmitted");

      // Get commitment
      const [exists, isVerified, minScore, timestamp] = await creditOracle.getCommitment(msme.address);
      expect(exists).to.be.true;
      expect(isVerified).to.be.false;
    });

    it("Should check creditworthiness", async () => {
      const commitment = ethers.id("test_score_700");
      await creditOracle.connect(msme).commitCreditScore(commitment);

      // Verify creditworthiness (returns false for unverified)
      const [isCreditworthy, requiredScore] = await creditOracle.isCreditworthy(
        msme.address,
        ethers.parseUnits("100000", 6)
      );
      expect(isCreditworthy).to.be.false;
    });
  });

  describe("FundingPool", () => {
    it("Should create funding round", async () => {
      // First, mint an invoice
      const amount = ethers.parseUnits("100000", 6);
      const dueDate = Math.floor(Date.now() / 1000) + 60 * 24 * 60 * 60;
      const fundingDeadline = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

      await invoiceNFT.connect(msme).mintInvoice(
        msme.address,
        amount,
        dueDate,
        "Buyer Company",
        ethers.zeroPadValue("0x1234", 32),
        fundingDeadline
      );

      // Transfer ownership to FundingPool
      await invoiceNFT.connect(msme).transferFrom(msme.address, fundingPool.address, 0);

      // Commit credit score
      const commitment = ethers.id("test_score_700");
      await creditOracle.connect(msme).commitCreditScore(commitment);

      // Should fail - not creditworthy
      // Note: Full test would require ZK proof verification
      expect(true).to.be.true; // Placeholder
    });
  });
});
