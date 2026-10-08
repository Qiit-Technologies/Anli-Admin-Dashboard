// import { Button } from '@/components/ui/button';
// import {
//     DropdownMenu,
//     DropdownMenuCheckboxItem,
//     DropdownMenuContent,
//     DropdownMenuLabel,
//     DropdownMenuSeparator,
//     DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { Table } from '@tanstack/react-table';
// import { ListFilter } from 'lucide-react';
// import React, { useEffect, useState } from 'react';
// import { DateRange } from 'react-day-picker';
// import { DateRangeFilter } from './DateRangeFilter';

// interface TableFilters {
//     id: string;
//     label: string;
//     options: {
//         value: string;
//         label: string;
//     }[];
// }

// interface TableFilterProps {
//     table: Table<any>;
//     filters?: TableFilters[];
//     dateFilterConfig?: {
//         enabled: boolean;
//         dateField: string;
//     };
// }

// export const TableDateFilter = ({
//     table,
//     filters = [],
//     dateFilterConfig,
// }: TableFilterProps) => {
//     const [dateRange, setDateRange] = useState<DateRange | undefined>(
//         undefined,
//     );

//     useEffect(() => {
//         if (dateFilterConfig?.enabled && dateFilterConfig.dateField) {
//             const dateColumn = table.getColumn(dateFilterConfig.dateField);
//             if (dateColumn) {
//                 const filterValue = dateColumn.getFilterValue();
//                 if (filterValue && Array.isArray(filterValue)) {
//                     setDateRange({
//                         from: filterValue[0],
//                         to: filterValue[1],
//                     });
//                 }
//             }
//         }
//     }, [dateFilterConfig, table]);

//     const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
//         setDateRange(newDateRange);

//         if (dateFilterConfig?.enabled && dateFilterConfig.dateField) {
//             if (newDateRange?.from && newDateRange?.to) {
//                 table
//                     .getColumn(dateFilterConfig.dateField)
//                     ?.setFilterValue([newDateRange.from, newDateRange.to]);
//             } else {
//                 table
//                     .getColumn(dateFilterConfig.dateField)
//                     ?.setFilterValue(undefined);
//             }
//         }
//     };

//     if (filters.length === 0 && !dateFilterConfig?.enabled) {
//         return null;
//     }

//     return (
//         <div className="flex items-center gap-2">
//             {dateFilterConfig?.enabled && (
//                 <DateRangeFilter
//                     dateField={dateFilterConfig.dateField}
//                     onDateRangeChange={handleDateRangeChange}
//                     className="min-w-[220px]"
//                 />
//             )}

//             {filters.length > 0 && (
//                 <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                         <Button
//                             variant="outline"
//                             className="flex items-center gap-2"
//                         >
//                             <ListFilter className="h-4 w-4" />
//                             Filters
//                         </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end" className="w-[200px]">
//                         {filters.map((filter) => (
//                             <React.Fragment key={filter.id}>
//                                 <DropdownMenuLabel>
//                                     {filter.label}
//                                 </DropdownMenuLabel>
//                                 {filter.options.map((option) => (
//                                     <DropdownMenuCheckboxItem
//                                         key={option.value}
//                                         checked={
//                                             table
//                                                 .getColumn(filter.id)
//                                                 ?.getFilterValue() ===
//                                             option.value
//                                         }
//                                         onCheckedChange={() => {
//                                             if (
//                                                 table
//                                                     .getColumn(filter.id)
//                                                     ?.getFilterValue() ===
//                                                 option.value
//                                             ) {
//                                                 table
//                                                     .getColumn(filter.id)
//                                                     ?.setFilterValue(undefined);
//                                             } else {
//                                                 table
//                                                     .getColumn(filter.id)
//                                                     ?.setFilterValue(
//                                                         option.value,
//                                                     );
//                                             }
//                                         }}
//                                     >
//                                         {option.label}
//                                     </DropdownMenuCheckboxItem>
//                                 ))}
//                                 <DropdownMenuSeparator />
//                             </React.Fragment>
//                         ))}
//                     </DropdownMenuContent>
//                 </DropdownMenu>
//             )}
//         </div>
//     );
// };

const TableDateFilter = () => {
    return <div>TableDateFilter</div>;
};

export default TableDateFilter;
