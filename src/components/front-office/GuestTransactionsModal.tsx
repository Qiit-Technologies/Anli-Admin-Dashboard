'use client';

import { useState, useEffect } from 'react';
import CustomDialog from '@/components/common/CustomDialog';
import {
    getCreditTransactions,
    type CreditTransaction,
} from '@/app/actions/guest-profile';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

interface GuestTransactionsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    profileId: number;
    profileName?: string;
}

export const GuestTransactionsModal = ({
    open,
    onOpenChange,
    profileId,
    profileName,
}: GuestTransactionsModalProps) => {
    const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && profileId) {
            fetchTransactions();
        }
    }, [open, profileId]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const result = await getCreditTransactions(profileId, 100);
            if (result.error) {
                toast.error(result.error);
                setTransactions([]);
            } else if (result.data) {
                setTransactions(result.data);
            }
        } catch (error: any) {
            console.error('Error fetching transactions:', error);
            toast.error('Failed to fetch transactions');
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const getTransactionTypeColor = (type: string) => {
        switch (type) {
            case 'DEPOSIT':
                return 'bg-green-100 text-green-700';
            case 'USAGE':
                return 'bg-red-100 text-red-700';
            case 'REFUND':
                return 'bg-blue-100 text-blue-700';
            case 'ADJUSTMENT':
                return 'bg-yellow-100 text-yellow-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
        } catch {
            return dateString;
        }
    };

    return (
        <CustomDialog
            open={open}
            onOpenChange={onOpenChange}
            title={`Transaction History${profileName ? ` - ${profileName}` : ''}`}
            description="View all credit transactions for this guest profile"
            confirmText="Close"
            onConfirm={() => onOpenChange(false)}
            maxWidth="2xl"
            footerType="full"
        >
            <div className="space-y-4">
                {loading ? (
                    <div className="w-full h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                        Loading transactions...
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="w-full h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                        No transactions found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="text-left p-3 text-xs font-semibold text-gray-700 uppercase">
                                        Date
                                    </th>
                                    <th className="text-left p-3 text-xs font-semibold text-gray-700 uppercase">
                                        Type
                                    </th>
                                    <th className="text-right p-3 text-xs font-semibold text-gray-700 uppercase">
                                        Amount
                                    </th>
                                    <th className="text-right p-3 text-xs font-semibold text-gray-700 uppercase">
                                        Balance Before
                                    </th>
                                    <th className="text-right p-3 text-xs font-semibold text-gray-700 uppercase">
                                        Balance After
                                    </th>
                                    <th className="text-left p-3 text-xs font-semibold text-gray-700 uppercase">
                                        Description
                                    </th>
                                    <th className="text-left p-3 text-xs font-semibold text-gray-700 uppercase">
                                        Reference
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="border-b hover:bg-gray-50"
                                    >
                                        <td className="p-3 text-sm text-gray-900">
                                            {formatDate(transaction.createdAt)}
                                        </td>
                                        <td className="p-3">
                                            <Badge
                                                className={getTransactionTypeColor(
                                                    transaction.transactionType,
                                                )}
                                            >
                                                {transaction.transactionType}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-sm text-right font-medium">
                                            <span
                                                className={
                                                    transaction.transactionType ===
                                                    'DEPOSIT'
                                                        ? 'text-green-600'
                                                        : transaction.transactionType ===
                                                            'USAGE'
                                                          ? 'text-red-600'
                                                          : 'text-gray-900'
                                                }
                                            >
                                                {transaction.transactionType ===
                                                'DEPOSIT'
                                                    ? '+'
                                                    : transaction.transactionType ===
                                                        'USAGE'
                                                      ? '-'
                                                      : ''}
                                                {formatCurrency(
                                                    transaction.amount,
                                                )}
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm text-right text-gray-600">
                                            {formatCurrency(
                                                transaction.balanceBefore || 0,
                                            )}
                                        </td>
                                        <td className="p-3 text-sm text-right text-gray-900 font-medium">
                                            {formatCurrency(
                                                transaction.balanceAfter || 0,
                                            )}
                                        </td>
                                        <td className="p-3 text-sm text-gray-700">
                                            {transaction.description || '—'}
                                        </td>
                                        <td className="p-3 text-sm text-gray-600">
                                            {transaction.referenceNumber || '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </CustomDialog>
    );
};
