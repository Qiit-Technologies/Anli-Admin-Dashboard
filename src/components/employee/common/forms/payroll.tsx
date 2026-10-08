'use client';

import { getDepartments } from '@/app/actions/department';
import { GeneratePayroll } from '@/app/actions/payroll';
import BrandButton from '@/components/common/Button';
import { SelectField } from '@/components/common/Form';
import Toast from '@/components/toast';
import { Role } from '@/types/staff.types';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

interface Payroll {
    type: string;
    department: string;
}

interface PayrollFormProps {
    onSuccess: () => void;
}

const PayrollForm = ({ onSuccess }: PayrollFormProps) => {
    const [formData, setFormData] = useState<Payroll>({
        type: '',
        department: '',
    });

    const { data: departments } = useSWR('/departments', getDepartments);

    const handleInputChange = (field: keyof Payroll, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await GeneratePayroll(formData);
            if (response.message === 'Payroll Generated Successful!') {
                toast.custom(() => (
                    <Toast
                        title="Success"
                        description="Payroll Generated Successful!"
                        type="success"
                    />
                ));
                onSuccess();
                return;
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={
                            response.message ??
                            'Something went wrong. Please try again.'
                        }
                        type="error"
                    />
                ));
            }
        } catch (error: any) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="Something went wrong. Please try again."
                    type="error"
                />
            ));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <SelectField
                id="type"
                label="Work Mode"
                name="type"
                value={formData.type ?? ''}
                onValueChange={(value) => handleInputChange('type', value)}
                options={[
                    { value: 'Monthly', label: 'Monthly' },
                    { value: 'Weekly', label: 'Weekly' },
                    { value: 'Daily', label: 'Daily' },
                    { value: 'Hourly', label: 'Hourly' },
                ]}
            />

            <SelectField
                id="department"
                label="Department"
                name="department"
                value={formData.department ?? ''}
                onValueChange={(value) =>
                    handleInputChange('department', value)
                }
                options={departments?.map((item: Role) => ({
                    value: item.id,
                    name: item.name,
                    label: item.name,
                }))}
            />

            <BrandButton className="h-12 w-full" type="submit">
                Generate Payroll
            </BrandButton>
        </form>
    );
};

export default PayrollForm;
