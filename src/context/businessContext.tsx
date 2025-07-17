"use client";

import { BusinessDTO } from "@/types/business";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface BusinessContextType {
  business: BusinessDTO | null;
  setBusiness: (business: BusinessDTO | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(
  undefined
);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [business, setBusinessState] = useState<BusinessDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedBusiness = localStorage.getItem("business");
    if (storedBusiness) {
      try {
        const parsed = JSON.parse(storedBusiness);
        setBusinessState(parsed);
      } catch {
        console.warn("Invalid business data in localStorage");
      }
    }
    setLoading(false);
  }, []);

  const setBusiness = (newBusiness: BusinessDTO | null) => {
    if (newBusiness) {
      localStorage.setItem("business", JSON.stringify(newBusiness));
    } else {
      localStorage.removeItem("business");
    }
    setBusinessState(newBusiness);
  };

  return (
    <BusinessContext.Provider
      value={{ business, setBusiness, loading, setLoading }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
}
