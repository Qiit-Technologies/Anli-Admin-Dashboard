"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { Next13ProgressBar } from "next13-progressbar";
import { UserProvider } from "@/context/userContext";

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
      <UserProvider>{children}</UserProvider>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
