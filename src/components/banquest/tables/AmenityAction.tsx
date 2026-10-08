'use client';

import {
    deleteBanquetInventoryItem,
    updateBanquetInventoryItem,
} from '@/app/actions/banquet-inventory';
import AddAmenityForm, {
    AddAmenityFormProps,
} from '@/components/banquest/common/form/add-amenity';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useSWRConfig } from 'swr';
import { AmenitiesExtended } from '../types';

function parseTypeForForm(type: string) {
    const parts = type.split(' — ');
    if (parts.length >= 2) {
        return { id: parts[0], name: parts.slice(1).join(' — ') };
    }
    return { id: String(type), name: type };
}

const AmenityAction = ({ amenity }: { amenity: AmenitiesExtended }) => {
    const { mutate } = useSWRConfig();
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const { id: formId, name: formName } = parseTypeForForm(amenity.type);

    const refresh = () => {
        mutate('/banquet/inventory');
        mutate('/banquet/inventory/stats');
    };

    const handleUpdate = async (data: AddAmenityFormProps) => {
        const result = await updateBanquetInventoryItem(amenity.id, {
            type: data.id.trim()
                ? `${data.id.trim()} — ${data.name.trim()}`
                : data.name.trim(),
            quantity: data.qauntity,
            unitCost: data.amount,
        });

        if (result.error) {
            toast.custom(() => (
                <Toast title="Error" description={result.error} type="error" />
            ));
            return;
        }

        toast.custom(() => (
            <Toast
                title="Success"
                description="Amenity updated successfully"
                type="success"
            />
        ));
        setEditOpen(false);
        refresh();
    };

    const handleDelete = async () => {
        setDeleting(true);
        const result = await deleteBanquetInventoryItem(amenity.id);
        setDeleting(false);

        if (result.error) {
            toast.custom(() => (
                <Toast title="Error" description={result.error} type="error" />
            ));
            return;
        }

        toast.custom(() => (
            <Toast
                title="Success"
                description="Amenity deleted successfully"
                type="success"
            />
        ));
        setDeleteOpen(false);
        refresh();
    };

    return (
        <div className="flex items-center gap-2">
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                    <Button variant="link" className="text-orion-blue px-0">
                        Edit
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Amenity</DialogTitle>
                        <DialogDescription>
                            Update amenity inventory details
                        </DialogDescription>
                    </DialogHeader>
                    <AddAmenityForm
                        mode="edit"
                        initialData={{
                            id: formId,
                            name: formName,
                            qauntity: amenity.quantity,
                            amount: amenity.unitCost ?? 0,
                        }}
                        onSubmit={handleUpdate}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                    <Button variant="link" className="text-destructive px-0">
                        Delete
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete amenity</DialogTitle>
                        <DialogDescription>
                            Remove this amenity from inventory?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={deleting}
                            onClick={handleDelete}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AmenityAction;
