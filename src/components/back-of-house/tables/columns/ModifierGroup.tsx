import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';
import ModifierGroupActionCell from '../ModifierGroupActionCell';
import { Checkbox } from '@/components/ui/checkbox';
import { Dispatch, SetStateAction } from 'react';
import { ModifierGroup } from '@/app/actions/modifier';
import { Badge } from '@/components/ui/badge';

export const ModifierGroupColumns: (
    selected: number[],
    setSelected: Dispatch<SetStateAction<number[]>>,
) => ColumnDef<ModifierGroup>[] = (selected, setSelected) => {
    return [
        {
            accessorKey: 'name',
            header: () => (
                <div>
                    <Tooltip
                        className="text-muted-foreground rounded-sm font-medium"
                        content="Modifier group name"
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
                        content="Modifier group description"
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
                    {row.original.description || (
                        <span className="text-muted-foreground italic">
                            No description
                        </span>
                    )}
                </span>
            ),
        },
        {
            accessorKey: 'isRequired',
            header: () => (
                <div>
                    <Tooltip
                        className="text-muted-foreground rounded-sm font-medium"
                        content="Whether this modifier is required"
                        showArrow={true}
                    >
                        <span className="flex items-center gap-2">
                            Required <CircleHelp className="w-4 h-4" />
                        </span>
                    </Tooltip>
                </div>
            ),
            cell: ({ row }) => (
                <Badge
                    variant={row.original.isRequired ? 'default' : 'outline'}
                >
                    {row.original.isRequired ? 'Required' : 'Optional'}
                </Badge>
            ),
        },
        {
            accessorKey: 'allowMultiple',
            header: () => (
                <div>
                    <Tooltip
                        className="text-muted-foreground rounded-sm font-medium"
                        content="Whether multiple selections are allowed"
                        showArrow={true}
                    >
                        <span className="flex items-center gap-2">
                            Selection Type <CircleHelp className="w-4 h-4" />
                        </span>
                    </Tooltip>
                </div>
            ),
            cell: ({ row }) => (
                <Badge
                    variant={row.original.allowMultiple ? 'default' : 'outline'}
                >
                    {row.original.allowMultiple ? 'Multiple' : 'Single'}
                </Badge>
            ),
        },
        {
            accessorKey: 'options',
            header: () => (
                <div>
                    <Tooltip
                        className="text-muted-foreground rounded-sm font-medium"
                        content="Number of options in this group"
                        showArrow={true}
                    >
                        <span className="flex items-center gap-2">
                            Options <CircleHelp className="w-4 h-4" />
                        </span>
                    </Tooltip>
                </div>
            ),
            cell: ({ row }) => (
                <span>{row.original.options?.length || 0}</span>
            ),
        },
        {
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => {
                return <ModifierGroupActionCell group={row.original} />;
            },
        },
        {
            id: 'delete-all',
            header: () => null,
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

