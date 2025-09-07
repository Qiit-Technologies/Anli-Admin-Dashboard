"use client";

import { useEffect, useState } from "react";
import Header from "../components/layout/header";
import Sidebar from "../components/layout/sidebar";
import UsersTable from "../components/staffs/usersTable";
import { useBusiness } from "@/context/businessContext";
import { useRouter } from "next/navigation";

export default function PaymentHistoryPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { business, loading } = useBusiness();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!business || Object.keys(business).length < 1)) {
      router.replace("/business-list");
    }
  }, [business, loading, router]);

  if (loading || !business) return null;

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
      <div className="flex-1 flex flex-col">
        <Header isOpen={menuOpen} setIsOpen={setMenuOpen} title="Staffs" />
        <main className="px-4 sm:px-8 md:px-10 py-10 space-y-6 bg-white">
          <UsersTable businessId={business.id?.toString()} />
        </main>
      </div>
    </div>
  );
}
