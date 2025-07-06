"use client";

import {
  ArrowDown,
  Calendar,
  CircleQuestionMark,
  ListFilterIcon,
} from "lucide-react";
import { Divider } from "./divider";

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
    status: "Transaction Failed",
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
      <div className="flex flex-col p-4 sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-md font-normal text-[#101828]">
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
        <table className="w-full text-sm text-left min-w-[600px]">
          <thead className="text-gray-500 border-b">
            <tr>
              <th className="py-3 px-4 bg-[#EAECF0]">
                <div className="flex items-center gap-2 font-medium text-[#667085]">
                  Date <CircleQuestionMark size={16} color="#667085" />
                </div>
              </th>
              <th className="py-3 px-4 bg-[#EAECF0]">
                <div className="flex items-center gap-2 font-medium text-[#667085]">
                  Amount <CircleQuestionMark size={16} color="#667085" />
                </div>
              </th>
              <th className="py-3 px-4 bg-[#EAECF0]">
                <div className="flex items-center gap-2 font-medium text-[#667085]">
                  Payment Method{" "}
                  <CircleQuestionMark size={16} color="#667085" />
                </div>
              </th>
              <th className="py-3 px-4 bg-[#EAECF0]">
                <div className="flex items-center gap-2 font-medium text-[#667085]">
                  Status <ArrowDown size={16} color="#667085" />
                </div>
              </th>
              <th className="py-3 px-4 bg-[#EAECF0]">
                <div className="flex items-center gap-2 font-medium text-[#667085]">
                  Action <CircleQuestionMark size={16} color="#667085" />
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            {transactions.map((row, i) => (
              <tr key={i} className="border-t">
                <td className="py-4 px-4">{row.date}</td>
                <td className="py-4 px-4">{row.amount}</td>
                <td className="py-4 px-4">{row.method}</td>
                <td className="py-4 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      row.color === "green"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        row.color === "green" ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></span>
                    {row.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-blue-600 hover:underline cursor-pointer">
                  View
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
