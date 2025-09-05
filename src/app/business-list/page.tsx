"use client";

import BusinessList from "./components/businessList";
import { useUser } from "@/context/userContext";
import { useRouter } from "next13-progressbar";
import { useEffect } from "react";

export default function Page() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || Object.keys(user).length < 1)) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F47411] mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || Object.keys(user).length < 1) {
    return null; // Will redirect to login
  }

  return <BusinessList />;
}
