import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Toast from '@/components/toast';
import { ManagerPinDialog } from '../../common/modal/ManagerPinDialog';
import {
    handleStatusUpdate,
    SRRejectionModal,
} from '../../common/modal/SRRejection';
import { ApprovalDrawer } from '../ApprovalDrawer';
import { RequestInfoPanel } from '../InfoPanel';

type StockRequestProps = {
    id: string;
    numericId?: number;
    department: string;
    requestedBy: string;
    quantity: number;
    itemCount?: number;
    date: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'AWAITING_ADMIN_APPROVAL';
    item: {
        id: number;
        lineId?: number;
        name: string;
        unitOfMeasurement: string;
        quantity: number;
        issuedQuantity?: number | null;
    }[];
    rejectionReason?: string;
};

export const stockRequestsFilters = [
    {
        id: 'department',
        label: 'Department',
        options: [
            { value: 'Housekeeping', label: 'Housekeeping' },
            { value: 'Kitchen', label: 'Kitchen' },
            { value: 'Stock', label: 'Stock' },
        ],
    },
];

const statusStyles = {
    pending: {
        bg: 'bg-orange-100',
        dot: 'bg-orange-500',
        text: 'text-orange-600',
    },
    awaiting_admin_approval: {
        bg: 'bg-orange-100',
        dot: 'bg-orange-500',
        text: 'text-orange-600',
    },
    rejected: {
        bg: 'bg-red-100',
        dot: 'bg-red-500',
        text: 'text-red-600',
    },
    approved: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
};

export const stockRequestColumn: ColumnDef<StockRequestProps>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <div className="w-fit h-full flex items-center bg-red">
                <Checkbox
                    className="shadow-none border-gray-300 data-[state=checked]:bg-brand"
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={(value) =>
                        table.toggleAllPageRowsSelected(!!value)
                    }
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="w-full h-full flex items-center bg-red">
                <Checkbox
                    className="shadow-none border-gray-300 data-[state=checked]:bg-brand"
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'id',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Request ID"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Request ID <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            return (
                <div className="capitalize flex flex-col">
                    <span className="text-muted-foreground">
                        {row.original.id}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'department',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Department"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Department <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            return <span>{row.original.department}</span>;
        },
    },
    {
        accessorKey: 'requestedBy',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Requested By"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Requested By <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            return <span>{row.original.requestedBy}</span>;
        },
    },
    {
        accessorKey: 'quantity',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Quantity"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Quantity <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            return (
                <span>
                    {row.original.itemCount
                        ? `${row.original.itemCount} items (${row.original.quantity})`
                        : row.original.quantity}
                </span>
            );
        },
    },
    {
        accessorKey: 'date',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Date"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Date <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            return (
                <div className="flex flex-col">
                    <span>{row.original.date}</span>
                    {/* <span>2:30pm</span> */}
                </div>
            );
        },
    },
    {
        accessorKey: 'status',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Status: Pending | Approved | Rejected"
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
            const displayText =
                status === 'APPROVED' || status === 'REJECTED'
                    ? 'Done'
                    : 'Pending';

            return (
                <div
                    className={cn(
                        statusStyles[
                            status.toLowerCase() as keyof typeof statusStyles
                        ]?.bg || 'bg-gray-100',
                        'flex items-center justify-center gap-2 w-fit px-3 py-1 rounded-full',
                    )}
                >
                    <div
                        className={cn(
                            statusStyles[
                                status.toLowerCase() as keyof typeof statusStyles
                            ]?.dot || 'bg-gray-500',
                            'w-2 h-2 rounded-full',
                        )}
                    />
                    <span
                        className={cn(
                            statusStyles[
                                status.toLowerCase() as keyof typeof statusStyles
                            ]?.text || 'text-gray-600',
                            'text-xs caption-top',
                        )}
                    >
                        {displayText}
                    </span>
                </div>
            );
        },
    },
    {
        id: 'actions',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Actions"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Action <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <ApprovalCellActions row={row} statusStyles={statusStyles} />
        ),
    },
];

