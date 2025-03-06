"use client";

import React, { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import "./DashboardTables.css";

const GET_PLAYERS = gql`
  query GetPlayers {
    players {
      id
      game {
        id
      }
      playerId
      playerAddress
      joinedAt
    }
  }
`;

const PlayerList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, loading, error } = useQuery(GET_PLAYERS);

  const filteredPlayers = data?.players.filter((player: any) =>
    player.game && player.game.id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="table-container">
      <div className="table-header">
        <h2>Player List</h2>
        <input
          type="text"
          placeholder="Search by game ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="table-content">
        {loading ? (
          <p>Loading players...</p>
        ) : error ? (
          <p style={{ color: "red" }}>Error: {error.message}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Game ID</th>
                <th>Player ID</th>
                <th>Player Address</th>
                <th>Joined At</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player: any) => (
                <tr key={player.id}>

                  <td>{player.id}</td>
                  <td>{player.game ? player.game.id : "-"}</td>
                  <td>{player.playerId}</td>
                  <td>{player.playerAddress}</td>
                  <td>{player.joinedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PlayerList;
