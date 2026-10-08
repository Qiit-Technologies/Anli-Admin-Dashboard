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
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

import SearchInput from '@/components/house-keeping/common/SearchInput';
import TableFilter from '@/components/house-keeping/tables/Filter';
import { DataTablePagination } from '@/components/house-keeping/tables/Pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { DateRangeFilter } from './DateRangeFilter';
import DateRangePicker from './DateRangePicker';

interface TableFilters {
    id: string;
    label: string;
    options: {
        value: string;
        label: string;
    }[];
    subFilters?: {
        triggerValue: string;
        filter: TableFilters;
    }[];
}

type TableProps = {
    variant?: 'default' | 'striped';
    data: any;
    columns: ColumnDef<any>[];
    filters?: TableFilters[];
    hasHeader?: boolean;
    title?: string;
    isPaginated?: boolean;
    extend?: React.ReactNode;
    hasFilter?: boolean;
    hasDateFilter?: boolean;
    pageIndex?: number;
    pageSize?: number;
    fullWidth?: boolean;
    dateFilter?: {
        enabled: boolean;
        column: string;
        label?: string;
    };
    presetDateFilter?: {
        enabled: boolean;
        column: string;
    };
    isSticky?: boolean;
    containerClassName?: string;
    headerClassName?: string;
    cellClassName?: string;
    onSelectionChange?: (rows: any[]) => void;
    rowClickSelect?: boolean;
    singleSelect?: boolean;
    columnDisplay?: {
        label: string;
        options: { value: string; columnId: string; label: string }[];
        defaultColumnId?: string;
        onChange?: (columnId: string) => void;
    };
    persistPaginationInQuery?: boolean;
    paginationQueryKey?: string;
    searchPlaceholder?: string;
    meta?: any;
    highlightedRowId?: string | number;
};

