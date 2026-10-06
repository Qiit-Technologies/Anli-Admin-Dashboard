'use client';
import { getServiceUsageSummary } from '@/app/actions/membership';
import { Calendar } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Table, Tbody, Td, Th, Thead, Tr } from '../customTable';

interface ServiceUsageTableProps {
    memberId: string;
}

interface ServiceUsage {
    serviceName: string;
    lastUsed: string;
    totalVisits: number;
}

const ServiceUsageTable: React.FC<ServiceUsageTableProps> = ({ memberId }) => {
    const [serviceUsages, setServiceUsages] = useState<ServiceUsage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchServiceUsage = async () => {
            try {
                setLoading(true);
                const response = await getServiceUsageSummary(memberId, {
                    page: 1,
                    limit: 10,
                });
                if (response.data) {
                    setServiceUsages(response.data);
                }
            } catch (err) {
                setError('Failed to fetch service usage data');
                console.error('Error fetching service usage:', err);
            } finally {
                setLoading(false);
            }
        };

        if (memberId) {
            fetchServiceUsage();
        }
    }, [memberId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">
                    Loading service usage data...
                </div>
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
                <h2 className="text-xl font-semibold">Service Usage Summary</h2>
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
                            <Th>Service</Th>
                            <Th>Last Used</Th>
                            <Th>Total Visits</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {serviceUsages.length > 0 ? (
                            serviceUsages.map((row, i) => (
                                <Tr key={i}>
                                    <Td>{row.serviceName}</Td>
                                    <Td>
                                        {new Date(
                                            row.lastUsed,
                                        ).toLocaleDateString()}
                                    </Td>
                                    <Td>{row.totalVisits.toLocaleString()}</Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td
                                    colSpan={3}
                                    className="text-center text-gray-500 py-8"
                                >
                                    No service usage data available
                                </Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
            </div>
        </>
    );
};

export default ServiceUsageTable;
