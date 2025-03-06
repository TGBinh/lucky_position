"use client";

import React, { useState } from "react";
import AllGames from "./AllGames";
import CurrentGame from "./CurrentGame";
import PlayerList from "./PlayerList";
import GameConfiguration from "./GameConfiguration";
import "./DashboardTables.css";

type TableKey = "games" | "current" | "players" | "gameConfiguration";

const DashboardTables = () => {
  const [activeTable, setActiveTable] = useState<TableKey>("current");
  
  const ordering: TableKey[] = ["games", "current", "players", "gameConfiguration"];
  const activeIndex = ordering.indexOf(activeTable);
  const leftKey = ordering[(activeIndex - 1 + ordering.length) % ordering.length];
  const rightKey = ordering[(activeIndex + 1) % ordering.length];
  const hiddenKey = ordering[(activeIndex + 2) % ordering.length];
  
  const positions: Record<TableKey, string> = {
    games: "",
    current: "",
    players: "",
    gameConfiguration: "",
  };
  
  positions[activeTable] = "center";
  positions[leftKey] = "left";
  positions[rightKey] = "right";
  positions[hiddenKey] = "hidden";

  const tableComponents: Record<TableKey, JSX.Element> = {
    games: <AllGames />,
    current: <CurrentGame />,
    players: <PlayerList />,
    gameConfiguration: <GameConfiguration />,
  };

  return (
    <div className="dashboard-container">
      {ordering.map((key) => (
        <div
          key={key}
          className={`table-wrapper ${positions[key]} ${activeTable === key ? "active" : "inactive"}`}
          onClick={() => {
            if (activeTable !== key) setActiveTable(key);
          }}
        >
          {tableComponents[key]}
        </div>
      ))}
    </div>
  );
};

export default DashboardTables;
