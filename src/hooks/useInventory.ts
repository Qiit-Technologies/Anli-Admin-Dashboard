// import { fetchInventory } from '@/app/actions/inventory';
// import { InventoryInterface } from '@/types';
// import { SortDescriptor } from '@heroui/react';
// import { useEffect, useMemo, useState } from 'react';

// type IndexedObject = { [key: string]: any };

// const useInventory = (refreshTable: number) => {
//     const [items, setItems] = useState<InventoryInterface[]>([]);
//     const [page, setPage] = useState(1);
//     const [lastPage, setLastPage] = useState(1);
//     const [loading, setLoading] = useState<boolean>(false);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [filterDepartment, setFilterDepartment] = useState('all');
//     const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
//         column: 'id',
//         direction: 'ascending',
//     });

//     useEffect(() => {
//         const loadItems = async () => {
//             setLoading(true);
//             const { data, meta } = await fetchInventory(page);
//             setItems(data);
//             setLastPage(meta.lastPage);
//             setLoading(false);
//         };
//         loadItems();
//     }, [page, refreshTable]);

//     const filteredItems = items.filter((item) => {
//         const matchesQuery = item.item.name
//             .toLowerCase()
//             .includes(searchQuery.toLowerCase());
//         const matchesDepartment =
//             filterDepartment === 'all' ||
//             item.role.department === filterDepartment;
//         return matchesQuery && matchesDepartment;
//     });

//     const handleSort = (column: SortDescriptor) => {
//         setSortDescriptor(column);
//     };

//     const sortedItems = useMemo(() => {
//         return [...filteredItems].sort((a, b) => {
//             const getValue = <T>(item: T, column: keyof T | string): any => {
//                 // Map flat column names to nested keys
//                 const columnMap: Partial<
//                     Record<keyof InventoryInterface | string, string>
//                 > = {
//                     name: 'item.name',
//                     department: 'role.department',
//                 };

//                 // Resolve nested keys
//                 const resolvedColumn =
//                     columnMap[column as string] || (column as string);
//                 const keys = resolvedColumn.split('.') as IndexedObject;
//                 return keys.reduce(
//                     (value: any, key: string) => value?.[key],
//                     item,
//                 );
//             };

//             const first = getValue(
//                 a,
//                 sortDescriptor.column as keyof InventoryInterface,
//             );
//             const second = getValue(
//                 b,
//                 sortDescriptor.column as keyof InventoryInterface,
//             );

//             // Compare values
//             const cmp = first < second ? -1 : first > second ? 1 : 0;

//             // Handle sort direction
//             return sortDescriptor.direction === 'descending' ? -cmp : cmp;
//         });
//     }, [filteredItems, sortDescriptor]);

//     return {
//         items: sortedItems,
//         page,
//         setPage,
//         lastPage,
//         isLoading: loading,
//         searchQuery,
//         setSearchQuery,
//         setFilterDepartment,
//         filterDepartment,
//         sortDescriptor,
//         setSortDescriptor: handleSort,
//     };
// };

// export default useInventory;
