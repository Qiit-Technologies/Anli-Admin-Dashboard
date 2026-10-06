import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import Toast from '../toast';
import { createGoodsReceipt } from '@/app/actions/stock';

interface CreateGRNModalProps {
    open: boolean;
    purchaseOrder: any;
    onClose: () => void;
    onSuccess?: () => void;
}

const CreateGRNModal = ({
    open,
    purchaseOrder,
    onClose,
    onSuccess,
}: CreateGRNModalProps) => {
    const [quantities, setQuantities] = useState<{ [itemId: number]: number }>(
        () =>
            Object.fromEntries(
                (purchaseOrder.items || []).map((item: any) => [
                    item.id,
                    item.quantity,
                ]),
            ),
    );
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleQuantityChange = (itemId: number, value: string) => {
        setQuantities((prev) => ({ ...prev, [itemId]: Number(value) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const items = purchaseOrder.items.map((item: any) => ({
                purchaseOrderItemId: item.id,
                quantityReceived: quantities[item.id],
            }));
            const payload = {
                purchaseOrderId: purchaseOrder.id,
                notes,
                items,
            };
            const res = await createGoodsReceipt(payload);
            console.log(res);
            if (!res.data) throw new Error('Failed to create GRN');

            // Handle the new response format with message property
            if (res.data.message) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={res.data.message}
                        type="success"
                    />
                ));
            } else {
                // Fallback for legacy response format
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Goods Receipt Note created successfully!"
                        type="success"
                    />
                ));
            }
            if (onSuccess) onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to create GRN');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent>
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-lg mx-auto"
                >
                    <DialogHeader>
                        <DialogTitle>Create Goods Receipt Note</DialogTitle>
                    </DialogHeader>
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">Notes</label>
                        <Input
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Enter any notes..."
                        />
                    </div>
                    <div className="mb-4">
                        <table className="w-full border">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 border">Item</th>
                                    <th className="p-2 border">Ordered Qty</th>
                                    <th className="p-2 border">Received Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchaseOrder.items?.map((item: any) => (
                                    <tr key={item.id}>
                                        <td className="p-2 border">
                                            {item.item?.name || item.item}
                                        </td>
                                        <td className="p-2 border">
                                            {item.quantity}
                                        </td>
                                        <td className="p-2 border">
                                            <Input
                                                type="number"
                                                min={0}
                                                max={item.quantity}
                                                value={
                                                    quantities[item.id] ?? ''
                                                }
                                                onChange={(e) =>
                                                    handleQuantityChange(
                                                        item.id,
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-24"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {error && <div className="text-red-500 mb-2">{error}</div>}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-brand text-white"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create GRN'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateGRNModal;
