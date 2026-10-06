'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
    FormInput,
    FormSelect,
    FormRadioGroup,
    FormTextarea,
    FormDatePicker,
    FormTimePicker,
} from '@/components/reservation/form/components';
import { DashboardReservationFormData } from '../schemas/dashboardReservation.schema';
import useSWR from 'swr';
import {
    getReservationSpaces,
    getBlockedDates,
} from '@/app/actions/reservation';

interface DashboardReservationDateTimeFormProps {
    form: UseFormReturn<DashboardReservationFormData>;
}

const RESERVATION_TYPE_OPTIONS = [
    { value: 'Single Reservation', label: 'Single Reservation' },
    { value: 'Group Reservation', label: 'Group Reservation' },
    { value: 'Business Reservation', label: 'Business Reservation' },
];

const FOOD_TYPE_OPTIONS = [
    { value: 'continental', label: 'Continental' },
    { value: 'african', label: 'African' },
    { value: 'asian', label: 'Asian' },
];

const EVENT_TYPE_OPTIONS = [
    { value: 'Birthday Dinner', label: 'Birthday Dinner' },
    { value: 'Date Night', label: 'Date Night' },
    { value: 'Anniversary', label: 'Anniversary' },
    { value: 'Other', label: 'Other' },
];

export function DashboardReservationDateTimeForm({
    form,
}: DashboardReservationDateTimeFormProps) {
    const {
        register,
        control,
        watch,
        setValue,
        formState: { errors },
    } = form;

    const { data: spacesResponse } = useSWR(
        'reservation-spaces',
        getReservationSpaces,
    );
    const { data: blockedDatesResponse } = useSWR(
        'blocked-reservation-dates',
        getBlockedDates,
    );
    const spaces = spacesResponse?.data || [];
    const blockedDates = blockedDatesResponse?.data || [];

    const selectedSpaceType = watch('reservationDateTime.spaceType');

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

    // Use number of seats as table type options
    const TABLE_TYPE_OPTIONS = Array.from(
        new Set((selectedSpace?.tables || []).map((t: any) => t.numberOfSeats)),
    )
        .sort((a: any, b: any) => a - b)
        .map((seats) => ({
            value: `Table for ${seats}`,
            label: `Table for ${seats}`,
        }));

    return (
        <div className="space-y-4">
            {selectedSpace && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
                    <span className="font-semibold">Status:</span>
                    <span>
                        {availableTables} of {totalTables} tables available in{' '}
                        {selectedSpace.name}
                    </span>
                </div>
            )}
            <div className="grid grid-cols-2 gap-4">
                <FormDatePicker
                    label="Reservation date"
                    name="reservationDateTime.date"
                    control={control}
                    placeholder="Enter Reservation Date"
                    error={errors.reservationDateTime?.date?.message}
                    blockedDates={blockedDates}
                    icon={
                        <img
                            src="/reservation/calendar.svg"
                            alt="Calendar"
                            width={16}
                            height={16}
                        />
                    }
                    className="bg-[#FAFAFA] border-none"
                />

                <FormTimePicker
                    label="Reservation time"
                    name="reservationDateTime.time"
                    control={control}
                    placeholder="Enter time"
                    error={errors.reservationDateTime?.time?.message}
                    icon={
                        <img
                            src="/reservation/clock.svg"
                            alt="Clock"
                            width={16}
                            height={16}
                        />
                    }
                    className="bg-[#FAFAFA] border-none"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormSelect
                    label="Space Type"
                    placeholder="Select Space Type"
                    options={spaceOptions}
                    error={errors.reservationDateTime?.spaceType?.message}
                    registration={register('reservationDateTime.spaceType', {
                        onChange: (e) => {
                            console.log(e);
                            setValue('reservationDateTime.tableId', undefined);
                        },
                    })}
                    className="bg-[#FAFAFA] border-none"
                />

                <FormSelect
                    label="Table Number"
                    placeholder="Select Table"
                    options={tableOptions}
                    error={errors.reservationDateTime?.tableId?.message}
                    registration={register('reservationDateTime.tableId', {
                        onChange: (e: any) => {
                            const val = e.target.value;
                            const selectedTable = selectedSpace?.tables?.find(
                                (t: any) => String(t.id) === val,
                            );
                            if (selectedTable) {
                                setValue(
                                    'reservationDateTime.tableNumber',
                                    String(selectedTable.number),
                                );
                                setValue(
                                    'reservationDateTime.tableType',
                                    `Table for ${selectedTable.numberOfSeats}`,
                                );
                                // Explicitly set as number to avoid validation issues
                                const numId = Number(val);
                                if (!isNaN(numId)) {
                                    setValue(
                                        'reservationDateTime.tableId',
                                        numId,
                                        {
                                            shouldValidate: true,
                                        },
                                    );
                                }
                            }
                        },
                    })}
                    className="bg-[#FAFAFA] border-none"
                />
            </div>

            <FormSelect
                label="Table Type (Style)"
                placeholder="Select Table Style"
                options={TABLE_TYPE_OPTIONS}
                error={errors.reservationDateTime?.tableType?.message}
                registration={register('reservationDateTime.tableType')}
                className="bg-[#FAFAFA] border-none"
            />

            <FormRadioGroup
                options={RESERVATION_TYPE_OPTIONS}
                error={errors.reservationDateTime?.reservationType?.message}
                registration={register('reservationDateTime.reservationType')}
            />

            <div>
                <FormInput
                    label="Guest Number"
                    placeholder="Enter the number of guest"
                    error={errors.reservationDateTime?.guestNumber?.message}
                    registration={register('reservationDateTime.guestNumber')}
                />
                <div className="bg-[#F2FFF4] px-[8px] py-[7px] h-10 mt-3 flex items-center">
                    <p className="text-xs text-[#066812] font-normal">
                        Note if the number of guest is up to 12 and a above you
                        will have to pick a food menu.
                    </p>
                </div>
            </div>

            <div className="p-4 rounded-[16px] bg-[#F2F6FF] space-y-4">
                <FormSelect
                    label="Event Type"
                    placeholder="Select Event type"
                    options={EVENT_TYPE_OPTIONS}
                    error={errors.reservationDateTime?.eventType?.message}
                    registration={register('reservationDateTime.eventType')}
                    className="bg-white"
                />

                <FormSelect
                    label="Food Type"
                    placeholder="Select Food type"
                    options={FOOD_TYPE_OPTIONS}
                    error={errors.reservationDateTime?.foodType?.message}
                    registration={register('reservationDateTime.foodType')}
                    className="bg-white"
                />

                <FormTextarea
                    label="Special Note"
                    placeholder="describe any special notes or requests"
                    rows={3}
                    error={errors.reservationDateTime?.specialNote?.message}
                    registration={register('reservationDateTime.specialNote')}
                    className="bg-white"
                />
            </div>
        </div>
    );
}
