// import { fetchItems } from '@/app/actions/items';
// import { ItemInterface } from '@/types';
// import { SortDescriptor } from '@heroui/react';
// import { useEffect, useMemo, useState } from 'react';

// const useItems = (refreshTable: number) => {
//     const [items, setItems] = useState<ItemInterface[]>([]);
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
//             const { data, meta } = await fetchItems(page);
//             setItems(data);
//             setLastPage(meta.lastPage);
//             setLoading(false);
//         };
//         loadItems();
//     }, [page, refreshTable]);

//     const filteredItems = items.filter((item) => {
//         const matchesQuery = item.name
//             .toLowerCase()
//             .includes(searchQuery.toLowerCase());
//         const matchesFilter =
//             filterDepartment === 'all' || item.minStock >= item.quantity;
//         return matchesQuery && matchesFilter;
//     });

//     const handleSort = (column: SortDescriptor) => {
//         setSortDescriptor(column);
//     };

//     const sortedItems = useMemo(() => {
//         return [...filteredItems].sort((a: ItemInterface, b: ItemInterface) => {
//             const first = a[
//                 sortDescriptor.column as keyof ItemInterface
//             ] as number;
//             const second = b[
//                 sortDescriptor.column as keyof ItemInterface
//             ] as number;
//             const cmp = first < second ? -1 : first > second ? 1 : 0;

//             return sortDescriptor.direction === 'descending' ? -cmp : cmp;
//         });
//     }, [sortDescriptor, filteredItems]);

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

// export default useItems;
