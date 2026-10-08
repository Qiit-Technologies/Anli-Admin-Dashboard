'use client';
interface TransferEmployee {
    department: string;
    userRole: string;
    branch: string;
    jobDescription: string;
    startDate: string;
}

import BrandButton from '@/components/common/Button';
import { InputField, SelectField } from '@/components/common/Form';
import { useState } from 'react';

const TransferEmployeeForm = () => {
    const [formData, setFormData] = useState<TransferEmployee>({
        department: '',
        branch: '',
        userRole: '',
        jobDescription: '',
        startDate: '',
    });

    const handleInputChange = (field: keyof TransferEmployee, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="border flex flex-col gap-4 rounded-lg p-4">
            <SelectField
                id="department"
                label="Department"
                name="department"
                value={formData.department ?? ''}
                onValueChange={(value) =>
                    handleInputChange('department', value)
                }
                options={[
                    { value: 'IT', label: 'IT' },
                    { value: 'HR', label: 'Human Resources' },
                    { value: 'Finance', label: 'Finance' },
                ]}
            />

            <SelectField
                id="userRole"
                label="User Role"
                name="userRole"
                value={formData.userRole ?? ''}
                onValueChange={(value) => handleInputChange('userRole', value)}
                options={[
                    { value: 'admin', label: 'Admin' },
                    { value: 'manager', label: 'Manager' },
                    { value: 'employee', label: 'Employee' },
                ]}
            />

            <SelectField
                id="branch"
                label="Branch"
                name="branch"
                value={formData.branch ?? ''}
                onValueChange={(value) => handleInputChange('branch', value)}
                options={[
                    { value: 'HQ', label: 'Headquarters' },
                    { value: 'Branch1', label: 'Branch 1' },
                    { value: 'Branch2', label: 'Branch 2' },
                ]}
            />

            <InputField
                id="description"
                label="Description"
                type="text"
                placeholder="Enter department description"
                name="description"
                value={formData.jobDescription}
                onChange={(e) => {
                    handleInputChange('jobDescription', e.target.value);
                }}
            />
            <InputField
                id="startDate"
                label="Start Date"
                type="date"
                name="startDate"
                value={formData.startDate?.toString() ?? ''}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
            />

            <BrandButton>Continue</BrandButton>
        </div>
    );
};

export default TransferEmployeeForm;
