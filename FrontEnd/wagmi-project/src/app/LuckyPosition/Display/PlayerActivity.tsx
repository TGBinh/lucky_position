"use client";

import React from "react";
import PlayerList from "../Read/PlayerList";
import GameJoined from "../Read/GameJoined";
import "./PlayerActivity.css";

const PlayerActivity: React.FC = () => {
  return (
    <div className="dashboard-container">
      <div className="row">
        <div className="column">
          <PlayerList />
        </div>
        <div className="column">
          <GameJoined />
        </div>
      </div>
    </div>
  );
};

export default PlayerActivity;
