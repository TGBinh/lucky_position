"use client";

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { publicClient, walletClient } from "../../../client";
import { contract } from "../LuckyPositionAbi";
import { useAccount } from "wagmi";
import { Address } from "viem";
import "./ClaimRefund.css";
import "./Error.css";

interface ErrorNotificationProps {
  message: string;
  onClose: () => void;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 30000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div className="error-notification1">
      <span>{message}</span>
      <button className="close-button1" onClick={onClose}>
        X
      </button>
    </div>,
    document.body
  );
};

interface ClaimRefundButtonProps {
  gameId: string;
}

const ClaimRefundButton: React.FC<ClaimRefundButtonProps> = ({ gameId }) => {
  const [showPanel, setShowPanel] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { address } = useAccount();

  const togglePanel = () => {
    setShowPanel(!showPanel);
    if (showPanel) {
      setMessage("");
      setErrorMessage("");
    }
  };

  const handleClaim = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setMessage("");

    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: "claimRefund",
        args: [[BigInt(gameId)]], 
        account: address as Address,
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
    <div className="claim-refund-button">
      {!showPanel ? (
        <button onClick={togglePanel}>Claim Refund</button>
      ) : (
        <>
          <form onSubmit={handleClaim} className="claim-form">
            <button type="submit">Confirm</button>
            <button type="button" onClick={togglePanel}>
              Cancel
            </button>
            {message && <div className="message">{message}</div>}
          </form>
          {errorMessage && (
            <ErrorNotification message={errorMessage} onClose={() => setErrorMessage("")} />
          )}
        </>
      )}
    </div>
  );
};

export default ClaimRefundButton;
