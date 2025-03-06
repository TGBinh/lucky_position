"use client";

import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client'; 
import { contract } from '../LuckyPositionAbi'; 
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import './Function.css'; 

const SetResumeTime = () => {
  const [timestamp, setTimestamp] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (!timestamp) {
      setErrorMessage("Please enter a timestamp.");
      return;
    }
    try {
      const time = BigInt(timestamp);
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: "setResumeTime",
        args: [time],
        account: account.address as Address,
      });
      const hash = await walletClient.writeContract(request);
      console.log("Transaction hash:", hash);
    } catch (error: any) {
      console.error("Error calling setResumeTime:", error);
      setErrorMessage(error.message || "An error occurred while setting resume time.");
    }
  };

  return (
    <div className="form-container">
      <h2>Set Resume Time</h2>
      <form onSubmit={submit}>
        <div className="input-container">
          <label htmlFor="timestamp">Timestamp</label>
          <input
            type="number"
            id="timestamp"
            name="timestamp"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
          />
        </div>
        <button type="submit" className="submit-button">
          Set Resume Time
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

export default SetResumeTime;
