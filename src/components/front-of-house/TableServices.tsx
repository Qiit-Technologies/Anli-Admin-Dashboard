'use client';
import {
    getDineInAreas,
    getTables,
    resetTable,
} from '@/app/actions/back-of-house';
import PageWrapper from '@/components/common/PageWrapper';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useOrderStore from '@/store/useOrder';
import { EllipsisVerticalIcon, Plus, Users } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { LuBell } from 'react-icons/lu';
import useSWR, { mutate } from 'swr';
import { PermissionGate } from '../permission/PermissionGate';
import { PERMISSIONS } from '../permission/data/permissions';
import Toast from '../toast';
import { Button } from '../ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Skeleton } from '../ui/skeleton';
import OrderForm from './OrderForm';
import { ViewOrderSheet } from './sheets/ViewOrderSheet';
import { ScopedOrder } from './types';
interface TableTracksProps {
    title: string;
    tables: ScopedOrder['table'][];
    onTableSelect: () => void;
    onClearTable: (id: number) => void;
}

const TableTracks = ({
    title,
    tables,
    onTableSelect,
    onClearTable,
}: TableTracksProps) => {
    return (
        <div className="flex flex-col gap-4">
            <h1>{title}</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {tables &&
                    tables.map((table) => (
                        <TableCard
                            key={table?.id}
                            table={table}
                            onTableSelect={onTableSelect}
                            onClearTable={onClearTable}
                        />
                    ))}
            </div>
        </div>
    );
};

interface TableCardProps {
    table: ScopedOrder['table'];
    onTableSelect: () => void;
    onClearTable: (id: number) => void;
}

interface OrderFormData {
    waiter: {
        id: number;
        fullName: string;
        email: string;
        roleId: number;
    };
    guestName: string;
    guestEmail: string;
    phoneNumber: string;
    bookingTime?: string;
    bookingDate?: string;
}

