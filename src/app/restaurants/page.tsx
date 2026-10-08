"use client";

import { useState } from "react";
import RestaurantLanding from "@/components/restaurants/RestaurantLanding";
import { CatalogAdmin } from "./catalog-admin";

type RestaurantsView = "discover" | "catalog";

// Merge of both branches' /restaurants pages:
// - "Discover" (feature/loyalty-admin): customer-facing restaurant landing.
// - "Catalog" (main): scraped-restaurant catalog admin.
// Nothing from either side removed.
export default function RestaurantsPage() {
  const [view, setView] = useState<RestaurantsView>("discover");

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center gap-2 px-4 py-2 bg-[#0B0B0B] text-white text-sm shrink-0 z-50">
        <span className="font-semibold mr-2">Restaurants:</span>
        <button
          onClick={() => setView("discover")}
          className={`px-3 py-1 rounded-full font-medium cursor-pointer ${
            view === "discover"
              ? "bg-[#007BFF] text-white"
              : "bg-white/10 text-white/70 hover:bg-white/20"
          }`}
        >
          Discover
        </button>
        <button
          onClick={() => setView("catalog")}
          className={`px-3 py-1 rounded-full font-medium cursor-pointer ${
            view === "catalog"
              ? "bg-[#007BFF] text-white"
              : "bg-white/10 text-white/70 hover:bg-white/20"
          }`}
        >
          Catalog Admin
        </button>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        {view === "discover" ? <RestaurantLanding /> : <CatalogAdmin />}
      </div>
    </div>
  );
}
