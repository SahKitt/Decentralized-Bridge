// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BscToken is ERC20, Ownable {
    event TokensMinted(address indexed to, uint256 amount);

    constructor() ERC20("BSC Token", "BSC") {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
}
