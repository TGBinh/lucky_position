"use client";

import React from "react";
import { gql, useQuery } from "@apollo/client";
import "./GameConfiguration.css";
import JoinGame from "../Write/JoinGame";
import { FiSettings, FiClock, FiDollarSign } from "react-icons/fi"; 

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

const ShortTextWithCopy: React.FC<{ text: string }> = ({ text }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="short-text-container">
      <span className="short-text">{text}</span>
      <span className="copy-icon" onClick={handleCopy} title="Copy to clipboard">
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="#B55AED"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="14" height="14" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="17" y2="10" />
        </svg>
      </span>
    </div>
  );
};

const GameConfiguration = () => {
  const { data, loading, error } = useQuery(GET_GAME_CONFIGURATION);

  if (loading) return <p>Loading configuration...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error.message}</p>;

  const config = data?.gameConfigurations?.[0];
  if (!config) return <p>No configuration found.</p>;

  return (
    <div className="current-game-card">
      <div className="game-header">
        <h2 className="game-title">
          <FiSettings style={{ fontSize: "16px", marginRight: "8px" }} />
          Game Configuration
        </h2>
      </div>

      <div className="game-info-grid">
        <div className="info-item">
          <span className="info-label">
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="#007BFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "6px" }}
            >
              <circle cx="10" cy="10" r="8" />
              <line x1="10" y1="4" x2="10" y2="10" />
              <line x1="10" y1="10" x2="14" y2="10" />
            </svg>
            Pause Timestamp
          </span>
          <span className="info-value1">{config.pauseTimestamp}</span>
        </div>

        <div className="info-item">
          <span className="info-label">
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="#007BFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "6px" }}
            >
              <circle cx="10" cy="10" r="8" />
              <line x1="10" y1="4" x2="10" y2="10" />
              <line x1="10" y1="10" x2="14" y2="10" />
            </svg>
            Resume Timestamp
          </span>
          <span className="info-value1">{config.resumeTimestamp}</span>
        </div>

        <div className="info-item">
          <span className="info-label">
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="#007BFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "6px" }}
            >
              <circle cx="10" cy="10" r="8" />
              <line x1="10" y1="4" x2="10" y2="10" />
              <line x1="10" y1="10" x2="14" y2="10" />
            </svg>
            Duration
          </span>
          <span className="info-value1">{config.duration}</span>
        </div>

        <div className="info-item">
          <span className="info-label">
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="#28ACEA"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "6px" }}
            >
              <rect x="3" y="4" width="14" height="12" rx="2" ry="2" />
              <line x1="3" y1="10" x2="17" y2="10" />
            </svg>
            Ticket Price
          </span>
          <span className="info-value1">{config.ticketPrice}</span>
        </div>

        <div className="info-item">
          <span className="info-label">
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="#28ACEA"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "6px" }}
            >
              <path d="M4 10h12" />
              <path d="M10 6l4 4-4 4" />
            </svg>
            Forwarder
          </span>
          <span className="info-value1">
            <ShortTextWithCopy text={config.forwarder} />
          </span>
        </div>

        <div className="info-item">
          <span className="info-label">
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="#28ACEA"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "6px" }}
            >
              <path d="M10 2v16" />
              <path d="M7 6h6a3 3 0 1 1 0 6H7" />
            </svg>
            Fee Percentage
          </span>
          <span className="info-value1">{config.feePercentage}%</span>
        </div>

        <div className="info-item">
          <span className="info-label">
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="#B55AED"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "6px" }}
            >
              <rect x="3" y="4" width="14" height="14" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="17" y2="10" />
            </svg>
            VRF Coordinator
          </span>
          <span className="info-value1">
            <ShortTextWithCopy text={config.vrfCoordinator} />
          </span>
        </div>

        <div className="info-item">
          <span className="info-label">
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="#B55AED"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "6px" }}
            >
              <circle cx="5" cy="11" r="2" />
              <path d="M7 11h4a2 2 0 1 1 0 4H7" />
              <path d="M7 11l-2-2" />
            </svg>
            Key Hash
          </span>
          <span className="info-value1">
            <ShortTextWithCopy text={config.keyHash} />
          </span>
        </div>

        <div className="info-item full-width">
          <span className="info-label">
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="#B55AED"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "6px" }}
            >
              <rect x="3" y="4" width="14" height="14" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="17" y2="10" />
            </svg>
            Subscription ID
          </span>
          <span className="info-value1">
            <ShortTextWithCopy text={config.subscriptionId} />
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameConfiguration;
