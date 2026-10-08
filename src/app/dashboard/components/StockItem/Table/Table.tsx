// import renderCell from '@/app/dashboard/components/Stock/Table/renderCell';
// import useItems from '@/hooks/useItems';
// import { ColumnKeyType, ItemInterface } from '@/types';
// import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
// import {
//     Button,
//     Input,
//     Pagination,
//     Select,
//     SelectItem,
//     Table,
//     TableBody,
//     TableCell,
//     TableColumn,
//     TableHeader,
//     TableRow,
//     useDisclosure,
// } from '@heroui/react';
// import React, { useState } from 'react';
// import { IoMdAddCircleOutline, IoMdRefresh } from 'react-icons/io';
// import DetailsModal from './DetailsModal/DetailsModal';

// interface TableViewProps {
//     onEdit: (item?: ItemInterface) => void;
//     onDelete: (id: number) => void;
//     refreshTable: number;
//     setRefreshTable: React.Dispatch<React.SetStateAction<number>>;
// }

// const departments = [
//     {
//         key: 'LowStock',
//         label: 'Low Stock',
//     },
// ];

// const TableView: React.FC<TableViewProps> = ({
//     onEdit,
//     onDelete,
//     refreshTable,
//     setRefreshTable,
// }) => {
//     const columns = [
//         { name: 'Item No', uid: 'id' },
//         { name: 'Name', uid: 'name' },
//         { name: 'Current Stock', uid: 'quantity' },
//         { name: 'In Use', uid: 'inUse' },
//         { name: 'Minimum Stock', uid: 'minStock' },
//         { name: 'Price', uid: 'price' },
//         { name: 'Actions', uid: 'actions' },
//     ];
//     const {
//         items,
//         page,
//         setPage,
//         lastPage,
//         isLoading,
//         searchQuery,
//         setSearchQuery,
//         setFilterDepartment,
//         filterDepartment,
//         sortDescriptor,
//         setSortDescriptor,
//     } = useItems(refreshTable);
//     const { isOpen, onOpen, onOpenChange } = useDisclosure();
//     const [item, setItem] = useState<ItemInterface>();
//     const handleClick = (item: ItemInterface) => {
//         setItem(item);
//         onOpen();
//     };

//     return (
//         <>
//             <Table
//                 aria-label="inventory items table"
//                 sortDescriptor={sortDescriptor}
//                 onSortChange={setSortDescriptor}
//                 topContent={
//                     <div className="flex justify-between gap-3">
//                         <Select
//                             items={[
//                                 { key: 'all', label: 'All Items' },
//                                 ...departments,
//                             ]}
//                             selectedKeys={[filterDepartment]}
//                             onChange={(e) =>
//                                 setFilterDepartment(e.target.value)
//                             }
//                             className="max-w-44"
//                         >
//                             {(category) => (
//                                 <SelectItem key={category.key}>
//                                     {category.label}
//                                 </SelectItem>
//                             )}
//                         </Select>
//                         <div className="flex w-full justify-end gap-2">
//                             <Input
//                                 isClearable
//                                 className="w-[20%] focus-within:w-[40%] transition-width"
//                                 placeholder="Search"
//                                 startContent={
//                                     <MagnifyingGlassIcon width={20} />
//                                 }
//                                 value={searchQuery}
//                                 onClear={() => {
//                                     // setPage(1);
//                                 }}
//                                 onValueChange={setSearchQuery}
//                             />
//                             <Button
//                                 color="primary"
//                                 startContent={<IoMdAddCircleOutline />}
//                                 variant="bordered"
//                                 id="add-item-btn"
//                                 onPress={() => onEdit(undefined)}
//                             >
//                                 Add item
//                             </Button>

//                             <Button
//                                 onPress={() =>
//                                     setRefreshTable(refreshTable + 1)
//                                 }
//                                 isIconOnly
//                                 aria-label="Like"
//                                 color="default"
//                                 isLoading={isLoading}
//                             >
//                                 <IoMdRefresh className="w-5 h-5" />
//                             </Button>
//                         </div>
//                     </div>
//                 }
//                 bottomContent={
//                     <div className="flex w-full justify-center">
//                         <Pagination
//                             isCompact
//                             showControls
//                             showShadow
//                             classNames={{
//                                 cursor: 'bg-orion-blue',
//                             }}
//                             color="default"
//                             page={page}
//                             total={lastPage}
//                             onChange={(page) => setPage(page)}
//                         />
//                     </div>
//                 }
//             >
//                 <TableHeader columns={columns}>
//                     {(column) => (
//                         <TableColumn key={column.uid} allowsSorting>
//                             {column.name}
//                         </TableColumn>
//                     )}
//                 </TableHeader>
//                 <TableBody emptyContent={'No items to display.'} items={items}>
//                     {(item) => (
//                         <TableRow key={item.id}>
//                             {(columnKey) => (
//                                 <TableCell>
//                                     {renderCell(
//                                         item,
//                                         columnKey as ColumnKeyType,
//                                         () => onEdit(item),
//                                         () => onDelete(item.id),
//                                         () => handleClick(item),
//                                     )}
//                                 </TableCell>
//                             )}
//                         </TableRow>
//                     )}
//                 </TableBody>
//             </Table>
//             {item && (
//                 <DetailsModal
//                     isOpen={isOpen}
//                     item={item}
//                     onOpenChange={onOpenChange}
//                 />
//             )}
//         </>
//     );
// };

// export default TableView;
