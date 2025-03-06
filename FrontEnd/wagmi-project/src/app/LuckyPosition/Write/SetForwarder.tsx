"use client";

import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client'; 
import { contract } from '../LuckyPositionAbi'; 
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import './Function.css'; 

const SetForwarder = () => {
  const [forwarderAddress, setForwarderAddress] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    if (!forwarderAddress) {
      setErrorMessage("Please enter a forwarder address.");
      return;
    }
    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: "setForwarder",
        args: [forwarderAddress as Address],
        account: account.address as Address,
      });
      const hash = await walletClient.writeContract(request);
      console.log("Transaction hash:", hash);
    } catch (error: any) {
      console.error("Error calling setForwarder:", error);
      setErrorMessage(error.message || "An error occurred.");
    }
  };

  return (
    <div className="form-container">
      <h2>Set Forwarder Address</h2>
      <form onSubmit={submit}>
        <div className="input-container">
          <label htmlFor="forwarderAddress">Forwarder Address</label>
          <input
            type="text"
            id="forwarderAddress"
            name="forwarderAddress"
            value={forwarderAddress}
            onChange={(e) => setForwarderAddress(e.target.value)}
          />
        </div>
        <button type="submit" className="submit-button">
          Set Forwarder
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

export default SetForwarder;

