"use client";

import React, { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import "./DashboardTables.css";

const GET_GAMES = gql`
  query GetGames {
    games {
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

const AllGames = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, loading, error } = useQuery(GET_GAMES);

  const filteredGames = data?.games.filter((game: any) =>
    game.id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="table-container">
      <div className="table-header">
        <h2>All Games</h2>
        <input
          type="text"
          placeholder="Search by game ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="table-content">
        {loading ? (
          <p>Loading games...</p>
        ) : error ? (
          <p style={{ color: "red" }}>Error: {error.message}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Ticket Price</th>
                <th>Total Pool</th>
                <th>Winner</th>
                <th>Status</th>
                <th>Start Time</th>
                <th>End Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredGames.map((game: any) => (
                <tr key={game.id}>
                  <td>{game.id}</td>
                  <td>{game.ticketPrice}</td>
                  <td>{game.totalPool}</td>
                  <td>{game.winner}</td>
                  <td>{game.status}</td>
                  <td>{game.startTime}</td>
                  <td>{game.endTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AllGames;
