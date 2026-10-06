'use client';
import React, { useState } from 'react';
import { PurchaseOrderStage } from '@/types/purchase-order';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { updatePurchaseOrderStage } from '@/app/actions/invoice';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface StageManagementProps {
    purchaseOrderId: number;
    currentStage: PurchaseOrderStage;
    onStageUpdate: () => void;
}

const stageOptions = [
    { value: PurchaseOrderStage.CREATED, label: 'Created' },
    { value: PurchaseOrderStage.APPROVED, label: 'Approved' },
    { value: PurchaseOrderStage.SUPPLIED, label: 'Supplied' },
    { value: PurchaseOrderStage.COMPLETED, label: 'Completed' },
    { value: PurchaseOrderStage.PAID, label: 'Paid' },
];

export default function StageManagement({
    purchaseOrderId,
    currentStage,
    onStageUpdate,
}: StageManagementProps) {
    const [selectedStage, setSelectedStage] =
        useState<PurchaseOrderStage>(currentStage);
    const [remarks, setRemarks] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStageUpdate = async () => {
        if (selectedStage === currentStage) {
            toast.error('Please select a different stage');
            return;
        }

        setIsUpdating(true);
        try {
            const result = await updatePurchaseOrderStage(
                purchaseOrderId,
                selectedStage,
                remarks || undefined,
            );

            if (result.error) {
                toast.error(result.error);
                return;
            }

            toast.success('Purchase order stage updated successfully!');
            setRemarks('');
            onStageUpdate();
        } catch (error: any) {
            toast.error('Failed to update stage. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Update Stage
            </h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Stage
                    </label>
                    <div className="px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-600">
                        {
                            stageOptions.find(
                                (option) => option.value === currentStage,
                            )?.label
                        }
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Stage
                    </label>
                    <Select
                        value={selectedStage}
                        onValueChange={(value) =>
                            setSelectedStage(value as PurchaseOrderStage)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select new stage" />
                        </SelectTrigger>
                        <SelectContent>
                            {stageOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    disabled={option.value === currentStage}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Remarks (Optional)
                    </label>
                    <Textarea
                        placeholder="Add remarks for this stage change..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        rows={3}
                    />
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={handleStageUpdate}
                        disabled={isUpdating || selectedStage === currentStage}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isUpdating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            'Update Stage'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
