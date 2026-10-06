import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'nextjs-toploader/app';
import React, { useEffect, useState } from 'react';

export type RoomDetails = {
    roomId?: string;
    roomType: string;
    roomCapacity?: string;
    roomNumber: string;
    roomFloor?: string;
    roomPrice?: string;
    roomTypeId?: string;
};

type EditRoomModalProps = {
    isOpen: boolean;
    onClose: () => void;
    roomType: string;
    roomNumber: string;
    roomFloor?: string;
    roomPrice?: string;
    roomCapacity?: string;
    onSave: (updatedRoom: RoomDetails) => void;
    roomId?: string;
    roomTypeId?: string;
};

const EditRoomModal: React.FC<EditRoomModalProps> = ({
    isOpen,
    onClose,
    roomType,
    roomNumber,
    roomFloor,
    roomPrice,
    roomCapacity,
    onSave,
    roomId,
    roomTypeId,
}) => {
    const router = useRouter();
    const [formData, setFormData] = useState<RoomDetails>({
        roomType: roomType ?? '',
        roomNumber: roomNumber?.toString() ?? '',
        roomFloor: roomFloor?.toString() ?? '',
        roomPrice: roomPrice?.toString() ?? '',
        roomCapacity: roomCapacity?.toString() ?? '',
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSave) {
            onSave({ ...formData, roomId, roomTypeId });
        }
        router.refresh();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-full max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-medium text-gray-900">
                        Edit Room Details
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="mt-2">
                    <div className="grid gap-4 py-4">
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
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-blue text-white">
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditRoomModal;
