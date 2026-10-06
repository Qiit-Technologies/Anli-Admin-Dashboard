import { ColumnDef } from '@tanstack/react-table';

interface Payable {
    id: number;
    title: string | null;
    lastName: string;
    firstName: string;
    balance: number;
    accountPaidInto: string;
    phoneNumber: string;
    payableCreatedAt: Date;
    gender: 'male' | 'female';
    address: string;
    paymentMethod: string;
    guestType: string;
}

export const usePayableColumns = (): ColumnDef<Payable>[] => {
    return [
        {
            accessorKey: 'id',
            header: 'Acc No',
            cell: ({ row }) => <div>{row.original.id}</div>,
        },
        {
            accessorKey: 'title',
            header: 'Title',
            cell: ({ row }) => <div>{row.original.title}</div>,
        },
        {
            accessorKey: 'lastName',
            header: 'Surname',
            cell: ({ row }) => <div>{row.original.lastName}</div>,
        },
        {
            accessorKey: 'firstName',
            header: 'Firstname',
            cell: ({ row }) => <div>{row.original.firstName}</div>,
        },
        {
            accessorKey: 'balance',
            header: 'Balance',
            cell: ({ row }) => (
                <div>₦{Number(row.original.balance).toLocaleString()}</div>
            ),
        },
        {
            accessorKey: 'paymentMethod',
            header: 'Payment method',
            cell: ({ row }) => <div>{row.original.paymentMethod}</div>,
        },
        {
            accessorKey: 'accountPaidInto',
            header: 'Account Paid Into',
            cell: ({ row }) => (
                <div className="w-[140px] truncate">
                    {row.original.accountPaidInto}
                </div>
            ),
        },
        {
            accessorKey: 'phoneNumber',
            header: 'Phone Number',
            cell: ({ row }) => <div>{row.original.phoneNumber}</div>,
        },
        {
            accessorKey: 'payableCreatedAt',
            header: 'Creation Date',
            cell: ({ row }) => {
                const [date, time] = formatDateString(
                    row.original.payableCreatedAt,
                );
                return (
                    <div className="flex flex-col text-xs [&>:nth-child(1)]:text-black">
                        <span>{date}</span>
                        <span>{time}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'gender',
            header: 'Gender',
            cell: ({ row }) => <div>{row.original.gender}</div>,
        },
        {
            accessorKey: 'address',
            header: 'Address',
            cell: ({ row }) => (
                <div className="w-[83px] truncate">{row.original.address}</div>
            ),
        },
        {
            accessorKey: 'guestType',
            header: 'Guest Type',
            cell: ({ row }) => <div>{row.original.guestType}</div>,
        },
    ];
};

function formatDateString(dateString: Date): [string, string] {
    const dateObj = new Date(dateString);

    if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date string');
    }

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

    return [date, time];
}
