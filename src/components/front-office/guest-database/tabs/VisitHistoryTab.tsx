import { formatCurrency } from '@/lib/utils';
import { VisitRecord } from '../types';
import { ColumnDef } from '@tanstack/react-table';
import CustomTable from '@/components/common/table/CustomTable';
import { cn } from '@/lib/utils';

const useVisitHistoryColumns = (): ColumnDef<VisitRecord>[] => {
    return [
        {
            accessorKey: 'date',
            header: 'Last Visit',
            cell: ({ row }) => (
                <span className="text-slate-600">{row.original.date}</span>
            ),
        },
        {
            accessorKey: 'checkIn',
            header: 'Check-In',
            cell: ({ row }) => (
                <span className="text-slate-600">{row.original.checkIn}</span>
            ),
        },
        {
            accessorKey: 'checkOut',
            header: 'Check-Out',
            cell: ({ row }) => (
                <span className="text-slate-600">{row.original.checkOut}</span>
            ),
        },
        {
            accessorKey: 'roomTable',
            header: 'Room/Table',
            cell: ({ row }) => (
                <span className="font-medium text-slate-900">
                    {row.original.roomTable}
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
                            status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : status === 'Upcoming'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-rose-100 text-rose-700',
                        )}
                    >
                        {status === 'Completed' ? 'Complected' : status}
                    </span>
                );
            },
        },
    ];
};

export const VisitHistoryTab = ({ visits }: { visits: VisitRecord[] }) => {
    const columns = useVisitHistoryColumns();

    if (!visits.length) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
                No visit history available for this guest yet.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-bold text-slate-900">
                    Visit History
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    showing {visits.length} total visits
                </p>
            </div>
            <CustomTable
                data={visits}
                columns={columns}
                hasHeader={false}
                isPaginated={true}
                pageSize={10}
                variant="striped"
            />
        </div>
    );
};
