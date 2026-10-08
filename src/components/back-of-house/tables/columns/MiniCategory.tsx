import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';
import MiniCatActionCell from '../MiniCatActionCell';
import { formatDate } from '@/lib/helpers';
import { Dispatch, SetStateAction } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import MiniCatDeleteCell from '../MiniCatDeleteCell';

export interface MiniCategory {
    id: number;
    menuCategory: Category;
    menuCategoryId: number;
    name: string;
    description: string;
    createdAt: string;
}

interface Category {
    id: number;
    name: string;
    category: string;
    description: string;
}

export const MiniCatColumns: (
    selected: number[],
    setSelected: Dispatch<SetStateAction<number[]>>,
) => ColumnDef<MiniCategory>[] = (selected, setSelected) => {
    return [
        {
            accessorKey: 'menuCategory',
            header: () => (
                <div>
                    <Tooltip
                        className="text-muted-foreground rounded-sm font-medium"
                        content="Menu category name"
                        showArrow={true}
                    >
                        <span className="flex items-center gap-2">
                            Menu Category <CircleHelp className="w-4 h-4" />
                        </span>
                    </Tooltip>
                </div>
            ),
            cell: ({ row }) => (
                <span>{row.original.menuCategory?.name ?? ''}</span>
            ),
        },
        {
            accessorKey: 'subCategory',
            header: () => (
                <div>
                    <Tooltip
                        className="text-muted-foreground rounded-sm font-medium"
                        content="Sub category name"
                        showArrow={true}
                    >
                        <span className="flex items-center gap-2">
                            Sub Category <CircleHelp className="w-4 h-4" />
                        </span>
                    </Tooltip>
                </div>
            ),
            cell: ({ row }) => <span>{row.original?.name}</span>,
        },
        {
            accessorKey: 'createdAt',
            header: () => (
                <div>
                    <Tooltip
                        className="text-muted-foreground rounded-sm font-medium"
                        content="createdAt"
                        showArrow={true}
                    >
                        <span className="flex items-center gap-2">
                            CreatedAt <CircleHelp className="w-4 h-4" />
                        </span>
                    </Tooltip>
                </div>
            ),
            cell: ({ row }) => (
                <span>{formatDate(row.original.createdAt)}</span>
            ),
        },
        {
            id: 'action',
            header: 'Action',
            cell: ({ row }) => {
                return <MiniCatActionCell miniCategory={row.original} />;
            },
        },

        {
            id: 'delete-all',
            header: () => <MiniCatDeleteCell selected={selected} />,
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

export default MiniCatColumns;
