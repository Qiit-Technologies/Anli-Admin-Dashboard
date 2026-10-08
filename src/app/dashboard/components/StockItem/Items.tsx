// import { addItem, deleteItem, updateItem } from '@/app/actions/items';
// import useStats from '@/hooks/useStats';
// import { Item, ItemInterface } from '@/types';
// import { Spinner, useDisclosure } from '@heroui/react';
// import React, { useState } from 'react';
// import AddModal from './Table/AddModal';
// import EditModal from './Table/EditModal';
// import TableView from './Table/Table';

// const Items: React.FC = () => {
//     const [editItem, setEditItem] = useState<ItemInterface>();
//     const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
//     const createItem = useDisclosure();
//     const [refreshTable, setRefreshTable] = useState(1);
//     const { stats, isLoading } = useStats(refreshTable);

//     const handleEdit = (item?: ItemInterface) => {
//         if (item !== undefined) {
//             setEditItem(item);
//             onOpen();
//         } else {
//             createItem.onOpen();
//         }
//     };

//     const handleDelete = async (id: number) => {
//         await deleteItem(id);
//         setRefreshTable(refreshTable + 1);
//     };

//     const handleSave = async (item: Partial<Item> & { id: number }) => {
//         await updateItem(item.id, item);
//         setEditItem(undefined);
//         setRefreshTable(refreshTable + 1);
//     };

//     const handleSaveAdd = async (item: Item) => {
//         await addItem(item);
//         createItem.onClose();
//         setRefreshTable(refreshTable + 1);
//     };

//     return (
//         <div className="p-6 space-y-4">
//             {/* Stats */}
//             <div className="flex gap-4">
//                 {[
//                     {
//                         label: 'Total items in stock',
//                         value: stats?.itemsInStock,
//                     },
//                     {
//                         label: 'Number of items in high stock',
//                         value: stats?.itemsOverStock,
//                     },
//                     {
//                         label: 'Number of items in low stock',
//                         value: stats?.itemsLowStock,
//                     },
//                     {
//                         label: 'Number of items out of stock',
//                         value: stats?.itemsOutOfStock,
//                     },
//                 ].map(({ label, value }) => (
//                     <div
//                         key={label}
//                         className="flex flex-col w-fit justify-between gap-4 p-4 pb-2 bg-white rounded-lg shadow-md"
//                     >
//                         <span>{label}</span>
//                         {!isLoading ? (
//                             <span className="text-3xl font-bold">{value}</span>
//                         ) : (
//                             <Spinner
//                                 color="warning"
//                                 size="md"
//                                 className="items-start"
//                             />
//                         )}
//                     </div>
//                 ))}
//             </div>
//             <TableView
//                 refreshTable={refreshTable}
//                 setRefreshTable={setRefreshTable}
//                 onEdit={handleEdit}
//                 onDelete={handleDelete}
//             />
//             <AddModal
//                 isOpen={createItem.isOpen}
//                 onClose={() => {
//                     createItem.onClose();
//                 }}
//                 onSave={handleSaveAdd}
//                 onOpenChange={createItem.onOpenChange}
//             />
//             {editItem !== undefined && (
//                 <EditModal
//                     isOpen={isOpen}
//                     item={editItem}
//                     onClose={() => {
//                         setEditItem(undefined);
//                         onClose();
//                     }}
//                     onSave={handleSave}
//                     onOpenChange={onOpenChange}
//                 />
//             )}
//         </div>
//     );
// };

// export default Items;
