"use client";

import React from "react";
import { gql, useQuery } from "@apollo/client";
import "./DashboardTables.css";

const GET_GAME_CONFIGURATION = gql`
  query GetGameConfiguration {
    gameConfigurations {
      feePercentage
      ticketPrice
      duration
      subscriptionId
      vrfCoordinator
      keyHash
      forwarder
      pauseTimestamp
      resumeTimestamp
    }
  }
`;

const GameConfiguration = () => {
  const { data, loading, error } = useQuery(GET_GAME_CONFIGURATION);

  if (loading) return <p>Loading configuration...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error.message}</p>;

  const config = data.gameConfigurations && data.gameConfigurations[0];
  if (!config) return <p>No configuration found.</p>;

  return (
    <div className="current-game-details table-container">
      <div className="table-header">
        <h2>Game Configuration</h2>
      </div>
      <div className="game-details-content">
        <div className="detail-row">
          <span className="detail-label">Fee Percentage</span>
          <span className="detail-separator">:</span>
          <span className="detail-value">{config.feePercentage}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Duration</span>
          <span className="detail-separator">:</span>
          <span className="detail-value">{config.duration}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Ticket Price</span>
          <span className="detail-separator">:</span>
          <span className="detail-value">{config.ticketPrice}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Subscription ID</span>
          <span className="detail-separator">:</span>
          <span className="detail-value">{config.subscriptionId}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">VRF Coordinator</span>
          <span className="detail-separator">:</span>
          <span className="detail-value">{config.vrfCoordinator}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Key Hash</span>
          <span className="detail-separator">:</span>
          <span className="detail-value">{config.keyHash}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Forwarder</span>
          <span className="detail-separator">:</span>
          <span className="detail-value">{config.forwarder}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Pause Timestamp</span>
          <span className="detail-separator">:</span>
          <span className="detail-value">{config.pauseTimestamp}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Resume Timestamp</span>
          <span className="detail-separator">:</span>
          <span className="detail-value">{config.resumeTimestamp}</span>
        </div>
      </div>
    </div>
  );
};

export default GameConfiguration;
