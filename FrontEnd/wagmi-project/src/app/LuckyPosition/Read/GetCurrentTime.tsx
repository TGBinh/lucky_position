"use client";

import React, { useState } from "react";
import { publicClient } from "../../../client";
import { contract } from "../LuckyPositionAbi";
import { Address } from "viem";
import "./Time.css";

const CurrentTime = () => {
  const [currentTime, setCurrentTime] = useState<
    [number, number, number] | null
  >(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchCurrentTime = async () => {
    setLoading(true);
    setError("");
    try {
      const result = (await publicClient.readContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: "getCurrentTime",
        args: [],
      })) as [bigint, bigint, bigint];

      const formatted: [number, number, number] = [
        Number(result[0]),
        Number(result[1]),
        Number(result[2]),
      ];
      setCurrentTime(formatted);
    } catch (err: any) {
      setError(err.message || "Error fetching current time");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="current-time-display">
      <button className="current-time-button" onClick={fetchCurrentTime}>
        Current Time
      </button>
      {loading && <span className="current-time-loading">Loading...</span>}
      {error && (
        <span className="current-time-error" style={{ color: "red" }}>
          {error}
        </span>
      )}
      {currentTime && (
        <div className="current-time-values">
          {currentTime[0]}:{currentTime[1].toString().padStart(2, "0")}:
          {currentTime[2].toString().padStart(2, "0")}
        </div>
      )}
    </div>
  );
};

export default CurrentTime;
