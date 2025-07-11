"use client";

import Header from "../components/layout/header";
import IssuesTable from "../components/issues/issuesTable";
import Sidebar from "../components/layout/sidebar";
import { useState } from "react";

export default function IssuesPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
      <div className="flex-1 flex flex-col">
        <Header isOpen={menuOpen} setIsOpen={setMenuOpen} title="Issues Logs" />
        <main className="px-4 sm:px-8 md:px-12 py-10 space-y-6 bg-white">
          <IssuesTable />
        </main>
      </div>
    </div>
  );
}
