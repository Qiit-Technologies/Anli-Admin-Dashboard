import { ArrowDown, Calendar, ListFilterIcon } from "lucide-react";
import { Table, Th, Tr, Td, Thead, Tbody, StatusBadge } from "../customTable";
import SearchWithIcon from "../searchWithIcon";
import { useState } from "react";

const members = [
  {
    id: "1",
    name: "Jane Okoro",
    role: "Principal",
    plan: "Gold",
    lastVisit: "May 24th 2025",
    totalSpend: "₦132,000",
    status: "Active",
  },
  {
    id: "2",
    name: "Jane Okoro",
    role: "Principal",
    plan: "Gold",
    lastVisit: "May 24th 2025",
    totalSpend: "₦132,000",
    status: "Active",
  },
  {
    id: "3",
    name: "Jane Okoro",
    role: "Principal",
    plan: "Gold",
    lastVisit: "May 24th 2025",
    totalSpend: "₦132,000",
    status: "Active",
  },
];

const GuestHistoryTable = () => {
  const [query, setQuery] = useState("");
  return (
    <>
      <div className="overflow-x-auto bg-[#FBFBFB] rounded-xl p-6">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-between pb-8">
          <SearchWithIcon
            className="w-[478px] bg-white"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex flex-row gap-5">
            <button className="flex items-center justify-center gap-2 border rounded-md px-3 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50 w-full sm:w-auto">
              <Calendar size={16} />
              Jan 6, 2022 - Jan 13, 2022
            </button>
            <button className="flex items-center justify-center gap-2 border rounded-md px-3 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50 w-full sm:w-auto">
              <ListFilterIcon size={16} />
              Filters
            </button>
          </div>
        </div>
        <Table>
          <Thead>
            <Tr className="border-t-0">
              <Th>Full Name</Th>
              <Th>Role</Th>
              <Th withIcon>Plan</Th>
              <Th withIcon>Last Visit</Th>
              <Th withIcon>Total Spend</Th>
              <Th withIcon icon={<ArrowDown size={16} color="#667085" />}>
                Status
              </Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {members.map((row, i) => (
              <Tr key={i}>
                <Td className="py-4 px-4 bg-white">{row.name}</Td>
                <Td className="py-4 px-4 bg-white">{row.role}</Td>
                <Td className="py-4 px-4 bg-white">{row.plan}</Td>
                <Td className="py-4 px-4 bg-white">{row.lastVisit}</Td>
                <Td className="py-4 px-4 bg-white">{row.totalSpend}</Td>
                <Td className="py-4 px-4 bg-white">
                  <StatusBadge
                    status={row.status}
                    statusColorMap={{
                      active: "green",
                      expired: "red",
                    }}
                  />
                </Td>
                <Td className="text-[#667085] cursor-pointer bg-white">
                  <a href={`guest-history/${row.id}`}>View History</a>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </>
  );
};

export default GuestHistoryTable;
