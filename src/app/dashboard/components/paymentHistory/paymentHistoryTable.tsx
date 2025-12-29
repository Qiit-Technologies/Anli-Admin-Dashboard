"use client";

import { ArrowDown, Calendar, ListFilterIcon } from "lucide-react";
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
const payments = [
  {
    date: "23rd March 2024",
    amount: "₦240,000,00.00",
    paymentMethod: "Transfer",
    status: "Paid",
    color: "green",
  },
  {
    date: "23rd March 2024",
    amount: "₦240,000,00.00",
    paymentMethod: "Transfer",
    status: "Paid",
    color: "green",
  },
  {
    date: "23rd March 2024",
    amount: "₦240,000,00.00",
    paymentMethod: "Transfer",
    status: "Paid",
    color: "green",
  },
  {
    date: "23rd March 2024",
    amount: "₦240,000,00.00",
    paymentMethod: "Transfer",
    status: "Paid",
    color: "green",
  },
  {
    date: "23rd March 2024",
    amount: "₦240,000,00.00",
    paymentMethod: "Transfer",
    status: "Paid",
    color: "green",
  },
];

export default function PaymentHistoryTable() {
  const [query, setQuery] = useState("");
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex flex-col px-4 sm:px-6 py-4 sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-base sm:text-lg font-normal text-[#101828]">
          Current Payment Transaction
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <SearchWithIcon
            className="w-full sm:w-[300px] md:w-[478px]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <button className="flex items-center justify-center gap-2 border rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full sm:w-auto">
            <Calendar size={16} />
            Select dates
          </button>
          <button className="flex items-center justify-center gap-2 border rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full sm:w-auto">
            <ListFilterIcon size={16} />
            Filters
          </button>
        </div>
      </div>
      <Divider className="mb-4" />
      {/* Table */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <Table>
          <Thead>
            <Tr>
              <Th withIcon>Date</Th>
              <Th withIcon>Amount</Th>
              <Th withIcon>Payment Method</Th>
              <Th withIcon icon={<ArrowDown size={16} color="#667085" />}>
                Status
              </Th>
              <Th withIcon>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {payments.map((row, i) => (
              <Tr key={i}>
                <Td>{row.date}</Td>
                <Td>{row.amount}</Td>
                <Td>{row.paymentMethod}</Td>
                <Td>
                  <StatusBadge
                    status={row.status}
                    statusColorMap={{
                      unpaid: "yellow",
                      paid: "green",
                    }}
                  />
                </Td>
                <Td className="text-blue-600 hover:underline cursor-pointer">
                  View
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </div>
  );
}