interface ApprovalCellActionsProps {
    row: {
        original: StockRequestProps;
    };
    statusStyles?: any;
}

const ApprovalCellActions = ({
    row,
    statusStyles,
}: ApprovalCellActionsProps) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isRejectionExpanded, setIsRejectionExpanded] = useState(false);
    const [isPinOpen, setIsPinOpen] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [issueNote, setIssueNote] = useState<string>('');
    const [lines, setLines] = useState(
        (row.original.item || []).map((item) => ({
            lineId: item.lineId || item.id,
            itemId: item.id,
            name: item.name,
            unitOfMeasurement: item.unitOfMeasurement,
            requestedQuantity: item.quantity,
            issuedQuantity: item.issuedQuantity ?? item.quantity,
            removed: false,
        })),
    );
    const { status, requestedBy, date, id } = row.original;
    const requestId = String(row.original.numericId ?? id);

    const fields = [
        { label: 'Requested By', value: requestedBy },
        { label: 'Date', value: date },
        { label: 'Request ID', value: id },
        { label: 'Status', value: status },
    ];

    const rejectionReason =
        (row.original as any).rejectionReason ??
        (row.original as any).reason ??
        (row.original as any).rejectedReason;

    const isPending =
        status === 'PENDING' || status === 'AWAITING_ADMIN_APPROVAL';

    const openPinApproval = () => {
        const active = lines.filter((l) => !l.removed);
        if (active.length === 0) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Add at least one item before approving."
                    type="error"
                />
            ));
            return;
        }
        setIsPinOpen(true);
    };

    const handleApproveWithPin = async (pin: string) => {
        setIsApproving(true);
        try {
            const ok = await handleStatusUpdate(
                requestId,
                'APPROVED',
                undefined,
                undefined,
                issueNote,
                lines.map((l) => ({
                    id: l.lineId,
                    issuedQuantity: l.removed ? 0 : Number(l.issuedQuantity),
                    remove: l.removed,
                })),
                pin,
            );
            if (ok) {
                setIsPinOpen(false);
                setIsDrawerOpen(false);
                setIsRejectionExpanded(false);
            }
        } finally {
            setIsApproving(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <ManagerPinDialog
                open={isPinOpen}
                onOpenChange={setIsPinOpen}
                isLoading={isApproving}
                onConfirm={handleApproveWithPin}
            />
            <ApprovalDrawer
                open={isDrawerOpen}
                setOpen={setIsDrawerOpen}
                trigger={<button className="font-normal">View</button>}
            >
                <div className="py-4">
                    <h2 className="text-xl font-semibold">
                        Stock Request Details
                    </h2>
                </div>
                <div className="bg-hexbrand/10 p-4 rounded-lg grid grid-cols-2">
                    <RequestInfoPanel
                        fields={fields}
                        status={status}
                        statusStyles={statusStyles}
                    />
                </div>

                <div className="mt-4 border rounded-md overflow-hidden">
                    <div className="bg-gray-50 px-3 py-2 text-sm font-medium border-b">
                        Requested items
                    </div>
                    <div className="divide-y">
                        {lines.map((line) => (
                            <div
                                key={line.lineId}
                                className={cn(
                                    'flex flex-wrap items-center gap-3 px-3 py-2.5',
                                    line.removed && 'opacity-50 bg-red-50',
                                )}
                            >
                                <div className="min-w-[140px] flex-1">
                                    <p className="text-sm font-medium">
                                        {line.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Requested {line.requestedQuantity}{' '}
                                        {line.unitOfMeasurement}
                                    </p>
                                </div>
                                {isPending && !line.removed ? (
                                    <Input
                                        type="number"
                                        min={0}
                                        max={line.requestedQuantity}
                                        className="w-24 h-9"
                                        value={line.issuedQuantity}
                                        onChange={(e) =>
                                            setLines((prev) =>
                                                prev.map((l) =>
                                                    l.lineId === line.lineId
                                                        ? {
                                                              ...l,
                                                              issuedQuantity:
                                                                  Number(
                                                                      e.target
                                                                          .value,
                                                                  ),
                                                          }
                                                        : l,
                                                ),
                                            )
                                        }
                                    />
                                ) : (
                                    <span className="text-sm tabular-nums w-24 text-center">
                                        {line.removed
                                            ? 'Removed'
                                            : line.issuedQuantity}
                                    </span>
                                )}
                                {isPending ? (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="text-red-500 h-8"
                                        onClick={() =>
                                            setLines((prev) =>
                                                prev.map((l) =>
                                                    l.lineId === line.lineId
                                                        ? {
                                                              ...l,
                                                              removed:
                                                                  !l.removed,
                                                          }
                                                        : l,
                                                ),
                                            )
                                        }
                                    >
                                        {line.removed ? 'Undo' : 'Remove'}
                                    </Button>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Note to requester (optional)
                    </label>
                    <Input
                        type="text"
                        value={issueNote}
                        onChange={(e) => setIssueNote(e.target.value)}
                        placeholder="e.g., Remaining qty will be supplied later"
                        className="focus:ring-brand focus-visible:ring-brand"
                        aria-label="Add issuing note"
                    />
                </div>
                {rejectionReason && (
                    <div className="mt-5">
                        <h3 className="text-base font-semibold text-red-600">
                            Rejection Reason
                        </h3>
                        <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {rejectionReason}
                        </div>
                    </div>
                )}
                {isPending ? (
                    <div className="flex flex-col gap-2 mt-5">
                        <Button
                            size="lg"
                            className="bg-orion-blue hover:bg-orion-blue h-14 text-white"
                            onClick={openPinApproval}
                        >
                            Approve Entire Request
                        </Button>
                        <Button
                            variant="outline"
                            className="text-orion-blue h-14 border-orion-blue"
                            onClick={() =>
                                setIsRejectionExpanded(!isRejectionExpanded)
                            }
                        >
                            Reject Entire Request
                        </Button>
                        {isRejectionExpanded && (
                            <SRRejectionComponent
                                id={requestId}
                                setIsDrawerOpen={setIsDrawerOpen}
                            />
                        )}
                    </div>
                ) : (
                    <div className="mt-5 text-lg font-semibold capitalize">
                        {status.toLowerCase().replaceAll('_', ' ')}
                    </div>
                )}
            </ApprovalDrawer>

            {isPending ? (
                <>
                    <button
                        className="text-orion-blue"
                        onClick={openPinApproval}
                    >
                        Approve
                    </button>
                    <SRRejectionModal
                        id={requestId}
                        trigeer={
                            <button className="text-danger">Reject</button>
                        }
                    />
                </>
            ) : (
                <span
                    className={
                        status === 'APPROVED'
                            ? 'text-green-600'
                            : 'text-red-600'
                    }
                >
                    {status.toLowerCase()}
                </span>
            )}
        </div>
    );
};

const SRRejectionComponent = ({
    id,
    setIsDrawerOpen,
}: {
    id: string;
    setIsDrawerOpen: (open: boolean) => void;
}) => {
    const [reason, setReason] = useState('');
    return (
        <div className="flex items-center justify-center gap-4 w-full h-full flex-col">
            <Input
                type="text"
                placeholder="Reason for rejection"
                className="mt-4 border w-full focus-visible:border-brand focus-visible:ring-brand h-14"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
            />
            <Button
                size={'lg'}
                className="bg-orion-blue w-full mt-3 hover:bg-orion-blue p-4 text-white rounded-md"
                onClick={() => {
                    handleStatusUpdate(id, 'REJECTED', reason);
                    setIsDrawerOpen(false);
                }}
            >
                Done
            </Button>
        </div>
    );
};
