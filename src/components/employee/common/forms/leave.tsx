'use client';

import BrandButton from '@/components/common/Button';
import { InputField } from '@/components/common/Form';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export interface LeaveProps {
    startDate: string;
    endDate: string;
    reason: string;
}

interface CreateShiftFormProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
    initialData?: any;
    isLoading?: boolean;
}

const LeaveForm = ({
    onSubmit,
    onCancel,
    initialData,
    isLoading,
}: CreateShiftFormProps) => {
    const [formData, setFormData] = useState<Omit<LeaveProps, 'id'>>({
        startDate: initialData?.startDate ?? '',
        endDate: initialData?.endDate ?? '',
        reason: initialData?.reason ?? '',
    });
    useEffect(() => {
        if (initialData) {
            setFormData({
                startDate: initialData.startDate,
                endDate: initialData.endDate,
                reason: initialData.reason,
            });
        }
    }, [initialData]);

    const handleInputChange = (
        field: keyof Omit<LeaveProps, 'id'>,
        value: any,
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const valid = formData.startDate && formData.endDate && formData.reason;

    return (
        <div className="space-y-6">
            <div className="border flex flex-col gap-4 rounded-lg p-4">
                <InputField
                    id="startDate"
                    label="Start Date"
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={(e) =>
                        handleInputChange('startDate', e.target.value)
                    }
                />
                <InputField
                    id="endDate"
                    label="End Date"
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={(e) =>
                        handleInputChange('endDate', e.target.value)
                    }
                />
                <InputField
                    id="reason"
                    label="Reason"
                    type="text"
                    name="reason"
                    value={formData.reason}
                    onChange={(e) =>
                        handleInputChange('reason', e.target.value)
                    }
                />
            </div>

            <div className="flex justify-between gap-2">
                <div className="flex gap-2 ml-auto">
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <BrandButton
                        loading={isLoading}
                        disabled={!valid}
                        onClick={() => onSubmit(formData)}
                    >
                        {initialData
                            ? 'Update Leave request'
                            : 'Create Leave request'}
                    </BrandButton>
                </div>
            </div>
        </div>
    );
};

export default LeaveForm;
