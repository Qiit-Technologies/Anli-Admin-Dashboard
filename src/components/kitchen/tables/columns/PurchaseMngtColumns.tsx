import ViewPurchase from '@/components/account/viewPurchase';
import { ScopedPurchase } from '@/components/front-of-house/types';
import { Tooltip, useDisclosure } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { CircleHelp } from 'lucide-react';
import Link from 'next/link';
import { PurchaseOrderStage } from '@/types/purchase-order';

const statusStyles = {
    awaiting_grn: {
        bg: '#FFF7F0',
        text: '#D55D00',
    },
    pending_payment: {
        bg: '#FFF7F0',
        text: '#D55D00',
    },
    completed: {
        bg: '#EBFFEE',
        text: '#02542D',
    },
    pending: {
        bg: '#FFF7F0',
        text: '#D55D00',
    },
};

const stageStyles = {
    [PurchaseOrderStage.CREATED]: {
        bg: '#EBF8FF',
        text: '#1E40AF',
    },
    [PurchaseOrderStage.APPROVED]: {
        bg: '#F0FDF4',
        text: '#166534',
    },
    [PurchaseOrderStage.SUPPLIED]: {
        bg: '#FEF3C7',
        text: '#92400E',
    },
    [PurchaseOrderStage.COMPLETED]: {
        bg: '#F3E8FF',
        text: '#7C3AED',
    },
    [PurchaseOrderStage.PAID]: {
        bg: '#ECFDF5',
        text: '#065F46',
    },
};

const stageLabels = {
    [PurchaseOrderStage.CREATED]: 'Created',
    [PurchaseOrderStage.APPROVED]: 'Approved',
    [PurchaseOrderStage.SUPPLIED]: 'Supplied',
    [PurchaseOrderStage.COMPLETED]: 'Completed',
    [PurchaseOrderStage.PAID]: 'Paid',
};

export const PurchaseMngtColumns: ColumnDef<ScopedPurchase>[] = [
    {
        accessorKey: 'poNumber',
        header: 'PO No',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-center">
                {row.original.poNumber}
            </span>
        ),
    },
    {
        accessorKey: 'vendor',
        header: 'Vendors',
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="text-sm font-normal leading-5 text-[#101828]">
                    {row.original?.vendor?.vendorName}
                </span>
                <span className="text-sm font-normal leading-5">
                    {row.original?.vendor?.emailAddress}
                </span>
            </div>
        ),
    },
    {
        accessorKey: 'total',
        header: () => (
            <div className="w-fit">
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Total amount of the purchase order"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Total <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#667085] text-center">
                {row.original.total}
            </span>
        ),
    },
    {
        accessorKey: 'itemGrouping',
        header: () => (
            <div className="w-fit">
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Grouping of the items in the purchase order"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Item Grouping <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#667085] text-center">
                {row.original?.itemGrouping}
            </span>
        ),
    },
    {
        accessorKey: 'dateSent',
        header: () => (
            <div className="w-fit">
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Date the purchase order was sent"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Date Sent <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#667085] text-center">
                {row?.original?.dateSent &&
                !isNaN(new Date(row.original.dateSent).getTime())
                    ? format(new Date(row.original.dateSent), 'PPpp')
                    : '-'}
            </span>
        ),
    },
    {
        accessorKey: 'status',
        header: () => (
            <div className="w-fit">
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Status of the purchase order"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Status <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <div className="flex items-center justify-center w-full">
                    <div
                        className={`w-fit px-3 py-1 rounded-full`}
                        style={{ background: statusStyles[status]?.bg }}
                    >
                        <span
                            className={`text-xs caption-top`}
                            style={{ color: statusStyles[status]?.text }}
                        >
                            {status}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'currentStage',
        header: () => (
            <div className="w-fit">
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Current stage of the purchase order"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Stage <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const stage = row.original.currentStage;
            return (
                <div className="flex items-center justify-center w-full">
                    <div
                        className={`w-fit px-3 py-1 rounded-full`}
                        style={{
                            background:
                                stage in stageStyles
                                    ? stageStyles[stage as PurchaseOrderStage]
                                          ?.bg
                                    : undefined,
                        }}
                    >
                        <span
                            className={`text-xs caption-top`}
                            style={{
                                color:
                                    stage in stageStyles
                                        ? stageStyles[
                                              stage as PurchaseOrderStage
                                          ]?.text
                                        : undefined,
                            }}
                        >
                            {stage in stageLabels
                                ? stageLabels[stage as PurchaseOrderStage]
                                : stage}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'action',
        header: () => <div className="text-center pr-3">Action</div>,
        cell: ({ row }) => <PurchaseActionCell data={row.original} />,
    },
];

const PurchaseActionCell = ({ data }: { data: ScopedPurchase }) => {
    const {
        isOpen: isCreateModalOpen,
        onOpen: onCreateModalOpen,
        onClose: onCreateModalClose,
    } = useDisclosure();

    return (
        <>
            <div className="flex gap-2 justify-center items-center">
                <Link
                    href={`/account/purchase-management/${data.poNumber.replace(/^TXN-00/, '')}`}
                    passHref
                    legacyBehavior
                >
                    <a>
                        <span className="cursor-pointer text-blue-600 hover:underline text-sm font-medium leading-5">
                            {data && data.status === 'completed'
                                ? 'Detailed View'
                                : 'View & Pay'}
                        </span>
                    </a>
                </Link>
                <span
                    onClick={onCreateModalOpen}
                    className="cursor-pointer text-[#667085] text-sm font-medium leading-5"
                >
                    Quick View
                </span>
            </div>
            <ViewPurchase
                data={data}
                isOpen={isCreateModalOpen}
                onOpenChange={onCreateModalClose}
            />
        </>
    );
};
