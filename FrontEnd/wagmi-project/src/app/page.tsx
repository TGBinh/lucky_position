"use client";

import React from "react";
import { useAccount } from "wagmi";
import Header from "./Header";
import ConnectWallet from "./ConnectWallet";
import AdminSidebar from "./AdminSideBar";
import DashboardTables from "./LuckyPosition/Read/DashboardTables";
import ActiveTime from  "./LuckyPosition/Read/UpTime";
import OwnerDisplay from  "./LuckyPosition/Read/Owner";
import ClaimRefund from  "./LuckyPosition/Write/ClaimRefund";

export default function Home() {
  const { address } = useAccount();


  return (
    <div>
      <Header />
      <ConnectWallet />
      <AdminSidebar />
      <main style={{ padding: "20px" }}>
        <DashboardTables />
        <ActiveTime />
        <OwnerDisplay />
        <ClaimRefund />
      </main>
    </div>
  );
}
