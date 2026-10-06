// import { ColumnKeyType, ItemInterface } from '@/types';
// import { Tooltip } from '@heroui/react';
// import { AiOutlineEdit } from 'react-icons/ai';
// import { MdDeleteForever, MdOutlineInfo } from 'react-icons/md';

// const renderCell = (
//     item: ItemInterface,
//     columnKey: ColumnKeyType,
//     onEdit: () => void,
//     onDelete: () => void,
//     onOpen: () => void,
// ) => {
//     switch (columnKey) {
//         case 'id':
//             return item.id;
//         case 'name':
//             return item.name;
//         case 'quantity':
//             return item.quantity;
//         case 'minStock':
//             return item.minStock;
//         case 'inUse':
//             return item.inUse;
//         case 'price':
//             return `₦${item.price?.toFixed(2)}`;
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
//                     <Tooltip size="sm" color="danger" content="Delete item">
//                         <span
//                             className="text-2xl text-danger cursor-pointer active:opacity-50"
//                             onClick={onDelete}
//                         >
//                             <MdDeleteForever />
//                         </span>
//                     </Tooltip>
//                     <Tooltip size="sm" color="primary" content="Item details">
//                         <span
//                             className="text-2xl text-primary cursor-pointer active:opacity-50"
//                             onClick={onOpen}
//                         >
//                             <MdOutlineInfo />
//                         </span>
//                     </Tooltip>
//                 </div>
//             );
//         default:
//             return null;
//     }
// };

// export default renderCell;
