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
import { useState } from 'react';

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
};

const CustomTable = ({
    variant = 'striped',
    columns,
    data,
    filters,
    hasHeader = false,
    isPaginated = true,
    title,
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
        pageSize: 5,
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
        <div className="flex flex-col overflow-y-auto">
            {!hasHeader && variant === 'striped' && (
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
            <div className="w-full h-full overflow-hidden relative bg-white border rounded-lg">
                {variant === 'default' && (
                    <div className="flex items-center justify-between p-4 py-4 px-6">
                        <SearchInput className="w-full lg:w-[400px]" />
                        <Button variant={'outline'}>
                            <ListFilter />
                            More filters
                        </Button>
                    </div>
                )}
                {hasHeader && (
                    <div className="flex items-center w-full justify-between px-6 py-4">
                        <h1>{title}</h1>
                        <TableFilter table={table} filters={filters} />
                    </div>
                )}
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
                    {isPaginated && (
                        <div className="w-full flex items-center justify-between px-6 py-4 border-t">
                            <DataTablePagination table={table} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomTable;
