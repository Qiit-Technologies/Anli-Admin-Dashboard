import { useRouter } from 'nextjs-toploader/app';
import React, { useState, useEffect } from 'react';

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-medium text-gray-900">
                    Edit Room Details
                </h3>
                <form onSubmit={handleSubmit} className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Room Type
                    </label>
                    <input
                        type="text"
                        name="roomType"
                        value={formData.roomType}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                    <label className="block text-sm font-medium text-gray-700 mt-2">
                        Room Capacity
                    </label>
                    <input
                        type="number"
                        name="roomCapacity"
                        value={formData.roomCapacity}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                    <label className="block text-sm font-medium text-gray-700 mt-2">
                        Room Number
                    </label>
                    <input
                        type="number"
                        name="roomNumber"
                        value={formData.roomNumber}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                    <label className="block text-sm font-medium text-gray-700 mt-2">
                        Room Floor
                    </label>
                    <input
                        type="number"
                        name="roomFloor"
                        value={formData.roomFloor}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                    <label className="block text-sm font-medium text-gray-700 mt-2">
                        Room Price (In Naira)
                    </label>
                    <input
                        type="number"
                        name="roomPrice"
                        value={formData.roomPrice}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                    <div className="mt-4 flex justify-between gap-2">
                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue text-white rounded-md"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditRoomModal;
