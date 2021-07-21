// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    address public minter;

  //add minter changed event
  event MinterChanged(address indexed _from, address _to);

  constructor() payable ERC20("Decentralized Bank Currency", "DBC") {
    minter = msg.sender;
  }

  function passMinterRole(address _dBank) public returns(bool){
      require(msg.sender == minter, "Error: only owner can pass the minter role!");
      minter = _dBank;
      
      emit MinterChanged(msg.sender, _dBank);
      return true;
  }

  function mint(address account, uint256 amount) public {
    require(msg.sender == minter);
	_mint(account, amount);
	}
}