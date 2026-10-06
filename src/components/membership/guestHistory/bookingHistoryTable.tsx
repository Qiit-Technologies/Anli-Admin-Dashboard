import { Table, Th, Tr, Td, Thead, Tbody, StatusBadge } from "../customTable";
import { Calendar } from "lucide-react";

const bookingHistories = [
  {
    date: "July 10, 2025",
    time: "9:12 AM",
    service: "Spa - swedish",
    bookedBy: "Principal",
    status: "granted",
  },
  {
    date: "July 10, 2025",
    time: "9:12 AM",
    service: "Spa - swedish",
    bookedBy: "Principal",
    status: "denied",
  },
  {
    date: "July 10, 2025",
    time: "9:12 AM",
    service: "Spa - swedish",
    bookedBy: "Principal",
    status: "granted",
  },
];

const BookingHistoryTable = () => {
  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-start py-4 sm:items-center gap-3">
        <h2 className="text-xl font-semibold">Booking History</h2>
        <div className="flex flex-row gap-5">
          <button className="flex items-center justify-center gap-2 border rounded-md px-3 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50 w-full sm:w-auto">
            <Calendar size={16} />
            Jan 6, 2022 - Jan 13, 2022
          </button>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Time</Th>
              <Th withIcon>Service/Area</Th>
              <Th withIcon>Booked by</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {bookingHistories.map((row, i) => (
              <Tr key={i}>
                <Td>{row.date}</Td>
                <Td>{row.time}</Td>
                <Td>{row.service}</Td>
                <Td>{row.bookedBy}</Td>
                <Td>
                  <StatusBadge
                    status={row.status}
                    statusColorMap={{
                      granted: "green",
                      denied: "red",
                    }}
                  />
                </Td>
                <Td>Rebook</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </>
  );
};

export default BookingHistoryTable;
