"use client";

import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client'; 
import { contract } from '../LuckyPositionAbi'; 
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import './Function.css'; 

const TransferOwnership = () => {
  const [newOwner, setNewOwner] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (!newOwner) {
      setErrorMessage("Please enter the new owner's address.");
      return;
    }
    
    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: "transferOwnership",
        args: [newOwner as Address],
        account: account.address as Address,
      });
      const hash = await walletClient.writeContract(request);
      console.log("Transaction hash:", hash);
    } catch (error: any) {
      console.error("Error calling transferOwnership:", error);
      setErrorMessage(error.message || "An error occurred while transferring ownership.");
    }
  };

  return (
    <div className="form-container">
      <h2>Transfer Ownership</h2>
      <form onSubmit={submit}>
        <div className="input-container">
          <label htmlFor="newOwner">New Owner Address</label>
          <input
            type="text"
            id="newOwner"
            name="newOwner"
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
          />
        </div>
        <button type="submit" className="submit-button">
          Transfer Ownership
        </button>
        {errorMessage && (
          <div style={{ color: "red", marginTop: "8px", fontSize: "0.7rem" }}>
            {errorMessage}
          </div>
        )}
      </form>
    </div>
  );
};

export default TransferOwnership;
