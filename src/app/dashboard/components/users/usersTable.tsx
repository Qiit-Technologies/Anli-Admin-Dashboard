"use client";

import { ArrowDown, Calendar, ListFilterIcon } from "lucide-react";
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
import Image from "next/image";

const users = [
  {
    employeeName: "Goodness Amaechi",
    emailAddress: "test@gmail.com",
    jobTitle: "User Experience",
    department: "Design",
    employeeType: "Full-time",
    employeeStatus: "Active",
    color: "green",
  },
  {
    employeeName: "Goodness Amaechi",
    emailAddress: "test@gmail.com",
    jobTitle: "User Experience",
    department: "Design",
    employeeType: "Full-time",
    employeeStatus: "Active",
    color: "green",
  },
  {
    employeeName: "Goodness Amaechi",
    emailAddress: "test@gmail.com",
    jobTitle: "User Experience",
    department: "Design",
    employeeType: "Full-time",
    employeeStatus: "Active",
    color: "green",
  },
  {
    employeeName: "Goodness Amaechi",
    emailAddress: "test@gmail.com",
    jobTitle: "User Experience",
    department: "Design",
    employeeType: "Full-time",
    employeeStatus: "Active",
    color: "green",
  },
];

export default function UsersTable() {
  const [query, setQuery] = useState("");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex flex-col px-6 py-4 sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-lg font-normal text-[#101828]">Users</h2>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <SearchWithIcon
            className="w-[478px]"
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
      <div className="overflow-x-auto">
        <Table>
          <Thead>
            <Tr>
              <Th withIcon>Employee Name</Th>
              <Th withIcon>Email Address</Th>
              <Th withIcon>Job Title</Th>
              <Th withIcon>Department</Th>
              <Th withIcon>Employee Type</Th>
              <Th withIcon icon={<ArrowDown size={16} color="#667085" />}>
                Employee Status
              </Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((row, i) => (
              <Tr key={i}>
                <Td>
                  <div className="flex items-center gap-2">
                    <Image
                      src={`https://ui-avatars.com/api/?name=${row.employeeName?.replaceAll(' ', '-')}`}
                      alt={row.employeeName}
                      className="w-6 h-6 rounded-full"
                      width={24}
                      height={24}
                    />
                    <span>{row.employeeName}</span>
                  </div>
                </Td>
                <Td>{row.emailAddress}</Td>
                <Td>{row.jobTitle}</Td>
                <Td>{row.department}</Td>
                <Td>{row.employeeType}</Td>
                <Td>
                  <StatusBadge color={row.color} status={row.employeeStatus} />
                </Td>
                <Td className="text-blue-600 hover:underline cursor-pointer text-center">
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
