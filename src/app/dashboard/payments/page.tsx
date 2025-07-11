"use client";

import { useState } from "react";
import Header from "../components/layout/header";
import Sidebar from "../components/layout/sidebar";
import PaymentHistoryTable from "../components/paymentHistory/paymentHistoryTable";

export default function PaymentHistoryPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
      <div className="flex-1 flex flex-col">
        <Header
          isOpen={menuOpen}
          setIsOpen={setMenuOpen}
          title="Payment History"
        />
        <main className="px-4 sm:px-8 md:px-12 py-10 space-y-6 bg-white">
          <PaymentHistoryTable />
        </main>
      </div>
    </div>
  );
}
