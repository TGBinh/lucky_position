// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ConfirmedOwnerWithProposalUpgradeable} from "./ConfirmedOwnerWithProposalUpgradeable.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/// @title The ConfirmedOwner contract
/// @notice A contract with helpers for basic contract ownership.
contract ConfirmedOwnerUpgradeable is Initializable, ConfirmedOwnerWithProposalUpgradeable {
  function __ConfirmedOwner_init(address newOwner) internal onlyInitializing {
      __ConfirmedOwnerWithProposal_init(newOwner, address(0));
    }
}
