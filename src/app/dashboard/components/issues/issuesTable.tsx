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
import useSWR from "swr";
import getReports from "@/app/actions/report";
import { Spinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/common/pagination";

export default function IssuesTable({ businessId }: { businessId: string }) {
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: response, isLoading } = useSWR(`/super-admin/hotels`, () =>
    getReports({ page, limit, businessId })
  );

  const reports = response?.data?.reports || [];
  const totalPages = response?.totalPages || 1;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {isLoading ? (
        <div className="p-5 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-6 py-4 gap-3">
            <h2 className="text-lg font-normal text-[#101828]">
              Current Reported Issues
            </h2>
            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
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

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-4 sm:px-6 py-5">
            <SearchWithIcon
              className="w-full sm:w-[478px]"
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
                  <Th withIcon>Title</Th>
                  <Th withIcon>Description</Th>
                  <Th withIcon>Hotel ID</Th>
                  <Th withIcon icon={<ArrowDown size={16} color="#667085" />}>
                    Status
                  </Th>
                  <Th withIcon>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {reports.map((row, i) => (
                  <Tr key={i}>
                    <Td>
                      <input type="checkbox" />
                    </Td>
                    <Td>{i + 1}</Td>
                    <Td>{row.title}</Td>
                    <Td>{row.description}</Td>
                    <Td>{row.hotelId}</Td>
                    <Td>
                      <StatusBadge
                        status={row.status}
                        statusColorMap={{
                          unresolved: "yellow",
                          resolved: "green",
                        }}
                      />
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

            {showModal && (
              <LoggedIssueModal onClose={() => setShowModal(false)} />
            )}

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
