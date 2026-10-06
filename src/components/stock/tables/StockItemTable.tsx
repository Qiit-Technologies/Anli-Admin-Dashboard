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
import { ListFilter } from 'lucide-react';
import * as React from 'react';

import SearchInput from '@/components/house-keeping/common/SearchInput';
import TableFilter from '@/components/house-keeping/tables/Filter';
import { DataTablePagination } from '@/components/house-keeping/tables/Pagination';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import ExportButton from '@/components/ExportButton';

interface TableFilters {
    id: string;
    label: string;
    options: {
        value: string;
        label: string;
    }[];
}

type TableProps = {
    variant?: 'default' | 'striped';
    data: any[];
    columns: ColumnDef<any>[];
    filters?: TableFilters[];
    hasHeader?: boolean;
    title?: string;
    isPaginated?: boolean;
    extended?: React.ReactNode;
    hasStickyAction?: boolean;
    /** When true, table scrolls horizontally for wide column sets */
    scrollHorizontal?: boolean;
};

const StockItemTable = ({
    variant = 'striped',
    columns,
    data,
    filters,
    hasHeader = false,
    isPaginated = true,
    title,
    extended,
    hasStickyAction = false,
    scrollHorizontal = false,
}: TableProps) => {
    const searchParams = useSearchParams();

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

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>(initialColumnFilters);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [globalFilter, setGlobalFilter] = React.useState('');

    React.useEffect(() => {
        setColumnFilters(initialColumnFilters);
    }, [initialColumnFilters]);

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 18,
    });

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
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: 'includesString',
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
            globalFilter,
        },
    });

    const getRowClass = (row: any) => {
        const original = row.original || {};
        const now = new Date();
        const expiryDate = original.expiryDate
            ? new Date(original.expiryDate)
            : null;
        const daysToExpiry =
            typeof original.daysToExpiry === 'number'
                ? original.daysToExpiry
                : expiryDate
                  ? Math.ceil(
                        (expiryDate.getTime() - now.getTime()) /
                            (1000 * 60 * 60 * 24),
                    )
                  : null;

        const expired =
            original.expiryStatus === 'expired' ||
            original.status === 'Expired' ||
            (expiryDate && expiryDate < now) ||
            (typeof daysToExpiry === 'number' && daysToExpiry < 0);
        if (expired) return 'bg-[#FFD7D9] border-b-[#EE3C22]';

        const expiringSoon =
            original.expiryStatus === 'expiringSoon' ||
            (typeof daysToExpiry === 'number' &&
                daysToExpiry >= 1 &&
                daysToExpiry <= 3);
        if (expiringSoon) return 'bg-[#f973161c] border-b-[#FF6900]';

        const lowStock =
            original.stockStatus === 'low' ||
            original.status === 'Low' ||
            (typeof original.minStock === 'number' &&
                typeof original.quantity === 'number' &&
                original.quantity <= original.minStock);
        if (lowStock) return 'bg-[#FFFDEC] border-b-[#F0B100]';

        return '';
    };

    return (
        <div className="flex flex-col gap-3">
            {variant === 'striped' && (
                <div className="flex flex-wrap items-center gap-2 justify-between">
                    <SearchInput
                        className="w-full min-w-[200px] flex-1 sm:max-w-[320px]"
                        value={globalFilter}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        placeholder="Search items..."
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        <TableFilter table={table} filters={filters} />
                        <ExportButton data={data} filename="stock-items" />
                        {extended}
                    </div>
                </div>
            )}
            <div
                className={cn(
                    'w-full relative bg-white border rounded-lg',
                    scrollHorizontal ? 'overflow-x-auto' : 'overflow-hidden',
                )}
            >
                {variant === 'default' && (
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2">
                        <SearchInput className="w-full min-w-[200px] flex-1 sm:max-w-[320px]" />
                        <div className="flex flex-wrap items-center gap-2">
                            <Button variant={'outline'}>
                                <ListFilter />
                                More filters
                            </Button>
                            <ExportButton data={data} filename="stock-items" />
                            {extended}
                        </div>
                    </div>
                )}
                {hasHeader && (
                    <div className="flex items-center w-full justify-between px-4 py-2">
                        <h1>{title}</h1>
                        <ExportButton
                            data={data}
                            filename={title || 'stock-items'}
                        />
                    </div>
                )}
                <div>
                    <Table
                        className={cn(
                            scrollHorizontal && 'min-w-max w-full',
                        )}
                    >
                        <TableHeader className="bg-gray-100 border">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map(
                                        (header, index) => {
                                            const isActions =
                                                header.column.id === 'actions';
                                            return (
                                                <TableHead
                                                    key={header.id}
                                                    className={cn(
                                                        header.id === 'select'
                                                            ? 'w-8'
                                                            : '',
                                                        'h-auto text-[11px] font-medium py-1.5 px-2 text-start align-bottom',
                                                        !isActions &&
                                                            'min-w-[72px] max-w-[110px] whitespace-normal leading-tight',
                                                        isActions &&
                                                            'min-w-[40px] w-10',
                                                        index === 0 && 'pl-4',
                                                        hasStickyAction &&
                                                            index ===
                                                                headerGroup
                                                                    .headers
                                                                    .length -
                                                                    1 &&
                                                            'sticky right-0 bg-gray-100',
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
                            {table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={
                                            row.getIsSelected() && 'selected'
                                        }
                                        className={cn(
                                            'data-[state=selected]:bg-brand/10 h-9',
                                            getRowClass(row),
                                        )}
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
                                                        index === 0 && 'pl-4',
                                                        index ===
                                                            row.getVisibleCells()
                                                                .length -
                                                                1 && 'pr-4',
                                                        'text-muted-foreground py-1 px-2 text-[12px] leading-tight normal-case',
                                                        hasStickyAction &&
                                                            index ===
                                                                row.getVisibleCells()
                                                                    .length -
                                                                    1 &&
                                                            'sticky right-0 bg-white',
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
                    {isPaginated && (
                        <div className="w-full flex items-center justify-between px-4 py-2 border-t">
                            <DataTablePagination table={table} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StockItemTable;
