"use client";

import React from "react";
import AllGames from "../Read/AllGames";
import PlayerList from "../Read/PlayerList";
import OwnerDisplay from "../Read/Owner";

import "./Dashboard.css"; 

const DisplayAllGames: React.FC = () => {
  return (
    <div className="dashboard-container">
      <OwnerDisplay />
      <div className="top-row">
        <div className="column">
          <AllGames />
        </div>
      </div>

      <div className="bottom-row">
      </div>
    </div>
  );
};

export default DisplayAllGames;
