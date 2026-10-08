'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AddManualItemFormProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const AddManualItemForm: React.FC<AddManualItemFormProps> = ({ onSubmit, onCancel, isLoading }) => {
    const [form, setForm] = useState({
        itemName: '',
        quantity: '',
        unit: '',
        remarks: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label className="text-sm font-medium">
                    Item Name <span className="text-destructive">*</span>
                </Label>
                <Input
                    placeholder="e.g., Disposable Packs"
                    className="h-12 bg-gray-50 border-none rounded-lg"
                    value={form.itemName}
                    onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Quantity <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        type="number"
                        placeholder="0"
                        className="h-12 bg-gray-50 border-none rounded-lg"
                        value={form.quantity}
                        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Unit <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        placeholder="e.g., pcs, kg, L"
                        className="h-12 bg-gray-50 border-none rounded-lg"
                        value={form.unit}
                        onChange={(e) => setForm({ ...form, unit: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-medium">Remarks</Label>
                <Textarea
                    placeholder="Optional notes..."
                    className="min-h-[100px] bg-gray-50 border-none rounded-lg"
                    value={form.remarks}
                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    className="h-12 px-8 border-gray-200 text-foreground font-medium rounded-lg"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className="h-12 px-8 bg-orion-blue hover:bg-orion-blue/90 text-white font-medium rounded-lg shadow-sm"
                    disabled={isLoading}
                >
                    {isLoading ? 'Adding...' : 'Add Item'}
                </Button>
            </div>
        </form>
    );
};

export default AddManualItemForm;
