import { ColumnDef } from '@tanstack/react-table';

interface Guest {
    id: number;
    accountNumber: string;
    title: string | null;
    lastName: string;
    firstName: string;
    balance: number;
    phoneNumber: string;
    receivableCreatedAt: Date;
    gender: 'male' | 'female';
    address: string;
    guestType: string;
}

export const useReceivableColumns = (): ColumnDef<Guest>[] => {
    return [
        {
            accessorKey: 'id',
            header: 'Acc No',
            cell: ({ row }) => {
                return <div>{row.original.id}</div>;
            },
        },
        {
            accessorKey: 'title',
            header: 'Title',
            cell: ({ row }) => {
                return <div>{row.original.title}</div>;
            },
        },
        {
            accessorKey: 'lastName',
            header: 'Surname',
            cell: ({ row }) => {
                return <div>{row.original.lastName}</div>;
            },
        },
        {
            accessorKey: 'firstName',
            header: 'Firstname',
            cell: ({ row }) => {
                return <div>{row.original.firstName}</div>;
            },
        },
        {
            accessorKey: 'balance',
            header: 'Balance',
            cell: ({ row }) => {
                return (
                    <div>-{Number(row.original.balance).toLocaleString()}</div>
                );
            },
        },
        {
            accessorKey: 'phoneNumber',
            header: 'Phone Number',
            cell: ({ row }) => {
                return <div>{row.original.phoneNumber}</div>;
            },
        },
        {
            accessorKey: 'receivableCreatedAt',
            header: 'Creation Date',
            cell: ({ row }) => {
                const [date, time] = formatDateString(
                    row.original.receivableCreatedAt,
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
            cell: ({ row }) => {
                return <div>{row.original.gender}</div>;
            },
        },
        {
            accessorKey: 'address',
            header: 'Address',
            cell: ({ row }) => {
                return (
                    <div className="w-[83px] truncate">
                        {row.original.address}
                    </div>
                );
            },
        },
        {
            accessorKey: 'guestType',
            header: 'Guest Type',
            cell: ({ row }) => {
                return <div>{row.original.guestType}</div>;
            },
        },
    ];
};

function formatDateString(dateString: Date): [string, string] {
    const dateObj = new Date(dateString);

    // Handle invalid date
    if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date string');
    }

    const date = dateObj.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
    }); // e.g. "23/04/24"

    const time = dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }); // e.g. "2:30 PM"

    return [date, time];
}
