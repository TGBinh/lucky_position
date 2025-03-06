"use client";

import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client'; 
import { contract } from '../LuckyPositionAbi'; 
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import './Function.css'; 

const SetGameParams = () => {
  const [ticketPrice, setTicketPrice] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (!ticketPrice || !duration) {
      setErrorMessage("Please enter both ticket price and duration.");
      return;
    }
    
    try {
      const price = BigInt(ticketPrice);
      const dur = BigInt(duration);
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: "setGameParams",
        args: [price, dur],
        account: account.address as Address,
      });
      const hash = await walletClient.writeContract(request);
      console.log("Transaction hash:", hash);
    } catch (error: any) {
      console.error("Error calling setGameParams:", error);
      setErrorMessage(error.message || "An error occurred while setting game parameters.");
    }
  };

  return (
    <div className="form-container">
      <h2>Set Game Parameters</h2>
      <form onSubmit={submit}>
        <div className="input-container">
          <label htmlFor="ticketPrice">Ticket Price</label>
          <input
            type="number"
            id="ticketPrice"
            name="ticketPrice"
            value={ticketPrice}
            onChange={(e) => setTicketPrice(e.target.value)}
          />
        </div>
        <div className="input-container">
          <label htmlFor="duration">Duration</label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
        <button type="submit" className="submit-button">
          Set Game Params
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

export default SetGameParams;
