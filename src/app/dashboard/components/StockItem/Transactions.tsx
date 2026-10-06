// import { getTransactions } from '@/app/actions/items';
// import { formatDate } from '@/lib/helpers';
// import { SimplifiedTransaction, Transaction } from '@/types/transaction.types';
// import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
// import {
//     Button,
//     getKeyValue,
//     Input,
//     Pagination,
//     Table,
//     TableBody,
//     TableCell,
//     TableColumn,
//     TableHeader,
//     TableRow,
// } from '@heroui/react';
// import React, { useEffect, useState } from 'react';
// import { IoMdRefresh } from 'react-icons/io';

// interface NewTransaction extends SimplifiedTransaction {
//     name: string;
// }

// const Transactions: React.FC = () => {
//     const columns = [
//         { name: 'Transaction Id', uid: 'id' },
//         { name: 'Item', uid: 'name' },
//         { name: 'Staff', uid: 'fullName' },
//         { name: 'Department', uid: 'department' },
//         { name: 'Quantity', uid: 'quantity' },
//         { name: 'Status', uid: 'type' },
//         { name: 'Date', uid: 'date' },
//     ];
//     const [page, setPage] = useState(1);
//     const [lastPage, setLastPage] = useState(1);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const [transactions, setTransactions] = useState<NewTransaction[]>([]);
//     const [refresh, setRefresh] = useState(0);

//     useEffect(() => {
//         const getData = async () => {
//             try {
//                 setIsLoading(true);
//                 const { data, meta } = await getTransactions(page);
//                 const transactions = data.map((transaction: Transaction) => ({
//                     name: transaction.item.name,
//                     id: transaction.id,
//                     type: transaction.transactionType,
//                     quantity: transaction.quantityChange,
//                     date: formatDate(transaction.transactionDate),
//                     department: transaction.role.department,
//                     fullName: transaction.staff.fullName,
//                 }));
//                 const filteredTransactions = transactions.filter(
//                     (transaction) =>
//                         transaction.name
//                             .toLowerCase()
//                             .includes(searchQuery.toLowerCase()) ||
//                         transaction.fullName
//                             .toLowerCase()
//                             .includes(searchQuery.toLowerCase()),
//                 );
//                 setLastPage(meta.lastPage);
//                 setTransactions(filteredTransactions);
//                 setIsLoading(false);
//             } catch (err) {
//                 console.error('Failed to fetch:', err);
//                 setIsLoading(false);
//             }
//         };
//         getData();
//     }, [page, searchQuery, refresh]);

//     return (
//         <>
//             <Table
//                 aria-label="inventory items table"
//                 // sortDescriptor={sortDescriptor}
//                 // onSortChange={setSortDescriptor}
//                 topContent={
//                     <div className="flex justify-between gap-3">
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
//                                     setPage(1);
//                                 }}
//                                 onValueChange={setSearchQuery}
//                             />
//                             <Button
//                                 onPress={() => setRefresh(refresh + 1)}
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
//                 <TableBody
//                     emptyContent={'No transactions to display.'}
//                     items={transactions}
//                 >
//                     {(item) => (
//                         <TableRow key={item.id}>
//                             {(columnKey) => (
//                                 <TableCell>
//                                     {getKeyValue(item, columnKey)}
//                                 </TableCell>
//                             )}
//                         </TableRow>
//                     )}
//                 </TableBody>
//             </Table>
//         </>
//     );
// };

// export default Transactions;
