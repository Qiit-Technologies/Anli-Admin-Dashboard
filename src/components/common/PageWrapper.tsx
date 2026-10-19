"use client";

import type { ReactNode } from "react";
import HqShell from "@/app/dashboard/components/layout/hq-shell";

export default function PageWrapper({
  title = "Admin",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <HqShell title={title}>{children}</HqShell>
  );
}
