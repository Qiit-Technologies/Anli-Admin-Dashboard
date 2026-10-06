import { ArrowDown, Calendar, ListFilterIcon } from 'lucide-react';
import { Table, Th, Tr, Td, Thead, Tbody, StatusBadge } from '../customTable';

const bookings = [
    {
        name: 'John Doe',
        facility: 'Gym',
        date: '23rd March 2024',
        time: '2:30px',
        bookedBy: 'Membership Manager',
        status: 'Confirmed',
        action: 'Granted',
    },
    {
        name: 'John Doe',
        facility: 'Gym',
        date: '23rd March 2024',
        time: '2:30px',
        bookedBy: 'Membership Manager',
        status: 'Confirmed',
        action: 'Granted',
    },
    {
        name: 'John Doe',
        facility: 'Gym',
        date: '23rd March 2024',
        time: '2:30px',
        bookedBy: 'Membership Manager',
        status: 'Confirmed',
        action: 'Granted',
    },
];

const RecentBookingTable = () => {
    return (
        <>
            <div className="overflow-x-auto rounded-xl py-6">
                <div className="flex justify-between px-6">
                    <h2 className="text-xl font-semibold">Recent Booking</h2>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-between pb-8">
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
                </div>

                <Table>
                    <Thead>
                        <Tr className="border-t-0">
                            <Th>Member Name</Th>
                            <Th withIcon>Facility</Th>
                            <Th withIcon>Date</Th>
                            <Th>Time</Th>
                            <Th withIcon>Booked By</Th>
                            <Th
                                withIcon
                                icon={<ArrowDown size={16} color="#667085" />}
                            >
                                Status
                            </Th>
                            <Th
                                withIcon
                                icon={<ArrowDown size={16} color="#667085" />}
                            >
                                Action
                            </Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {bookings.map((row, i) => (
                            <Tr key={i}>
                                <Td>{row.name}</Td>
                                <Td>{row.facility}</Td>
                                <Td>{row.date}</Td>
                                <Td>{row.time}</Td>
                                <Td>{row.bookedBy}</Td>
                                <Td>
                                    <StatusBadge
                                        status={row.status}
                                        statusColorMap={{
                                            confirmed: 'green',
                                            expired: 'red',
                                        }}
                                    />
                                </Td>
                                <Td>
                                    <StatusBadge
                                        status={row.action}
                                        statusColorMap={{
                                            granted: 'green',
                                            expired: 'red',
                                        }}
                                    />
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </div>
        </>
    );
};

export default RecentBookingTable;
