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
import { Pagination } from "@/components/common/pagination";
import { useDebounce } from "@/hooks/useDebounce";
import useSWR from "swr";
import getStaff from "@/app/actions/staff";
import { Spinner } from "@/components/ui/spinner";

export default function UsersTable({ businessId }: { businessId: string }) {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);
  const limit = 10;

  const { data: response, isLoading } = useSWR(
    [`/super-admin/get-staff`, page, limit, debouncedQuery, businessId],
    () =>
      getStaff({
        page,
        limit,
        searchTerm: debouncedQuery,
        businessId: businessId,
      })
  );

  const staff = response?.data?.staffs ?? [];
  const totalPages = response?.totalPages ?? 1;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {isLoading ? (
        <div className="p-5">
          <Spinner>Loading component</Spinner>
        </div>
      ) : (
        <>
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
                  <Th withIcon>Work Mode</Th>
                  <Th withIcon>Employee Type</Th>
                  <Th withIcon icon={<ArrowDown size={16} color="#667085" />}>
                    Employee Status
                  </Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {staff.map((row, i) => (
                  <Tr key={i}>
                    <Td>
                      <div className="flex items-center gap-2">
                        <Image
                          src={
                            row?.profileImage ||
                            `https://ui-avatars.com/api/?name=${row.fullName?.replaceAll(
                              " ",
                              "-"
                            )}`
                          }
                          alt={row.fullName}
                          className="w-6 h-6 rounded-full"
                          width={24}
                          height={24}
                          unoptimized
                        />
                        <span>{row.fullName}</span>
                      </div>
                    </Td>
                    <Td>{row.email}</Td>
                    <Td>{row.workMode}</Td>
                    <Td>{row.type}</Td>
                    <Td>
                      <StatusBadge
                        status={row.status}
                        statusColorMap={{
                          online: "green",
                          offline: "red",
                        }}
                      />
                    </Td>
                    <Td className="text-blue-600 hover:underline cursor-pointer py-4 px-4">
                      View
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            <Pagination
              totalPages={totalPages}
              page={page}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  );
}
