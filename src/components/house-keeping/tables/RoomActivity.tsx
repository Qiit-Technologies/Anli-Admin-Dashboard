'use client';

import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from '@tanstack/react-table';
import {
    ArrowDown,
    ChevronDown,
    ChevronRight,
    CircleHelp,
    ListFilter,
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ROOM } from '@/types';
import { Tooltip } from '@heroui/react';
import Link from 'next/link';
import SearchInput from '../common/SearchInput';
import TableFilter from './Filter';
import StatusToggleButton from './components/StatusToggleButton';

type TableProps = {
    variant?: 'default' | 'striped';
    data: ROOM[];
};

const statusStyles = {
    pending: {
        bg: 'bg-orange-100',
        dot: 'bg-orange-500',
        text: 'text-orange-600',
    },
    done: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
        bgVariant: 'bg-orion-blue/15',
        textVariant: 'text-orion-blue',
    },
    cancelled: {
        bg: 'bg-red-100',
        dot: 'bg-red-500',
        text: 'text-red-600',
    },
    inProgress: {
        bg: 'bg-blue-100',
        dot: 'bg-blue-500',
        text: 'text-blue-600',
    },
};

const statusConfig = {
    DIRTY: {
        color: 'text-red-600',
        text: 'Dirty',
    },
    BOOKED: {
        color: 'text-orion-blue',
        text: 'Occupied',
    },
    AVAIL: {
        color: 'text-green-600',
        text: 'Clean',
    },
    IN_REVIEW: {
        color: 'text-yellow-600',
        text: 'In Review',
    },
    MAINTENANCE: {
        color: 'text-yellow-600',
        text: 'Under Maintenance',
    },
};

export const columns: ColumnDef<ROOM>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <div className="w-fit h-full flex items-center bg-red">
                <Checkbox
                    className="shadow-none border-gray-300 data-[state=checked]:bg-brand"
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={(value) =>
                        table.toggleAllPageRowsSelected(!!value)
                    }
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="w-full h-full flex items-center bg-red">
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
        accessorKey: 'roomNumber',
        header: 'Room Number',
        cell: ({ row }) => {
            const roomNumber = row.original.roomNumber;

            return (
                <div className="capitalize flex flex-col">
                    <span className="text-muted-foreground">{roomNumber}</span>
                </div>
            );
        },
    },
    {
        id: 'roomType',
        accessorKey: 'roomtype.name',
        header: 'Room Type',
        cell: ({ row }) => {
            const roomType = row.original.roomtype.name;

            return (
                <div className="capitalize flex flex-col">
                    <span className="text-muted-foreground">{roomType}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'room.isOccupied',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Whether the room is currently occupied"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Occupancy Status
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const isRoomOccupied = row.original.isOccupied;
            return (
                <span>
                    {isRoomOccupied === true ? 'In house' : 'Checked Out'}
                </span>
            );
        },
    },
    {
        id: 'stayOver',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Stay over - Staying over the room"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Stay Over <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const stayOver = row.original.isBooked;
            const stayOverText = stayOver ? 'Yes' : 'No';
            return <span>{stayOverText}</span>;
        },
    },
    {
        id: 'cleanedRoom',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Is A Room Cleaned - Cleaned | Not Cleaned"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Cleaned Room <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const room = row.original;
            const status = row.original.status;
            const isCleaned = status !== 'DIRTY' ? 'Cleaned' : 'Dirty';
            let statusColor = '';
            const config = statusConfig[room.status] || {
                color: 'bg-gray-600 text-gray-600',
                text: 'Unknown',
            };

            statusColor = config.color;
            return <span className={statusColor}>{isCleaned}</span>;
        },
    },
    {
        accessorKey: 'isBooked',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Due Out - Due in time | Not Due"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Due Out <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const dueOut = row.original.isBooked;
            const isDue = dueOut ? 'Due in time' : 'Not Due';
            return <span className="text-green-700">{isDue}</span>;
        },
    },
    {
        id: 'status',
        accessorKey: 'status',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Request Status - Pending | Processing | Attended to | Failed"
                    showArrow={true}
                >
                    <button className="flex items-center gap-2">
                        Status <ArrowDown className="w-4 h-4" />
                    </button>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const statusText = row.original.status;
            const status =
                statusText === 'DIRTY'
                    ? 'cancelled'
                    : statusText === 'MAINTENANCE'
                      ? 'inProgress'
                      : 'done';
            return (
                <div
                    className={cn(
                        statusStyles[status]?.bg || 'bg-gray-100',
                        'flex items-center justify-center gap-2 w-fit px-3 py-1 rounded-full',
                    )}
                >
                    <div
                        className={cn(
                            statusStyles[status]?.dot || 'bg-gray-500',
                            'w-2 h-2 rounded-full',
                        )}
                    />
                    <span
                        className={cn(
                            statusStyles[status]?.text || 'text-gray-600',
                            'text-xs caption-top',
                        )}
                    >
                        {status}
                    </span>
                </div>
            );
        },
    },
    {
        id: 'action',
        header: () => {
            return (
                <div>
                    <Tooltip
                        className="text-muted-foreground rounded-sm font-medium"
                        content="Update Request Status - Click to update"
                        showArrow={true}
                    >
                        <button className="flex items-center gap-2">
                            Action <CircleHelp className="w-4 h-4" />
                        </button>
                    </Tooltip>
                </div>
            );
        },
        cell: ({ row }) => <StatusToggleButton row={row} />,
    },
];