const TableCard = ({ table, onTableSelect, onClearTable }: TableCardProps) => {
    const isOccupied = table?.isOccupied;
    const { order, setOrder } = useOrderStore();
    const [activeSheet, setActiveSheet] = useState<string | null>(null);

    const handleSheetOpen = (sheetName: string) => {
        setActiveSheet(sheetName);
    };
    const handleSheetClose = () => {
        setActiveSheet(null);
    };
    const handleSubmit = (data: OrderFormData) => {
        const date = new Date();
        const time = date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });

        const formattedDate = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

        // Extract dineArea ID - handle both object and string/number cases safely
        const dineAreaRaw = table?.dineInArea as unknown;
        let dineAreaId = '';
        if (
            dineAreaRaw &&
            typeof dineAreaRaw === 'object' &&
            'id' in (dineAreaRaw as { id?: number | string })
        ) {
            const idValue = (dineAreaRaw as { id?: number | string }).id;
            if (idValue !== undefined && idValue !== null) {
                dineAreaId = String(idValue);
            }
        } else if (
            typeof dineAreaRaw === 'string' ||
            typeof dineAreaRaw === 'number'
        ) {
            dineAreaId = String(dineAreaRaw);
        }

        setOrder({
            ...order,
            orderType: 'DINE_IN',
            table: {
                id: table?.id ?? 0,
                number: table?.number ?? 0,
                numberOfSeats: table?.numberOfSeats ?? 0,
                isOccupied: true,
                dineArea: dineAreaId,
                availableSeats: table?.availableSeats ?? 0,
            },
            waiter: data.waiter,
            guestName: data.guestName,
            requestTable: String(table?.id) ?? '',
            guestEmail: data.guestEmail,
            phoneNumber: data.phoneNumber,
            requestDate: new Date(data.bookingDate + ' ' + data.bookingTime),
            bookingDate: formattedDate,
            bookingTime: time,
            kitchen: table?.kitchen,
        });
        handleSheetClose();
        onTableSelect();
    };
    const handleClearTable = (id: number) => {
        onClearTable(id);
    };

    const isAssigned = !!table?.current_waiter;

    // Define dynamic colors
    const bgColor = isAssigned ? 'bg-[#ffede0]' : 'bg-white';
    const textColor = isAssigned ? 'text-[#4D2404]' : 'text-gray-700';
    const subTextColor = isAssigned ? 'text-[#4D2404]' : 'text-gray-500';
    const iconColor = isAssigned ? 'text-[#4D2404]' : 'text-gray-500';
    const borderColor = isAssigned ? 'border-[#4D2404]' : 'border-gray-200';

    return (
        <div
            className={`w-full h-full flex flex-col rounded-md border  hover:cursor-pointer p-4 hover:shadow-md transition-all duration-300 ${bgColor} ${textColor}`}
        >
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Users className={`w-4 h-4 ${iconColor}`} />
                    <h1 className={`text-sm font-medium ${subTextColor}`}>
                        {table?.numberOfSeats}
                    </h1>
                </div>

                <PermissionGate
                    permissions={[PERMISSIONS.CREATE_NEW_ORDER]}
                    blockType="modal"
                    permissionType="all"
                >
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`${isAssigned ? 'text-[#4D2404] hover:text-white/80' : 'text-gray-700 hover:text-gray-900'}`}
                            >
                                <EllipsisVerticalIcon size={16} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => handleSheetOpen('viewOrder')}
                            >
                                <p>View Orders</p>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleClearTable(table?.id ?? 0)}
                            >
                                <p>Clear Table</p>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </PermissionGate>
            </div>

            {/* Middle Section */}
            <div className="flex flex-col justify-center items-center px-10 py-10">
                <h1 className={`text-lg font-semibold ${textColor}`}>
                    T - {table?.number}
                </h1>
                {table?.current_waiter && (
                    <span
                        className={`w-full text-center text-sm truncate ${subTextColor}`}
                    >
                        {table?.current_waiter?.fullName}
                    </span>
                )}
            </div>

            <hr className={`my-2 ${borderColor}`} />

            {/* Footer */}
            <div className="flex-1 flex items-center justify-between gap-4">
                <button
                    className={`px-2 rounded-lg text-sm transition-all duration-300 ${
                        isAssigned
                            ? 'text-[#4D2404] hover:bg-white/20 hover:text-white'
                            : 'text-muted-foreground hover:bg-orion-blue/20 hover:text-orion-blue'
                    }`}
                    onClick={() => handleSheetOpen('viewOrder')}
                >
                    {Math.max(0, table?.availableSeats || 0)} remaining
                </button>

                <PermissionGate
                    permissions={[PERMISSIONS.CREATE_NEW_ORDER]}
                    blockType="modal"
                    permissionType="all"
                >
                    {!isOccupied ? (
                        <Dialog>
                            <DialogTrigger asChild>
                                <button
                                    className={`rounded-lg p-2 transition-all duration-200 ${
                                        isAssigned
                                            ? 'text-[#4D2404] hover:bg-white/20'
                                            : 'hover:bg-gray-100'
                                    }`}
                                >
                                    <Plus className="w-4 h-4 font-medium" />
                                </button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Order Details</DialogTitle>
                                </DialogHeader>
                                <div className="mt-4">
                                    <OrderForm
                                        onSubmit={(data) => handleSubmit(data)}
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <span className="text-sm text-red-500">Booked</span>
                    )}
                </PermissionGate>
            </div>

            <ViewOrderSheet
                isOpen={activeSheet === 'viewOrder'}
                onClose={handleSheetClose}
                table={table}
            />
        </div>
    );
};

