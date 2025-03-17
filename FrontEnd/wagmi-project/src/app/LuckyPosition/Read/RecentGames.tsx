"use client";

import React from "react";
import { gql, useQuery } from "@apollo/client";
import { FaListUl } from "react-icons/fa";
import "./RecentGames.css"; 

const GET_NEXT_FOUR_GAMES = gql`
  query {
    games(orderBy: endTime_DESC, limit: 6) {
      id
      totalPool
      winner
      status
      startTime
      endTime
    }
  }
`;


function formatTime(rawTime?: string): string {
  if (!rawTime) return "Invalid Time";
  const numericTime = parseInt(rawTime, 10);
  let dateObj: Date;
  
  if (!isNaN(numericTime)) {
    dateObj = new Date(numericTime * 1000);
  } else {
    dateObj = new Date(rawTime);
  }
  
  if (isNaN(dateObj.getTime())) {
    return "Invalid Time";
  }
  
  return dateObj.toLocaleTimeString("en-US", {
    timeZone: "UTC",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });
}

const NextFourGames: React.FC = () => {
  const { data, loading, error } = useQuery(GET_NEXT_FOUR_GAMES);

  if (loading) return <p>Loading games...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error.message}</p>;

  const allGames = data?.games || [];
  const nextFourGames = allGames.slice(1, 5);

  return (
    <div className="outer-container">
      <div className="table-container">
        <div className="table-header">
          <div>
            <FaListUl className="header-icon" />
            <h2>Recent Games</h2>
          </div>
        </div>

        <table className="game-table">
          <thead>
            <tr>
              <th>Game ID</th>
              <th>Total Pool</th>
              <th><span className="winner-text">Winner</span></th>
              <th>Status</th>
              <th>Start Time</th>
              <th>End Time</th>
            </tr>
          </thead>
          <tbody>
            {nextFourGames.map((game: any) => (
              <tr key={game.id}>
                <td>{game.id}</td>
                <td>{game.totalPool}</td>
                <td>{game.winner}</td>
                <td>
                  {game.status?.toUpperCase() === "ENDED" ? (
                    <span className="status-ended">ENDED</span>
                  ) : game.status?.toUpperCase() === "FAILED" ? (
                    <span className="status-failed">FAILED</span>
                  ) : (
                    <span>{game.status}</span>
                  )}
                </td>
                <td>{formatTime(game.startTime)}</td>
                <td>{formatTime(game.endTime)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NextFourGames;