export const roomStatusColumnTrimmed: ColumnDef<ROOM>[] = [
    {
        accessorKey: 'roomNumber',
        header: 'Room Number',
        cell: ({ row }) => {
            const roomNumber = row.original.roomNumber;
            const roomType = row.original.roomtype;

            return (
                <div className="capitalize flex flex-col">
                    <span className="text-muted-foreground">
                        {roomNumber} <span>({roomType.name})</span>
                    </span>
                </div>
            );
        },
    },
    {
        id: 'cleanedRoom',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Is A Room Cleaned - Cleaned | Not Cleaned"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Cleaned Room <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const room = row.original;
            const status = row.original.status;
            const isCleaned = status !== 'DIRTY' ? 'Cleaned' : 'Dirty';
            let statusColor = '';
            const config = statusConfig[room.status] || {
                color: 'bg-gray-600 text-gray-600',
                text: 'Unknown',
            };

            statusColor = config.color;
            return <span className={statusColor}>{isCleaned}</span>;
        },
    },
    {
        id: 'status',
        accessorKey: 'status',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Request Status - Pending | Processing | Attended to | Failed"
                    showArrow={true}
                >
                    <button className="flex items-center gap-2">
                        Status <ArrowDown className="w-4 h-4" />
                    </button>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const statusText = row.original.status;
            const status =
                statusText === 'DIRTY'
                    ? 'cancelled'
                    : statusText === 'MAINTENANCE'
                      ? 'inProgress'
                      : 'done';
            return (
                <div
                    className={cn(
                        statusStyles[status]?.bg || 'bg-gray-100',
                        'flex items-center justify-center gap-2 w-fit px-3 py-1 rounded-full',
                    )}
                >
                    <div
                        className={cn(
                            statusStyles[status]?.dot || 'bg-gray-500',
                            'w-2 h-2 rounded-full',
                        )}
                    />
                    <span
                        className={cn(
                            statusStyles[status]?.text || 'text-gray-600',
                            'text-xs caption-top',
                        )}
                    >
                        {status}
                    </span>
                </div>
            );
        },
    },
];

const filters = [
    {
        id: 'roomType',
        label: 'Room Type',
        options: [
            { value: 'Single', label: 'Single' },
            { value: 'Double', label: 'Double' },
            { value: 'Suite', label: 'Suite' },
        ],
    },
    {
        id: 'status',
        label: 'Status',
        options: [
            { value: 'DIRTY', label: 'Pending' },
            { value: 'BOOKED', label: 'Done' },
        ],
    },
];

