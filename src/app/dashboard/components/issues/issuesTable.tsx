"use client";

import { Calendar, ListFilterIcon } from "lucide-react";
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
import useSWR from "swr";
import { Spinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/common/pagination";
import fetcher from "@/app/actions/fetcher";
import { getReportsResponse2 } from "@/app/actions/types";
import { AddIssueBtn } from "./AddIssueBtn";
import { ViewIssueSheet } from "./ViewIssueSheet";
import { ReportDTO } from "@/types/report";

export default function IssuesTable({ businessId }: { businessId: string }) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showIssueSheet, setShowIssueSheet] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });
  const [selectedReport, setSelectedReport] = useState<ReportDTO | null>(null);

  const {
    data: response,
    isLoading,
    mutate,
  } = useSWR(
    [
      `/super-admin/${businessId}/reports`,
      pagination.page,
      query,
      statusFilter,
      dateRange,
    ],
    () => {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        q: query,
      });

      if (statusFilter !== "all") params.append("status", statusFilter);
      if (dateRange.start) params.append("startDate", dateRange.start);
      if (dateRange.end) params.append("endDate", dateRange.end);

      return fetcher<getReportsResponse2>(
        `/super-admin/${businessId}/reports?${params.toString()}`,
      );
    },
  );

  const reports = response?.data.data || [];
  const totalPages = response?.data.meta.totalPages || 0;

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
              <button
                onClick={() => {
                  setShowDatePicker(!showDatePicker);
                  setShowFilters(false);
                }}
                className={`flex items-center justify-center gap-2 border rounded-md px-3 py-2 text-sm w-full sm:w-auto transition-colors ${
                  showDatePicker
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Calendar size={16} />
                Select dates
              </button>
              <button
                onClick={() => {
                  setShowFilters(!showFilters);
                  setShowDatePicker(false);
                }}
                className={`flex items-center justify-center gap-2 border rounded-md px-3 py-2 text-sm w-full sm:w-auto transition-colors ${
                  showFilters
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ListFilterIcon size={16} />
                Filters
              </button>
              <AddIssueBtn refetch={() => mutate()} businessId={businessId} />
            </div>
          </div>

          {/* Date Picker Panel */}
          {showDatePicker && (
            <div className="px-6 py-4 bg-gray-50 border-b">
              <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          start: e.target.value,
                        }))
                      }
                      className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          end: e.target.value,
                        }))
                      }
                      className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mb-1">
                  <button
                    onClick={() => setDateRange({ start: "", end: "" })}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="px-4 py-2 text-sm bg-white border rounded-md hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filters Panel */}
          {showFilters && (
            <div className="px-6 py-4 bg-gray-50 border-b">
              <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm min-w-[150px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="resolved">Resolved</option>
                    <option value="unresolved">Unresolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="flex gap-2 mb-1">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-4 py-2 text-sm bg-white border rounded-md hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          <Divider />

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-4 sm:px-6 py-5">
            <SearchWithIcon
              className="w-full sm:w-[300px] md:w-[478px]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <Table className="table-fixed w-full min-w-[600px]">
              <Thead>
                <Tr>
                  <Th className="p-3 w-1">
                    <input type="checkbox" />
                  </Th>
                  <Th className="w-[100px]">Issues ID</Th>
                  <Th className="w-[150px] truncate">Creator</Th>
                  <Th className="w-[300px] truncate">Description</Th>
                  <Th className="w-[100px]">Hotel ID</Th>
                  <Th className="w-[100px]">Status</Th>
                  <Th className="w-[100px]" withIcon>
                    Action
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {reports.map((row, i) => (
                  <Tr key={i}>
                    <Td>
                      <input type="checkbox" />
                    </Td>
                    <Td>{row.id}</Td>
                    <Td className="truncate">{row.createdBy}</Td>
                    <Td className="truncate">{row.description}</Td>
                    <Td> {row.hotelId}</Td>
                    <Td>
                      <StatusBadge
                        status={row.status}
                        statusColorMap={{
                          unresolved: "yellow",
                          resolved: "green",
                          open: "blue",
                          closed: "red",
                        }}
                      />
                    </Td>
                    <Td
                      className="text-blue-600 hover:underline cursor-pointer"
                      onClick={() => {
                        setSelectedReport(row);
                        setShowIssueSheet(true);
                      }}
                    >
                      View
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            {selectedReport && (
              <ViewIssueSheet
                open={showIssueSheet}
                report={selectedReport}
                businessId={businessId}
                setOpen={(val: boolean) => {
                  setSelectedReport(null);
                  setShowIssueSheet(val);
                }}
                refetch={() => {
                  setSelectedReport(null);
                  mutate();
                }}
              />
            )}

            <Pagination
              totalPages={totalPages}
              page={pagination.page}
              onPageChange={(newPage) =>
                setPagination((prev) => ({ ...prev, page: newPage }))
              }
            />
          </div>
        </>
      )}
    </div>
  );
}
