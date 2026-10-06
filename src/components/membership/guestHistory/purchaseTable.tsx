'use client';
import { getPurchaseHistory } from '@/app/actions/membership';
import { Calendar } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Table, Tbody, Td, Th, Thead, Tr } from '../customTable';

interface PurchasesTableProps {
    memberId: string;
}

interface Purchase {
    id: number;
    purchaseDate: string;
    itemName: string;
    amount: number;
    facilityName: string;
}

const PurchasesTable: React.FC<PurchasesTableProps> = ({ memberId }) => {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPurchases = async () => {
            try {
                setLoading(true);
                const response = await getPurchaseHistory(memberId, {
                    page: 1,
                    limit: 10,
                });
                if (response.data) {
                    setPurchases(response.data);
                }
            } catch (err) {
                setError('Failed to fetch purchase history');
                console.error('Error fetching purchases:', err);
            } finally {
                setLoading(false);
            }
        };

        if (memberId) {
            fetchPurchases();
        }
    }, [memberId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">Loading purchase history...</div>
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
                <h2 className="text-xl font-semibold">Purchase History</h2>
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
                            <Th>Item</Th>
                            <Th>Facility</Th>
                            <Th withIcon>Amount</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {purchases.length > 0 ? (
                            purchases.map((row, i) => (
                                <Tr key={i}>
                                    <Td>
                                        {new Date(
                                            row.purchaseDate,
                                        ).toLocaleDateString()}
                                    </Td>
                                    <Td>{row.itemName}</Td>
                                    <Td>{row.facilityName}</Td>
                                    <Td>₦{row.amount.toLocaleString()}</Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td
                                    colSpan={4}
                                    className="text-center text-gray-500 py-8"
                                >
                                    No purchase history available
                                </Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
            </div>
        </>
    );
};

export default PurchasesTable;
