"use client";

import React, { useState } from "react";
import { publicClient, walletClient } from "../../../client";
import { contract } from "../LuckyPositionAbi";
import { useAccount } from "wagmi";
import { Address } from "viem";

const ClaimRefund: React.FC = () => {
  const [showPanel, setShowPanel] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const account = useAccount();

  const togglePanel = () => {
    setShowPanel(!showPanel);
    if (showPanel) {
      setInputValue("");
      setMessage("");
      setErrorMessage("");
    }
  };

  const handleClaim = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setMessage("");

    const gameIdsStringArray = inputValue
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");
    if (gameIdsStringArray.length === 0) {
      setErrorMessage("Please enter at least one game ID.");
      return;
    }

    let gameIds;
    try {
      gameIds = gameIdsStringArray.map((idStr) => BigInt(idStr));
    } catch (err) {
      setErrorMessage("Invalid game ID format.");
      return;
    }

    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: "claimRefund",
        args: [gameIds],
        account: account.address as Address,
      });

      const txHash = await walletClient.writeContract(request);
      console.log("Claim refund transaction hash:", txHash);
      setMessage("Refund claimed successfully!");
    } catch (error: any) {
      console.error("Error claiming refund:", error);
      setErrorMessage(error.message || "An error occurred while claiming refund.");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        right: "10px",
        zIndex: 1000,
      }}
    >
      <div
        onClick={togglePanel}
        style={{
          background: "#fff",
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "10px",
          cursor: "pointer",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          textAlign: "center",
        }}
      >
        Claim Refund
      </div>
      {showPanel && (
        <div
          style={{
            position: "absolute",
            bottom: "0", 
            right: "calc(100% + 10px)", 
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "10px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            minWidth: "250px",
          }}
        >
          <form onSubmit={handleClaim}>
            <input
              type="text"
              placeholder="Enter game IDs, comma separated"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{
                width: "93%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "0.9rem",
                marginBottom: "6px",
              }}
            />
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "8px",
                background: "#0070f3",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              Claim
            </button>
          </form>
          {message && (
            <div
              style={{
                marginTop: "6px",
                color: "green",
                textAlign: "center",
                fontSize: "0.9rem",
              }}
            >
              {message}
            </div>
          )}
          {errorMessage && (
            <div
              style={{
                marginTop: "6px",
                color: "red",
                textAlign: "center",
                fontSize: "0.65rem",
              }}
            >
              {errorMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClaimRefund;
