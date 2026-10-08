import { ColumnDef } from '@tanstack/react-table';
import { formatCurrency } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

export type ARAPType = 'receivables' | 'payables';

export interface ARAPRow {
    accountId?: number;
    guestId?: number;
    accountNumber: string;
    title: string | null;
    lastName: string;
    firstName: string;
    fullName?: string; // Added for guest profile
    email?: string; // Added for guest profile
    balance: number; // always stored as positive; rendering handles sign
    phoneNumber: string;
    createdAt: Date;
    gender: 'male' | 'female' | 'other';
    address: string;
    IDNumber?: string; // Added for guest profile
    nationality?: string; // Added for guest profile
    dateOfBirth?: string | Date; // Added for guest profile
    notes?: string; // Added for guest profile
    createdBy: string;
    guestType: string;
    // Added optional room context for auto-select behaviors
    roomId?: number;
    roomNumber?: string | number;
    roomTypeName?: string;
    // Added optional stay status for delete guard logic
    isCheckedIn?: boolean;
    isCheckedOut?: boolean;
    referenceNumber?: string | null;
    description?: string | null;
}

export const usePmFolioReceivableColumns = (): ColumnDef<ARAPRow>[] => {
    const base = useARAPColumns('receivables');
    const refColumn: ColumnDef<ARAPRow> = {
        accessorKey: 'referenceNumber',
        header: 'PM Folio ref',
        cell: ({ row }) => (
            <div className="font-mono text-xs">
                {row.original.referenceNumber || '—'}
            </div>
        ),
    };
    const accIdx = base.findIndex(
        (c) => 'accessorKey' in c && c.accessorKey === 'accountNumber',
    );
    if (accIdx === -1) return [refColumn, ...base];
    return [...base.slice(0, accIdx + 1), refColumn, ...base.slice(accIdx + 1)];
};

export const useARAPColumns = (type: ARAPType): ColumnDef<ARAPRow>[] => {
    const isReceivable = type === 'receivables';

    return [
        {
            id: 'select',
            header: ({ table }) => (
                <div className="w-fit h-full flex items-center">
                    <Checkbox
                        className="shadow-none border-gray-300 data-[state=checked]:bg-brand"
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() &&
                                'indeterminate')
                        }
                        onCheckedChange={(value) =>
                            table.toggleAllPageRowsSelected(!!value)
                        }
                        aria-label="Select all"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="w-full h-full flex items-center">
                    <Checkbox
                        className="shadow-none border-gray-300 data-[state=checked]:bg-brand"
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'accountNumber',
            header: 'Acc No',
            cell: ({ row }) => <div>{row.original.accountNumber}</div>,
        },
        {
            accessorKey: 'fullName',
            header: 'Full Name',
            cell: ({ row }) => (
                <div>
                    {row.original.fullName ||
                        `${row.original.firstName} ${row.original.lastName}`.trim()}
                </div>
            ),
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) => (
                <div className="w-[180px] truncate">
                    {row.original.email || '-'}
                </div>
            ),
        },
        {
            accessorKey: 'createdAt',
            header: 'Creation Date',
            cell: ({ row }) => {
                const dateObj = new Date(row.original.createdAt);
                const date = dateObj.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                });
                const time = dateObj.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                });
                return (
                    <div className="flex flex-col text-xs [&>:nth-child(1)]:text-black">
                        <span>{date}</span>
                        <span>{time}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'balance',
            header: 'Balance',
            cell: ({ row }) => (
                <div
                    className={
                        !isReceivable ? 'text-emerald-700' : 'text-red-700'
                    }
                >
                    {!isReceivable
                        ? `${formatCurrency(row.original.balance)}`
                        : `-${formatCurrency(row.original.balance)}`}
                </div>
            ),
        },
        {
            accessorKey: 'phoneNumber',
            header: 'Phone',
            cell: ({ row }) => <div>{row.original.phoneNumber}</div>,
        },
        {
            accessorKey: 'guestType',
            header: 'Guest Type',
            cell: ({ row }) => (
                <div className="capitalize">
                    {row.original.guestType || '-'}
                </div>
            ),
        },
        {
            accessorKey: 'createdBy',
            header: 'Created By',
            cell: ({ row }) => <div>{row.original.createdBy || '-'}</div>,
        },
    ];
};
