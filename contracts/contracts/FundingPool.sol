// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./InvoiceNFT.sol";
import "./ZKCreditOracle.sol";

/**
 * @title FundingPool
 * @dev Manages community funding for invoices using native AVAX
 *
 * Flow:
 * 1. MSME lists invoice (must have ZK proof of creditworthiness)
 * 2. Investors fund invoice (AVAX deposits)
 * 3. When target reached (80% of invoice amount):
 *    - 80% → MSME immediately
 *    - 20% → Escrow (released when buyer pays)
 * 4. On payment: Interest + principal → Investors (proportional)
 */
contract FundingPool is ReentrancyGuard {
    InvoiceNFT public immutable invoiceNFT;
    ZKCreditOracle public immutable creditOracle;

    struct FundingRound {
        uint256 invoiceId;
        uint256 targetAmount;     // 80% of invoice value
        uint256 raisedAmount;
        uint256 interestRate;     // Basis points (e.g., 1800 = 18%)
        uint256 deadline;
        bool isActive;
        bool isSettled;
        address[] investors;
        mapping(address => uint256) investments;
    }

    struct Settlement {
        uint256 principalPaid;
        uint256 interestPaid;
        uint256 timestamp;
    }

    mapping(uint256 => FundingRound) public fundingRounds;
    mapping(uint256 => Settlement) public settlements;

    // Platform fee (in basis points, e.g., 500 = 5%)
    uint256 public platformFee = 500;
    address public feeCollector;

    // Events
    event FundingRoundCreated(
        uint256 indexed invoiceId,
        uint256 targetAmount,
        uint256 interestRate,
        uint256 deadline
    );

    event InvestmentMade(
        uint256 indexed invoiceId,
        address indexed investor,
        uint256 amount
    );

    event FundingCompleted(uint256 indexed invoiceId, uint256 totalRaised);

    event InvoiceSettled(
        uint256 indexed invoiceId,
        uint256 principalPaid,
        uint256 interestPaid
    );

    constructor(
        address _invoiceNFT,
        address _creditOracle,
        address _feeCollector
    ) {
        invoiceNFT = InvoiceNFT(_invoiceNFT);
        creditOracle = ZKCreditOracle(_creditOracle);
        feeCollector = _feeCollector;
    }

    /**
     * @dev SINGLE-TX INVOICE CREATION - Reduces 4 confirmations to 1!
     * Combines: commit credit → verify proof → mint NFT → create funding
     * This is the main function MSMEs should use for uploading invoices
     */
    function mintInvoiceAndCreateFunding(
        // Invoice params
        uint256 amount,
        uint256 dueDate,
        string memory buyerName,
        bytes32 ipfsHash,
        uint256 fundingDeadline,
        uint256 interestRate,
        // ZK proof params
        bytes32 creditCommitment,
        uint256[2] memory proof_a,
        uint256[2][2] memory proof_b,
        uint256[2] memory proof_c,
        uint256[3] memory publicInputs,
        uint256 minThreshold
    ) external nonReentrant returns (uint256 invoiceId) {
        // Step 1: Commit and verify credit score for the MSME (msg.sender)
        creditOracle.commitCreditScoreFor(msg.sender, creditCommitment);
        creditOracle.verifyScoreProofFor(msg.sender, proof_a, proof_b, proof_c, publicInputs, minThreshold);

        // Step 2: Mint invoice NFT
        invoiceId = invoiceNFT.mintInvoice(
            msg.sender,
            amount,
            dueDate,
            buyerName,
            ipfsHash,
            fundingDeadline
        );

        // Step 3: Create funding round
        uint256 targetAmount = amount * 80 / 100; // 80% of invoice

        FundingRound storage round = fundingRounds[invoiceId];
        round.invoiceId = invoiceId;
        round.targetAmount = targetAmount;
        round.raisedAmount = 0;
        round.interestRate = interestRate;
        round.deadline = fundingDeadline;
        round.isActive = true;
        round.isSettled = false;

        // Step 4: Update invoice status to Funding
        invoiceNFT.updateStatus(invoiceId, InvoiceNFT.InvoiceStatus.Funding);

        emit FundingRoundCreated(invoiceId, targetAmount, interestRate, fundingDeadline);
    }

    /**
     * @dev Create funding round for invoice
     * @param invoiceId Invoice NFT token ID
     * @param interestRate Annual interest rate in basis points
     */
    function createFundingRound(
        uint256 invoiceId,
        uint256 interestRate
    ) external nonReentrant {
        // Verify caller owns the invoice NFT
        require(invoiceNFT.ownerOf(invoiceId) == msg.sender, "Not invoice owner");

        // Get invoice details
        InvoiceNFT.InvoiceMetadata memory invoice = invoiceNFT.getInvoice(invoiceId);
        require(invoice.status == InvoiceNFT.InvoiceStatus.Listed, "Invalid status");

        // Verify creditworthiness via ZK oracle
        (bool isCreditworthy, uint256 requiredScore) =
            creditOracle.isCreditworthy(msg.sender, invoice.amount);
        require(isCreditworthy,
                string(abi.encodePacked(
                    "Not creditworthy. Need score > ",
                    Strings.toString(requiredScore)
                )));

        // Calculate target amount (80% of invoice)
        uint256 targetAmount = invoice.amount * 80 / 100;

        // Create funding round
        FundingRound storage round = fundingRounds[invoiceId];
        round.invoiceId = invoiceId;
        round.targetAmount = targetAmount;
        round.raisedAmount = 0;
        round.interestRate = interestRate;
        round.deadline = invoice.fundingDeadline;
        round.isActive = true;
        round.isSettled = false;

        // Update invoice status
        invoiceNFT.updateStatus(invoiceId, InvoiceNFT.InvoiceStatus.Funding);

        emit FundingRoundCreated(invoiceId, targetAmount, interestRate, round.deadline);
    }

    /**
     * @dev Invest in invoice funding round using native AVAX
     * @param invoiceId Invoice to fund
     */
    function invest(uint256 invoiceId)
        external
        payable
        nonReentrant
    {
        FundingRound storage round = fundingRounds[invoiceId];
        require(round.isActive, "Round not active");
        require(block.timestamp < round.deadline, "Deadline passed");
        require(msg.value > 0, "Amount must be > 0");
        require(round.raisedAmount + msg.value <= round.targetAmount,
                "Exceeds target");

        // Record investment
        if (round.investments[msg.sender] == 0) {
            round.investors.push(msg.sender);
        }
        round.investments[msg.sender] += msg.value;
        round.raisedAmount += msg.value;

        // Update invoice funded amount
        invoiceNFT.updateFundedAmount(invoiceId, msg.value);

        emit InvestmentMade(invoiceId, msg.sender, msg.value);

        // Check if target reached
        if (round.raisedAmount >= round.targetAmount) {
            _completeFunding(invoiceId, round);
        }
    }

    /**
     * @dev Internal function to complete funding round
     */
    function _completeFunding(uint256 invoiceId, FundingRound storage round) internal {
        round.isActive = false;

        // Get MSME (invoice owner)
        address msme = invoiceNFT.ownerOf(invoiceId);

        // Get invoice amount
        InvoiceNFT.InvoiceMetadata memory invoice = invoiceNFT.getInvoice(invoiceId);

        // Send 80% to MSME immediately (in AVAX)
        uint256 msmeAmount = invoice.amount * 80 / 100;
        (bool success, ) = payable(msme).call{value: msmeAmount}("");
        require(success, "Transfer to MSME failed");

        // 20% stays in escrow (released on payment)

        // Update invoice status
        invoiceNFT.updateStatus(invoiceId, InvoiceNFT.InvoiceStatus.Funded);

        emit FundingCompleted(invoiceId, round.raisedAmount);
    }

    /**
     * @dev Settle invoice when payment received
     * Distributes principal + interest to investors proportionally
     * MSME must send AVAX with this call to cover the returns
     * @param invoiceId Invoice ID
     */
    function settleInvoice(uint256 invoiceId)
        external
        payable
        nonReentrant
    {
        // Only MSME can call this
        require(invoiceNFT.ownerOf(invoiceId) == msg.sender, "Not invoice owner");

        FundingRound storage round = fundingRounds[invoiceId];
        require(!round.isSettled, "Already settled");
        require(round.raisedAmount > 0, "No investments");

        // Calculate interest based on time held
        InvoiceNFT.InvoiceMetadata memory invoice = invoiceNFT.getInvoice(invoiceId);
        uint256 daysHeld = (block.timestamp - (invoice.fundingDeadline - 60 days)) / 1 days;
        if (daysHeld > 365) daysHeld = 365; // Cap at 1 year
        uint256 interestAmount = (round.raisedAmount * round.interestRate * daysHeld) / (10000 * 365);

        // Platform fee from interest
        uint256 fee = (interestAmount * platformFee) / 10000;

        // Total needed: principal + interest
        uint256 totalNeeded = round.raisedAmount + interestAmount;
        require(msg.value >= totalNeeded, "Insufficient payment");

        // Distribute to investors proportionally
        address[] memory investors = round.investors;
        for (uint256 i = 0; i < investors.length; i++) {
            address investor = investors[i];
            uint256 investorShare = round.investments[investor];
            uint256 proportion = (investorShare * 1e18) / round.raisedAmount;

            // Principal + proportional interest
            uint256 investorPrincipal = (round.raisedAmount * proportion) / 1e18;
            uint256 investorInterest = (interestAmount * proportion) / 1e18;
            uint256 investorReturn = investorPrincipal + investorInterest;

            (bool success, ) = payable(investor).call{value: investorReturn}("");
            require(success, "Transfer to investor failed");
        }

        // Send fee to fee collector
        if (fee > 0) {
            (bool feeSuccess, ) = payable(feeCollector).call{value: fee}("");
            require(feeSuccess, "Fee transfer failed");
        }

        // Update settlement
        round.isSettled = true;
        settlements[invoiceId] = Settlement({
            principalPaid: round.raisedAmount,
            interestPaid: interestAmount,
            timestamp: block.timestamp
        });

        // Update invoice status
        invoiceNFT.updateStatus(invoiceId, InvoiceNFT.InvoiceStatus.Paid);

        emit InvoiceSettled(invoiceId, round.raisedAmount, interestAmount);

        // Refund excess payment
        if (msg.value > totalNeeded) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - totalNeeded}("");
            require(refundSuccess, "Refund failed");
        }
    }

    /**
     * @dev Get investors in funding round
     */
    function getInvestors(uint256 invoiceId)
        external
        view
        returns (address[] memory)
    {
        return fundingRounds[invoiceId].investors;
    }

    /**
     * @dev Get investor's investment amount
     */
    function getInvestmentAmount(uint256 invoiceId, address investor)
        external
        view
        returns (uint256)
    {
        return fundingRounds[invoiceId].investments[investor];
    }

    /**
     * @dev Get complete funding information for an invoice
     */
    function getFundingInfo(uint256 invoiceId)
        external
        view
        returns (
            uint256 targetAmount,
            uint256 raisedAmount,
            uint256 interestRate,
            uint256 deadline,
            bool isActive,
            bool isSettled,
            uint256 investorCount
        )
    {
        FundingRound storage round = fundingRounds[invoiceId];
        return (
            round.targetAmount,
            round.raisedAmount,
            round.interestRate,
            round.deadline,
            round.isActive,
            round.isSettled,
            round.investors.length
        );
    }

    /**
     * @dev Get funding progress percentage (0-100)
     */
    function getFundingProgress(uint256 invoiceId)
        external
        view
        returns (uint256 percentage)
    {
        FundingRound storage round = fundingRounds[invoiceId];
        if (round.targetAmount == 0) return 0;
        percentage = (round.raisedAmount * 100) / round.targetAmount;
        if (percentage > 100) percentage = 100;
    }

    /**
     * @dev Set platform fee
     */
    function setPlatformFee(uint256 newFee) external {
        require(msg.sender == feeCollector, "Not fee collector");
        require(newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = newFee;
    }

    /**
     * @dev Allow contract to receive AVAX
     */
    receive() external payable {}
}
