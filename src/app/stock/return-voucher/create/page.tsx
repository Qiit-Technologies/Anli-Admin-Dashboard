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
import { CalendarIcon, Plus, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { createReturnVoucher } from '@/app/actions/stock';
import toast from 'react-hot-toast';
import Toast from '@/components/toast';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { getStaffList } from '@/app/actions/staff';
import { useHotelServicesContext } from '@/context/HotelServicesContext';
import { useItemsContext } from '@/context/ItemsContext';
import { RETURN_REASONS } from '../types';

interface RtvRow {
    id: string;
    itemId: string;
    quantity: string;
    unit: string;
    unitCost: string;
    reason: string;
}

const emptyRow = (): RtvRow => ({
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    itemId: '',
    quantity: '',
    unit: '',
    unitCost: '',
    reason: '',
});

const CreateReturnVoucherPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [fromDepartment, setFromDepartment] = useState('');
    const [receivedBy, setReceivedBy] = useState('');
    const [remarks, setRemarks] = useState('');
    const [rows, setRows] = useState<RtvRow[]>([emptyRow()]);

    const { data: staffResponse } = useSWR('/staff', () =>
        getStaffList(1, 1000),
    );
    const staffList = staffResponse?.data || [];

    const { itemsList } = useItemsContext();
    const { hotelServices } = useHotelServicesContext();

    const addRow = () => setRows([...rows, emptyRow()]);
    const removeRow = (id: string) => {
        if (rows.length > 1) setRows(rows.filter((r) => r.id !== id));
    };
    const updateRow = (id: string, field: keyof RtvRow, value: string) => {
        setRows(
            rows.map((r) => {
                if (r.id !== id) return r;
                const next = { ...r, [field]: value };
                if (field === 'itemId' && value) {
                    const sel = itemsList.find(
                        (li: any) => String(li.value) === value,
                    );
                    if (sel) {
                        if (sel.unitOfMeasurement)
                            next.unit = sel.unitOfMeasurement;
                        if (sel.costPrice) next.unitCost = String(sel.costPrice);
                    }
                }
                return next;
            }),
        );
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            if (!fromDepartment) {
                toast.custom(() => (
                    <Toast
                        title="Validation Error"
                        description="Please select the department returning the stock."
                        type="error"
                    />
                ));
                setIsLoading(false);
                return;
            }

            const invalid = rows.filter(
                (r) =>
                    !r.itemId || !r.quantity || Number(r.quantity) <= 0,
            );
            if (invalid.length > 0) {
                toast.custom(() => (
                    <Toast
                        title="Validation Error"
                        description="Each line needs an item and a quantity greater than zero."
                        type="error"
                    />
                ));
                setIsLoading(false);
                return;
            }

            const payload = {
                returnDate: (date ?? new Date()).toISOString().split('T')[0],
                fromDepartment,
                receivedById: receivedBy ? Number(receivedBy) : undefined,
                remarks: remarks || undefined,
                items: rows.map((r) => ({
                    itemId: Number(r.itemId),
                    quantity: Number(r.quantity),
                    unit: r.unit || undefined,
                    unitCost: r.unitCost ? Number(r.unitCost) : undefined,
                    reason: r.reason || undefined,
                })),
            };

            const result = await createReturnVoucher(payload);
            if (result.error) {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={
                            result.error ||
                            'Failed to create return voucher.'
                        }
                        type="error"
                    />
                ));
            } else {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Return voucher created successfully."
                        type="success"
                    />
                ));
                setTimeout(
                    () => router.push('/stock/return-voucher'),
                    800,
                );
            }
        } catch {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="An unexpected error occurred."
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
                    title="Return Voucher"
                    subtitle="Record stock returned from a department back to the store"
                />
                <HeaderActions />
            </PageHeader>

            <PageWrapper className="flex-1 overflow-auto pt-4 pb-20">
                <div className="max-w-6xl mx-auto space-y-8 pb-10">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-foreground">
                            New Return Voucher
                        </h2>
                        <p className="text-xs text-muted-foreground font-medium italic">
                            RTV number is generated automatically on save
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
                                Return Date
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
                                From Department
                            </Label>
                            <Select
                                value={fromDepartment}
                                onValueChange={setFromDepartment}
                            >
                                <SelectTrigger className="h-12 border-gray-200 bg-white">
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hotelServices.map(
                                        (service: any, index: number) => (
                                            <SelectItem
                                                key={index}
                                                value={service.value}
                                            >
                                                {service.label ||
                                                    service.value}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
                                Received By
                            </Label>
                            <Select
                                value={receivedBy}
                                onValueChange={setReceivedBy}
                            >
                                <SelectTrigger className="h-12 border-gray-200 bg-white">
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
                    </div>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold">
                                Returned Items
                            </h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={addRow}
                                className="gap-1.5"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Add line
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {rows.map((row) => (
                                <div
                                    key={row.id}
                                    className="grid grid-cols-12 gap-3 items-end"
                                >
                                    <div className="col-span-4 space-y-1">
                                        <Label className="text-xs text-muted-foreground">
                                            Item
                                        </Label>
                                        <Select
                                            value={row.itemId}
                                            onValueChange={(v) =>
                                                updateRow(
                                                    row.id,
                                                    'itemId',
                                                    v,
                                                )
                                            }
                                        >
                                            <SelectTrigger className="h-11 bg-white">
                                                <SelectValue placeholder="Select item" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {itemsList.map(
                                                    (item: any) => (
                                                        <SelectItem
                                                            key={item.value}
                                                            value={String(
                                                                item.value,
                                                            )}
                                                        >
                                                            {item.label ||
                                                                item.name}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <Label className="text-xs text-muted-foreground">
                                            Qty
                                        </Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            className="h-11 bg-white"
                                            value={row.quantity}
                                            onChange={(e) =>
                                                updateRow(
                                                    row.id,
                                                    'quantity',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <Label className="text-xs text-muted-foreground">
                                            Unit Cost
                                        </Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            className="h-11 bg-white"
                                            value={row.unitCost}
                                            onChange={(e) =>
                                                updateRow(
                                                    row.id,
                                                    'unitCost',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="col-span-3 space-y-1">
                                        <Label className="text-xs text-muted-foreground">
                                            Reason
                                        </Label>
                                        <Select
                                            value={row.reason}
                                            onValueChange={(v) =>
                                                updateRow(
                                                    row.id,
                                                    'reason',
                                                    v,
                                                )
                                            }
                                        >
                                            <SelectTrigger className="h-11 bg-white">
                                                <SelectValue placeholder="Select reason" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {RETURN_REASONS.map((r) => (
                                                    <SelectItem
                                                        key={r}
                                                        value={r}
                                                    >
                                                        {r}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-11 w-11 p-0 text-destructive"
                                            onClick={() =>
                                                removeRow(row.id)
                                            }
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
                            Remarks
                        </Label>
                        <Textarea
                            className="bg-white"
                            rows={3}
                            placeholder="Optional notes about this return…"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.push('/stock/return-voucher')
                            }
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading
                                ? 'Saving…'
                                : 'Create Return Voucher'}
                        </Button>
                    </div>
                </div>
            </PageWrapper>
        </div>
    );
};

export default CreateReturnVoucherPage;
