"use client";

import React, { useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { FaListUl } from "react-icons/fa";
import "./PlayerList.css"; 

const GET_PLAYERS_CONNECTION = gql`
  query GetPlayersConnection($searchTerm: String) {
    playersConnection(
      orderBy: game_endTime_ASC,
      where: { game: { id_contains: $searchTerm } }
    ) {
      totalCount
    }
  }
`;

const GET_PLAYERS_OFFSET = gql`
  query MyQuery($limit: Int, $offset: Int, $searchTerm: String) {
    players(limit: $limit, offset: $offset, where: { game: { id_contains: $searchTerm } }, orderBy: game_endTime_ASC) {
      game {
        id
      }
      playerId
      playerAddress
      joinedAt
    }
  }
`;

function formatDateTimeGMT(rawTime?: string): string {
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

const PlayerList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const limit = 10;
  const offset = page * limit;

  const { data: dataConn, loading: loadingConn, error: errorConn } = useQuery(GET_PLAYERS_CONNECTION, {
    variables: { searchTerm },
    fetchPolicy: "cache-and-network",
  });

  const { data: dataOffset, loading: loadingOffset, error: errorOffset } = useQuery(GET_PLAYERS_OFFSET, {
    variables: { limit, offset, searchTerm },
    fetchPolicy: "cache-and-network",
  });

  const totalCount = dataConn?.playersConnection.totalCount || 0;
  const totalPages = Math.ceil(totalCount / limit);

  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const players = dataOffset?.players || [];

  return (
    <div className="outer-container2">
      <div className="table-container2">
        <div className="table-header2">
          <div className="header-left2">
            <FaListUl className="header-icon2" />
            <h2>Player List</h2>
          </div>
          <input
            type="text"
            placeholder="Search by game ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="table-content">
          {loadingConn || loadingOffset ? (
            <p>Loading players...</p>
          ) : errorConn || errorOffset ? (
            <p style={{ color: "red" }}>
              Error: {(errorConn && errorConn.message) || (errorOffset && errorOffset.message)}
            </p>
          ) : (
            <>
              <table className="player-table">
                <thead>
                  <tr>
                    <th className="col-game-id">Game ID</th>
                    <th className="col-player-id">Player ID</th>
                    <th className="col-player-address">Player Address</th>
                    <th className="col-joined-at">Joined At</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player: any) => (
                    <tr key={player.playerId}>
                      <td className="col-game-id">{player.game ? player.game.id : "-"}</td>
                      <td className="col-player-id">{player.playerId}</td>
                      <td className="col-player-address">{player.playerAddress}</td>
                      <td className="col-joined-at">{formatDateTimeGMT(player.joinedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination">
                <button onClick={handlePrevPage} disabled={page === 0}>
                  Previous
                </button>
                <span style={{ margin: "0 8px", display: "inline-flex", alignItems: "center" }}>
                  Page{" "}
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={page + 1}
                    onChange={(e) => {
                      const newPage = Number(e.target.value) - 1;
                      if (!isNaN(newPage) && newPage >= 0 && newPage < totalPages) {
                        setPage(newPage);
                      }
                    }}
                    style={{ width: "50px", textAlign: "center", margin: "0 4px" }}
                  />
                  of {totalPages}
                </span>
                <button onClick={handleNextPage} disabled={page >= totalPages - 1}>
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerList;
