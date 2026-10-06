'use client';

import BackButton from '@/components/buttons/back-button';
import Toast from '@/components/toast';
import { Spinner } from '@heroui/react';
import { useRouter } from 'nextjs-toploader/app';
import React, { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoImageOutline } from 'react-icons/io5';
import { SlCloudUpload } from 'react-icons/sl';
import { createRoom } from '../actions/room';
import { getRoomTypesByHotelId } from '../actions/roomType';
import { AddRoomModal } from './AddRoomModal';

export default function AddRoom() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const router = useRouter();
    const [, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [roomType, setRoomType] = useState<{ id: number; name: string }[]>(
        [],
    );
    const [selectedRoomType, setSelectedRoomType] = useState('');
    const [roomCapacity, setRoomCapacity] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const [roomPrice, setRoomPrice] = useState('');
    const [formattedPrice, setFormattedPrice] = useState('');
    const [roomFloors, setRoomFloors] = useState('');
    const [fetchTrigger, setFetchTrigger] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        const fetchRoomTypes = async () => {
            const result = (await getRoomTypesByHotelId()) as any;

            if (result && result.error) {
                console.error('Error:', result.error);
            } else if (result && result.data) {
                setRoomType(result.data);
            }
        };

        fetchRoomTypes();
    }, [fetchTrigger]);

    const handleRoomTypeCreated = () => {
        setFetchTrigger((prev) => !prev);
    };

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData();

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

        formData.append('coverImage', imageUrl);
        formData.append('roomType', selectedRoomType.toString());
        formData.append('roomCapacity', roomCapacity.toString());
        formData.append('roomNumber', roomNumber.toString());
        formData.append('roomPrice', roomPrice.toString());
        formData.append('roomFloors', roomFloors.toString());
        try {
            if (
                !selectedRoomType ||
                !roomCapacity ||
                !roomNumber ||
                !roomPrice ||
                !roomFloors
            ) {
                setError('All fields are required.');
                setIsLoading(false);
                return;
            }

            const response = await createRoom(formData);
            if (response) {
                if (response.message === 'Room created successfully') {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
                    router.push('/dashboard?frontoffice=room-system');
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
    const formatNumber = (num: string) => {
        const cleanNum = num.replace(/\D/g, '');
        if (cleanNum === '') return '';

        return parseInt(cleanNum, 10).toLocaleString();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/,/g, '');
        const formattedValue = formatNumber(rawValue);
        setRoomPrice(rawValue);
        setFormattedPrice(formattedValue);
    };

    const handleBlur = () => {
        if (roomPrice) {
            setFormattedPrice(`${formattedPrice}.00`);
        } else {
            setFormattedPrice('');
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <BackButton />
            <h1 className="text-2xl font-semibold text-gray-900">Add Room</h1>
            <p className="text-gray-500 mt-1">
                Manage who access to this workspace
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-8">
                        <div className="flex flex-col items-center justify-center">
                            {selectedImage ? (
                                <img
                                    src={selectedImage}
                                    alt="Uploaded room"
                                    className="w-32 h-32 object-cover rounded-lg"
                                />
                            ) : (
                                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-50">
                                    <IoImageOutline className="w-8 h-8 text-gray-400" />
                                </div>
                            )}
                            <p className="mt-4 text-gray-500">Upload Photo</p>
                        </div>
                    </div>

                    <label className="block">
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                        <div className="flex items-center justify-center py-3 px-4 border border-blue-400 rounded-lg text-blue-500 cursor-pointer hover:bg-gray-50">
                            <SlCloudUpload className="w-5 h-5 mr-2" />
                            Upload
                        </div>
                    </label>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-gray-600">
                                Select Room Type
                            </label>
                            <button
                                className="px-4 py-2 bg-orion-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                                onClick={openModal}
                            >
                                Add new room type
                            </button>
                            <AddRoomModal
                                isOpen={isModalOpen}
                                onClose={closeModal}
                                onRoomTypeCreated={handleRoomTypeCreated}
                            />
                        </div>

                        <select
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedRoomType}
                            onChange={(e) =>
                                setSelectedRoomType(e.target.value)
                            }
                        >
                            <option value="">Type of room</option>
                            {roomType.map((roomType) => (
                                <option key={roomType.id} value={roomType.id}>
                                    {roomType.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-600 mb-2">
                            Room Capacity
                        </label>
                        <input
                            type="text"
                            placeholder="What is the room capacity"
                            value={roomCapacity}
                            onChange={(e) => setRoomCapacity(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-600 mb-2">
                            Room Number
                        </label>
                        <input
                            type="text"
                            placeholder="What is the room number"
                            value={roomNumber}
                            onChange={(e) => setRoomNumber(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-600 mb-2">
                            Room Floor
                        </label>
                        <input
                            type="text"
                            placeholder="What floor is the room located"
                            value={roomFloors}
                            onChange={(e) => setRoomFloors(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-medium text-gray-900">
                        Add features ( optional )
                    </h3>
                    <p className="text-gray-500 mt-1">
                        Setting up shop allows the tailor reach more customers
                        on regalia
                    </p>

                    <div className="mt-4 flex gap-4">
                        <label className="flex items-center px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input type="checkbox" className="w-5 h-5 mr-2" />
                            Min Bar
                        </label>
                        <label className="flex items-center px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input type="checkbox" className="w-5 h-5 mr-2" />
                            Restaurant
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-gray-600 mb-2">
                        Room Price ( In Naria )
                    </label>
                    <input
                        type="text"
                        placeholder="What is the room price"
                        value={formattedPrice}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onFocus={() =>
                            setFormattedPrice(formatNumber(roomPrice))
                        }
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    disabled={isLoading}
                    type="submit"
                    className="w-full flex items-center justify-center gap-3 disabled:opacity-30 bg-[#007BFF] text-white py-3 px-4 rounded-lg hover:bg-[#4B96FE] transition-colors"
                >
                    {isLoading && (
                        <Spinner
                            classNames={{
                                circle1: 'text-white',
                                circle2: 'text-white',
                                spinnerBars: 'text-white',
                            }}
                        />
                    )}
                    Save
                </button>
            </form>
        </div>
    );
}
