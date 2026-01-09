// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title InvoiceMarketplace
 * @dev Secondary marketplace for trading invoice NFTs
 * @notice Allows investors to sell their invoice positions before maturity
 */
contract InvoiceMarketplace is ReentrancyGuard {
    struct Listing {
        address seller;
        uint256 askingPrice;      // in wei (AVAX)
        uint256 faceValue;        // expected payout at maturity
        uint256 daysToMaturity;   // days remaining until due date
        uint256 listedAt;
        bool isActive;
    }

    // NFT contract address => Token ID => Listing
    mapping(address => mapping(uint256 => Listing)) public listings;

    // Track active listings for enumeration
    uint256 public totalListings;
    mapping(uint256 => address) public listingNFTContract;
    mapping(uint256 => uint256) public listingTokenId;

    event InvoiceListed(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 askingPrice,
        uint256 faceValue,
        uint256 impliedYield
    );

    event InvoiceSold(
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price
    );

    event ListingCancelled(
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller
    );

    event ListingUpdated(
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 newPrice
    );

    /**
     * @dev List an invoice NFT for sale
     * @param nftContract Address of the invoice NFT contract
     * @param tokenId Token ID of the invoice
     * @param askingPrice Price in AVAX (wei)
     * @param faceValue Expected return at maturity
     * @param daysToMaturity Days until invoice due date
     */
    function listInvoice(
        address nftContract,
        uint256 tokenId,
        uint256 askingPrice,
        uint256 faceValue,
        uint256 daysToMaturity
    ) external {
        IERC721 nft = IERC721(nftContract);

        require(nft.ownerOf(tokenId) == msg.sender, "Not owner");
        require(
            nft.getApproved(tokenId) == address(this) ||
            nft.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );
        require(askingPrice > 0, "Price must be > 0");
        require(askingPrice < faceValue, "Price must be < face value");
        require(daysToMaturity > 0, "Invoice must not be matured");

        // Check if already listed
        Listing storage existingListing = listings[nftContract][tokenId];
        require(!existingListing.isActive, "Already listed");

        // Create listing
        listings[nftContract][tokenId] = Listing({
            seller: msg.sender,
            askingPrice: askingPrice,
            faceValue: faceValue,
            daysToMaturity: daysToMaturity,
            listedAt: block.timestamp,
            isActive: true
        });

        // Track for enumeration
        listingNFTContract[totalListings] = nftContract;
        listingTokenId[totalListings] = tokenId;
        totalListings++;

        // Calculate implied yield
        uint256 impliedYield = calculateImpliedYield(faceValue, askingPrice, daysToMaturity);

        emit InvoiceListed(
            nftContract,
            tokenId,
            msg.sender,
            askingPrice,
            faceValue,
            impliedYield
        );
    }

    /**
     * @dev Purchase a listed invoice NFT
     * @param nftContract Address of the invoice NFT contract
     * @param tokenId Token ID to purchase
     */
    function buyInvoice(
        address nftContract,
        uint256 tokenId
    ) external payable nonReentrant {
        Listing storage listing = listings[nftContract][tokenId];

        require(listing.isActive, "Not listed");
        require(msg.value >= listing.askingPrice, "Insufficient payment");

        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == listing.seller, "Seller no longer owns NFT");

        address seller = listing.seller;
        uint256 price = listing.askingPrice;

        // Mark as inactive before transfers (reentrancy protection)
        listing.isActive = false;

        // Transfer NFT to buyer
        nft.safeTransferFrom(seller, msg.sender, tokenId);

        // Transfer payment to seller
        (bool success, ) = seller.call{value: price}("");
        require(success, "Payment transfer failed");

        // Refund excess payment
        if (msg.value > price) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - price}("");
            require(refundSuccess, "Refund failed");
        }

        emit InvoiceSold(nftContract, tokenId, seller, msg.sender, price);
    }

    /**
     * @dev Cancel a listing
     * @param nftContract Address of the invoice NFT contract
     * @param tokenId Token ID to cancel
     */
    function cancelListing(address nftContract, uint256 tokenId) external {
        Listing storage listing = listings[nftContract][tokenId];

        require(listing.seller == msg.sender, "Not seller");
        require(listing.isActive, "Not active");

        listing.isActive = false;

        emit ListingCancelled(nftContract, tokenId, msg.sender);
    }

    /**
     * @dev Update listing price
     * @param nftContract Address of the invoice NFT contract
     * @param tokenId Token ID to update
     * @param newPrice New asking price
     */
    function updatePrice(
        address nftContract,
        uint256 tokenId,
        uint256 newPrice
    ) external {
        Listing storage listing = listings[nftContract][tokenId];

        require(listing.seller == msg.sender, "Not seller");
        require(listing.isActive, "Not active");
        require(newPrice > 0, "Price must be > 0");
        require(newPrice < listing.faceValue, "Price must be < face value");

        listing.askingPrice = newPrice;

        emit ListingUpdated(nftContract, tokenId, newPrice);
    }

    /**
     * @dev Calculate implied annual yield for a listing
     * @param faceValue Expected return at maturity
     * @param askingPrice Current asking price
     * @param daysRemaining Days until maturity
     * @return uint256 Implied yield in basis points (10000 = 100%)
     */
    function calculateImpliedYield(
        uint256 faceValue,
        uint256 askingPrice,
        uint256 daysRemaining
    ) public pure returns (uint256) {
        if (daysRemaining == 0 || askingPrice == 0) return 0;

        // Yield = (Face - Price) / Price * (365 / Days) * 10000
        // Returns basis points (10000 = 100%)
        uint256 profit = faceValue - askingPrice;
        uint256 annualizedYield = (profit * 365 * 10000) / (askingPrice * daysRemaining);

        return annualizedYield;
    }

    /**
     * @dev Get listing details
     * @param nftContract Address of the invoice NFT contract
     * @param tokenId Token ID
     * @return Listing struct
     */
    function getListing(address nftContract, uint256 tokenId)
        external
        view
        returns (Listing memory)
    {
        return listings[nftContract][tokenId];
    }

    /**
     * @dev Check if an invoice is listed
     * @param nftContract Address of the invoice NFT contract
     * @param tokenId Token ID
     * @return bool True if actively listed
     */
    function isListed(address nftContract, uint256 tokenId)
        external
        view
        returns (bool)
    {
        return listings[nftContract][tokenId].isActive;
    }

    /**
     * @dev Get discount percentage
     * @param faceValue Expected return at maturity
     * @param askingPrice Current asking price
     * @return uint256 Discount in basis points (10000 = 100%)
     */
    function getDiscount(uint256 faceValue, uint256 askingPrice)
        public
        pure
        returns (uint256)
    {
        if (faceValue == 0) return 0;
        return ((faceValue - askingPrice) * 10000) / faceValue;
    }
}
