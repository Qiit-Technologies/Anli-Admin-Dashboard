"use client";

import { ArrowDown, Calendar, CloudUpload, ListFilterIcon } from "lucide-react";
import { Divider } from "../divider";
import {
  StatusBadge,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@/components/common/customTable";
import SearchWithIcon from "@/components/common/searchWithIcon";
import { useState } from "react";
import LoggedIssueModal from "./issueModal";

const transactions = [
  {
    issuesId: "LOG23#",
    issuesReport: "Guests unable to confirm onloine bookings",
    module: "Front Office",
    priority: "High",
    dateLogged: "23rd March 2024",
    status: "Open",
    color: "green",
  },
  {
    issuesId: "LOG23#",
    issuesReport: "Guests unable to confirm onloine bookings",
    module: "Front Office",
    priority: "High",
    dateLogged: "23rd March 2024",
    status: "Open",
    color: "green",
  },
  {
    issuesId: "LOG23#",
    issuesReport: "Guests unable to confirm onloine bookings",
    module: "Front Office",
    priority: "High",
    dateLogged: "23rd March 2024",
    status: "Open",
    color: "green",
  },
  {
    issuesId: "LOG23#",
    issuesReport: "Guests unable to confirm onloine bookings",
    module: "Front Office",
    priority: "High",
    dateLogged: "23rd March 2024",
    status: "Open",
    color: "green",
  },
];

export default function IssuesTable() {
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex flex-col px-6 py-4 sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-lg font-normal text-[#101828]">
          Current Reported Issues
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
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
            Print Issues
          </button>
        </div>
      </div>
      <Divider />
      <div className="flex justify-between items-start sm:items-center gap-3 px-4 py-5">
        <SearchWithIcon
          className="w-[478px]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button className="flex items-center justify-center gap-2 border rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full sm:w-auto">
          <ListFilterIcon size={16} />
          More filters
        </button>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <Thead>
            <Tr>
              <Th className="p-3 w-1">
                <input type="checkbox" />
              </Th>
              <Th>Issues ID</Th>
              <Th withIcon>Issues Report</Th>
              <Th withIcon>Module</Th>
              <Th withIcon>priority</Th>
              <Th withIcon>Date Logged</Th>
              <Th withIcon icon={<ArrowDown size={16} color="#667085" />}>
                Status
              </Th>
              <Th withIcon>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {transactions.map((row, i) => (
              <Tr key={i}>
                <Td>
                  <input type="checkbox" />
                </Td>
                <Td>{row.issuesId}</Td>
                <Td>{row.issuesReport}</Td>
                <Td>{row.module}</Td>
                <Td>{row.priority}</Td>
                <Td>{row.dateLogged}</Td>
                <Td>
                  <StatusBadge color={row.color} status={row.status} />
                </Td>
                <Td
                  className="text-blue-600 hover:underline cursor-pointer"
                  onClick={() => setShowModal(true)}
                >
                  View
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {showModal && <LoggedIssueModal onClose={() => setShowModal(false)} />}
      </div>
    </div>
  );
}
