// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockToken is ERC20, Ownable {
    bool public transferShouldFail;

    constructor(
        address initialOwner
    ) ERC20("MockToken", "MTK") Ownable(initialOwner) {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    function setTransferShouldFail(bool _shouldFail) external {
        transferShouldFail = _shouldFail;
    }
    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        require(!transferShouldFail, "Token transfer failed");
        return super.transferFrom(sender, recipient, amount);
    }
}
