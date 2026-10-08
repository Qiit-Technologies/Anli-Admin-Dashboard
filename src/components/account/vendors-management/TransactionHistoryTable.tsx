'use client';

import { StatusBadge } from '@/components/ui/status-badge';
import { Info } from 'lucide-react';
import type { VendorTransaction } from '@/types/vendor';

interface TransactionHistoryTableProps {
    transactions: VendorTransaction[];
}

export function TransactionHistoryTable({
    transactions,
}: TransactionHistoryTableProps) {
    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                    Transaction History
                </h2>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden lg:block">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            Ref ID
                                            <Info className="h-3 w-3 text-gray-400" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Account Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Account
                                    </th>
                                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Item Purchased
                                    </th> */}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            Date purchased
                                            <Info className="h-3 w-3 text-gray-400" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            Status
                                            <svg
                                                className="h-3 w-3 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {transaction.refId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {transaction.accountName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {transaction.paymentType}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {transaction.account}
                                        </td>
                                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {transaction.itemPurchased}
                                        </td> */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {
                                                    transaction.datePurchased.split(
                                                        ' ',
                                                    )[0]
                                                }
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {
                                                    transaction.datePurchased.split(
                                                        ' ',
                                                    )[1]
                                                }
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge
                                                status={transaction.status}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile/Tablet Grid */}
                <div className="lg:hidden">
                    <div className="hide-scrollbar overflow-x-auto">
                        <div className="grid grid-cols-7 gap-4 p-4 bg-gray-50 border-b border-gray-200 min-w-[1000px]">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ref ID
                            </div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Account Name
                            </div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Payment type
                            </div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Account
                            </div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Item Purchased
                            </div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date purchased
                            </div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </div>
                        </div>

                        <div className="divide-y divide-gray-200 min-w-[1000px]">
                            {transactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="grid grid-cols-7 gap-4 p-4 hover:bg-gray-50"
                                >
                                    <div className="text-sm text-gray-900">
                                        {transaction.refId}
                                    </div>
                                    <div className="text-sm text-gray-900">
                                        {transaction.accountName}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {transaction.paymentType}
                                    </div>
                                    <div className="text-sm text-gray-900">
                                        {transaction.account}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {transaction.itemPurchased}
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-900">
                                            {
                                                transaction.datePurchased.split(
                                                    ' ',
                                                )[0]
                                            }
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {
                                                transaction.datePurchased.split(
                                                    ' ',
                                                )[1]
                                            }
                                        </div>
                                    </div>
                                    <div>
                                        <StatusBadge
                                            status={transaction.status}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
