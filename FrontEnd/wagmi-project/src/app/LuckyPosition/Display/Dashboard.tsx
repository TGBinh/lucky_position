"use client";

import React from "react";
import CurrentGame from "../Read/CurrentGame";
import GameConfiguration from "../Read/GameConfiguration";
import RecentGames from "../Read/RecentGames";
import ActiveTime from "../Read/UpTime"
import "./Dashboard.css"; 

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <ActiveTime />
      <div className="top-row">
        <div className="column">
          <CurrentGame />
        </div>
        <div className="column">
          <GameConfiguration />
        </div>
      </div>

      <div className="bottom-row">
        <RecentGames />
      </div>
    </div>
  );
};

export default Dashboard;
