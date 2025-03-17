"use client";

import React, { useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { FaListUl } from "react-icons/fa";
import { useAccount } from "wagmi";
import ConnectWallet from "../../ConnectWallet";
import ClaimRefundButton from "../Write/ClaimRefund";
import { publicClient, walletClient } from "../../../client";
import { contract } from "../LuckyPositionAbi";
import { Address } from "viem";
import "./GameJoined.css"; 

const GET_PLAYERS_CONNECTION = gql`
  query GetPlayersConnection($searchTerm: String, $currentUser: String) {
    playersConnection(
      orderBy: game_endTime_ASC,
      where: {
        playerAddress_containsInsensitive: $currentUser,
        game: { id_contains: $searchTerm }
      }
    ) {
      totalCount
    }
  }
`;

const GET_PLAYERS_OFFSET = gql`
  query GetPlayersOffset($limit: Int, $offset: Int, $searchTerm: String, $currentUser: String) {
    players(limit: $limit, offset: $offset, orderBy: game_endTime_ASC, where: { 
      game: { id_contains: $searchTerm },
      playerAddress_containsInsensitive: $currentUser
    }) {
      game {
        id
        status
        winner
        refundClaimGames(where: { refundClaim: { playerAddress_containsInsensitive: $currentUser } }) {
          id
        }
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

const GameJoined = () => {
  const { address, isConnected } = useAccount();
  const currentUser = address ?? "";
  
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const limit = 10;
  const offset = page * limit;

  const { data: dataConn, loading: loadingConn, error: errorConn } = useQuery(GET_PLAYERS_CONNECTION, {
    variables: { searchTerm, currentUser },
    fetchPolicy: "cache-and-network",
  });

  const { data: dataOffset, loading: loadingOffset, error: errorOffset } = useQuery(GET_PLAYERS_OFFSET, {
    variables: { limit, offset, searchTerm, currentUser },
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

  const renderNote = (game: any) => {
    if (game.status === "ENDED") {
      if (game.winner && game.winner.toLowerCase() === currentUser.toLowerCase()) {
        return <span title="You won!" className="note-crown">👑</span>;
      }
      return <span title="Lost" className="note-red-x">✖</span>;
    }
    if (game.status === "CREATED") {
      return <span title="Game in progress" className="note-clock">⏰</span>;
    }
    if (game.status === "PAUSED") {
      return <span title="Game Paused" className="note-red-x">✖</span>;
    }
    if (game.status === "FAILED") {
      if (game.refundClaimGames && game.refundClaimGames.length > 0) {
        return <span title="Refund Claimed" className="note-claimed">Claimed</span>;
      } else {
        return <ClaimRefundButton gameId={game.id} />;
      }
    }
    return "";
  };

  const handleClaimAllRefund = async () => {
    const unclaimedGameIDs = players
      .filter((player: any) => player.game && player.game.status.toUpperCase() === "FAILED" && (!player.game.refundClaimGames || player.game.refundClaimGames.length === 0))
      .map((player: any) => player.game.id);

    if (unclaimedGameIDs.length === 0) {
      alert("No unclaimed refunds available.");
      return;
    }

    try {
      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: "claimRefund",
        args: [unclaimedGameIDs.map((id: string) => BigInt(id))],
        account: address as Address,
      });

      const txHash = await walletClient.writeContract(request);
      console.log("Claim all refund transaction hash:", txHash);
      alert("Refund claimed successfully for games: " + unclaimedGameIDs.join(", "));
    } catch (err: any) {
      console.error("Error claiming all refund:", err);
      alert(err.message || "An error occurred while claiming all refund.");
    }
  };

  return (
    <div className="outer-container-gamejoined">
      <div className="table-container-gamejoined">
        <div className="table-header-gamejoined">
          <div className="header-left-gamejoined">
            <FaListUl className="header-icon-gamejoined" />
            <h2>My Joined Games</h2>
          </div>
          <input
            className="search-input"
            type="text"
            placeholder="Search by game ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {isConnected && (
          <div className="claim-all-container">
            <button className="claim-all-button" onClick={handleClaimAllRefund}>
              Claim All Refund
            </button>
          </div>
        )}
        <div className="table-content-gamejoined">
          {!isConnected ? (
            <p className="connect-notice">
              Connect wallet to see your joined games.
            </p>
          ) : (
            <>
              {loadingConn || loadingOffset ? (
                <p>Loading games...</p>
              ) : errorConn || errorOffset ? (
                <p className="error">
                  Error: {(errorConn && errorConn.message) || (errorOffset && errorOffset.message)}
                </p>
              ) : (
                <>
                  <table className="game-table-gamejoined">
                    <thead>
                      <tr>
                        <th>Game ID</th>
                        <th>Status</th>
                        <th>Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.length > 0 ? (
                        players.map((player: any) => (
                          <tr key={player.playerId}>
                            <td>{player.game ? player.game.id : "-"}</td>
                            <td>
                              {player.game.status?.toUpperCase() === "ENDED" ? (
                                <span className="status-ended">ENDED</span>
                              ) : player.game.status?.toUpperCase() === "FAILED" ? (
                                <span className="status-failed">FAILED</span>
                              ) : player.game.status?.toUpperCase() === "PAUSED" ? (
                                <span className="status-paused">PAUSED</span>
                              ) : player.game.status?.toUpperCase() === "CREATED" ? (
                                <span className="status-created">CREATED</span>
                              ) : (
                                <span>{player.game.status}</span>
                              )}
                            </td>
                            <td>{renderNote(player.game)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="no-data-gamejoined">
                            No games to display.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {players.length > 0 && (
                    <div className="pagination-gamejoined">
                      <button onClick={handlePrevPage} disabled={page === 0}>
                        Previous
                      </button>
                      <span className="page-info">
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
                        />{" "}
                        of {totalPages}
                      </span>
                      <button onClick={handleNextPage} disabled={page >= totalPages - 1}>
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameJoined;
