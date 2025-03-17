"use client";

import React, { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import "./CurrentGame.css";
import JoinGame from "../Write/JoinGame";

const GET_CURRENT_GAME = gql`
  query {
    games(orderBy: endTime_DESC, limit: 1) {
      id
      ticketPrice
      totalPool
      winner
      status
      startTime
      endTime
    }
  }
`;

function formatDateTime(rawTime?: string): string {
  if (!rawTime) return "Invalid Date";
  const numericTime = parseInt(rawTime, 10);
  let dateObj: Date;

  if (!isNaN(numericTime)) {
    dateObj = new Date(numericTime * 1000);
  } else {
    dateObj = new Date(rawTime);
  }

  if (isNaN(dateObj.getTime())) {
    return "Invalid Date";
  }

  return dateObj.toLocaleString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });
}

function getHMS(rawEndTime?: string) {
  if (!rawEndTime) return { hours: "00", minutes: "00", seconds: "00", ended: true };

  const numericTime = parseInt(rawEndTime, 10);
  let endMs: number;

  if (!isNaN(numericTime)) {
    endMs = numericTime * 1000;
  } else {
    endMs = new Date(rawEndTime).getTime();
  }

  if (isNaN(endMs)) {
    return { hours: "00", minutes: "00", seconds: "00", ended: true };
  }

  const now = Date.now();
  if (now >= endMs) {
    return { hours: "00", minutes: "00", seconds: "00", ended: true };
  }

  const diffMs = endMs - now;
  const diffSec = Math.floor(diffMs / 1000);
  const h = Math.floor(diffSec / 3600);
  const m = Math.floor((diffSec % 3600) / 60);
  const s = diffSec % 60;

  return {
    hours: String(h).padStart(2, "0"),
    minutes: String(m).padStart(2, "0"),
    seconds: String(s).padStart(2, "0"),
    ended: false,
  };
}

const CurrentGame: React.FC = () => {
  const { data, loading, error } = useQuery(GET_CURRENT_GAME);

  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [seconds, setSeconds] = useState("00");
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const game = data?.games?.[0];
    if (!game) return;

    const updateCountdown = () => {
      const { hours, minutes, seconds, ended } = getHMS(game.endTime);
      setHours(hours);
      setMinutes(minutes);
      setSeconds(seconds);
      setIsEnded(ended);
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalId);
  }, [data]);

  if (loading) return <p>Loading current game...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error.message}</p>;

  const game = data?.games?.[0];
  if (!game) return <p>No current game.</p>;

  const formattedStartTime = formatDateTime(game.startTime);
  const formattedEndTime = formatDateTime(game.endTime);

  return (
    <div className="current-game-card">
      <div className="header-bar">
        <div className="header-left1">
          <div className="clock-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="10" cy="10" r="8" />
              <path d="M10 6v4l2 2" />
            </svg>
          </div>
          <h2>Current Game</h2>
        </div>
        <div className="game-id-pill">Game #{game.id}</div>
      </div>

      <div className="time-remaining-container">
        <div className="time-remaining-label">Time Remaining</div>
        <div className="time-remaining-hms">
          {isEnded ? (
            <div className="time-text">
              <span className="time-num">00</span> : <span className="time-num">00</span> : <span className="time-num">00</span>
            </div>
          ) : (
            <div className="time-text">
              <span className="time-num">{hours}</span> : <span className="time-num">{minutes}</span> : <span className="time-num">{seconds}</span>
            </div>
          )}
          <div className="time-units">
            <span>hours</span>
            <span>min</span>
            <span>sec</span>
          </div>
        </div>
      </div>

      <div className="divider"></div>

      <div className="info-grid">
        <div className="info-box status-box">
          <div className="info-icon">
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="#2BC155"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <div className="info-text">
            <div className="info-label">Status</div>
            <div className="info-value">{game.status}</div>
          </div>
        </div>

        <div className="info-box pool-box">
          <div className="info-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 256 417"
              xmlns="http://www.w3.org/2000/svg"
              fill="#F95887"
            >
              <path d="M127.6 0L124.2 10.9V279.8L127.6 283.2L255.2 209.4L127.6 0Z" />
              <path d="M127.6 0L0 209.4L127.6 283.2V150.1V0Z" />
              <path d="M127.6 306.7L125.5 309.5V416.5L127.6 422.2L255.3 234.2L127.6 306.7Z" />
              <path d="M127.6 422.2V306.7L0 234.2L127.6 422.2Z" />
            </svg>
          </div>
          <div className="info-text">
            <div className="info-label">Total Pool</div>
            <div className="info-value">{game.totalPool / (10**18)}</div>
          </div>
        </div>

        <div className="info-box start-box">
          <div className="info-icon">
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="#28ACEA"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="14" height="14" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="17" y2="10" />
            </svg>
          </div>
          <div className="info-text">
            <div className="info-label">Start Time</div>
            <div className="info-value">{formattedStartTime}</div>
          </div>
        </div>

        <div className="info-box end-box">
          <div className="info-icon">
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
          </div>
          <div className="info-text">
            <div className="info-label">End Time</div>
            <div className="info-value">{formattedEndTime}</div>
          </div>
        </div>
      </div>

      <div className="join-button-container">
        <JoinGame currentGameId={game.id} />
      </div>
    </div>
  );
};

export default CurrentGame;
