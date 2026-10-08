// import { SimplifiedTransaction } from '@/types/transaction.types';
// import { formatDate } from '@/lib/helpers';
// import { Key } from 'react';

// const renderCell = (item: SimplifiedTransaction, columnKey: Key) => {
//     const { type, quantity, date, department, fullName } = item;
//     const phrase =
//         type === 'ADD'
//             ? 'added item to'
//             : type === 'REMOVE'
//               ? 'returned item from'
//               : 'consumed item from';

//     switch (columnKey) {
//         case 'type':
//             return `${fullName} ${phrase} ${department}`;
//         case 'quantity':
//             return quantity;
//         case 'date':
//             return formatDate(date);
//         default:
//             return null;
//     }
// };

// export default renderCell;