const RoomActivityTable = ({ variant = 'default', data }: TableProps) => {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({ roomType: false, select: false });
    const [rowSelection, setRowSelection] = React.useState({});
    const [expandedGroups, setExpandedGroups] = React.useState<
        Record<string, boolean>
    >({});

    const groupedData = React.useMemo(() => {
        if (!data) return {};
        const sortedData = [...data].sort((a, b) =>
            (a.roomtype.name ?? 'Unknown').localeCompare(
                b.roomtype.name ?? 'Unknown',
            ),
        );

        const groups: Record<string, typeof data> = {};

        for (const activity of sortedData) {
            const groupKey = activity.roomtype.name ?? 'Unknown';
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(activity);
        }

        return groups;
    }, [data]);

    React.useEffect(() => {
        const initialExpandedState: Record<string, boolean> = {};
        Object.keys(groupedData).forEach((group) => {
            initialExpandedState[group] = true;
        });
        setExpandedGroups(initialExpandedState);
    }, [groupedData]);

    const toggleGroupExpansion = (groupName: string) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [groupName]: !prev[groupName],
        }));
    };

    const table = useReactTable({
        data: data ?? [],
        columns: columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <div>
            {variant === 'striped' && (
                <div className="flex items-center justify-between my-6">
                    <SearchInput
                        className="w-full lg:w-[400px]"
                        value={table.getState().globalFilter || ''}
                        onChange={(event) =>
                            table.setGlobalFilter(event.target.value)
                        }
                    />
                    <TableFilter table={table} filters={filters} />
                </div>
            )}
            <div className="w-full relative bg-white border rounded-lg">
                <div className="flex border-b items-center px-6 py-4">
                    <h1>Room Activity</h1>
                </div>
                {variant === 'default' && (
                    <div className="flex items-center justify-between p-4 py-4 px-6">
                        <SearchInput className="w-full lg:w-[400px]" />
                        <Button variant={'outline'}>
                            <ListFilter />
                            More filters
                        </Button>
                    </div>
                )}
                <div>
                    <Table>
                        <TableHeader className="bg-gray-100 border py-4">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map(
                                        (header, index) => {
                                            if (header.id === 'roomType')
                                                return null;
                                            return (
                                                <TableHead
                                                    key={header.id}
                                                    className={cn(
                                                        header.id === 'select'
                                                            ? 'w-8'
                                                            : '',
                                                        index === 0 && 'pl-6',
                                                    )}
                                                >
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                              header.column
                                                                  .columnDef
                                                                  .header,
                                                              header.getContext(),
                                                          )}
                                                </TableHead>
                                            );
                                        },
                                    )}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {Object.keys(groupedData).length > 0 ? (
                                Object.entries(groupedData).map(
                                    ([groupName, groupItems]) => (
                                        <React.Fragment key={groupName}>
                                            <TableRow
                                                className="bg-white cursor-pointer"
                                                onClick={() =>
                                                    toggleGroupExpansion(
                                                        groupName,
                                                    )
                                                }
                                            >
                                                <TableCell
                                                    colSpan={
                                                        table
                                                            .getVisibleLeafColumns()
                                                            .filter(
                                                                (col) =>
                                                                    col.id !==
                                                                    'roomType',
                                                            ).length
                                                    }
                                                    className="px-6 py-4"
                                                >
                                                    <div className="flex items-center">
                                                        <div className="mr-2">
                                                            {expandedGroups[
                                                                groupName
                                                            ] ? (
                                                                <ChevronDown className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4" />
                                                            )}
                                                        </div>
                                                        <h3 className="font-medium">
                                                            {groupName} (
                                                            {groupItems.length}{' '}
                                                            rooms)
                                                        </h3>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            {expandedGroups[groupName] &&
                                                groupItems.map((item) => {
                                                    const row = table
                                                        .getRowModel()
                                                        .rows.find(
                                                            (r) =>
                                                                r.original
                                                                    .id ===
                                                                item.id,
                                                        );
                                                    if (!row) return null;

                                                    return (
                                                        <TableRow
                                                            key={item.id}
                                                            data-state={
                                                                row.getIsSelected() &&
                                                                'selected'
                                                            }
                                                            className="data-[state=selected]:bg-brand/10"
                                                        >
                                                            {row
                                                                .getVisibleCells()
                                                                .filter(
                                                                    (cell) =>
                                                                        cell
                                                                            .column
                                                                            .id !==
                                                                        'roomType',
                                                                )
                                                                .map(
                                                                    (
                                                                        cell,
                                                                        index,
                                                                    ) => (
                                                                        <TableCell
                                                                            key={
                                                                                cell.id
                                                                            }
                                                                            className={cn(
                                                                                cell.id ===
                                                                                    'select'
                                                                                    ? 'w-8'
                                                                                    : '',
                                                                                index ===
                                                                                    0 &&
                                                                                    'pl-6',
                                                                                index ===
                                                                                    row
                                                                                        .getVisibleCells()
                                                                                        .filter(
                                                                                            (
                                                                                                c,
                                                                                            ) =>
                                                                                                c
                                                                                                    .column
                                                                                                    .id !==
                                                                                                'roomType',
                                                                                        )
                                                                                        .length -
                                                                                        1 &&
                                                                                    'pr-6',
                                                                                'capitalize text-muted-foreground py-4',
                                                                            )}
                                                                        >
                                                                            {flexRender(
                                                                                cell
                                                                                    .column
                                                                                    .columnDef
                                                                                    .cell,
                                                                                cell.getContext(),
                                                                            )}
                                                                        </TableCell>
                                                                    ),
                                                                )}
                                                        </TableRow>
                                                    );
                                                })}
                                        </React.Fragment>
                                    ),
                                )
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={
                                            table
                                                .getVisibleLeafColumns()
                                                .filter(
                                                    (col) =>
                                                        col.id !== 'roomType',
                                                ).length
                                        }
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export const RoomActivityTableUnGrouped = ({
    variant = 'default',
    data,
}: TableProps) => {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({
            select: false,
        });
    const [rowSelection, setRowSelection] = React.useState({});

    const table = useReactTable({
        data: data ?? [],
        columns: columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <div>
            {variant === 'striped' && (
                <div className="flex items-center justify-between my-6">
                    <SearchInput className="w-full lg:w-[400px]" />
                    <Button variant={'outline'}>
                        <ListFilter />
                        More filters
                    </Button>
                </div>
            )}
            <div className="w-full relative bg-white border rounded-lg">
                <div className="flex border-b items-center px-6 py-4">
                    <h1>Recent Room Activity</h1>
                    <Link
                        className="ml-auto hover:underline hover:text-brand hover:underline-offset-2"
                        href={'/house-keeping/room-status/all-room-activities'}
                    >
                        View All
                    </Link>
                </div>
                {/* {variant === 'default' && (
                    <div className="flex items-center justify-between p-4 py-4 px-6">
                        <SearchInput className="w-full lg:w-[400px]" />
                        <Button variant={'outline'}>
                            <ListFilter />
                            More filters
                        </Button>
                    </div>
                )} */}
                <div>
                    <Table>
                        <TableHeader className="bg-gray-100 border py-4">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map(
                                        (header, index) => (
                                            <TableHead
                                                key={header.id}
                                                className={cn(
                                                    header.id === 'select'
                                                        ? 'w-8'
                                                        : '',
                                                    index === 0 && 'pl-6',
                                                )}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column
                                                              .columnDef.header,
                                                          header.getContext(),
                                                      )}
                                            </TableHead>
                                        ),
                                    )}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={
                                            row.getIsSelected() && 'selected'
                                        }
                                        className="data-[state=selected]:bg-brand/10"
                                    >
                                        {row
                                            .getVisibleCells()
                                            .map((cell, index) => (
                                                <TableCell
                                                    key={cell.id}
                                                    className={cn(
                                                        cell.id === 'select'
                                                            ? 'w-8'
                                                            : '',
                                                        index === 0 && 'pl-6',
                                                        index ===
                                                            row.getVisibleCells()
                                                                .length -
                                                                1 && 'pr-6',
                                                        'capitalize text-muted-foreground py-4',
                                                    )}
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef
                                                            .cell,
                                                        cell.getContext(),
                                                    )}
                                                </TableCell>
                                            ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={
                                            table.getVisibleLeafColumns().length
                                        }
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default RoomActivityTable;
