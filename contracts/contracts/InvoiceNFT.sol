// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title InvoiceNFT
 * @dev Each invoice is a unique NFT. MSME owns it until funded.
 * Metadata stored on IPFS (Pinata), only CID on-chain.
 */
contract InvoiceNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    struct InvoiceMetadata {
        uint256 amount;          // Invoice amount in USDC (6 decimals)
        uint256 dueDate;         // Unix timestamp
        address buyer;           // Verified buyer address (optional)
        string buyerName;        // Company name
        bytes32 ipfsCID;         // IPFS content hash
        InvoiceStatus status;
        uint256 fundedAmount;    // Amount raised so far
        uint256 fundingDeadline; // Deadline to raise funds
    }

    enum InvoiceStatus {
        Listed,      // Available for funding
        Funding,     // Actively being funded
        Funded,      // Fully funded, awaiting payment
        Paid,        // Invoice paid, funds distributed
        Defaulted,   // Invoice overdue
        Cancelled    // Cancelled by MSME
    }

    mapping(uint256 => InvoiceMetadata) public invoices;

    // Events
    event InvoiceMinted(
        uint256 indexed tokenId,
        address indexed msme,
        uint256 amount,
        uint256 dueDate
    );

    event InvoiceStatusChanged(
        uint256 indexed tokenId,
        InvoiceStatus oldStatus,
        InvoiceStatus newStatus
    );

    constructor() ERC721("ChaiTrade Invoice", "CTI") Ownable(msg.sender) {}

    /**
     * @dev Mint new invoice NFT
     * @param to MSME address (owner)
     * @param amount Invoice amount (USDC, 6 decimals)
     * @param dueDate Payment due date (unix timestamp)
     * @param buyerName Buyer company name
     * @param ipfsCID IPFS content identifier
     * @param fundingDeadline Deadline to raise funds (unix timestamp)
     */
    function mintInvoice(
        address to,
        uint256 amount,
        uint256 dueDate,
        string memory buyerName,
        bytes32 ipfsCID,
        uint256 fundingDeadline
    ) public returns (uint256) {
        require(amount > 0, "Amount must be > 0");
        require(dueDate > block.timestamp, "Due date must be future");
        require(fundingDeadline > block.timestamp && fundingDeadline < dueDate,
                "Invalid funding deadline");

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        invoices[tokenId] = InvoiceMetadata({
            amount: amount,
            dueDate: dueDate,
            buyer: address(0), // Optional: can be set later
            buyerName: buyerName,
            ipfsCID: ipfsCID,
            status: InvoiceStatus.Listed,
            fundedAmount: 0,
            fundingDeadline: fundingDeadline
        });

        emit InvoiceMinted(tokenId, to, amount, dueDate);
        return tokenId;
    }

    /**
     * @dev Update invoice status (only owner or authorized contracts)
     */
    function updateStatus(uint256 tokenId, InvoiceStatus newStatus)
        public
        onlyOwner
    {
        InvoiceStatus oldStatus = invoices[tokenId].status;
        invoices[tokenId].status = newStatus;
        emit InvoiceStatusChanged(tokenId, oldStatus, newStatus);
    }

    /**
     * @dev Update funded amount
     */
    function updateFundedAmount(uint256 tokenId, uint256 amount)
        public
        onlyOwner
    {
        invoices[tokenId].fundedAmount += amount;

        // Auto-transition to Funded status if target reached
        if (invoices[tokenId].fundedAmount >= invoices[tokenId].amount * 80 / 100) {
            updateStatus(tokenId, InvoiceStatus.Funded);
        }
    }

    /**
     * @dev Get invoice details
     */
    function getInvoice(uint256 tokenId)
        public
        view
        returns (InvoiceMetadata memory)
    {
        require(_ownerOf(tokenId) != address(0), "Invoice does not exist");
        return invoices[tokenId];
    }

    // Override required functions
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
