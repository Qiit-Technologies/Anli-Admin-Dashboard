import { formatDate } from '@/lib/helpers';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';
import DineAreaActionCell from '../DineAreaActionCell';

interface DineAreaTableProps {
    id: number;
    name: string;
    description: string;
    createdAt?: string;
    menuCategories?: any[];
    status: 'not available' | 'ready';
}

export const DineAreaColumns: ColumnDef<DineAreaTableProps>[] = [
    {
        accessorKey: 'name',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Dining area name"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Dine Area <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.name}</span>,
    },
    {
        accessorKey: 'description',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Description of the dining area"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Description <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span className="truncate">{row.original.description}</span>
        ),
    },
    {
        accessorKey: 'createdAt',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="When the dining area was created"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Created Date <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span>{formatDate(row.original.createdAt ?? '')}</span>
        ),
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            return (
                <DineAreaActionCell
                    id={row.original.id}
                    name={row.original.name}
                    menuCategories={row.original.menuCategories}
                    description={row.original.description}
                />
            );
        },
    },
];
