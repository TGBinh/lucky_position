"use client";

import React from "react";
import { gql, useQuery } from "@apollo/client";
import "./DashboardTables.css";
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

const CurrentGame = () => {
  const { data, loading, error } = useQuery(GET_CURRENT_GAME);

  if (loading) return <p>Loading current game...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error.message}</p>;

  const game = data?.games && data.games[0];
  if (!game) return <p>No current game.</p>;

  return (
    <div className="current-game-details table-container">
      <div className="table-header">
        <h2>Current Game</h2>
      </div>
      <div className="game-details-content">
        <div className="detail-row">
          <span className="detail-label">ID</span>
          <span className="detail-separator">:</span>
          <span className="detail-value">{game.id}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Ticket Price</span>
          <span className="detail-separator">:</span>
          <span className="detail-value">{game.ticketPrice}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Total Pool</span>
          <span className="detail-separator">:</span>
          <span className="detail-value">{game.totalPool}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Winner</span>
          <span className="detail-separator">:</span>
          <span className="detail-value">{game.winner}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Status</span>
          <span className="detail-separator">:</span>
          <span className="detail-value">{game.status}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Start Time</span>
          <span className="detail-separator">:</span>
          <span className="detail-value">{game.startTime}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">End Time</span>
          <span className="detail-separator">:</span>
          <span className="detail-value">{game.endTime}</span>
        </div>
      </div>
      <JoinGame currentGameId={game.id} />
    </div>
  );
};

export default CurrentGame;
