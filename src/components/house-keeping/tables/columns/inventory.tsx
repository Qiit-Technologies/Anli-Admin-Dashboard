import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowDown, CircleHelp } from 'lucide-react';

type InventoryProps = {
    id: string;
    itemName: string;
    itemDescription: string;
    quantityTaken: number;
    remainedStock: number;
    refNo: string;
    issuingOfficer: string;
    department: 'House Keeping' | 'Restaurant' | 'Kitchen' | 'Front Desk';
    status: 'collected' | 'processing';
};

export const inventoryList: InventoryProps[] = [
    {
        id: 'INV001',
        itemName: 'Office Chair',
        itemDescription: 'Ergonomic mesh office chair with lumbar support',
        quantityTaken: 5,
        remainedStock: 15,
        refNo: 'REF/2024/001',
        issuingOfficer: 'John Smith',
        department: 'House Keeping',
        status: 'collected',
    },
    {
        id: 'INV002',
        itemName: 'Laptop Stand',
        itemDescription: 'Adjustable aluminum laptop stand',
        quantityTaken: 3,
        remainedStock: 7,
        refNo: 'REF/2024/002',
        issuingOfficer: 'Michael Brown',
        department: 'Front Desk',
        status: 'processing',
    },
    {
        id: 'INV003',
        itemName: 'Wireless Mouse',
        itemDescription: 'Bluetooth wireless mouse with ergonomic design',
        quantityTaken: 10,
        remainedStock: 20,
        refNo: 'REF/2024/003',
        issuingOfficer: 'Emma Davis',
        department: 'Restaurant',
        status: 'collected',
    },
    {
        id: 'INV004',
        itemName: 'Whiteboard Markers',
        itemDescription: 'Pack of 12 assorted color whiteboard markers',
        quantityTaken: 8,
        remainedStock: 32,
        refNo: 'REF/2024/004',
        issuingOfficer: 'Lisa Taylor',
        department: 'Kitchen',
        status: 'processing',
    },
    {
        id: 'INV005',
        itemName: 'Monitor Stand',
        itemDescription: 'Dual monitor stand with cable management',
        quantityTaken: 2,
        remainedStock: 8,
        refNo: 'REF/2024/005',
        issuingOfficer: 'Chris Thompson',
        department: 'House Keeping',
        status: 'collected',
    },
];

export const inventoryFilters = [
    {
        id: 'status',
        label: 'Status',
        options: [
            { value: 'collected', label: 'Collected' },
            { value: 'processing', label: 'Processing' },
        ],
    },
    {
        id: 'department',
        label: 'Department',
        options: [
            { value: 'House Keeping', label: 'House Keeping' },
            { value: 'Restaurant', label: 'Restaurant' },
            { value: 'Kitchen', label: 'Kitchen' },
            { value: 'Front Desk', label: 'Front Desk' },
        ],
    },
];

const statusStyles = {
    processing: {
        bg: 'bg-yellow-50',
        dot: 'bg-yellow-400',
        text: 'text-yellow-600',
    },
    collected: {
        bg: 'bg-emerald-50',
        dot: 'bg-emerald-400',
        text: 'text-emerald-600',
    },
    cancelled: {
        bg: 'bg-red-100',
        dot: 'bg-red-500',
        text: 'text-red-600',
    },
};

export const inventoryColumn: ColumnDef<InventoryProps>[] = [
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
                    content="Inventory ID"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        ID <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
    },
    {
        accessorKey: 'itemName',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Name of the item"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Item Name/Description <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const { itemName, itemDescription } = row.original;
            return (
                <Tooltip
                    className="rounded-md p-4"
                    content={
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-black">
                                {itemDescription}
                            </span>
                            <span className="text-sm text-muted-foreground">{`(${itemName})`}</span>
                        </div>
                    }
                >
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-black w-40 truncate">
                            {itemDescription}
                        </span>
                        <span className="text-sm text-muted-foreground w-40 truncate">{`(${itemName})`}</span>
                    </div>
                </Tooltip>
            );
        },
    },
    {
        accessorKey: 'quantityTaken',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Quantity of items taken"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Quantity Taken <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
    },
    {
        accessorKey: 'remainedStock',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Remaining stock quantity"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Remained Stock <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
    },
    {
        accessorKey: 'refNo',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Reference number"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Ref No <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
    },
    {
        accessorKey: 'issuingOfficer',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Name of the issuing officer"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Issuing Officer <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
    },
    {
        accessorKey: 'department',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Staff Deparment"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Department <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
    },
    {
        accessorKey: 'status',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Status: Collected | Processing"
                    showArrow={true}
                >
                    <button className="flex items-center gap-2">
                        Status <ArrowDown className="w-4 h-4" />
                    </button>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <div
                    className={cn(
                        statusStyles[
                            status?.toLowerCase() as keyof typeof statusStyles
                        ]?.bg || 'bg-gray-100',
                        'flex items-center justify-center gap-2 w-fit px-3 py-1 rounded-full',
                    )}
                >
                    <div
                        className={cn(
                            statusStyles[
                                status?.toLowerCase() as keyof typeof statusStyles
                            ]?.dot || 'bg-gray-500',
                            'w-2 h-2 rounded-full',
                        )}
                    />
                    <span
                        className={cn(
                            statusStyles[
                                status?.toLowerCase() as keyof typeof statusStyles
                            ]?.text || 'text-gray-600',
                            'text-xs caption-top',
                        )}
                    >
                        {status}
                    </span>
                </div>
            );
        },
    },
];
