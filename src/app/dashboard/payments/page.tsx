"use client";

import { useState } from "react";
import Header from "../components/layout/header";
import Sidebar from "../components/layout/sidebar";
import PaymentHistoryTable from "../components/paymentHistory/paymentHistoryTable";

export default function PaymentHistoryPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-col sm:flex-row overflow-hidden">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <Header
          isOpen={menuOpen}
          setIsOpen={setMenuOpen}
          title="Payment History"
        />
        <main className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-10 space-y-4 sm:space-y-6 bg-white overflow-y-auto overflow-x-hidden flex-1 min-h-0">
          <PaymentHistoryTable />
        </main>
      </div>
    </div>
  );
}
