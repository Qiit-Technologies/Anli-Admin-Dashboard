import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';
import ItemActionCell from '../ItemActionCell';
import { Dispatch, SetStateAction } from 'react';
import ItemDeleteCell from '../ItemDeleteCell';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/lib/utils';

export const ItemTableColumns: (
    selected: number[],
    setSelected: Dispatch<SetStateAction<number[]>>,
) => ColumnDef<any>[] = (selected, setSelected) => {
    return [
        // {
        //     id: 'select',
        //     header: ({ table }) => (
        //         <Checkbox
        //             checked={
        //                 table.getIsAllPageRowsSelected() ||
        //                 (table.getIsSomePageRowsSelected() && 'indeterminate')
        //             }
        //             onCheckedChange={(value) =>
        //                 table.toggleAllPageRowsSelected(!!value)
        //             }
        //             aria-label="Select all"
        //         />
        //     ),
        //     cell: ({ row }) => (
        //         <Checkbox
        //             checked={row.getIsSelected()}
        //             onCheckedChange={(value) => row.toggleSelected(!!value)}
        //             aria-label="Select row"
        //         />
        //     ),
        //     enableSorting: false,
        //     enableHiding: false,
        // },
        {
            accessorKey: 'name',
            header: () => (
                <div>
                    <Tooltip
                        className="text-muted-foreground rounded-sm font-medium"
                        content="Item name"
                        showArrow={true}
                    >
                        <span className="flex items-center gap-2">
                            Name <CircleHelp className="w-4 h-4" />
                        </span>
                    </Tooltip>
                </div>
            ),
            cell: ({ row }) => <span>{row?.original?.name}</span>,
        },
        {
            accessorKey: 'description',
            header: () => (
                <div>
                    <Tooltip
                        className="text-muted-foreground rounded-sm font-medium"
                        content="Item description"
                        showArrow={true}
                    >
                        <span className="flex items-center gap-2">
                            Description <CircleHelp className="w-4 h-4" />
                        </span>
                    </Tooltip>
                </div>
            ),
            cell: ({ row }) => <span>{row?.original?.description}</span>,
        },
        {
            accessorKey: 'price',
            header: () => (
                <div>
                    <Tooltip
                        className="text-muted-foreground rounded-sm font-medium"
                        content="Item price"
                        showArrow={true}
                    >
                        <span className="flex items-center gap-2">
                            Price <CircleHelp className="w-4 h-4" />
                        </span>
                    </Tooltip>
                </div>
            ),
            cell: ({ row }) => (
                <span>{formatCurrency(row?.original?.price)}</span>
            ),
        },
        {
            accessorKey: 'category',
            header: () => (
                <div>
                    <Tooltip
                        className="text-muted-foreground rounded-sm font-medium"
                        content="Item category"
                        showArrow={true}
                    >
                        <span className="flex items-center gap-2">
                            Category <CircleHelp className="w-4 h-4" />
                        </span>
                    </Tooltip>
                </div>
            ),
            cell: ({ row }) => <span>{row?.original?.category?.name}</span>,
            filterFn: (row, filterValue) => {
                const categoryName = row?.original?.category?.name;
                if (!filterValue || filterValue.length === 0) return true;
                return filterValue.includes(categoryName);
            },
        },
        {
            accessorKey: 'subCategory',
            header: () => (
                <div>
                    <Tooltip
                        className="text-muted-foreground rounded-sm font-medium"
                        content="Sub category"
                        showArrow={true}
                    >
                        <span className="flex items-center gap-2">
                            Sub Category <CircleHelp className="w-4 h-4" />
                        </span>
                    </Tooltip>
                </div>
            ),
            cell: ({ row }) => (
                <span>
                    {row?.original?.subCategory?.name ?? 'No sub category'}
                </span>
            ),
        },
        {
            id: 'action',
            header: 'Action',
            cell: ({ row }) => {
                return <ItemActionCell item={row?.original} />;
            },
        },
        {
            id: 'delete-all',
            header: () => <ItemDeleteCell selected={selected} />,
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

export default ItemTableColumns;
