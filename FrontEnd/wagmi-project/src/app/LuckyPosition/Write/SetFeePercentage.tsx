"use client";

import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client'; 
import { contract } from '../LuckyPositionAbi'; 
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import './Function.css'; 

const SetFeePercentage = () => {
  const [feePercentage, setFeePercentage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (!feePercentage) {
      setErrorMessage("Please enter fee percentage");
      return;
    }

    try {
      const fee = BigInt(feePercentage);

      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: "setFeePercentage",
        args: [fee],
        account: account.address as Address,
      });

      const hash = await walletClient.writeContract(request);
      console.log("Transaction hash:", hash);
    } catch (error: any) {
      console.error("Error calling setFeePercentage:", error);
      setErrorMessage(error.message || "An error occurred while setting fee percentage.");
    }
  };

  return (
    <div className="form-container">
      <h2>Set Fee Percentage</h2>
      <form onSubmit={submit}>
        <div className="input-container">
          <label htmlFor="feePercentage">Fee Percentage</label>
          <input
            type="number"
            id="feePercentage"
            name="feePercentage"
            value={feePercentage}
            onChange={(e) => setFeePercentage(e.target.value)}
          />
        </div>
        <button type="submit" className="submit-button">
          Set Fee Percentage
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

export default SetFeePercentage;
