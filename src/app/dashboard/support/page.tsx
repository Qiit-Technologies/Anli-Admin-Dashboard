"use client";

import HqShell from "../components/layout/hq-shell";
import { SupportTicketsView } from "../components/support/SupportTicketsView";

export default function DashboardSupportPage() {
  return (
    <HqShell title="Support Tickets">
      <SupportTicketsView />
    </HqShell>
  );
}