const TableServiceComponent = ({
    onTableSelect,
}: {
    onTableSelect: () => void;
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryDineArea = searchParams.get('dineArea');
    const [defaultTab] = useState<string>('1');
    const { data: dineInAreas, isLoading } = useSWR(
        '/restaurants/dine-in-areas',
        getDineInAreas,
    );

    console.log(dineInAreas);

    const [tables, setTables] = useState<any>(null);
    const [isLoadingTables, setIsLoadingTables] = useState(true);

    const bothLoading = isLoading || isLoadingTables;

    useEffect(() => {
        setIsLoadingTables(true);
        const fetchOrders = async () => {
            try {
                const response = await getTables();
                setTables(response);
                setIsLoadingTables(false);
            } catch (error: any) {
                console.error('Error fetching orders:', error);
                setIsLoadingTables(false);
            } finally {
                setIsLoadingTables(false);
            }
        };

        fetchOrders();
    }, []);

    useEffect(() => {
        if (!queryDineArea && dineInAreas?.data?.length) {
            router.replace(`?dineArea=${dineInAreas.data[0].id}`, {
                scroll: false,
            });
        }
    }, [dineInAreas, queryDineArea, router]);

    const activeTabValue =
        queryDineArea ||
        (dineInAreas?.data?.length
            ? String(dineInAreas.data[0].id)
            : defaultTab);

    const clearTable = async (id: number) => {
        setIsLoadingTables(true);
        try {
            const response = await resetTable(id);

            if (response.message === 'Reset table successfully!') {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Table cleared successfully!"
                        type="success"
                    />
                ));
                const updatedTables = await getTables();
                mutate('/restaurants/dine-in-areas');
                setTables(updatedTables);
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description="Failed to clear table. Please try again."
                        type="error"
                    />
                ));
            }
        } catch (error: any) {
            console.error('Error:', error);
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="Failed to clear table. Please try again."
                    type="error"
                />
            ));
        } finally {
            setIsLoadingTables(false);
        }
    };

    const isReady = dineInAreas?.data?.length > 0 && tables?.data?.length > 0;

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Table Services"
                    subtitle={`Manage table services`}
                />
                <div className="ml-auto flex items-center justify-center">
                    <Button className=" bg-white rounded-full p-4 w-8 h-8 shadow-none border text-gray-400">
                        <LuBell className="w-6 h-6" />
                    </Button>
                </div>
            </PageHeader>
            <div>
                {isReady &&
                    (bothLoading ? (
                        <div className="flex flex-col gap-4">
                            <div className="h-6 w-24">
                                <Skeleton className="h-full w-full" />
                            </div>
                            <div className="grid grid-cols-5 gap-4">
                                {[...Array(10)].map((_, i) => (
                                    <Skeleton
                                        key={i}
                                        className="h-[200px] w-full"
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <Tabs
                            value={activeTabValue}
                            onValueChange={(val) => {
                                router.push(`?dineArea=${val}`, {
                                    scroll: false,
                                });
                            }}
                            className="w-full"
                        >
                            <TabsList className="w-full px-0 justify-start gap-4 bg-transparent bordeer-b">
                                {dineInAreas?.data?.map((tab: any) => (
                                    <TabsTrigger
                                        className="text-base px-0 data-[state=active]:text-hexbrand data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-hexbrand"
                                        key={tab.id}
                                        value={String(tab.id)}
                                    >
                                        {tab.name}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            {dineInAreas?.data?.map(
                                (area: {
                                    id: number;
                                    tables: ScopedOrder['table'][];
                                    kitchen?: { id: number };
                                }) => {
                                    return (
                                        <TabsContent
                                            key={area.id}
                                            value={String(area.id)}
                                        >
                                            <div className="flex flex-col gap-4 mt-5">
                                                <TableTracks
                                                    onClearTable={clearTable}
                                                    onTableSelect={
                                                        onTableSelect
                                                    }
                                                    title="Tables"
                                                    tables={area.tables
                                                        .sort(
                                                            (a, b) =>
                                                                (a?.number ??
                                                                    0) -
                                                                (b?.number ??
                                                                    0),
                                                        )
                                                        .filter(
                                                            (
                                                                table,
                                                            ): table is NonNullable<
                                                                typeof table
                                                            > => table !== null,
                                                        )
                                                        .map((table) => ({
                                                            id: table?.id,
                                                            number: table?.number,
                                                            isOccupied:
                                                                table?.isOccupied,
                                                            numberOfSeats:
                                                                table?.numberOfSeats,
                                                            availableSeats:
                                                                table?.availableSeats,
                                                            dineInArea:
                                                                area.id.toString(),
                                                            current_waiter:
                                                                table?.current_waiter,
                                                            kitchen:
                                                                area?.kitchen
                                                                    ?.id,
                                                        }))}
                                                />
                                            </div>
                                        </TabsContent>
                                    );
                                },
                            )}
                        </Tabs>
                    ))}
            </div>
        </PageWrapper>
    );
};

export default TableServiceComponent;
