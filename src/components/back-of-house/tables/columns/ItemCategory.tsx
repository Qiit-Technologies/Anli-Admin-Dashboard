import { Category } from '@/hooks/useMiniCategory';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';
import ItemCategoryActionCell from '../ItemCategoryActionCell';
import { Checkbox } from '@/components/ui/checkbox';
import { Dispatch, SetStateAction } from 'react';
import ItemCategoryDeleteCell from '../ItemCategoryDeleteCell';

export const ItemCategories: Category[] = [
    {
        id: 1,
        name: 'Beverages',
        category: 'Beverages',
        description: 'Drinks and liquid refreshments',
    },
    {
        id: 2,
        name: 'Appetizers',
        category: 'Main Course',
        description: 'Primary dishes',
    },
];

export const ItemCategoryColumns: (
    selected: number[],
    setSelected: Dispatch<SetStateAction<number[]>>,
) => ColumnDef<Category>[] = (selected, setSelected) => {
    return [
        {
            accessorKey: 'name',
            header: () => (
                <div>
                    <Tooltip
                        className="text-muted-foreground rounded-sm font-medium"
                        content="Category name"
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
                        content="Category description"
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
            accessorKey: 'category',
            header: () => (
                <div>
                    <Tooltip
                        className="text-muted-foreground rounded-sm font-medium"
                        content="Category"
                        showArrow={true}
                    >
                        <span className="flex items-center gap-2">
                            Category <CircleHelp className="w-4 h-4" />
                        </span>
                    </Tooltip>
                </div>
            ),
            cell: ({ row }) => <span>{row.original.category}</span>,
        },
        {
            accessorKey: 'menus',
            header: () => (
                <div>
                    <Tooltip
                        className="text-muted-foreground rounded-sm font-medium"
                        content="Menus this category belongs to"
                        showArrow={true}
                    >
                        <span className="flex items-center gap-2">
                            Menus <CircleHelp className="w-4 h-4" />
                        </span>
                    </Tooltip>
                </div>
            ),
            cell: ({ row }) => {
                const menus = row.original.menus || (row.original.menu ? [row.original.menu] : []);
                if (menus.length === 0) {
                    return (
                        <span className="text-muted-foreground italic">
                            No menus assigned
                        </span>
                    );
                }
                if (menus.length === 1) {
                    return <span>{menus[0].name}</span>;
                }
                return (
                    <span className="truncate">
                        {menus.map((m) => m.name).join(', ')}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => {
                return (
                    <ItemCategoryActionCell
                        category={row.original as Category}
                    />
                );
            },
        },

        {
            id: 'delete-all',
            header: () => <ItemCategoryDeleteCell selected={selected} />,
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
