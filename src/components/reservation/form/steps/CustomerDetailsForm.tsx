'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormInput } from '../components';
import { ReservationFormData } from '../schemas';

interface CustomerDetailsFormProps {
    form: UseFormReturn<ReservationFormData>;
}

export default function CustomerDetailsForm({
    form,
}: CustomerDetailsFormProps) {
    const {
        register,
        formState: { errors },
    } = form;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="First name."
                    placeholder="Enter First name"
                    error={errors.customerDetails?.firstName?.message}
                    registration={register('customerDetails.firstName')}
                />
                <FormInput
                    label="Last name."
                    placeholder="Enter Last name"
                    error={errors.customerDetails?.lastName?.message}
                    registration={register('customerDetails.lastName')}
                />
            </div>

            <FormInput
                label="Email Address"
                type="email"
                placeholder="Enter Email Address"
                error={errors.customerDetails?.email?.message}
                registration={register('customerDetails.email')}
            />

            <FormInput
                label="Phone Number"
                type="tel"
                placeholder="+234 000"
                error={errors.customerDetails?.phone?.message}
                registration={register('customerDetails.phone')}
            />
        </div>
    );
}
