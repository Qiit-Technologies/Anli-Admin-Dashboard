// import useDetails from '@/hooks/useDetails';
// import { formatDate } from '@/lib/helpers';
// import { ItemInterface } from '@/types';
// import { SimplifiedInventory } from '@/types/inventory.types';
// import { SimplifiedTransaction } from '@/types/transaction.types';
// import {
//     Card,
//     CardBody,
//     getKeyValue,
//     Pagination,
//     Tab,
//     Table,
//     TableBody,
//     TableCell,
//     TableColumn,
//     TableHeader,
//     TableRow,
//     Tabs,
// } from '@heroui/react';
// import { CgArrowsExchangeAltV, CgDetailsMore } from 'react-icons/cg';
// import { MdOutlineInventory2 } from 'react-icons/md';

// function DetailsTabs({ item }: { item: ItemInterface }) {
//     const {
//         id,
//         name,
//         description,
//         createdAt,
//         price,
//         minStock,
//         quantity,
//         inUse,
//     } = item;
//     const {
//         transactions,
//         historyMeta,
//         setHistoryPage,
//         inventoryMeta,
//         setInventoryPage,
//         inventory,
//     } = useDetails(id);
//     return (
//         <div className="flex w-full flex-col">
//             <Tabs aria-label="Options" color="primary" variant="underlined">
//                 <Tab
//                     key="photos"
//                     title={
//                         <div className="flex items-center space-x-2">
//                             <CgDetailsMore className="w-5 h-5" />
//                             <span>Details</span>
//                         </div>
//                     }
//                 >
//                     <Card>
//                         <CardBody>
//                             <div className="flex flex-col gap-1 capitalize h-[200px] overflow-auto">
//                                 <div className="space-x-1">
//                                     <span className="font-bold">item ID:</span>
//                                     <span className="text-sm">{id}</span>
//                                 </div>
//                                 <div className="space-x-1">
//                                     <span className="font-bold">name:</span>
//                                     <span className="text-sm">{name}</span>
//                                 </div>
//                                 <div className="space-x-1">
//                                     <span className="font-bold">
//                                         description:
//                                     </span>
//                                     <span className="text-sm">
//                                         {description}
//                                     </span>
//                                 </div>
//                                 <div className="space-x-1">
//                                     <span className="font-bold">
//                                         created at:
//                                     </span>
//                                     <span className="text-sm">
//                                         {formatDate(createdAt)}
//                                     </span>
//                                 </div>
//                                 <div className="space-x-1">
//                                     <span className="font-bold">price:</span>
//                                     <span className="text-sm">
//                                         ₦ {price.toFixed(2)}
//                                     </span>
//                                 </div>
//                                 <div className="space-x-1">
//                                     <span className="font-bold">
//                                         minimum stock:
//                                     </span>
//                                     <span className="text-sm">{minStock}</span>
//                                 </div>
//                                 <div className="space-x-1">
//                                     <span className="font-bold">quantity:</span>
//                                     <span className="text-sm">{quantity}</span>
//                                 </div>
//                                 <div className="space-x-1">
//                                     <span className="font-bold">
//                                         items in-use:
//                                     </span>
//                                     <span className="text-sm">{inUse}</span>
//                                 </div>
//                             </div>
//                         </CardBody>
//                     </Card>
//                 </Tab>
//                 <Tab
//                     key="music"
//                     title={
//                         <div className="flex items-center space-x-2">
//                             <CgArrowsExchangeAltV className="w-5 h-5" />
//                             <span>History</span>
//                         </div>
//                     }
//                 >
//                     <Table
//                         aria-label="Table with transaction history"
//                         bottomContent={
//                             <div className="flex w-full justify-center">
//                                 <Pagination
//                                     isCompact
//                                     showControls
//                                     showShadow
//                                     classNames={{
//                                         cursor: 'bg-orion-blue',
//                                     }}
//                                     color="default"
//                                     page={historyMeta.page}
//                                     total={historyMeta.lastPage}
//                                     onChange={(page) => setHistoryPage(page)}
//                                 />
//                             </div>
//                         }
//                     >
//                         <TableHeader
//                             columns={[
//                                 { key: 'fullName', label: 'Staff' },
//                                 { key: 'department', label: 'Department' },
//                                 { key: 'quantity', label: 'Quantity' },
//                                 { key: 'type', label: 'Status' },
//                                 { key: 'date', label: 'Date' },
//                             ]}
//                         >
//                             {(column) => (
//                                 <TableColumn key={column.key}>
//                                     {column.label}
//                                 </TableColumn>
//                             )}
//                         </TableHeader>
//                         <TableBody
//                             emptyContent={'No history.'}
//                             items={transactions}
//                         >
//                             {(item: SimplifiedTransaction) => (
//                                 <TableRow key={item.id}>
//                                     {(columnKey) => (
//                                         <TableCell className="text-xs">
//                                             {getKeyValue(item, columnKey)}
//                                         </TableCell>
//                                     )}
//                                 </TableRow>
//                             )}
//                         </TableBody>
//                     </Table>
//                 </Tab>
//                 <Tab
//                     key="videos"
//                     title={
//                         <div className="flex items-center space-x-2">
//                             <MdOutlineInventory2 className="w-5 h-5" />
//                             <span>Inventory</span>
//                         </div>
//                     }
//                 >
//                     <Table
//                         aria-label="Table of inventories containing this item"
//                         bottomContent={
//                             <div className="flex w-full justify-center">
//                                 <Pagination
//                                     isCompact
//                                     showControls
//                                     showShadow
//                                     classNames={{
//                                         cursor: 'bg-orion-blue',
//                                     }}
//                                     color="default"
//                                     page={inventoryMeta.page}
//                                     total={inventoryMeta.lastPage}
//                                     onChange={(page) => setInventoryPage(page)}
//                                 />
//                             </div>
//                         }
//                     >
//                         <TableHeader
//                             columns={[
//                                 { key: 'department', label: 'Department' },
//                                 { key: 'quantity', label: 'Quantity' },
//                                 { key: 'minStock', label: 'Minimum Stock' },
//                                 { key: 'createdAt', label: 'Date Created' },
//                             ]}
//                         >
//                             {(column) => (
//                                 <TableColumn key={column.key}>
//                                     {column.label}
//                                 </TableColumn>
//                             )}
//                         </TableHeader>
//                         <TableBody
//                             emptyContent={'No history.'}
//                             items={inventory}
//                         >
//                             {(item: SimplifiedInventory) => (
//                                 <TableRow key={item.id}>
//                                     {(columnKey) => (
//                                         <TableCell className="text-xs">
//                                             {getKeyValue(item, columnKey)}
//                                         </TableCell>
//                                     )}
//                                 </TableRow>
//                             )}
//                         </TableBody>
//                     </Table>
//                 </Tab>
//             </Tabs>
//         </div>
//     );
// }

// export default DetailsTabs;
