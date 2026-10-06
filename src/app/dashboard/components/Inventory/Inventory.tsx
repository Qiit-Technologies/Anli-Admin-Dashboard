// import {
//     addInventoryItem,
//     deleteInventoryItem,
//     updateInventory,
//     updateInventoryInterface,
//     updateInventoryItem,
// } from '@/app/actions/inventory';
// import { getSingleItem } from '@/app/actions/items';
// import Toast from '@/components/toast';
// import useItems from '@/hooks/useItems';
// import { useDisclosure } from '@heroui/react';
// import React, { useState } from 'react';
// import toast from 'react-hot-toast';
// import AddModal from './Table/AddModal';
// import EditModal from './Table/EditModal';
// import TableView from './Table/Table';

// const Overview: React.FC = () => {
//     const [editItem, setEditItem] = useState<updateInventoryInterface>();
//     const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
//     const createItem = useDisclosure();
//     const [refreshTable, setRefreshTable] = useState(1);
//     const { items } = useItems(refreshTable);

//     const handleEdit = async (item?: updateInventoryInterface) => {
//         if (item !== undefined) {
//             const { quantity } = await getSingleItem(item.itemId);
//             setEditItem({ ...item, maxQuantity: quantity });
//             onOpen();
//         } else {
//             createItem.onOpen();
//         }
//     };

//     const handleDelete = async (id: number) => {
//         await deleteInventoryItem(id);
//         setRefreshTable(refreshTable + 1);
//     };

//     const handleSave = async (item: updateInventoryInterface) => {
//         await updateInventoryItem(item);
//         setEditItem(undefined);
//         setRefreshTable(refreshTable + 1);
//     };

//     const handleSaveAdd = async (item: updateInventory) => {
//         const response = await addInventoryItem(item);
//         if (!response.success) {
//             return toast.custom(() => (
//                 <Toast
//                     title="Error!"
//                     description={response.message}
//                     type="error"
//                 />
//             ));
//         }
//         createItem.onClose();
//         setRefreshTable(refreshTable + 1);
//     };

//     return (
//         <div className="p-6 space-y-4">
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
//                 items={items}
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

// export default Overview;
