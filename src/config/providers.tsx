"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Next13ProgressBar } from "next13-progressbar";
import { UserProvider } from "@/context/userContext";
import { BusinessProvider } from "@/context/businessContext";
import { ToastContainer } from "react-toastify";
// import "react-toastify/ReactToastify.css";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Next13ProgressBar
        height="4px"
        color="#007BFF"
        options={{ showSpinner: false }}
        showOnShallow
      />
      <UserProvider>
        <BusinessProvider>{children}</BusinessProvider>
      </UserProvider>
      <ToastContainer position="top-right" />
    </QueryClientProvider>
  );
}
