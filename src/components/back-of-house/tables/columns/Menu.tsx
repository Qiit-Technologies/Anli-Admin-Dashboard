import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';
import MenuActionCell from '../MenuActionCell';
import { Checkbox } from '@/components/ui/checkbox';
import { Dispatch, SetStateAction } from 'react';
import MenuDeleteCell from '../MenuDeleteCell';

export interface Menu {
    id: number;
    name: string;
    description?: string;
    dineInArea?: {
        id: number;
        name: string;
    };
    categories?: any[];
    createdAt?: Date;
    updatedAt?: Date;
}

export const MenuColumns: (
    selected: number[],
    setSelected: Dispatch<SetStateAction<number[]>>,
) => ColumnDef<Menu>[] = (selected, setSelected) => {
    return [
        {
            accessorKey: 'name',
            header: () => (
                <div>
                    <Tooltip
                        className="text-muted-foreground rounded-sm font-medium"
                        content="Menu name"
                        showArrow={true}
                    >
                        <span className="flex items-center gap-2">
                            Name <CircleHelp className="w-4 h-4" />
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
                        content="Menu description"
                        showArrow={true}
                    >
                        <span className="flex items-center gap-2">
                            Description <CircleHelp className="w-4 h-4" />
                        </span>
                    </Tooltip>
                </div>
            ),
            cell: ({ row }) => (
                <span className="truncate">
                    {row.original.description || '-'}
                </span>
            ),
        },
        {
            accessorKey: 'dineInArea',
            header: () => (
                <div>
                    <Tooltip
                        className="text-muted-foreground rounded-sm font-medium"
                        content="Dine area this menu is attached to"
                        showArrow={true}
                    >
                        <span className="flex items-center gap-2">
                            Dine Area <CircleHelp className="w-4 h-4" />
                        </span>
                    </Tooltip>
                </div>
            ),
            cell: ({ row }) => (
                <span>{row.original.dineInArea?.name || 'General Menu'}</span>
            ),
        },
        {
            accessorKey: 'categories',
            header: () => (
                <div>
                    <Tooltip
                        className="text-muted-foreground rounded-sm font-medium"
                        content="Number of categories in this menu"
                        showArrow={true}
                    >
                        <span className="flex items-center gap-2">
                            Categories <CircleHelp className="w-4 h-4" />
                        </span>
                    </Tooltip>
                </div>
            ),
            cell: ({ row }) => (
                <span>
                    {row.original.categories?.length || 0} category
                    {(row.original.categories?.length || 0) !== 1 ? 'ies' : ''}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => {
                return <MenuActionCell menu={row.original as Menu} />;
            },
        },
        {
            id: 'delete-all',
            header: () => <MenuDeleteCell selected={selected} />,
            cell: ({ row }) => {
                return (
                    <div className="w-full justify-center items-center flex">
                        <Checkbox
                            checked={selected?.includes(row.original?.id)}
                            onCheckedChange={() => {
                                if (selected?.includes(row.original?.id)) {
                                    setSelected(
                                        selected.filter(
                                            (id) => id !== row.original.id,
                                        ),
                                    );
                                } else {
                                    setSelected([
                                        ...selected,
                                        row.original?.id,
                                    ]);
                                }
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                );
            },
        },
    ];
};




