"use client";

import Header from "../components/layout/header";
import IssuesTable from "../components/issues/issuesTable";
import Sidebar from "../components/layout/sidebar";
import { useEffect, useState } from "react";
import { useBusiness } from "@/context/businessContext";
import { useRouter } from "next/navigation";

export default function IssuesPage() {
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
    <div className="h-screen w-screen flex flex-col sm:flex-row overflow-hidden">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <Header isOpen={menuOpen} setIsOpen={setMenuOpen} title="Issues Logs" />
        <main className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-10 space-y-4 sm:space-y-6 bg-white overflow-y-auto overflow-x-hidden flex-1 min-h-0">
          <IssuesTable businessId={business.id?.toString()} />
        </main>
      </div>
    </div>
  );
}
