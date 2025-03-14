"use client";

import React, { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import "./ConnectWallet.css";

function ConnectWallet() {
  const [showDetails, setShowDetails] = useState(false);
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  const toggleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  return (
    <div className="wallet-container">
      {account.status === "connected" ? (
        <div className="wallet-connected" onClick={toggleDetails}>
          <span className="wallet-address">
            {account.address
              ? account.address.substring(0, 6) +
                "..." +
                account.address.substring(account.address.length - 4)
              : ""}
          </span>
          {showDetails && (
            <div className="wallet-details">
              <p>Status: {account.status}</p>
              <p>ChainId: {account.chainId}</p>
              <button onClick={() => disconnect()}>Disconnect</button>
            </div>
          )}
        </div>
      ) : (
        <div className="wallet-disconnected">
          <button onClick={() => connect({ connector: connectors[0] })}>
            Connect
          </button>
          {status !== "idle" && <p>{status}</p>}
          {error && <p className="error">{error.message}</p>}
        </div>
      )}
    </div>
  );
}

export default ConnectWallet;
