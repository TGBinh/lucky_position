"use client";

import React from "react";
import { gql, useQuery } from "@apollo/client";
import "./Time.css"; 
import CurrentTime from  "./GetCurrentTime";

const GET_ACTIVE_TIME = gql`
  query GetActiveTime {
    gameConfigurations {
      pauseTimestamp
      resumeTimestamp
    }
  }
`;

const ActiveTime = () => {
  const { data, loading, error } = useQuery(GET_ACTIVE_TIME);

  if (loading) return <p>Loading active time...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error.message}</p>;

  const config = data?.gameConfigurations?.[0];
  if (!config) return <p>No configuration found.</p>;

  const pauseTimestamp = Number(config.pauseTimestamp);
  const resumeTimestamp = Number(config.resumeTimestamp);

  const formatTime = (secs: number): string => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const formattedPause = formatTime(pauseTimestamp);
  const formattedResume = formatTime(resumeTimestamp);

  return (
    <div className="active-time-container">
      <span className="clock-icon">⏰</span>
      Active time: {formattedResume} - {formattedPause}
      <CurrentTime />
    </div>
  );
};

export default ActiveTime;