const CustomTable = ({
    variant = 'striped',
    columns,
    data,
    filters,
    hasHeader = true,
    isPaginated = true,
    title,
    extend,
    hasFilter = true,
    pageIndex = 0,
    pageSize = 10,
    fullWidth,
    dateFilter,
    presetDateFilter,
    containerClassName,
    headerClassName,
    cellClassName,
    isSticky,
    onSelectionChange,
    rowClickSelect = false,
    singleSelect = false,
    columnDisplay,
    persistPaginationInQuery = false,
    paginationQueryKey = 'page',
    searchPlaceholder,
    meta,
    highlightedRowId,
}: TableProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const defaultDisplayColumnId =
        columnDisplay?.defaultColumnId ?? columnDisplay?.options?.[0]?.columnId;

    const initialColumnFilters: ColumnFiltersState = React.useMemo(() => {
        if (!filters) return [];
        const colFilters: ColumnFiltersState = [];
        filters.forEach((filter) => {
            const val = searchParams.get(filter.id);
            if (val && val !== 'all') {
                colFilters.push({ id: filter.id, value: val });
            }
        });
        return colFilters;
    }, [filters, searchParams]);

    const initialSearch = searchParams.get('search') || '';

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>(initialColumnFilters);

    React.useEffect(() => {
        setColumnFilters(initialColumnFilters);
    }, [initialColumnFilters]);

    const [displayColumnId, setDisplayColumnId] = useState(
        defaultDisplayColumnId,
    );
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>(() => {
            const vis: VisibilityState = { select: true };
            if (columnDisplay) {
                columnDisplay.options.forEach((opt) => {
                    vis[opt.columnId] = opt.columnId === defaultDisplayColumnId;
                });
            }
            return vis;
        });
    const [rowSelection, setRowSelection] = React.useState({});

    const queryPageIndex = React.useMemo(() => {
        if (!persistPaginationInQuery) return undefined;

        const rawPage = searchParams.get(paginationQueryKey);
        const parsedPage = Number(rawPage);

        if (!rawPage || Number.isNaN(parsedPage) || parsedPage < 1) return 0;
        return parsedPage - 1;
    }, [persistPaginationInQuery, paginationQueryKey, searchParams]);

    const [pagination, setPagination] = useState({
        pageIndex: queryPageIndex ?? pageIndex,
        pageSize: pageSize,
    });

    const [searchInput, setSearchInput] = useState(initialSearch);

    const handleSearchChange = (value: string) => {
        setSearchInput(value);
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set('search', value);
        } else {
            params.delete('search');
        }
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const [dateRange, setDateRange] = useState<{
        from: Date | undefined;
        to: Date | undefined;
    }>({
        from: undefined,
        to: undefined,
    });
    const [presetDateRange, setPresetDateRange] = useState<
        { from: Date | undefined; to: Date | undefined } | undefined
    >(undefined);

    const globalFilter = React.useMemo(
        () => ({
            searchInput,
            dateRange,
            presetDateRange,
        }),
        [searchInput, dateRange, presetDateRange],
    );

    const table = useReactTable({
        data: data,
        columns: columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        autoResetPageIndex: false,
        meta: meta,
        globalFilterFn: (row, columnId, value) => {
            const { searchInput, dateRange, presetDateRange } = value;

            const globalSearch = String(searchInput).toLowerCase();
            const matchesSearch =
                !globalSearch ||
                row
                    .getAllCells()
                    .some((cell) =>
                        String(cell.getValue())
                            .toLowerCase()
                            .includes(globalSearch),
                    );

            let matchesDate = true;
            if (
                dateFilter?.enabled &&
                dateFilter.column &&
                (dateRange.from || dateRange.to)
            ) {
                const cellValue = row.getValue(dateFilter.column);
                const cellDate = cellValue
                    ? new Date(cellValue as string)
                    : null;
                if (!cellDate || isNaN(cellDate.getTime())) {
                    matchesDate = false;
                } else {
                    const from = dateRange.from
                        ? new Date(dateRange.from).setHours(0, 0, 0, 0)
                        : null;
                    const to = dateRange.to
                        ? new Date(dateRange.to).setHours(23, 59, 59, 999)
                        : null;
                    if (from && cellDate.getTime() < from) matchesDate = false;
                    if (to && cellDate.getTime() > to) matchesDate = false;
                }
            }

            let matchesPresetDate = true;
            if (
                presetDateFilter?.enabled &&
                presetDateFilter.column &&
                presetDateRange
            ) {
                const cellValue = row.getValue(presetDateFilter.column);
                const cellDate = cellValue
                    ? new Date(cellValue as string)
                    : null;
                if (!cellDate || isNaN(cellDate.getTime())) {
                    matchesPresetDate = false;
                } else {
                    const from = presetDateRange.from
                        ? new Date(presetDateRange.from).setHours(0, 0, 0, 0)
                        : null;
                    const to = presetDateRange.to
                        ? new Date(presetDateRange.to).setHours(23, 59, 59, 999)
                        : null;
                    if (from && cellDate.getTime() < from)
                        matchesPresetDate = false;
                    if (to && cellDate.getTime() > to)
                        matchesPresetDate = false;
                }
            }

            return matchesSearch && matchesDate && matchesPresetDate;
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
            globalFilter,
        },
    });

    React.useEffect(() => {
        if (!persistPaginationInQuery) return;

        const currentPage = String(pagination.pageIndex + 1);
        const existingPage = searchParams.get(paginationQueryKey);
        if (existingPage === currentPage) return;

        const params = new URLSearchParams(searchParams.toString());
        params.set(paginationQueryKey, currentPage);
        router.replace(`?${params.toString()}`, { scroll: false });
    }, [
        pagination.pageIndex,
        paginationQueryKey,
        persistPaginationInQuery,
        router,
        searchParams,
    ]);

    React.useEffect(() => {
        if (!onSelectionChange) return;
        const selected = table
            .getSelectedRowModel()
            .rows.map((r) => r.original);
        onSelectionChange(selected);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rowSelection]);

    // Find and scroll to highlighted row when highlightedRowId changes
    React.useEffect(() => {
        if (!highlightedRowId) {
            return;
        }

        // Step 1: Get all processed rows (sorted, filtered, etc.)
        const processedRows = table.getSortedRowModel().rows;

        // Step 2: Find the index of our target order
        const rowIndex = processedRows.findIndex(
            (row) => String(row.original.id) === String(highlightedRowId),
        );

        if (rowIndex === -1) {
            return;
        }

        // Step 3: Calculate target page index
        const targetPageIndex = Math.floor(rowIndex / pagination.pageSize);

        // Step 4: Navigate to correct page and scroll
        if (targetPageIndex !== pagination.pageIndex) {
            table.setPageIndex(targetPageIndex);
            setTimeout(() => {
                const rowElement = document.querySelector('.bg-yellow-50');
                if (rowElement) {
                    rowElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'center',
                    });
                }
            }, 1000);
        } else {
            setTimeout(() => {
                const rowElement = document.querySelector('.bg-yellow-50');
                if (rowElement) {
                    rowElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'center',
                    });
                }
            }, 300);
        }
    }, [highlightedRowId, table, pagination]);

    const handleColumnDisplayChange = React.useCallback(
        (columnId: string) => {
            setDisplayColumnId(columnId);
            if (columnDisplay) {
                const next: VisibilityState = { ...columnVisibility };
                columnDisplay.options.forEach((opt) => {
                    next[opt.columnId] = opt.columnId === columnId;
                });
                setColumnVisibility(next);
                columnDisplay.onChange?.(columnId);
            }
        },
        [columnDisplay, columnVisibility],
    );

    const handlePresetDateChange = React.useCallback(
        (dateRange: { from: Date | undefined; to: Date | undefined }) => {
            if (dateRange) {
                setPresetDateRange({
                    from: dateRange.from,
                    to: dateRange.to || undefined,
                });
            } else {
                setPresetDateRange(undefined);
            }
        },
        [setPresetDateRange],
    );

    return (
        <div className="flex flex-col w-full">
            {hasHeader && (
                <div className="flex flex-col lg:flex-row items-start sm:items-center gap-4 justify-between mb-6">
                    <SearchInput
                        className="w-full sm:w-[400px]"
                        placeholder={searchPlaceholder}
                        value={searchInput}
                        onChange={(event) =>
                            handleSearchChange(event.target.value)
                        }
                    />
                    <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
                        <div className="flex flex-col md:flex-row items-center gap-2">
                            {columnDisplay && (
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-muted-foreground whitespace-nowrap">
                                        {columnDisplay.label}
                                    </label>
                                    <Select
                                        value={displayColumnId}
                                        onValueChange={
                                            handleColumnDisplayChange
                                        }
                                    >
                                        <SelectTrigger className="w-[140px] h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {columnDisplay.options.map(
                                                (opt) => (
                                                    <SelectItem
                                                        key={opt.columnId}
                                                        value={opt.columnId}
                                                    >
                                                        {opt.label}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            {dateFilter?.enabled && (
                                <DateRangePicker
                                    dateRange={dateRange}
                                    onDateRangeChange={setDateRange}
                                    label={dateFilter.label}
                                />
                            )}

                            {presetDateFilter?.enabled && (
                                <DateRangeFilter
                                    onDateRangeChange={
                                        handlePresetDateChange as any
                                    }
                                />
                            )}

                            <TableFilter table={table} filters={filters} />
                        </div>
                        {extend}
                    </div>
                </div>
            )}
            <div
                className={cn(
                    'w-full overflow-hidden min-h-full bg-white rounded-lg border',
                    containerClassName,
                )}
            >
                {variant === 'default' && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full justify-between px-6 py-4">
                        <h1 className="text-lg font-semibold capitalize">
                            {title}
                        </h1>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            {extend}
                            {hasFilter && (
                                <TableFilter table={table} filters={filters} />
                            )}
                        </div>
                    </div>
                )}
                <div className="min-w-full overflow-x-auto">
                    <div>
                        <Table
                            className={cn(
                                'w-full',
                                fullWidth ? 'min-w-0' : 'min-w-[1000px]',
                            )}
                        >
                            <TableHeader className="bg-gray-100 border w-full py-4">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map(
                                            (header, index) => (
                                                <TableHead
                                                    key={header.id}
                                                    className={cn(
                                                        header.id === 'select'
                                                            ? 'w-6'
                                                            : 'min-w-[120px]',
                                                        index === 0 &&
                                                            header.id !==
                                                                'select' &&
                                                            'pl-6',
                                                        'whitespace-nowrap',
                                                        header.id === 'actions'
                                                            ? 'sticky right-0 pr-6 bg-gray-100'
                                                            : '',
                                                        headerClassName,
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
                                            ),
                                        )}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows.length > 0 ? (
                                    table.getRowModel().rows.map((row) => {
                                        const isHighlighted =
                                            highlightedRowId !== undefined &&
                                            String(row.original.id) ===
                                                String(highlightedRowId);
                                        return (
                                            <TableRow
                                                key={row.id}
                                                data-state={
                                                    row.getIsSelected() &&
                                                    'selected'
                                                }
                                                className={cn(
                                                    'data-[state=selected]:bg-brand/10 transition-colors',
                                                    isHighlighted
                                                        ? 'bg-yellow-50 ring-2 ring-yellow-400'
                                                        : '',
                                                )}
                                                onClick={() => {
                                                    if (!rowClickSelect) return;
                                                    if (singleSelect) {
                                                        if (
                                                            row.getIsSelected()
                                                        ) {
                                                            table.setRowSelection(
                                                                {},
                                                            );
                                                        } else {
                                                            table.setRowSelection(
                                                                {
                                                                    [row.id]: true,
                                                                },
                                                            );
                                                        }
                                                    } else {
                                                        row.toggleSelected();
                                                    }
                                                }}
                                            >
                                                {row
                                                    .getVisibleCells()
                                                    .map((cell, index) => (
                                                        <TableCell
                                                            key={cell.id}
                                                            className={cn(
                                                                cell.column
                                                                    .id ===
                                                                    'select'
                                                                    ? 'w-4'
                                                                    : 'min-w-[120px]',
                                                                index === 0 &&
                                                                    cell.column
                                                                        .id !==
                                                                        'select' &&
                                                                    'pl-6',
                                                                index ===
                                                                    row.getVisibleCells()
                                                                        .length -
                                                                        1 &&
                                                                    'pr-6',
                                                                'capitalize text-muted-foreground py-4 whitespace-nowrap',
                                                                isSticky &&
                                                                    index ===
                                                                        row.getVisibleCells()
                                                                            .length -
                                                                            1 &&
                                                                    'sticky right-0 pr-6 bg-white',
                                                                cellClassName,
                                                            )}
                                                        >
                                                            {flexRender(
                                                                cell.column
                                                                    .columnDef
                                                                    .cell,
                                                                cell.getContext(),
                                                            )}
                                                        </TableCell>
                                                    ))}
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={
                                                table.getVisibleLeafColumns()
                                                    .length
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
                {isPaginated && (
                    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t">
                        <DataTablePagination table={table} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomTable;
