'use client';
import React, { useState } from 'react';
import { RequisitionStage } from '@/types/requisition';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { updateRequisitionStage } from '@/app/actions/stock';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface RequisitionApprovalProps {
    stockRequestId: number;
    currentStage: RequisitionStage;
    onStageUpdate: () => void;
    userRole: string;
}

const stageOptions = [
    { value: RequisitionStage.CREATED, label: 'Created' },
    { value: RequisitionStage.APPROVED, label: 'Approved' },
    { value: RequisitionStage.PAID, label: 'Paid' },
    { value: RequisitionStage.SUPPLIED, label: 'Supplied' },
];

export default function RequisitionApproval({
    stockRequestId,
    currentStage,
    onStageUpdate,
    userRole,
}: RequisitionApprovalProps) {
    const [selectedStage, setSelectedStage] =
        useState<RequisitionStage>(currentStage);
    const [remarks, setRemarks] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStageUpdate = async () => {
        if (selectedStage === currentStage) {
            toast.error('Please select a different stage');
            return;
        }

        setIsUpdating(true);
        try {
            const result = await updateRequisitionStage(
                stockRequestId,
                selectedStage,
                remarks || undefined,
            );

            if (result.error) {
                toast.error(result.error);
                return;
            }

            toast.success('Requisition stage updated successfully!');
            setRemarks('');
            onStageUpdate();
        } catch (error: any) {
            toast.error('Failed to update stage. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    // Check if user can approve (management roles)
    const canApprove = ['administrator', 'manager', 'general manager'].includes(
        userRole,
    );

    return (
        <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Update Requisition Stage
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
                            setSelectedStage(value as RequisitionStage)
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

                {canApprove && currentStage === RequisitionStage.CREATED && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800">
                            <strong>Management Action Required:</strong> This
                            requisition needs management approval before it can
                            proceed to the next stage.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
