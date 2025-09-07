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

const transactions = [
  {
    date: "23rd March 2024",
    amount: "₦240,000,000.00",
    method: "Transfer",
    status: "Paid",
    color: "green",
  },
  {
    date: "01 January 2024",
    amount: "₦240,000,000.00",
    method: "POS",
    status: "Failed",
    color: "red",
  },
  {
    date: "31st June 2025",
    amount: "₦240,000,000.00",
    method: "Cash",
    status: "Paid",
    color: "green",
  },
];

export default function PaymentTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex flex-col px-6 py-4 sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-lg font-normal text-[#101828]">
          Current Payment Transaction
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
        </div>
      </div>
      <Divider className="mb-4" />
      {/* Table */}
      <div className="overflow-x-auto">
        <Table minWidth="500px">
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
            {transactions.map((row, i) => (
              <Tr key={i}>
                <Td>{row.date}</Td>
                <Td>{row.amount}</Td>
                <Td>{row.method}</Td>
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
