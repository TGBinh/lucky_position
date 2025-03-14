"use client";

import React, { useState } from "react";
import { publicClient } from "../../../client";
import { contract } from "../LuckyPositionAbi";
import { Address } from "viem";

const OwnerDisplay: React.FC = () => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [owner, setOwner] = useState<string>("");
  const [error, setError] = useState<string>("");

  const fetchOwner = async () => {
    try {
      const result = await publicClient.readContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: "owner",
        args: [],
      });
      const ownerAddress = result as `0x${string}`;
      setOwner(ownerAddress);
    } catch (err: any) {
      setError(err.message || "Error fetching owner");
    }
  };

  const handleClick = async () => {
    if (!expanded) {
      await fetchOwner();
    }
    setExpanded(!expanded);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: "fixed",
        bottom: "10px",
        left: "10px",
        width: expanded ? "400px" : "50px",
        height: "50px",
        background: "#a0cbf9", 
        border: "1px solid #a0cbf3",
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)",
        borderRadius: expanded ? "20px" : "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: expanded ? "space-around" : "center",
        padding: expanded ? "0 10px" : "0",
        cursor: "pointer",
        transition: "all 0.3s ease",
        zIndex: 1000,
      }}
    >
      {expanded ? (
        <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#000" }}>
          Owner: {owner}
        </span>
      ) : (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="black"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block" }}
        >
          <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zM12 14c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z" />
        </svg>
      )}
      {error && (
        <div style={{ color: "red", fontSize: "0.8rem", marginTop: "4px" }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default OwnerDisplay;
