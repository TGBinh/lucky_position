"use client";

import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client'; 
import { contract } from '../LuckyPositionAbi'; 
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import './Function.css'; 

const SetVRFParameters = () => {
  const [subscriptionId, setSubscriptionId] = useState<string>("");
  const [vrfCoordinator, setVrfCoordinator] = useState<string>("");
  const [keyHash, setKeyHash] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (!subscriptionId || !vrfCoordinator || !keyHash) {
      setErrorMessage("Please enter all VRF parameters.");
      return;
    }
    try {
      const subId = BigInt(subscriptionId);
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: "setVRFParameters",
        args: [subId, vrfCoordinator as Address, keyHash],
        account: account.address as Address,
      });
      const hash = await walletClient.writeContract(request);
      console.log("Transaction hash:", hash);
    } catch (error: any) {
      console.error("Error calling setVRFParameters:", error);
      setErrorMessage(error.message || "An error occurred while setting VRF parameters.");
    }
  };

  return (
    <div className="form-container">
      <h2>Set VRF Parameters</h2>
      <form onSubmit={submit}>
        <div className="input-container">
          <label htmlFor="subscriptionId">Subscription ID</label>
          <input
            type="number"
            id="subscriptionId"
            name="subscriptionId"
            value={subscriptionId}
            onChange={(e) => setSubscriptionId(e.target.value)}
          />
        </div>
        <div className="input-container">
          <label htmlFor="vrfCoordinator">VRF Coordinator Address</label>
          <input
            type="text"
            id="vrfCoordinator"
            name="vrfCoordinator"
            value={vrfCoordinator}
            onChange={(e) => setVrfCoordinator(e.target.value)}
          />
        </div>
        <div className="input-container">
          <label htmlFor="keyHash">Key Hash</label>
          <input
            type="text"
            id="keyHash"
            name="keyHash"
            value={keyHash}
            onChange={(e) => setKeyHash(e.target.value)}
          />
        </div>
        <button type="submit" className="submit-button">
          Set VRF Parameters
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

export default SetVRFParameters;
