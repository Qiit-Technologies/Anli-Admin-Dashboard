import { getCheckedInMembers } from '@/app/actions/membership';
import { formatDate } from '@/lib/helpers';
import { formatTime } from '@/lib/utils';
import { Member } from '@/types/membership/membership';
import { ArrowDown } from 'lucide-react';
import { useMemo } from 'react';
import useSWR from 'swr';
import { StatusBadge, Table, Tbody, Td, Th, Thead, Tr } from '../customTable';
import { Divider } from '../divider';

const ActivityTable = () => {
    const { data: membersData, error } = useSWR('/api/checked-in-members', () =>
        getCheckedInMembers({ page: 1, limit: 10 }),
    );

    const activities = useMemo(() => {
        if (!membersData?.data?.data) return [];

        const members = membersData.data.data as Member[];

        return members.map((member: any) => {
            const visitDate = member.latestVisit?.visitDate
                ? formatDate(member.latestVisit.visitDate as string)
                : formatDate(member.lastVisitDate as string);

            const visitTime = member.latestVisit?.visitTime
                ? member.latestVisit.visitTime
                : formatTime(member.lastVisitDate as string) || '';

            return {
                time: visitTime.slice(0, 5),
                member: `${member.firstName} ${member.lastName}`,
                type: member.membershipTier || 'Member',
                facility: member.latestVisit?.facility || 'N/A',
                date: visitDate,
                access: 'Granted',
            };
        });
    }, [membersData?.data?.data]);

    if (error) {
        return (
            <div className="p-6 text-center text-red-600">
                Error loading check-in activity: {error.message}
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col px-6 py-4 sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-lg font-normal text-[#101828]">
                    Recent Activity
                </h2>
            </div>
            <Divider className="mb-4" />
            {/* Table */}
            <div className="overflow-x-auto">
                <Table>
                    <Thead>
                        <Tr>
                            <Th>Time</Th>
                            <Th>Member Name</Th>
                            <Th withIcon>Type</Th>
                            <Th withIcon>Facility</Th>
                            <Th withIcon>Date</Th>
                            <Th
                                withIcon
                                icon={<ArrowDown size={16} color="#667085" />}
                            >
                                Access
                            </Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {activities.length === 0 ? (
                            <Tr>
                                <Td
                                    colSpan={6}
                                    className="text-center py-8 text-gray-500"
                                >
                                    No check-in activity today
                                </Td>
                            </Tr>
                        ) : (
                            activities.map((row, i) => (
                                <Tr key={i}>
                                    <Td>{row.time}</Td>
                                    <Td>{row.member}</Td>
                                    <Td>{row.type}</Td>
                                    <Td>{row.facility}</Td>
                                    <Td>{row.date}</Td>
                                    <Td>
                                        <StatusBadge
                                            status={row.access}
                                            statusColorMap={{
                                                granted: 'green',
                                                denied: 'red',
                                            }}
                                        />
                                    </Td>
                                </Tr>
                            ))
                        )}
                    </Tbody>
                </Table>
            </div>
        </>
    );
};

export default ActivityTable;
