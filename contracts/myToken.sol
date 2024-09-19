// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyToken {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 private _totalSupply;

    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowed;

    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // Constructor to initialize the token
    constructor(string memory tokenName, string memory tokenSymbol, uint256 initialSupply) {
        name = tokenName;
        symbol = tokenSymbol;
        _totalSupply = initialSupply * 10 ** uint256(decimals); // Adjust for decimals
        balances[msg.sender] = _totalSupply; // Assign all tokens to the contract deployer
    }

    // Get total supply
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    // Get balance of an account
    function balanceOf(address account) public view returns (uint256) {
        return balances[account];
    }

    // Transfer tokens
    function transfer(address to, uint256 value) public returns (bool) {
        require(to != address(0), "Invalid address");
        require(balances[msg.sender] >= value, "Insufficient balance");

        balances[msg.sender] -= value;
        balances[to] += value;

        emit Transfer(msg.sender, to, value);
        return true;
    }

    // Approve tokens for spending
    function approve(address spender, uint256 value) public returns (bool) {
        allowed[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    // Transfer tokens from one address to another
    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(from != address(0), "Invalid address");
        require(to != address(0), "Invalid address");
        require(balances[from] >= value, "Insufficient balance");
        require(allowed[from][msg.sender] >= value, "Allowance exceeded");

        balances[from] -= value;
        balances[to] += value;
        allowed[from][msg.sender] -= value;

        emit Transfer(from, to, value);
        return true;
    }

    // Get allowance
    function allowance(address owner, address spender) public view returns (uint256) {
        return allowed[owner][spender];
    }
}
