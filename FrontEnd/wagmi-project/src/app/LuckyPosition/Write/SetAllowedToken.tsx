"use client";

import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client'; 
import { contract } from '../LuckyPositionAbi'; 
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import './Function.css'; 

const SetAllowedToken = () => {
  const [allowedToken, setAllowedToken] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (!allowedToken) {
      setErrorMessage("Please enter token address");
      return;
    }

    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: "setAllowedToken",
        args: [allowedToken as Address],
        account: account.address as Address,
      });

      const hash = await walletClient.writeContract(request);
      console.log("Transaction hash:", hash);
    } catch (error: any) {
      console.error("Error calling setAllowedToken:", error);
      setErrorMessage(error.message || "An error occurred while setting allowed token.");
    }
  };

  return (
    <div className="form-container">
      <h2>Set Allowed Token</h2>
      <form onSubmit={submit}>
        <div className="input-container">
          <label htmlFor="allowedToken">Allowed Token Address</label>
          <input
            type="text"
            id="allowedToken"
            name="allowedToken"
            value={allowedToken}
            onChange={(e) => setAllowedToken(e.target.value)}
          />
        </div>
        <button type="submit" className="submit-button">
          Set Allowed Token
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

export default SetAllowedToken;
