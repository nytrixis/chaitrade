// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @dev Mock USDC token for testing on Avalanche Fuji
 * In production, use real USDC: 0xA7D8d9ef8D0231B7734519e4EB8Cc3F32a7cF7BE
 */
contract MockUSDC is ERC20, Ownable {
    constructor() ERC20("USD Coin", "USDC") Ownable(msg.sender) {
        // Mint 1,000,000 USDC to deployer
        _mint(msg.sender, 1_000_000 * 10**6);
    }

    /**
     * @dev Faucet function for testing
     * Allow anyone to mint 100 USDC
     */
    function faucet() external {
        _mint(msg.sender, 100 * 10**6);
    }

    /**
     * @dev Mint tokens (admin only)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev USDC has 6 decimals
     */
    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
