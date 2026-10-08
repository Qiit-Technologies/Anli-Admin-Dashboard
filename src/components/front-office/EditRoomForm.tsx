'use client';
import { editRoom } from '@/app/actions/room';
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
import ImageUpload from './common/Form/UploadImage';
import { FaRegEdit } from 'react-icons/fa';

export type RoomDetails = {
    roomId?: string;
    roomType: string;
    roomCapacity?: string;
    roomNumber: string;
    roomFloor?: string;
    roomPrice?: string;
    roomTypeId?: string;
    coverImage?: string;
};

type EditRoomModalProps = {
    roomType: string;
    roomNumber: string;
    roomFloor?: string;
    roomPrice?: string;
    roomCapacity?: string;
    roomId?: string;
    roomTypeId?: string;
};

const EditRoomForm: React.FC<EditRoomModalProps> = ({
    roomType,
    roomNumber,
    roomFloor,
    roomPrice,
    roomCapacity,
    roomId,
    roomTypeId,
}) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState<RoomDetails>({
        roomType: roomType ?? '',
        roomNumber: roomNumber?.toString() ?? '',
        roomFloor: roomFloor?.toString() ?? '',
        roomPrice: roomPrice?.toString() ?? '',
        roomCapacity: roomCapacity?.toString() ?? '',
        roomId,
        roomTypeId,
    });

    useEffect(() => {
        setFormData({
            roomType: roomType || '',
            roomNumber: roomNumber?.toString() || '',
            roomFloor: roomFloor?.toString() || '',
            roomPrice: roomPrice?.toString() || '',
            roomCapacity: roomCapacity?.toString() || '',
        });
    }, [roomType, roomNumber, roomFloor, roomPrice, roomCapacity]);

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
            let imageUrl = '';
            if (selectedImage) {
                const imageFormData = new FormData();
                imageFormData.append('file', selectedImage);
                imageFormData.append('upload_preset', 'anli_default');

                try {
                    const uploadResponse = await fetch(
                        'https://api.cloudinary.com/v1_1/dhkwjizxu/image/upload',
                        {
                            method: 'POST',
                            body: imageFormData,
                        },
                    );
                    const imageData = await uploadResponse.json();
                    imageUrl = imageData.secure_url;
                } catch (error: any) {
                    toast.custom(() => (
                        <Toast
                            title="Error!"
                            description="Image upload failed"
                            type="error"
                        />
                    ));
                    return;
                }
            }

            const roomDetails: RoomDetails = {
                ...formData,
                roomId,
                roomTypeId,
                coverImage: imageUrl || undefined,
            };
            const response = await editRoom(String(), roomDetails);
            if (response) {
                if (response.message === 'Room updated successfully') {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
                    if (window) {
                        window.location.reload();
                    }
                } else {
                    toast.custom(() => (
                        <Toast
                            title="Error!"
                            description={response.message}
                            type="error"
                        />
                    ));
                }
            }
        } catch (error: any) {
            console.error(error);
        }
    };

    const handleImageUpload = (imageUrl: string) => {
        if (imageUrl) {
            setSelectedImage(imageUrl);
        }
    };

    return (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
            <DialogTrigger asChild>
                <button
                    onClick={() => setShowEditModal(true)}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    title="Edit Room"
                >
                    <FaRegEdit className="w-4 h-4" />
                </button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Room</DialogTitle>
                    <DialogDescription>
                        Make changes to the room details below.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="mt-2">
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Room Image</Label>
                            <ImageUpload onImageUpload={handleImageUpload} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="roomType">Room Type</Label>
                            <Input
                                id="roomType"
                                type="text"
                                name="roomType"
                                value={formData.roomType}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="roomCapacity">Room Capacity</Label>
                            <Input
                                id="roomCapacity"
                                type="number"
                                name="roomCapacity"
                                value={formData.roomCapacity}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="roomNumber">Room Number</Label>
                            <Input
                                id="roomNumber"
                                type="number"
                                name="roomNumber"
                                value={formData.roomNumber}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="roomFloor">Room Floor</Label>
                            <Input
                                id="roomFloor"
                                type="number"
                                name="roomFloor"
                                value={formData.roomFloor}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="roomPrice">
                                Room Price (In Naira)
                            </Label>
                            <Input
                                id="roomPrice"
                                type="number"
                                name="roomPrice"
                                value={formData.roomPrice}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-4 flex justify-between gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowEditModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-orion-blue text-white"
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditRoomForm;
