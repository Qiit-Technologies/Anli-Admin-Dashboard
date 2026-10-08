'use client';
import { getVisitLogs } from '@/app/actions/membership';
import { ArrowDown, Calendar } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { StatusBadge, Table, Tbody, Td, Th, Thead, Tr } from '../customTable';

interface LogsTableProps {
    memberId: string;
}

interface VisitLog {
    id: number;
    checkInTime: string;
    checkInType: string;
    facilityName: string;
    accessResult: string;
}

const LogsTable: React.FC<LogsTableProps> = ({ memberId }) => {
    const [logs, setLogs] = useState<VisitLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVisitLogs = async () => {
            try {
                setLoading(true);
                const response = await getVisitLogs(memberId, {
                    page: 1,
                    limit: 10,
                });
                if (response.data) {
                    setLogs(response.data);
                }
            } catch (err) {
                setError('Failed to fetch visit logs');
                console.error('Error fetching visit logs:', err);
            } finally {
                setLoading(false);
            }
        };

        if (memberId) {
            fetchVisitLogs();
        }
    }, [memberId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">Loading visit logs...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="flex justify-between items-start py-4 sm:items-center gap-3">
                <h2 className="text-xl font-semibold">Visit Logs</h2>
                <div className="flex flex-row gap-5">
                    <button className="flex items-center justify-center gap-2 border rounded-md px-3 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50 w-full sm:w-auto">
                        <Calendar size={16} />
                        Filter by Date
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
                            <Th withIcon>Check-in-Type</Th>
                            <Th withIcon>Facility</Th>
                            <Th
                                withIcon
                                icon={<ArrowDown size={16} color="#667085" />}
                            >
                                Access Result
                            </Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {logs.length > 0 ? (
                            logs.map((row, i) => {
                                const checkInDate = new Date(row.checkInTime);
                                return (
                                    <Tr key={i}>
                                        <Td>
                                            {checkInDate.toLocaleDateString()}
                                        </Td>
                                        <Td>
                                            {checkInDate.toLocaleTimeString(
                                                [],
                                                {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                },
                                            )}
                                        </Td>
                                        <Td>{row.checkInType}</Td>
                                        <Td>{row.facilityName}</Td>
                                        <Td>
                                            <StatusBadge
                                                status={
                                                    row.accessResult ===
                                                    'granted'
                                                        ? 'active'
                                                        : 'inactive'
                                                }
                                                statusColorMap={{
                                                    active: 'green',
                                                    inactive: 'red',
                                                }}
                                            />
                                        </Td>
                                    </Tr>
                                );
                            })
                        ) : (
                            <Tr>
                                <Td
                                    colSpan={5}
                                    className="text-center text-gray-500 py-8"
                                >
                                    No visit logs available
                                </Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
            </div>
        </>
    );
};

export default LogsTable;
