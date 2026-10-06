import { formatCurrency } from '@/lib/utils';
import { BillingTransaction } from '../types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ColumnDef } from '@tanstack/react-table';
import CustomTable from '@/components/common/table/CustomTable';
import { cn } from '@/lib/utils';

interface BillingTabProps {
    summary: {
        totalBilled: number;
        totalPaid: number;
        outstanding: number;
    };
    transactions: BillingTransaction[];
}

const useBillingColumns = (): ColumnDef<BillingTransaction>[] => {
    return [
        {
            accessorKey: 'date',
            header: 'Last Visit',
            cell: ({ row }) => (
                <span className="text-slate-600">{row.original.date}</span>
            ),
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => (
                <span className="font-medium text-slate-900">
                    {row.original.description}
                </span>
            ),
        },
        {
            accessorKey: 'amount',
            header: 'Amount',
            cell: ({ row }) => (
                <span className="font-semibold text-slate-900">
                    {formatCurrency(row.original.amount)}
                </span>
            ),
        },
        {
            accessorKey: 'paymentMethod',
            header: 'Payment Method',
            cell: ({ row }) => (
                <span className="text-slate-600">
                    {row.original.paymentMethod}
                </span>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <span
                        className={cn(
                            'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                            status === 'Paid'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700',
                        )}
                    >
                        {status}
                    </span>
                );
            },
        },
    ];
};

export const BillingTab = ({ transactions }: BillingTabProps) => {
    const columns = useBillingColumns();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">
                        Billing Records
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        {transactions.length} transactions
                    </p>
                </div>
                <Select defaultValue="all">
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="All Billing" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Billing</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {transactions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
                    No billing records found.
                </div>
            ) : (
                <CustomTable
                    data={transactions}
                    columns={columns}
                    hasHeader={false}
                    isPaginated={true}
                    pageSize={10}
                    variant="striped"
                />
            )}
        </div>
    );
};
