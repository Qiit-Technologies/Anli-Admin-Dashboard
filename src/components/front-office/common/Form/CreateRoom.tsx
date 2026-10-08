'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { createRoom } from '@/app/actions/room';

import { createRoomType } from '@/app/actions/roomType';
import { InputField, SelectField } from '@/components/common/Form';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import useRoomTypes from '@/hooks/useRoomTypes';
import { Check } from 'lucide-react';
import { mutate } from 'swr';
import ImageUpload from './UploadImage';

const roomTypeSchema = z.object({
    roomName: z.string().min(1, { message: 'Room name is required' }),
    description: z.string().optional(),
});

type RoomTypeFormValues = z.infer<typeof roomTypeSchema>;

const roomSchema = z.object({
    roomType: z.string().min(1, { message: 'Room type is required' }),
    roomCapacity: z.string().min(1, { message: 'Room capacity is required' }),
    roomNumber: z.string().min(1, { message: 'Room number is required' }),
    roomFloors: z.string().optional(),
    roomPrice: z.string().min(1, { message: 'Room price is required' }),
});

type RoomFormValues = z.infer<typeof roomSchema>;

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

interface CreateRoomTypeFormProps {
    onClose?: () => void;
}

export const CreateRoomTypeForm = ({ onClose }: CreateRoomTypeFormProps) => {
    const [formData, setFormData] = useState<RoomTypeFormValues>({
        roomName: '',
        description: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (field: keyof RoomTypeFormValues, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Clear error when field is updated
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleRoomTypeSelect = (room: string) => {
        handleInputChange('roomName', room);
    };

    const handleMutate = () => {
        mutate('/roomTypes');
        mutate('/hotelRooms');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            roomTypeSchema.parse(formData);
            setErrors({});

            setIsLoading(true);

            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.roomName);
            formDataToSend.append('description', formData.description || '');

            const response = await createRoomType(formDataToSend);

            if (response) {
                if (response.message === 'Room type created successfully!') {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));

                    setFormData({
                        roomName: '',
                        description: '',
                    });
                    onClose?.();
                    handleMutate();
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
            if (error instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};
                error.errors.forEach((err) => {
                    if (err.path) {
                        newErrors[err.path[0]] = err.message;
                    }
                });
                setErrors(newErrors);
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description="An unexpected error occurred"
                        type="error"
                    />
                ));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div>
                <h1 className="font-semibold text-lg">Create Room Type</h1>
                <span className="text-sm text-muted-foreground">
                    Create room types and descriptions
                </span>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4 mt-4">
                    <div className="flex flex-col gap-2">
                        <InputField
                            id="roomName"
                            label="Room Name"
                            placeholder="Name room type"
                            type="text"
                            name="roomName"
                            value={formData.roomName}
                            onChange={(e) =>
                                handleInputChange('roomName', e.target.value)
                            }
                        />
                        {errors.roomName && (
                            <div className="text-red-500 text-sm">
                                {errors.roomName}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <InputField
                            id="description"
                            label="Description (Optional)"
                            placeholder="Add additional details about the room type"
                            type="text"
                            name="description"
                            value={formData.description || ''}
                            onChange={(e) =>
                                handleInputChange('description', e.target.value)
                            }
                        />
                        {errors.description && (
                            <div className="text-red-500 text-sm">
                                {errors.description}
                            </div>
                        )}
                    </div>

                    <div className="mt-4">
                        <h3 className="text-lg font-bold mb-2">Type of Room</h3>
                        <p className="text-gray-500 text-sm mb-4">
                            These are some examples of room types. You can
                            select one or add a custom name.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {roomTypes.map((room) => (
                                <button
                                    key={room}
                                    type="button"
                                    onClick={() => handleRoomTypeSelect(room)}
                                    className={`p-4 relative text-sm rounded-lg border ${
                                        formData.roomName === room
                                            ? 'border-orion-blue text-orion-blue'
                                            : 'text-gray-700'
                                    }`}
                                >
                                    {formData.roomName === room && (
                                        <div className="absolute -top-2 -right-2 bg-orion-blue rounded-full w-6 h-6">
                                            <div className="flex items-center justify-center w-full h-full">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                    )}
                                    {room}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-orion-blue text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            {isLoading ? 'Creating...' : 'Create Room Type'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

interface RoomType {
    id: number;
    name: string;
}
interface CreateRoomFormProps {
    roomTypes: RoomType[];
    onClose?: () => void;
}
const CreateRoomForm = ({ roomTypes = [], onClose }: CreateRoomFormProps) => {
    const [formData, setFormData] = useState<RoomFormValues>({
        roomType: '',
        roomCapacity: '',
        roomNumber: '',
        roomFloors: '',
        roomPrice: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [formattedPrice, setFormattedPrice] = useState('');

    const handleInputChange = (field: keyof RoomFormValues, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Clear error when field is updated
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleImageUpload = (imageUrl: string) => {
        if (imageUrl) {
            setSelectedImage(imageUrl);
        }
    };

    const formatNumber = (num: string) => {
        const cleanNum = num.replace(/\D/g, '');
        if (cleanNum === '') return '';
        return parseInt(cleanNum, 10).toLocaleString();
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/,/g, '');
        const formattedValue = formatNumber(rawValue);
        handleInputChange('roomPrice', rawValue);
        setFormattedPrice(formattedValue);
    };

    const handleMutate = () => {
        mutate('/roomTypes');
        mutate('/hotelRooms');
    };

    // const handlePriceBlur = () => {
    //     if (formData.roomPrice) {
    //         setFormattedPrice(`${formattedPrice}.00`);
    //     } else {
    //         setFormattedPrice('');
    //     }
    // };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Validate form data
            roomSchema.parse(formData);
            setErrors({});

            setIsLoading(true);

            const formDataToSend = new FormData();

            // Handle image upload if needed
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
                    setIsLoading(false);
                    return;
                }
            }

            formDataToSend.append('coverImage', imageUrl);
            formDataToSend.append('roomType', formData.roomType);
            formDataToSend.append('roomCapacity', formData.roomCapacity);
            formDataToSend.append('roomNumber', formData.roomNumber);
            formDataToSend.append('roomPrice', formData.roomPrice);
            formDataToSend.append('roomFloors', formData.roomFloors ?? '');

            const response = await createRoom(formDataToSend);

            if (response) {
                if (response.message === 'Room created successfully') {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
                    handleMutate();
                    onClose?.();
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
            if (error instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};
                error.errors.forEach((err) => {
                    if (err.path) {
                        newErrors[err.path[0]] = err.message;
                    }
                });
                setErrors(newErrors);
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description="An unexpected error occurred"
                        type="error"
                    />
                ));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div>
                <h1 className="font-semibold text-lg">Add Room</h1>
                <span className="text-sm text-muted-foreground">
                    Create rooms for your hotel
                </span>
            </div>

            <form className="mt-6" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4 mt-4">
                    {/* Room Type Selection */}
                    <div className="flex flex-col gap-2">
                        <SelectField
                            id="roomType"
                            name="roomType"
                            label="Room Type"
                            value={formData.roomType}
                            onValueChange={(value) =>
                                handleInputChange('roomType', value)
                            }
                            options={(roomTypes ?? []).map((room) => ({
                                value: room.id.toString(),
                                label: room.name,
                            }))}
                            placeholder="Select a room type"
                        />
                        {errors.roomType && (
                            <div className="text-red-500 text-sm">
                                {errors.roomType}
                            </div>
                        )}
                    </div>

                    {/* Room Capacity */}
                    <div className="flex flex-col gap-2">
                        <InputField
                            id="roomCapacity"
                            name="roomCapacity"
                            label="Room Capacity"
                            placeholder="What is the room capacity"
                            type="text"
                            value={formData.roomCapacity}
                            onChange={(e) =>
                                handleInputChange(
                                    'roomCapacity',
                                    e.target.value,
                                )
                            }
                        />
                        {errors.roomCapacity && (
                            <div className="text-red-500 text-sm">
                                {errors.roomCapacity}
                            </div>
                        )}
                    </div>

                    {/* Room Number */}
                    <div className="flex flex-col gap-2">
                        <InputField
                            id="roomNumber"
                            name="roomNumber"
                            label="Room Number"
                            placeholder="What is the room number"
                            type="text"
                            value={formData.roomNumber}
                            onChange={(e) =>
                                handleInputChange('roomNumber', e.target.value)
                            }
                        />
                        {errors.roomNumber && (
                            <div className="text-red-500 text-sm">
                                {errors.roomNumber}
                            </div>
                        )}
                    </div>

                    {/* Room Floor */}
                    <div className="flex flex-col gap-2">
                        <InputField
                            id="roomFloors"
                            name="roomFloors"
                            label="Room Floor"
                            placeholder="What floor is the room located"
                            type="text"
                            value={formData.roomFloors}
                            onChange={(e) =>
                                handleInputChange('roomFloors', e.target.value)
                            }
                        />
                        {errors.roomFloors && (
                            <div className="text-red-500 text-sm">
                                {errors.roomFloors}
                            </div>
                        )}
                    </div>

                    {/* Features Section */}
                    {/* <div className="mt-4">
                        <h3 className="text-xl font-bold mb-2">
                            Add features (optional)
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Select additional features for this room
                        </p>

                        <div className="flex gap-4">
                            <label className="flex items-center px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 mr-2"
                                />
                                Mini Bar
                            </label>
                            <label className="flex items-center px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 mr-2"
                                />
                                Restaurant
                            </label>
                        </div>
                    </div> */}

                    {/* Room Price */}
                    <div className="flex flex-col gap-2">
                        <InputField
                            id="roomPrice"
                            name="roomPrice"
                            label="Room Price (In Naira)"
                            placeholder="What is the room price"
                            type="text"
                            value={formattedPrice}
                            onChange={handlePriceChange}
                            //onBlur={handlePriceBlur}
                        />
                        {errors.roomPrice && (
                            <div className="text-red-500 text-sm">
                                {errors.roomPrice}
                            </div>
                        )}
                    </div>

                    {/* Image Upload Section */}
                    <div className="mt-2">
                        <ImageUpload onImageUpload={handleImageUpload} />
                    </div>

                    <div className="mt-6">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-orion-blue h-12 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            {isLoading ? 'Creating Room...' : 'Create Room'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

const CreateRoomFlow = ({ onClose }: { onClose?: () => void }) => {
    const { roomTypes } = useRoomTypes();

    if (!roomTypes) {
        return <div>Loading...</div>;
    }
    return <CreateRoomForm onClose={onClose} roomTypes={roomTypes} />;
};

export default CreateRoomFlow;
