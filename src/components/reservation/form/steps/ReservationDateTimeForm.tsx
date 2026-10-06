'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
// import useSWR from 'swr';
import {
    FormInput,
    FormSelect,
    FormRadioGroup,
    FormTextarea,
    FormDatePicker,
    FormTimePicker,
} from '../components';
import { ReservationFormData } from '../schemas';
// import { getPublicBlockedDates } from '@/app/actions/reservation';

interface ReservationDateTimeFormProps {
    form: UseFormReturn<ReservationFormData>;
    hotelId?: string;
}

const TABLE_TYPE_OPTIONS = [
    { value: 'single', label: 'Single table' },
    { value: '6', label: '6 tables' },
    { value: '8', label: '8 tables' },
    { value: 'others', label: 'Others' },
];

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

export default function ReservationDateTimeForm({
    form,
    hotelId,
}: ReservationDateTimeFormProps) {
    const {
        register,
        control,
        formState: { errors },
    } = form;

    // const { data: blockedDatesResponse } = useSWR(
    //     hotelId ? `public-blocked-reservation-dates-${hotelId}` : null,
    //     () => getPublicBlockedDates(hotelId as string),
    // );
    // const blockedDates = blockedDatesResponse?.data || [];

    return (
        <div className="space-y-6">
            <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormDatePicker
                        label="Reservation date"
                        name="reservationDateTime.date"
                        control={control}
                        placeholder="Enter Reservation Date"
                        error={errors.reservationDateTime?.date?.message}
                        // blockedDates={blockedDates}
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

                <FormSelect
                    label="Table Type"
                    placeholder="Select Table Type"
                    options={TABLE_TYPE_OPTIONS}
                    error={errors.reservationDateTime?.tableType?.message}
                    registration={register('reservationDateTime.tableType')}
                    value={form.watch('reservationDateTime.tableType')}
                    className="bg-[#FAFAFA] border-none"
                />

                <FormRadioGroup
                    options={RESERVATION_TYPE_OPTIONS}
                    error={errors.reservationDateTime?.reservationType?.message}
                    registration={register(
                        'reservationDateTime.reservationType',
                    )}
                />

                <div>
                    <FormInput
                        label="Guest Number"
                        type="number"
                        placeholder="Enter the number of guest"
                        error={errors.reservationDateTime?.guestNumber?.message}
                        registration={register(
                            'reservationDateTime.guestNumber',
                        )}
                    />
                    <div className="bg-[#F2FFF4] px-[8px] py-[7px] min-h-[40px] h-auto mt-3 flex items-center">
                        <p className="text-xs text-[#066812] font-normal">
                            Note if the number of guest is up to 12 and above
                            you will have to pick a food menu.
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 rounded-[24px] bg-[#F2F6FF] space-y-4">
                <FormSelect
                    label="Food Type"
                    placeholder="Select Food type"
                    options={FOOD_TYPE_OPTIONS}
                    error={errors.reservationDateTime?.foodType?.message}
                    registration={register('reservationDateTime.foodType')}
                    value={form.watch('reservationDateTime.foodType')}
                    className="bg-[#F2F6FF]"
                />

                <FormTextarea
                    label="Food Quantity (optional)"
                    placeholder="describe the quantity of foods you want"
                    rows={3}
                    error={errors.reservationDateTime?.foodQuantity?.message}
                    registration={register('reservationDateTime.foodQuantity')}
                    className="bg-[#F2F6FF]"
                />
            </div>
        </div>
    );
}
