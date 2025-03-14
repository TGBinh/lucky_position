"use client";

import React from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import NavigationBar from "./NavigationBar";
import Dashboard from "./LuckyPosition/Display/Dashboard";
import DisplayAllGames from "./LuckyPosition/Display/DisplayAllGames";
import PlayerActivity from "../app/LuckyPosition/Display/PlayerActivity";
import GameSettings from "./GameSettings";

function Home() {
  return (
    <Router>
      <NavigationBar />
      <GameSettings />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/all-games" element={<DisplayAllGames />} />
        <Route path="/player-activity" element={<PlayerActivity />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}
export default Home