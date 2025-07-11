"use client";

import { ArrowDown, Calendar, CloudUpload, ListFilterIcon } from "lucide-react";
import { Divider } from "../divider";
import SearchWithIcon from "@/components/common/searchWithIcon";
import { useState } from "react";
import {
  Thead,
  Table,
  Th,
  Tr,
  Td,
  Tbody,
  StatusBadge,
} from "@/components/common/customTable";

const planHistory = [
  {
    dateChanged: "23rd March 2024",
    previousPlan: "Basic",
    newPlan: "Pro",
    changedBy: "Super Admin",
    billingCycle: "Monthly",
    notes: "Upgrade due to high usage",
    color: "green",
  },
  {
    dateChanged: "23rd March 2024",
    previousPlan: "Basic",
    newPlan: "Pro",
    changedBy: "Super Admin",
    billingCycle: "Monthly",
    notes: "Upgrade due to high usage",
    color: "green",
  },
  {
    dateChanged: "23rd March 2024",
    previousPlan: "Basic",
    newPlan: "Pro",
    changedBy: "Super Admin",
    billingCycle: "Monthly",
    notes: "Upgrade due to high usage",
    color: "green",
  },
  {
    dateChanged: "23rd March 2024",
    previousPlan: "Basic",
    newPlan: "Pro",
    changedBy: "Super Admin",
    billingCycle: "Monthly",
    notes: "Upgrade due to high usage",
    color: "green",
  },
];

export default function PlanHistoryTable() {
  const [query, setQuery] = useState("");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-normal text-[#101828]">Plan History</h2>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
          <button className="flex items-center justify-center gap-2 border rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full sm:w-auto">
            <Calendar size={16} />
            Select dates
          </button>
          <button className="flex items-center justify-center gap-2 border rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full sm:w-auto">
            <ListFilterIcon size={16} />
            Filters
          </button>
          <button className="flex items-center justify-center gap-2 border rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full sm:w-auto">
            <CloudUpload size={16} />
            Export
          </button>
        </div>
      </div>

      <Divider />

      {/* Search Input */}
      <div className="px-4 sm:px-6 py-5">
        <SearchWithIcon
          className="w-full max-w-md"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <Thead>
            <Tr>
              <Th withIcon>Date Changed</Th>
              <Th withIcon>Previous Plan</Th>
              <Th withIcon>New Plan</Th>
              <Th withIcon>Changed By</Th>
              <Th withIcon icon={<ArrowDown size={16} color="#667085" />}>
                Billing Cycle
              </Th>
              <Th withIcon>Notes</Th>
            </Tr>
          </Thead>
          <Tbody>
            {planHistory.map((row, i) => (
              <Tr key={i}>
                <Td>{row.dateChanged}</Td>
                <Td>{row.previousPlan}</Td>
                <Td>{row.newPlan}</Td>
                <Td>{row.changedBy}</Td>
                <Td>
                  <StatusBadge color={row.color} status={row.billingCycle} />
                </Td>
                <Td>{row.notes}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </div>
  );
}
