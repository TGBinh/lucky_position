"use client";

import React, { useState } from "react";
import CreateGame from "./LuckyPosition/Write/CreateGame";
import SetAllowedToken from "./LuckyPosition/Write/SetAllowedToken";
import SetFeePercentage from "./LuckyPosition/Write/SetFeePercentage";
import SetPauseTime from "./LuckyPosition/Write/SetPauseTime";
import SetResumeTime from "./LuckyPosition/Write/SetResumeTime";
import SetGameParams from "./LuckyPosition/Write/SetGameParams";
import SetVRFParameters from "./LuckyPosition/Write/SetVRFParameters";
import SetForwarder from "./LuckyPosition/Write/SetForwarder";
import PauseGame from "./LuckyPosition/Write/PauseGame";
import ResumeGame from "./LuckyPosition/Write/ResumeGame";
import TransferOwnership from "./LuckyPosition/Write/TransferOwnership";
import WithdrawFee from "./LuckyPosition/Write/WithDrawFee";

import "./GameSettings.css";

const GameSettings = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedFunction, setSelectedFunction] = useState<string>("");

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedFunction("");
  };

  const selectFunction = (func: string) => {
    setSelectedFunction(func);
  };

  const renderFunctionList = () => (
    <div className="function-list">
      <button onClick={() => selectFunction("createGame")}>Create Game</button>
      <button onClick={() => selectFunction("pauseGame")}>Pause Game</button>
      <button onClick={() => selectFunction("resumeGame")}>Resume Game</button>
      <button onClick={() => selectFunction("setForwarder")}>
        Set Forwarder
      </button>
      <button onClick={() => selectFunction("setPauseTime")}>
        Set Pause Time
      </button>
      <button onClick={() => selectFunction("setResumeTime")}>
        Set Resume Time
      </button>
      <button onClick={() => selectFunction("setAllowedToken")}>
        Set Allowed Token
      </button>
      <button onClick={() => selectFunction("setGameParams")}>
        Set Game Params
      </button>
      <button onClick={() => selectFunction("setFeePercentage")}>
        Set Fee Percentage
      </button>
      <button onClick={() => selectFunction("setVRFParameters")}>
        Set VRF Parameters
      </button>
      <button onClick={() => selectFunction("transferOwnership")}>
        Transfer Ownership
      </button>
      <button onClick={() => selectFunction("withdrawFee")}>Withdraw Fee</button>
    </div>
  );

  const renderSelectedFunction = () => (
    <div className="selected-function">
      <button className="back-button" onClick={() => setSelectedFunction("")}>
        ← Back
      </button>
      {selectedFunction === "createGame" && <CreateGame />}
      {selectedFunction === "pauseGame" && <PauseGame />}
      {selectedFunction === "resumeGame" && <ResumeGame />}
      {selectedFunction === "setAllowedToken" && <SetAllowedToken />}
      {selectedFunction === "setFeePercentage" && <SetFeePercentage />}
      {selectedFunction === "setPauseTime" && <SetPauseTime />}
      {selectedFunction === "setResumeTime" && <SetResumeTime />}
      {selectedFunction === "setGameParams" && <SetGameParams />}
      {selectedFunction === "setVRFParameters" && <SetVRFParameters />}
      {selectedFunction === "setForwarder" && <SetForwarder />}
      {selectedFunction === "transferOwnership" && <TransferOwnership />}
      {selectedFunction === "withdrawFee" && <WithdrawFee />}
    </div>
  );

  return (
    <div className="admin-dashboard">
      <button className="gear-button" onClick={openModal}>
        ⚙
      </button>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close" onClick={closeModal}>
              &times;
            </button>
            {selectedFunction ? renderSelectedFunction() : renderFunctionList()}
          </div>
        </div>
      )}

      <main className="admin-content"></main>
    </div>
  );
};

export default GameSettings;
