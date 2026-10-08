'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormInput } from '@/components/reservation/form/components';
import { DashboardReservationFormData } from '../schemas/dashboardReservation.schema';

interface DashboardCustomerDetailsFormProps {
    form: UseFormReturn<DashboardReservationFormData>;
}

export function DashboardCustomerDetailsForm({
    form,
}: DashboardCustomerDetailsFormProps) {
    const {
        register,
        formState: { errors },
    } = form;

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <FormInput
                    label="First name"
                    placeholder="Enter first name"
                    error={errors.customerDetails?.firstName?.message}
                    registration={register('customerDetails.firstName')}
                />
                <FormInput
                    label="Last name"
                    placeholder="Enter last name"
                    error={errors.customerDetails?.lastName?.message}
                    registration={register('customerDetails.lastName')}
                />
            </div>

            <FormInput
                label="Phone Number"
                type="tel"
                placeholder="+234 000"
                error={errors.customerDetails?.phone?.message}
                registration={register('customerDetails.phone')}
            />

            <FormInput
                label="Email Address"
                type="email"
                placeholder="Enter Email Address"
                error={errors.customerDetails?.email?.message}
                registration={register('customerDetails.email')}
            />
        </div>
    );
}
