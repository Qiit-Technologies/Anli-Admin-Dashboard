import { ScopedOutStandingPayment } from '@/components/front-of-house/types';
import { formatCurrency, getStatusColor } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';

export const OutStandingPaymentsColumns: ColumnDef<ScopedOutStandingPayment>[] =
    [
        {
            accessorKey: 'referenceNo',
            header: 'Reference No.',
            cell: ({ row }) => (
                <span className="text-sm font-normal leading-5 text-center">
                    {row.original.referenceNo}
                </span>
            ),
        },
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => (
                <span className="text-sm font-normal leading-5 text-[#101828] text-center">
                    {row.original.type}
                </span>
            ),
        },
        {
            accessorKey: 'department',
            header: 'Department',
            cell: ({ row }) => (
                <span className="text-sm font-normal leading-5 text-[#101828] text-center">
                    {row.original.department}
                </span>
            ),
        },
        {
            accessorKey: 'customerVendor',
            header: 'Customer / Vendor',
            cell: ({ row }) => (
                <span className="text-sm font-normal leading-5 text-[#101828] text-center">
                    {row.original.customerVendor}
                </span>
            ),
        },
        {
            accessorKey: 'amount',
            header: 'Amount (₦)',
            cell: ({ row }) => (
                <span className="text-sm font-normal leading-5 text-[#101828] text-center">
                    {formatCurrency(Number(row.original.amount))}
                </span>
            ),
        },
        {
            accessorKey: 'date',
            header: 'Date',
            cell: ({ row }) => (
                <span className="text-sm font-normal leading-5 text-[#101828] text-center">
                    {new Date(row.original.date).toISOString().split('T')[0]}
                </span>
            ),
        },

        {
            accessorKey: 'status',
            header: () => <div className="text-center pr-3">Status</div>,
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <div className="flex items-center justify-center w-full">
                        <div
                            className={`w-fit px-3 py-1 rounded-full capitalize ${getStatusColor(status?.toLocaleLowerCase())}`}
                        >
                            <span className={`text-xs caption-top`}>
                                {status
                                    ?.replaceAll('_', ' ')
                                    ?.toLocaleLowerCase()}
                            </span>
                        </div>
                    </div>
                );
            },
        },
    ];
