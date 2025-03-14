"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavigationBar.css";
import ConnectWallet from "./ConnectWallet";

const NavigationBar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="lucky-frame">
      <ConnectWallet />
      <div className="brand-container">
        <div className="lucky-icon">⚡</div>
        <div className="lucky-label">Lucky Position</div>
      </div>
      <div className="nav-frame">
        <nav className="nav-container">
          <Link
            className={`nav-button ${location.pathname === "/all-games" ? "active" : ""}`}
            to="/all-games"
          >
            All Games
          </Link>
          <Link
            className={`nav-button ${location.pathname === "/dashboard" ? "active" : ""}`}
            to="/dashboard"
          >
            Dashboard
          </Link>
          <Link
            className={`nav-button ${location.pathname === "/player-activity" ? "active" : ""}`}
            to="/player-activity"
          >
            Player Activity
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default NavigationBar;
