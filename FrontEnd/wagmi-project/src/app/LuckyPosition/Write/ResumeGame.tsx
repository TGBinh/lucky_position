"use client";

import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client'; 
import { contract } from '../LuckyPositionAbi'; 
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import './Function.css'; 

const ResumeGame = () => {
  const account = useAccount();
  const [errorMessage, setErrorMessage] = useState<string>("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: "resumeGame",
        args: [],
        account: account.address as Address,
      });
      const hash = await walletClient.writeContract(request);
      console.log("Transaction hash:", hash);
    } catch (error: any) {
      console.error("Error calling resumeGame:", error);
      setErrorMessage(error.message || "An error occurred while resuming the game.");
    }
  };

  return (
    <div className="form-container">
      <h2>Resume Game</h2>
      <form onSubmit={submit}>
        <button type="submit" className="submit-button">
          Resume Game
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

export default ResumeGame;
