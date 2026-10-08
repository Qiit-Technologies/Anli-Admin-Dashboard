import { ArrowDown, Calendar, ListFilterIcon } from "lucide-react";
import { Table, Th, Tr, Td, Thead, Tbody, StatusBadge } from "../customTable";
import SearchWithIcon from "../searchWithIcon";
import { useState } from "react";

const members = [
  {
    name: "Jane Okoro",
    id: "MEM-0001",
    plan: "Gold",
    startDate: "May 24th 2025",
    referrals: 4,
    phone: "08031234567",
    status: "Active",
  },
  {
    name: "Jane Okoro",
    id: "MEM-0001",
    plan: "Gold",
    startDate: "May 24th 2025",
    referrals: 4,
    phone: "08031234567",
    status: "Active",
  },
  {
    name: "Jane Okoro",
    id: "MEM-0001",
    plan: "Gold",
    startDate: "May 24th 2025",
    referrals: 4,
    phone: "08031234567",
    status: "Active",
  },
];

const MembersTable = () => {
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
              <Th>Membership ID</Th>
              <Th withIcon>Plan</Th>
              <Th withIcon>Start Date</Th>
              <Th withIcon>Referrals</Th>
              <Th withIcon>Phone</Th>
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
                <Td className="py-4 px-4 bg-white">{row.id}</Td>
                <Td className="py-4 px-4 bg-white">{row.plan}</Td>
                <Td className="py-4 px-4 bg-white">{row.startDate}</Td>
                <Td className="py-4 px-4 bg-white">{row.referrals}</Td>
                <Td className="py-4 px-4 bg-white">{row.phone}</Td>
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
                  <div className="flex flex-row gap-5">
                    <a href={`members/${row.id}`}>View</a>
                    <span>Edit</span>
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </>
  );
};

export default MembersTable;
