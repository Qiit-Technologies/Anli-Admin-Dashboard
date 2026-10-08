import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    FormDatePicker,
    FormTimePicker,
    FormSelect,
} from '@/components/reservation/form/components';
import { useIdleLogoutExemption } from '@/context/IdleLogoutContext';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reservation } from '@/components/reservations/types';

import useSWR from 'swr';
import { getReservationSpaces } from '@/app/actions/reservation';

interface EditReservationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reservation: Reservation | null;
    onSave: (reservation: Reservation, updates: EditReservationData) => void;
    isLoading?: boolean;
}

export interface EditReservationData {
    reservationDate: string;
    reservationTime: string;
    tableType: string;
    tableNumber?: string;
    tableId?: number;
    spaceType?: string;
}

export default function EditReservationModal({
    open,
    onOpenChange,
    reservation,
    onSave,
    isLoading = false,
}: EditReservationModalProps) {
    useIdleLogoutExemption(open);

    const {
        control,
        handleSubmit,
        reset,
        register,
        watch,
        setValue,
        formState: { errors },
    } = useForm<EditReservationData>({
        defaultValues: {
            reservationDate: '',
            reservationTime: '',
            tableType: '',
            spaceType: '',
        },
    });

    const { data: spacesResponse } = useSWR(
        'reservation-spaces',
        getReservationSpaces,
    );
    const spaces = spacesResponse?.data || [];

    const selectedSpaceType = watch('spaceType');
    const selectedTableId = watch('tableId');
    const selectedTableType = watch('tableType');

    const selectedSpace = spaces.find((s: any) => s.name === selectedSpaceType);

    const totalTables = selectedSpace?.tables?.length || 0;
    const availableTables =
        selectedSpace?.tables?.filter(
            (t: any) => !t.isOccupied && t.availableSeats > 0,
        ).length || 0;

    const tableOptions = (selectedSpace?.tables || []).map((t: any) => {
        const isFull = t.isOccupied || t.availableSeats <= 0;
        const status = isFull ? '🔴 FULL' : '🟢 AVAILABLE';
        const left = t.availableSeats ?? 0;
        return {
            value: String(t.id),
            label: `Table ${t.number} (${left} left) - ${status}`,
            disabled: isFull,
        };
    });

    const spaceOptions = spaces.map((s: any) => ({
        value: s.name,
        label: s.name,
    }));

    const TABLE_TYPES = Array.from(
        new Set((selectedSpace?.tables || []).map((t: any) => t.numberOfSeats)),
    )
        .sort((a: any, b: any) => a - b)
        .map((seats) => ({
            value: `Table for ${seats}`,
            label: `Table for ${seats}`,
        }));

    // Reset form when reservation changes
    useEffect(() => {
        if (reservation && open) {
            reset({
                reservationDate: reservation.reservationDate || '',
                reservationTime: reservation.rsvTime || '',
                tableType: reservation.tableType || '',
                spaceType: reservation.spaceType || '',
                tableId: reservation.tableId
                    ? Number(reservation.tableId)
                    : undefined,
            });
        }
    }, [reservation, open, reset]);

    const handleClose = () => {
        if (!isLoading) {
            onOpenChange(false);
        }
    };

    const onSubmit = (data: EditReservationData) => {
        if (reservation) {
            onSave(reservation, data);
        }
    };

    if (!reservation) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-[665px] w-full rounded-2xl p-0 [&>button]:hidden"
                style={{ borderRadius: '16px' }}
            >
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="pt-6 pr-[23px] pb-6 pl-[23px]"
                >
                    <DialogHeader className="relative pb-4 border-b border-[#EAECF0]">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="absolute right-0 top-0 p-1 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
                        >
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close</span>
                        </button>
                        <DialogTitle className="text-lg font-semibold text-[#101828]">
                            Extend Reservation
                        </DialogTitle>
                        <DialogDescription className="text-sm text-[#667085]">
                            Update the reservation details for the customer
                        </DialogDescription>
                    </DialogHeader>

                    {/* Customer Info Section - Read Only */}
                    <div className="mt-6 grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs text-[#667085] mb-1">
                                Customer Full Name
                            </p>
                            <p className="text-sm font-medium text-[#101828]">
                                {reservation.customerName}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-[#667085] mb-1">
                                Payment Type
                            </p>
                            <p className="text-sm font-medium text-[#101828]">
                                {reservation.paymentType}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-[#667085] mb-1">
                                Amount paid
                            </p>
                            <p className="text-sm font-medium text-[#101828]">
                                {reservation.amountPaid}
                            </p>
                        </div>
                    </div>

                    {/* Pick a new date section */}
                    <div className="mt-8 space-y-4">
                        <div className="flex items-center justify-between items-center">
                            <p className="text-sm text-[#101828] font-medium">
                                Pick a new available date
                            </p>
                            {selectedSpace && (
                                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-100">
                                    {availableTables} of {totalTables} tables
                                    available
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormDatePicker
                                label="Reservation date"
                                name="reservationDate"
                                control={control}
                                placeholder="Select date"
                                error={errors.reservationDate?.message}
                                className="bg-[#FAFAFA] border-[#D5D4D4] h-[52px]"
                            />

                            <FormTimePicker
                                label="Reservation time"
                                name="reservationTime"
                                control={control}
                                placeholder="Select time"
                                error={errors.reservationTime?.message}
                                className="bg-[#FAFAFA] border-[#D5D4D4] h-[52px]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormSelect
                                label="Space Type"
                                placeholder="Select Space Type"
                                options={spaceOptions}
                                error={errors.spaceType?.message}
                                value={selectedSpaceType}
                                registration={register('spaceType', {
                                    onChange: (e) => {
                                        console.log(e);
                                        setValue('tableId', undefined);
                                    },
                                })}
                                className="bg-[#FAFAFA] border-[#D5D4D4] h-[52px]"
                            />

                            <FormSelect
                                label="Table Number"
                                placeholder="Select Table"
                                options={tableOptions}
                                error={errors.tableId?.message}
                                value={selectedTableId ? String(selectedTableId) : ''}
                                registration={register('tableId', {
                                    onChange: (e: any) => {
                                        const selectedTable =
                                            selectedSpace?.tables?.find(
                                                (t: any) =>
                                                    String(t.id) ===
                                                    e.target.value,
                                            );
                                        if (selectedTable) {
                                            setValue(
                                                'tableNumber',
                                                String(selectedTable.number),
                                            );
                                            setValue(
                                                'tableType',
                                                `Table for ${selectedTable.numberOfSeats}`,
                                            );
                                        }
                                    },
                                    setValueAs: (v) =>
                                        v ? Number(v) : undefined,
                                })}
                                className="bg-[#FAFAFA] border-[#D5D4D4] h-[52px]"
                            />
                        </div>

                        <FormSelect
                            label="Table Type (Style)"
                            placeholder="Select Table Type"
                            options={TABLE_TYPES}
                            error={errors.tableType?.message}
                            value={selectedTableType}
                            registration={register('tableType')}
                            className="bg-[#FAFAFA] border-[#D5D4D4] h-[52px]"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 pt-6 mt-6 border-t border-[#EAECF0]">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="h-[48px] w-[180px] bg-[#007BFF] text-white rounded-lg text-sm font-semibold transition-all hover:bg-[#0069d9]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Done'
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="h-[48px] w-[140px] rounded-lg text-sm font-medium transition-all border border-[#007BFF] text-[#007BFF] hover:bg-[#F8FBFF]"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
