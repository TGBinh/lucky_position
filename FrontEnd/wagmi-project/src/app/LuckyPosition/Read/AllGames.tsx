"use client";

import React, { useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { FaListUl } from "react-icons/fa";
import "./AllGames.css";

const GET_GAMES_CONNECTION = gql`
  query GetGamesConnection($first: Int, $after: String, $searchTerm: String) {
    gamesConnection(
      orderBy: [endTime_ASC, id_ASC]
      where: { id_contains: $searchTerm }
      first: $first
      after: $after
    ) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

const GET_GAMES_OFFSET = gql`
  query MyQuery($limit: Int, $offset: Int, $searchTerm: String) {
    games(limit: $limit, offset: $offset, orderBy: endTime_ASC, where: { id_contains: $searchTerm }) {
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

function formatEth(valueInWei: number, maxDecimals: number = 8): string {
  const ethValue = Number(valueInWei) / 1e18;
  return ethValue.toLocaleString("en-US", {
    maximumFractionDigits: maxDecimals,
    minimumFractionDigits: 0,
  });
}

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

const AllGames = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);

  const limit = 10;
  const offset = page * limit;

  const {
    data: dataConn,
    loading: loadingConn,
    error: errorConn,
  } = useQuery(GET_GAMES_CONNECTION, {
    variables: { first: limit, after: null, searchTerm },
    fetchPolicy: "cache-and-network",
  });

  const {
    data: dataOffset,
    loading: loadingOffset,
    error: errorOffset,
  } = useQuery(GET_GAMES_OFFSET, {
    variables: { limit, offset, searchTerm },
    fetchPolicy: "cache-and-network",
  });

  const totalCount = dataConn?.gamesConnection.totalCount || 0;
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

  const games = dataOffset?.games || [];

  return (
    <div className="outer-container1">
      <div className="table-container">
        <div className="table-header">
          <div className="header-left">
            <FaListUl className="header-icon" />
            <h2>All Games</h2>
          </div>
          <input
            type="text"
            placeholder="Search by game ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="table-content" style={{ minHeight: "550px" }}>
          {loadingConn || loadingOffset ? (
            <p>Loading games...</p>
          ) : errorConn || errorOffset ? (
            <p style={{ color: "red" }}>
              Error:{" "}
              {(errorConn && errorConn.message) ||
                (errorOffset && errorOffset.message)}
            </p>
          ) : (
            <>
              <table className="game-table1">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Ticket Price</th>
                    <th>Total Pool</th>
                    <th><span className="winner-text">Winner</span></th>
                    <th>Status</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((game: any) => (
                    <tr key={game.id}>
                      <td>{game.id}</td>
                      <td>{formatEth(game.ticketPrice)}</td>
                      <td>{formatEth(game.totalPool)}</td>
                      <td>{game.winner}</td>
                      <td>
                        {game.status?.toUpperCase() === "ENDED" ? (
                          <span className="status-ended">ENDED</span>
                        ) : game.status?.toUpperCase() === "FAILED" ? (
                          <span className="status-failed">FAILED</span>
                        ) : game.status?.toUpperCase() === "PAUSED" ? (
                          <span className="status-paused">PAUSED</span>
                        ) : game.status?.toUpperCase() === "CREATED" ? (
                          <span className="status-created">CREATED</span>
                        ) : (
                          <span>{game.status}</span>
                        )}
                      </td>
                      <td>{formatDateTimeGMT(game.startTime)}</td>
                      <td>{formatDateTimeGMT(game.endTime)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div
                className="pagination"
                style={{ marginTop: "16px", textAlign: "center" }}
              >
                <button onClick={handlePrevPage} disabled={page === 0}>
                  Previous
                </button>
                <span
                  style={{
                    margin: "0 8px",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  Page{" "}
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={page + 1}
                    onChange={(e) => {
                      const newPage = Number(e.target.value) - 1;
                      if (
                        !isNaN(newPage) &&
                        newPage >= 0 &&
                        newPage < totalPages
                      ) {
                        setPage(newPage);
                      }
                    }}
                    style={{
                      width: "50px",
                      textAlign: "center",
                      margin: "0 4px",
                    }}
                  />
                  of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={page >= totalPages - 1}
                >
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

export default AllGames;
