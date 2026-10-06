'use client';

import {
    PageHeader,
    PageHeadertitle,
    HeaderActions,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createTransfer } from '@/app/actions/stock';
import toast from 'react-hot-toast';
import Toast from '@/components/toast';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { getStaffList } from '@/app/actions/staff';
import { useHotelServicesContext } from '@/context/HotelServicesContext';
import { useItemsContext } from '@/context/ItemsContext';
import { Input } from '@/components/ui/input';

const CreateStockTransferPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [receivedBy, setReceivedBy] = useState<string>('');
    const [toDepartment, setToDepartment] = useState<string>('');
    const [fromDepartment, setFromDepartment] = useState<string>('');

    const { data: staffResponse } = useSWR('/staff', () =>
        getStaffList(1, 1000),
    );
    const staffList = staffResponse?.data || [];

    const { itemsList, isLoading: itemsLoading } = useItemsContext();
    const { hotelServices } = useHotelServicesContext();

    const [items, setItems] = useState([
        {
            id: '1',
            itemName: '',
            module: '',
            quantity: '',
            unit: '',
            unitCost: '',
            value: '',
        },
    ]);

    const addItem = () => {
        setItems([
            ...items,
            {
                id: Date.now().toString(),
                itemName: '',
                module: '',
                quantity: '',
                unit: '',
                unitCost: '',
                value: '',
            },
        ]);
    };

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter((item) => item.id !== id));
        }
    };

    const updateItem = (id: string, field: string, value: string) => {
        setItems(
            items.map((item) => {
                if (item.id === id) {
                    const updatedItem = { ...item, [field]: value };

                    // Auto-fill category when item is selected
                    if (field === 'itemName' && value) {
                        const selectedItem = itemsList.find(
                            (listItem: any) => listItem.value === value,
                        );
                        if (selectedItem) {
                            // Auto-fill category
                            if (selectedItem.category) {
                                updatedItem.module = selectedItem.category;
                            }

                            // Auto-fill unit if available
                            if (selectedItem.unitOfMeasurement) {
                                updatedItem.unit =
                                    selectedItem.unitOfMeasurement;
                            }
                        }
                    }

                    return updatedItem;
                }
                return item;
            }),
        );
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            // Validate form fields
            if (!fromDepartment || !toDepartment) {
                toast.custom(() => (
                    <Toast
                        title="Validation Error"
                        description="Please select both From and To departments."
                        type="error"
                    />
                ));
                setIsLoading(false);
                return;
            }

            if (!receivedBy) {
                toast.custom(() => (
                    <Toast
                        title="Validation Error"
                        description="Please select who received the transfer."
                        type="error"
                    />
                ));
                setIsLoading(false);
                return;
            }

            // Validate items
            const invalidItems = items.filter(
                (item) =>
                    !item.itemName ||
                    !item.quantity ||
                    Number(item.quantity) <= 0,
            );

            if (invalidItems.length > 0) {
                toast.custom(() => (
                    <Toast
                        title="Validation Error"
                        description="Please ensure all items have a name and valid quantity."
                        type="error"
                    />
                ));
                setIsLoading(false);
                return;
            }

            // Format date safely
            const today = new Date();
            console.log('Original date state:', date);
            console.log('Today:', today);
            const transferDate = date && !isNaN(date.getTime()) ? date : today;
            console.log('Transfer date:', transferDate);
            const formattedDate = transferDate.toISOString().split('T')[0];
            console.log('Formatted date:', formattedDate);

            // Validate and format items
            const formattedItems = items.map((item) => ({
                itemId: Number(item.itemName) || 0,
                quantity: Number(item.quantity) || 0,
                unit: item.unit || 'pcs',
            }));

            console.log('Formatted items:', formattedItems);

            const payload = {
                transferDate: formattedDate,
                transferType: 'INTER',
                fromDepartment: fromDepartment || 'default',
                toDepartment: toDepartment || 'default',
                items: formattedItems,
                receivedById: receivedBy ? Number(receivedBy) : undefined,
            };
            console.log('Full payload:', payload);
            const result = await createTransfer(payload);

            if (result.error) {
                // Handle error case
                console.error('Failed to create transfer', result.error);
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={
                            result.error || 'Failed to create transfer request.'
                        }
                        type="error"
                    />
                ));
            } else {
                // Handle success case
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Stock transfer request created successfully."
                        type="success"
                    />
                ));

                // Only redirect on success
                setTimeout(() => {
                    router.push('/stock/transfer-management');
                }, 800);
            }
        } catch (error: any) {
            console.error('Unexpected error creating transfer', error);
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="An unexpected error occurred. Please try again."
                    type="error"
                />
            ));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="Transfer Management"
                    subtitle="Manage inter and intra-departmental stock transfers with complete audit trail"
                />
                <HeaderActions />
            </PageHeader>

            <PageWrapper className="flex-1 overflow-auto pt-4 pb-20">
                <div className="max-w-6xl mx-auto space-y-8 pb-10">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-foreground">
                            Create New Stock Transfer
                        </h2>
                        <p className="text-xs text-muted-foreground font-medium italic">
                            Initiate a new inter or intra-departmental stock
                            transfer
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
                                Transfer Date
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal h-12 border-gray-200 bg-white"
                                    >
                                        {date
                                            ? format(date, 'PPP')
                                            : 'Pick a date'}
                                        <CalendarIcon className="ml-auto h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
                                Received By
                            </Label>
                            <Select
                                value={receivedBy}
                                onValueChange={setReceivedBy}
                            >
                                <SelectTrigger className="h-12 border-gray-200 bg-white text-muted-foreground">
                                    <SelectValue placeholder="Select staff member" />
                                </SelectTrigger>
                                <SelectContent>
                                    {staffList.map((staff: any) => (
                                        <SelectItem
                                            key={staff.id}
                                            value={String(staff.id)}
                                        >
                                            {staff.fullName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
                                To Department
                            </Label>
                            <Select
                                value={toDepartment}
                                onValueChange={setToDepartment}
                            >
                                <SelectTrigger className="h-12 border-gray-200 bg-white text-muted-foreground">
                                    <SelectValue placeholder="Select destination" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hotelServices.map(
                                        (service: any, index: number) => (
                                            <SelectItem
                                                key={index}
                                                value={service.value}
                                            >
                                                {service.label}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
                                From Department
                            </Label>
                            <Select
                                value={fromDepartment}
                                onValueChange={setFromDepartment}
                            >
                                <SelectTrigger className="h-12 border-gray-200 bg-white text-muted-foreground">
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hotelServices.map(
                                        (service: any, index: number) => (
                                            <SelectItem
                                                key={index}
                                                value={service.value}
                                            >
                                                {service.label}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
                                Transferred By
                            </Label>
                            <Input
                                className="h-12 border-gray-200 bg-white"
                                placeholder="Current User (Auto-filled)"
                                value={
                                    staffList.find(
                                        (s: any) => s.id === 'current',
                                    )?.fullName || ''
                                }
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-foreground">
                                Items to Transfer
                            </h3>
                            <Button
                                onClick={addItem}
                                variant="outline"
                                className="h-8 border-gray-200 font-normal gap-2 text-xs"
                            >
                                <Plus className="h-4 w-4" />
                                Add Item
                            </Button>
                        </div>

                        {items.map((item) => (
                            <Card
                                key={item.id}
                                className="p-6 shadow-none border-gray-200 space-y-4 relative bg-white"
                            >
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-foreground">
                                            Item Name
                                        </Label>
                                        <Select
                                            value={item.itemName}
                                            onValueChange={(value) =>
                                                updateItem(
                                                    item.id,
                                                    'itemName',
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger className="h-11 border-gray-200 bg-white">
                                                <SelectValue placeholder="Select item" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {itemsList &&
                                                itemsList.length > 0 ? (
                                                    itemsList.map(
                                                        (listItem: any) => (
                                                            <SelectItem
                                                                key={
                                                                    listItem.value
                                                                }
                                                                value={
                                                                    listItem.value
                                                                }
                                                            >
                                                                {listItem.label}
                                                            </SelectItem>
                                                        ),
                                                    )
                                                ) : (
                                                    <div className="p-2 text-center text-sm text-muted-foreground">
                                                        {itemsLoading
                                                            ? 'Loading items...'
                                                            : 'No items available'}
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-foreground">
                                            Category
                                        </Label>
                                        <Input
                                            className="h-11 border-gray-200 bg-gray-50"
                                            placeholder="Category (Auto-filled)"
                                            value={item.module}
                                            readOnly
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-foreground">
                                            Quantity
                                        </Label>
                                        <Input
                                            type="number"
                                            className="h-11 border-gray-200 bg-white"
                                            placeholder="Enter Quantity"
                                            value={item.quantity}
                                            onChange={(e) =>
                                                updateItem(
                                                    item.id,
                                                    'quantity',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-foreground">
                                            Unit
                                        </Label>
                                        <Input
                                            className="h-11 border-gray-200"
                                            placeholder="pcs"
                                            value={item.unit}
                                            onChange={(e) =>
                                                updateItem(
                                                    item.id,
                                                    'unit',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-foreground">
                                            Unit Cost (N)
                                        </Label>
                                        <Input
                                            type="number"
                                            className="h-11 border-gray-200"
                                            placeholder="0"
                                            value={item.unitCost}
                                            onChange={(e) =>
                                                updateItem(
                                                    item.id,
                                                    'unitCost',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-foreground">
                                            Value (N)
                                        </Label>
                                        <Input
                                            type="number"
                                            className="h-11 border-gray-200"
                                            placeholder="0"
                                            value={item.value}
                                            onChange={(e) =>
                                                updateItem(
                                                    item.id,
                                                    'value',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Input
                                        className="h-12 border-gray-200 bg-gray-50 italic text-xs"
                                        placeholder="Total Transfer Value"
                                        readOnly
                                    />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button
                                        onClick={() => removeItem(item.id)}
                                        className="bg-red-500 hover:bg-red-600 h-9 px-4 text-xs font-bold gap-2 text-white flex items-center rounded-md"
                                    >
                                        <X className="h-4 w-4" />
                                        Remove Item
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-foreground">
                            Remarks (Optional)
                        </Label>
                        <Textarea
                            placeholder="Enter any notes or reasons for this transfer..."
                            className="min-h-[100px] border-gray-100 bg-white italic text-xs rounded-lg"
                        />
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="h-12 bg-orion-blue hover:bg-orion-blue/90 text-white font-bold flex-1 rounded-md shadow-sm"
                        >
                            {isLoading
                                ? 'Creating...'
                                : 'Create Transfer Request'}
                        </Button>
                        <Button
                            variant="outline"
                            className="h-12 bg-gray-50 border-none font-bold flex-1 text-foreground rounded-md shadow-sm"
                            onClick={() =>
                                router.push('/stock/transfer-management')
                            }
                        >
                            Cancel Item
                        </Button>
                    </div>
                </div>
            </PageWrapper>
        </div>
    );
};

export default CreateStockTransferPage;
