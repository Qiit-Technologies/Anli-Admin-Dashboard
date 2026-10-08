'use client';
interface ResignEmployee {
    reason: string;
    resignationDate: string;
    resignationLetter?: string;
}

import BrandButton from '@/components/common/Button';
import { InputField } from '@/components/common/Form';
import { useState } from 'react';

const ResignForm = () => {
    const [formData, setFormData] = useState<ResignEmployee>({
        reason: '',
        resignationDate: '',
        resignationLetter: '',
    });

    const handleInputChange = (field: keyof ResignEmployee, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="border rounded-lg flex flex-col gap-4 p-4">
            <InputField
                id="reason"
                label="Reason for resigning"
                placeholder="Reason for resigning"
                name="reason"
                value={formData.reason ?? ''}
                onChange={(e) => {
                    handleInputChange('reason', e.target.value);
                }}
            />

            <InputField
                id="resignationDate"
                label="Resignation Date"
                name="resignationDate"
                type="date"
                value={formData.resignationDate ?? ''}
                onChange={(e) => {
                    handleInputChange('resignationDate', e.target.value);
                }}
            />

            <BrandButton>Continue</BrandButton>
        </div>
    );
};

export default ResignForm;
