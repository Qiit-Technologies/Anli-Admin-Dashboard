import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { createRoomType } from '@/app/actions/roomType';
import toast from 'react-hot-toast';
import Toast from '@/components/toast';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRoomTypeCreated: () => void;
}

const roomTypes = [
    'Master bedroom',
    'Lounge Area',
    'Executive Suite',
    'Deluxe Room',
    'Single Room',
    'Penthouse Suite',
    'Junior Suite',
    'Double Room',
    'Family Room',
];

export function AddRoomModal({
    isOpen,
    onClose,
    onRoomTypeCreated,
}: ModalProps) {
    const [roomName, setRoomName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedRoomType, setSelectedRoomType] = useState<string | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleRoomTypeSelect = (room: string) => {
        setSelectedRoomType(room);
        setRoomName(room);
    };

    const handleSubmit = async () => {
        if (!roomName) {
            setError('Room name is required');
            return;
        }

        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('name', roomName);
        formData.append('description', description);

        try {
            const response = await createRoomType(formData);
            if (response) {
                if (response.message === 'Room type created successfully!') {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
                    onClose();
                    onRoomTypeCreated();
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
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative">
                <button
                    onClick={onClose}
                    aria-label="Close modal"
                    className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                >
                    <IoClose size={20} />
                </button>

                <h2 className="text-2xl font-bold mb-2">Create Room Type</h2>
                <p className="text-gray-500 mb-6">
                    Select a room type or add your own description.
                </p>

                {error && (
                    <div className="text-red-500 text-sm mb-4">{error}</div>
                )}

                <div>
                    <label className="block text-gray-500 mb-2">
                        Room Name
                    </label>
                    <input
                        type="text"
                        placeholder="Name room type"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="mt-6">
                    <label className="block text-gray-500 mb-2">
                        Description (Optional)
                    </label>
                    <textarea
                        placeholder="Add additional details about the room type"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="mt-6">
                    <h3 className="text-xl font-bold mb-2">Type of Room</h3>
                    <p className="text-gray-500 mb-4">
                        These are some examples of room types. You can select
                        one or add a custom name.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {roomTypes.map((room) => (
                            <button
                                key={room}
                                type="button"
                                onClick={() => handleRoomTypeSelect(room)}
                                className={`px-4 py-3 rounded-lg border ${
                                    selectedRoomType === room
                                        ? 'bg-blue-500 text-white'
                                        : 'text-gray-700'
                                }`}
                            >
                                {room}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className={`bg-orion-blue w-full text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors ${
                            isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {isLoading ? 'Saving...' : 'Done'}
                    </button>
                </div>
            </div>
        </div>
    );
}
