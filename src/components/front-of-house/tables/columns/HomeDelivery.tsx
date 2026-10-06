import { formatDate } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';
import { ScopedOrder } from '../../types';
import OrderAction from '../OrderAction';
import {
    complimentaryBadgeColumn,
    discountBadgeColumn,
    orderAmountColumn,
} from './complimentaryColumns';

const statusStyles = {
    PENDING: {
        bg: 'bg-yellow-100',
        dot: 'bg-yellow-500',
        text: 'text-yellow-600',
    },
    IN_KITCHEN: {
        bg: 'bg-orange-100',
        dot: 'bg-orange-500',
        text: 'text-orange-600',
    },
    COMPLETED: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
    CANCELLED: {
        bg: 'bg-red-100',
        dot: 'bg-red-500',
        text: 'text-red-600',
    },
    VOIDED: {
        bg: 'bg-slate-100',
        dot: 'bg-slate-500',
        text: 'text-slate-700',
    },
    DISPATCHED: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
    PAID: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
    READY: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
};

export const homeDeliveryFilters = [
    {
        id: 'deliveryStatus',
        label: 'Delivery Status',
        options: [
            { value: 'pending', label: 'Pending' },
            { value: 'in-transit', label: 'In Transit' },
            { value: 'done', label: 'Done' },
        ],
    },
    {
        id: 'paymentStatus',
        label: 'Payment Status',
        options: [
            { value: 'pending', label: 'Pending' },
            { value: 'paid', label: 'Paid' },
            { value: 'added to bill', label: 'Added to Bill' },
        ],
    },
];

export const homeDeliveryColumns: ColumnDef<ScopedOrder>[] = [
    {
        accessorKey: 'orderId',
        header: 'S/N',
        cell: ({ row, table }) => {
            const rowIndex = table
                .getFilteredRowModel()
                .rows.findIndex((r) => r.id === row.id);
            return <span>{rowIndex + 1}</span>;
        },
    },
    {
        accessorKey: 'date',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="When the order was placed"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Date <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{formatDate(row.original.createdAt)}</span>,
    },
    {
        accessorKey: 'orderType',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Type of order (e.g., Dinner, Lunch)"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Order Type <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.orderType}</span>,
    },
    {
        accessorKey: 'customerName',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Name of the customer"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Guest Name <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.guestName}</span>,
    },
    {
        accessorKey: 'paymentStatus',
        header: 'Payment Status',
        cell: ({ row }) => {
            const paymentStatus = row.original.paymentStatus;
            return (
                <div
                    className={cn(
                        statusStyles[paymentStatus as keyof typeof statusStyles]
                            ?.bg || 'bg-gray-100',
                        'flex items-center justify-center gap-2 w-fit px-3 py-1 rounded-full',
                    )}
                >
                    <div
                        className={cn(
                            statusStyles[
                                paymentStatus as keyof typeof statusStyles
                            ]?.dot || 'bg-gray-500',
                            'w-2 h-2 rounded-full',
                        )}
                    />
                    <span
                        className={cn(
                            statusStyles[
                                paymentStatus as keyof typeof statusStyles
                            ]?.text || 'text-gray-600',
                            'text-xs caption-top',
                        )}
                    >
                        {paymentStatus}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'deliveryStatus',
        header: 'Delivery Status',
        cell: ({ row }) => {
            //should exist in the order for home delivery
            // using something else for now
            const deliveryStatus = row.original.status as string;
            return (
                <div
                    className={cn(
                        statusStyles[
                            deliveryStatus as keyof typeof statusStyles
                        ]?.bg || 'bg-gray-100',
                        'flex items-center justify-center gap-2 w-fit px-3 py-1 rounded-full',
                    )}
                >
                    <div
                        className={cn(
                            statusStyles[
                                deliveryStatus as keyof typeof statusStyles
                            ]?.dot || 'bg-gray-500',
                            'w-2 h-2 rounded-full',
                        )}
                    />
                    <span
                        className={cn(
                            statusStyles[
                                deliveryStatus as keyof typeof statusStyles
                            ]?.text || 'text-gray-600',
                            'text-xs caption-top',
                        )}
                    >
                        {deliveryStatus}
                    </span>
                </div>
            );
        },
    },
    orderAmountColumn('Amount'),
    complimentaryBadgeColumn,
    discountBadgeColumn,
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => <OrderAction row={row.original} />,
    },
    // {
    //     id: 'actions',
    //     header: 'Action',
    //     cell: ({ row }) => {
    //         const order = row.original;
    //         const fields = [
    //             { label: 'Order type', value: order.orderType },
    //             { label: 'Customer name', value: order.guestName },
    //             //{ label: 'Recieving Officer', value: order.recievingOfficer },
    //             { label: 'Date Requested', value: formatDate(order.createdAt) },
    //             //  { label: 'Time Requested', value: order.timeOfRequest },
    //             //  { label: 'Payment Method', value: order.paymentMethod },
    //             { label: 'Payment Status', value: order.paymentStatus },
    //         ];

    //         // const locationFields = [
    //         //     { label: 'Recievers Name', value: order.recieversName },
    //         //     { label: 'Recieving Address', value: order.recievingAddress },
    //         //     {
    //         //         label: 'Recieving Mobile Number',
    //         //         value: order.recievingMobileNumber,
    //         //     },
    //         // ];
    //         return (
    //             <CustomSheet
    //                 title="Order Details"
    //                 trigger={
    //                     <button className="text-blue-600 hover:text-blue-800">
    //                         View
    //                     </button>
    //                 }
    //                 noTitle={true}
    //             >
    //                 <div className="flex items-center mb-4 justify-between">
    //                     <h1 className="text-xl font-bold">
    //                         Order ID: {order.id}
    //                     </h1>
    //                     <Button className="text-hexbrand" variant={'ghost'}>
    //                         Print
    //                     </Button>
    //                 </div>
    //                 <div className="bg-hexbrand/10 p-4 rounded-lg flex flex-col gap-4 ">
    //                     {fields.map((field) => (
    //                         <div
    //                             className="grid grid-cols-2 text-sm"
    //                             key={field.label}
    //                         >
    //                             <span className="text-gray-500 capitalize">
    //                                 {field.label}
    //                             </span>
    //                             <span className="text-gray-600">
    //                                 {field.value}
    //                             </span>
    //                         </div>
    //                     ))}
    //                 </div>
    //                 {/* <div className="bg-hexbrand/10 p-4 mt-4 rounded-lg flex flex-col gap-4 ">
    //                     <h1 className="text-sm">Delivery Information</h1>
    //                     {locationFields.map((field) => (
    //                         <div
    //                             className="grid grid-cols-2 text-sm"
    //                             key={field.label}
    //                         >
    //                             <span className="text-gray-500 capitalize">
    //                                 {field.label}
    //                             </span>
    //                             <span className="text-gray-600">
    //                                 {field.value}
    //                             </span>
    //                         </div>
    //                     ))}
    //                 </div> */}
    //                 <div>
    //                     <ItemsTable
    //                         items={order.items.map((item) => {
    //                             return {
    //                                 id: item.id,
    //                                 name: item.menuItem?.name || '',
    //                                 quantity: item.quantity,
    //                                 price: Number(item.price),
    //                                 total: Number(item.price),
    //                             };
    //                         })}
    //                         showTotal={true}
    //                         totalValue={Number(order.totalPrice)}
    //                     />
    //                 </div>
    //             </CustomSheet>
    //         );
    //     },
    // },
];
