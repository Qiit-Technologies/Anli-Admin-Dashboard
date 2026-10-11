"use client";

import { useEffect, useState } from "react";
import Header from "../components/layout/header";
import Sidebar from "../components/layout/sidebar";
import UsersTable from "../components/staffs/usersTable";
import RolesManager from "../components/staffs/RolesManager";
import { useBusiness } from "@/context/businessContext";
import { useRouter } from "next/navigation";

type StaffTab = "staff" | "roles";

export default function PaymentHistoryPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  // M9: Roles section lives here as a tab — templates + custom role CRUD.
  const [tab, setTab] = useState<StaffTab>("staff");

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
        <Header isOpen={menuOpen} setIsOpen={setMenuOpen} title="Staffs" />
        <main className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-10 space-y-4 sm:space-y-6 bg-white overflow-y-auto overflow-x-hidden flex-1 min-h-0">
          <div className="flex items-center gap-1 border-b">
            {(
              [
                { key: "staff", label: "Staff" },
                { key: "roles", label: "Roles & permissions" },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  tab === t.key
                    ? "border-[#FF6F00] text-[#FF6F00]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {tab === "staff" ? (
            <UsersTable businessId={business.id?.toString()} />
          ) : (
            <RolesManager businessId={business.id?.toString()} />
          )}
        </main>
      </div>
    </div>
  );
}
