// import { ColumnKeyType, InventoryInterface } from '@/types';
// import { Tooltip } from '@heroui/react';
// import { AiOutlineEdit } from 'react-icons/ai';
// import { MdOutlineRemoveCircleOutline } from 'react-icons/md';

// const renderCell = (
//     item: InventoryInterface,
//     columnKey: ColumnKeyType,
//     onEdit: () => void,
//     onDelete: () => void,
// ) => {
//     const {
//         quantity,
//         minStock,
//         item: { id, name, price, inUse },
//     } = item;

//     switch (columnKey) {
//         case 'id':
//             return id;
//         case 'name':
//             return name;
//         case 'quantity':
//             return quantity;
//         case 'inUse':
//             return inUse;
//         case 'minStock':
//             return minStock;
//         case 'price':
//             return `₦${price?.toFixed(2)}`;
//         case 'actions':
//             return (
//                 <div className="flex justify-start gap-4 w-full">
//                     <Tooltip size="sm" content="Edit item">
//                         <span
//                             className="text-2xl text-default-400 cursor-pointer active:opacity-50"
//                             onClick={onEdit}
//                         >
//                             <AiOutlineEdit />
//                         </span>
//                     </Tooltip>
//                     <Tooltip size="sm" color="danger" content="Remove item">
//                         <span
//                             className="text-2xl text-danger cursor-pointer active:opacity-50"
//                             onClick={onDelete}
//                         >
//                             <MdOutlineRemoveCircleOutline />
//                         </span>
//                     </Tooltip>
//                 </div>
//             );
//         default:
//             return null;
//     }
// };

// export default renderCell;
