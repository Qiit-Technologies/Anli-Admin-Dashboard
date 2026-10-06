import { ColumnDef } from '@tanstack/react-table';
import { RoleActionCell } from '../RoleActionCell';
import { formatDate } from '@/lib/helpers';

interface Role {
    id: string;
    name: string;
    description?: string;
    createdAt?: string;
}

export const RoleColumn = ({
    onEdit,
    onDelete,
}: {
    onEdit: (role: any) => void;
    onDelete: (id: string) => void;
}): ColumnDef<Role>[] => [
    {
        accessorKey: 'name',
        header: 'Role',
        cell: ({ row }) => (
            <span className="font-medium">{row.original.name}</span>
        ),
    },
    {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => <span>{row.original.description || 'N/A'}</span>,
    },
    {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => {
            if (
                !row.original.createdAt ||
                row.original.createdAt === 'No date'
            ) {
                return 'N/A';
            }
            try {
                return formatDate(row.original.createdAt);
            } catch (error) {
                return 'N/A';
            }
        },
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
            <RoleActionCell
                role={row.original}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        ),
    },
];
