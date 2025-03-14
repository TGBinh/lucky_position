"use client";

import React, { useState, useEffect } from "react";
import { publicClient, walletClient } from "../../../client";
import { contract } from "../LuckyPositionAbi";
import { useAccount } from "wagmi";
import { Address } from "viem";
import "./Function.css"; 
import "./Error.css"; 

interface JoinGameProps {
  currentGameId: string;
}

const waitForTransaction = async (
  txHash: `0x${string}`,
  timeout = 60000,
  interval = 1000
) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
      if (receipt) {
        return receipt;
      }
    } catch (e) {
      console.log("Waiting for receipt...");
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error("Transaction not confirmed within timeout");
};

interface ErrorNotificationProps {
  message: string;
  onClose: () => void;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 30000); 
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="error-notification">
      <span>{message}</span>
      <button className="close-button" onClick={onClose}>
        X
      </button>
    </div>
  );
};

const JoinGame: React.FC<JoinGameProps> = ({ currentGameId }) => {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const account = useAccount();

  useEffect(() => {
    const storedData = localStorage.getItem("joinedGame");
    if (storedData) {
      try {
        const { gameId, account: storedAccount } = JSON.parse(storedData);
        setHasJoined(gameId === currentGameId && storedAccount === account.address);
      } catch {
        setHasJoined(false);
      }
    } else {
      setHasJoined(false);
    }
  }, [currentGameId, account.address]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: "joinGame",
        args: [],
        account: account.address as Address,
      });

      const txHash = (await walletClient.writeContract(request)) as `0x${string}`;
      console.log("Transaction hash:", txHash);

      const receipt = await waitForTransaction(txHash);
      console.log("Transaction receipt:", receipt);

      if (receipt && (Number(receipt.status) === 1 || receipt.status === "success")) {
        localStorage.setItem(
          "joinedGame",
          JSON.stringify({ gameId: currentGameId, account: account.address })
        );
        setHasJoined(true);
      } else {
        setErrorMessage("Transaction failed.");
      }
    } catch (error: any) {
      console.error("Error calling joinGame:", error);
      setErrorMessage(error.message || "An error occurred while joining the game");
    }
  };

  return (
    <>
      {errorMessage && (
        <ErrorNotification message={errorMessage} onClose={() => setErrorMessage("")} />
      )}
      <div
        className="join-game-container"
        style={{
          width: "500px",
          margin: "0px auto",
          padding: "0px",
          borderRadius: "15px",
        }}
      >
        {hasJoined ? (
          <div
            className="waiting-text"
            style={{
              fontSize: "1rem",
              fontWeight: "bold",
              textAlign: "center",
              marginTop: "5px",
            }}
          >
            Waiting for results...
          </div>
        ) : (
          <form onSubmit={submit}>
            <button type="submit" className="submit-button">
              Join Game
            </button>
          </form>
        )}
      </div>
    </>
  );
};

export default JoinGame;
