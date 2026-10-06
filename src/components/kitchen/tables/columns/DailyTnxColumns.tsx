import ViewTransaction from '@/components/account/viewTransaction';
import { ScopedTransaction } from '@/components/front-of-house/types';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { Tooltip, useDisclosure } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';

const statusStyles = {
    'Awaiting GRN': {
        bg: '#FFF7F0',
        text: '#D55D00',
    },
    'Pending payment': {
        bg: '#FFF7F0',
        text: '#D55D00',
    },
    Completed: {
        bg: '#EBFFEE',
        text: '#02542D',
    },
    Pending: {
        bg: '#FFF7F0',
        text: '#D55D00',
    },
};

export const DailyTnxColumns: ColumnDef<ScopedTransaction>[] = [
    {
        accessorKey: 'orderId',
        header: () => (
            <div className="w-fit">
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Identification"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Order ID <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#667085] text-center">
                {row.original.orderId}
            </span>
        ),
    },
    {
        accessorKey: 'department',
        header: () => (
            <div className="w-fit">
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Transaction Department"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Department <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#667085] text-center">
                {row.original.department}
            </span>
        ),
    },
    {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-center truncate">
                {row.original.description}
            </span>
        ),
    },
    {
        accessorKey: 'servedBy',
        header: 'Served By',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#667085]">
                {row.original.servedBy}
            </span>
        ),
    },
    {
        accessorKey: 'tableRoom',
        header: () => (
            <div className="w-fit">
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Table or room used"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Table/Room <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#667085] text-center">
                {row.original.tableRoom}
            </span>
        ),
    },
    {
        accessorKey: 'paymentType',
        header: 'Payment type',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#667085]">
                {row.original.paymentType}
            </span>
        ),
    },
    {
        accessorKey: 'account',
        header: 'Account ',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#667085]">
                {row.original.account}
            </span>
        ),
    },

    {
        accessorKey: 'status',
        header: () => <div className="text-center pr-3">Status</div>,
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
        accessorKey: 'action',
        header: () => <div className="text-center pr-3">Action</div>,
        cell: ({ row }) => <TransactionActionCell data={row.original} />,
    },
];

const TransactionActionCell = ({ data }: { data: ScopedTransaction }) => {
    const {
        isOpen: isCreateModalOpen,
        onOpen: onCreateModalOpen,
        onClose: onCreateModalClose,
    } = useDisclosure();

    return (
        <>
            <PermissionGate
                permissions={[PERMISSIONS.VIEW_DAILY_TRANSACTIONS]}
                blockType="modal"
            >
                <p
                    onClick={onCreateModalOpen}
                    className="cursor-pointer flex gap-3 justify-center items-center text-[#667085] text-sm font-medium leading-5"
                >
                    View
                </p>
            </PermissionGate>

            <ViewTransaction
                transactionId={data.orderId}
                isOpen={isCreateModalOpen}
                onOpenChange={onCreateModalClose}
            />
        </>
    );
};
