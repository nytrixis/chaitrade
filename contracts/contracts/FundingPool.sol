// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./InvoiceNFT.sol";
import "./ZKCreditOracle.sol";

/**
 * @title FundingPool
 * @dev Manages community funding for invoices
 *
 * Flow:
 * 1. MSME lists invoice (must have ZK proof of creditworthiness)
 * 2. Investors fund invoice (USDC deposits)
 * 3. When target reached (80% of invoice amount):
 *    - 80% → MSME immediately
 *    - 20% → Escrow (released when buyer pays)
 * 4. On payment: Interest + principal → Investors (proportional)
 */
contract FundingPool is ReentrancyGuard {
    IERC20 public immutable usdc;
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
        address _usdc,
        address _invoiceNFT,
        address _creditOracle,
        address _feeCollector
    ) {
        usdc = IERC20(_usdc);
        invoiceNFT = InvoiceNFT(_invoiceNFT);
        creditOracle = ZKCreditOracle(_creditOracle);
        feeCollector = _feeCollector;
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
     * @dev Invest in invoice funding round
     * @param invoiceId Invoice to fund
     * @param amount USDC amount (6 decimals)
     */
    function invest(uint256 invoiceId, uint256 amount)
        external
        nonReentrant
    {
        FundingRound storage round = fundingRounds[invoiceId];
        require(round.isActive, "Round not active");
        require(block.timestamp < round.deadline, "Deadline passed");
        require(amount > 0, "Amount must be > 0");
        require(round.raisedAmount + amount <= round.targetAmount,
                "Exceeds target");

        // Transfer USDC from investor
        require(usdc.transferFrom(msg.sender, address(this), amount),
                "Transfer failed");

        // Record investment
        if (round.investments[msg.sender] == 0) {
            round.investors.push(msg.sender);
        }
        round.investments[msg.sender] += amount;
        round.raisedAmount += amount;

        // Update invoice funded amount
        invoiceNFT.updateFundedAmount(invoiceId, amount);

        emit InvestmentMade(invoiceId, msg.sender, amount);

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

        // Send 80% to MSME immediately
        uint256 msmeAmount = invoice.amount * 80 / 100;
        require(usdc.transfer(msme, msmeAmount), "Transfer to MSME failed");

        // 20% stays in escrow (released on payment)

        // Update invoice status
        invoiceNFT.updateStatus(invoiceId, InvoiceNFT.InvoiceStatus.Funded);

        emit FundingCompleted(invoiceId, round.raisedAmount);
    }

    /**
     * @dev Settle invoice when payment received
     * Distributes principal + interest to investors proportionally
     * @param invoiceId Invoice ID
     * @param amountReceived Total amount received from buyer
     */
    function settleInvoice(uint256 invoiceId, uint256 amountReceived)
        external
        nonReentrant
    {
        // Only MSME can call this
        require(invoiceNFT.ownerOf(invoiceId) == msg.sender, "Not invoice owner");

        FundingRound storage round = fundingRounds[invoiceId];
        require(!round.isSettled, "Already settled");
        require(round.raisedAmount > 0, "No investments");

        // Calculate interest based on time held
        InvoiceNFT.InvoiceMetadata memory invoice = invoiceNFT.getInvoice(invoiceId);
        uint256 daysMissing = (block.timestamp - (invoice.fundingDeadline - 60 days)) / 1 days;
        uint256 interestAmount = (round.targetAmount * round.interestRate / 10000 * daysMissing) / 365;

        // Platform fee
        uint256 fee = (round.raisedAmount * platformFee) / 10000;

        // Distribute to investors proportionally
        address[] memory investors = round.investors;
        for (uint256 i = 0; i < investors.length; i++) {
            address investor = investors[i];
            uint256 investorShare = round.investments[investor];
            uint256 proportion = (investorShare * 1e18) / round.targetAmount;

            // Principal + interest
            uint256 investorReturn = (round.targetAmount * proportion / 1e18) +
                                    (interestAmount * proportion / 1e18);

            require(usdc.transfer(investor, investorReturn), "Transfer failed");
        }

        // Send fee to fee collector
        require(usdc.transfer(feeCollector, fee), "Fee transfer failed");

        // Update settlement
        round.isSettled = true;
        settlements[invoiceId] = Settlement({
            principalPaid: round.targetAmount,
            interestPaid: interestAmount,
            timestamp: block.timestamp
        });

        // Update invoice status
        invoiceNFT.updateStatus(invoiceId, InvoiceNFT.InvoiceStatus.Paid);

        emit InvoiceSettled(invoiceId, round.targetAmount, interestAmount);
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
     * @dev Set platform fee
     */
    function setPlatformFee(uint256 newFee) external {
        require(msg.sender == feeCollector, "Not fee collector");
        require(newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = newFee;
    }
}
