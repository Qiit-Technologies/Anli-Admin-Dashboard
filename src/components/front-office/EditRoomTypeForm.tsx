'use client';
import { editRoomType } from '@/app/actions/roomType';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogTrigger } from '@radix-ui/react-dialog';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Toast from '../toast';
import { FaRegEdit } from 'react-icons/fa';

export type RoomTypeDetails = {
    roomTypeId?: string;
    name: string;
    description: string;
};

type EditRoomTypeModalProps = {
    name: string;
    description: string;
    roomTypeId?: string;
};

const EditRoomTypeForm: React.FC<EditRoomTypeModalProps> = ({
    name,
    description,
    roomTypeId,
}) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState<RoomTypeDetails>({
        name: name ?? '',
        description: description ?? '',
        roomTypeId,
    });

    useEffect(() => {
        setFormData({
            name: name || '',
            description: description || '',
            roomTypeId,
        });
    }, [name, description, roomTypeId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await editRoomType(String(roomTypeId), formData);
            if (response) {
                if (response.message === 'Room type updated successfully') {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
                    setShowEditModal(false);
                    if (window) {
                        window.location.reload();
                    }
                } else {
                    toast.custom(() => (
                        <Toast
                            title="Error!"
                            description={
                                response.message || 'Failed to update room type'
                            }
                            type="error"
                        />
                    ));
                }
            }
        } catch (error: any) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="An unexpected error occurred"
                    type="error"
                />
            ));
        }
    };

    return (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
            <DialogTrigger asChild>
                <button
                    onClick={() => setShowEditModal(true)}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    title="Edit Room Type"
                >
                    <FaRegEdit className="w-4 h-4" />
                </button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Room Type</DialogTitle>
                    <DialogDescription>
                        Make changes to the room type details below.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="mt-2">
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Room Type Name</Label>
                            <Input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowEditModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-orion-blue hover:bg-orion-blue/80"
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditRoomTypeForm;
