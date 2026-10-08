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
import { ListFilter, Plus } from 'lucide-react';
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
import Link from 'next/link';
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
    seeMoreLink?: string;
    hasCreate?: boolean;
};

const StockRequestTable = ({
    variant = 'striped',
    columns,
    data,
    filters,
    hasHeader = false,
    isPaginated = true,
    title,
    seeMoreLink,
    hasCreate = false,
}: TableProps) => {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({
            select: false,
        });
    const [rowSelection, setRowSelection] = React.useState({});

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
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
    });

    return (
        <div>
            {variant === 'striped' && (
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <SearchInput
                        className="w-full min-w-[200px] flex-1 sm:max-w-[320px]"
                        value={table.getState().globalFilter || ''}
                        onChange={(event) =>
                            table.setGlobalFilter(event.target.value)
                        }
                    />

                    <div className="flex flex-wrap items-center gap-2">
                        {hasCreate && (
                            <Button variant="outline" className="h-10">
                                <Plus className="mr-2 h-4 w-4" />
                                New request
                            </Button>
                        )}
                        <TableFilter table={table} filters={filters} />
                    </div>
                </div>
            )}

            <div className="w-full overflow-hidden relative bg-white border rounded-lg">
                {variant === 'default' && (
                    <div className="flex items-center justify-between p-4 py-4 px-6">
                        <SearchInput className="w-full lg:w-[400px]" />
                        <div className="ml-auto flex items-center gap-3">
                            <Button variant={'outline'}>
                                <ListFilter />
                                More filters
                            </Button>
                            <ExportButton
                                data={data}
                                filename="stock-requests"
                            />
                        </div>
                    </div>
                )}
                {hasHeader && (
                    <div className="flex items-center w-full justify-between px-4 py-2 border-b">
                        <h1 className="text-sm font-semibold">{title}</h1>
                        <div className="flex items-center gap-3 text-sm">
                            {seeMoreLink && (
                                <Link href={seeMoreLink}>See More</Link>
                            )}
                            <ExportButton
                                data={data}
                                filename="stock-requests"
                            />
                        </div>
                    </div>
                )}
                <div>
                    <Table>
                        <TableHeader className="bg-gray-100 border">
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
                                                    'h-auto py-1.5 text-[11px]',
                                                    index === 0 && 'pl-4',
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
                                        className="data-[state=selected]:bg-brand/10 h-9"
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
                                                        'capitalize text-muted-foreground py-1 text-[12px] leading-tight',
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

export default StockRequestTable;
