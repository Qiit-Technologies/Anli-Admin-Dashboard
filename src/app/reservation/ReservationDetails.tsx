import React, { useEffect, useMemo, useState } from 'react';
import { fetchHotelDetailsById } from '../actions/hotel';
import { getRoomTypesByHotelId } from '../actions/roomType';

interface ReservationDetailsProps {
    data: {
        roomtype?: any;
        startDate?: string;
        endDate?: string;
        startTime?: string;
        endTime?: string;
        nights?: any;
    };
    onChange: (newData: any) => void;
}

const ReservationDetails = ({ data, onChange }: ReservationDetailsProps) => {
    const [formData, setFormData] = useState(data);
    const [roomType, setRoomType] = useState<{ id: number; name: string }[]>(
        [],
    );
    const [fetchTrigger] = useState(false);
    const [hotelName, setHotelName] = useState('');

    useEffect(() => {
        setFormData(data);
    }, [data]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        const updatedData = { ...formData, [name]: value };

        if (name === 'startDate' || name === 'endDate') {
            const start = new Date(
                name === 'startDate' ? value : updatedData.startDate || '',
            );
            const end = new Date(
                name === 'endDate' ? value : updatedData.endDate || '',
            );

            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                const diffTime = end.getTime() - start.getTime();
                const nights = Math.max(
                    Math.ceil(diffTime / (1000 * 60 * 60 * 24)),
                    0,
                );
                updatedData.nights = nights;
            } else {
                updatedData.nights = 0;
            }
        }

        setFormData(updatedData);
        onChange(updatedData);
    };

    const selectedRoom = useMemo(() => {
        return roomType.find((room) => room.name === data.roomtype) || null;
    }, [roomType, formData.roomtype]);

    useEffect(() => {
        const fetchRoomTypes = async () => {
            const result = (await getRoomTypesByHotelId()) as any;
            if (result && result.error) {
                console.error('Error:', result.error);
            } else if (result && result.data) {
                setRoomType(result.data);
            }
        };

        const fetchHotelDetails = async () => {
            const result = await fetchHotelDetailsById();
            if (result && result.error) {
                console.error('Error:', result.error);
            } else if (result && result.data) {
                setHotelName(result.data.name);
            }
        };

        fetchHotelDetails();
        fetchRoomTypes();
    }, [fetchTrigger]);

    return (
        <form className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Reservation Details</h2>

            <div className="mb-4">
                <label className="block text-sm font-medium">Property</label>
                <input
                    type="text"
                    name="property"
                    className="border p-2 rounded w-full"
                    value={hotelName}
                    disabled
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium">Room Type</label>
                <select
                    name="roomtype"
                    className="border p-2 rounded w-full"
                    value={selectedRoom?.id || formData.roomtype || ''}
                    onChange={handleInputChange}
                >
                    <option value="">Type of room</option>
                    {roomType.map((roomtype) => (
                        <option key={roomtype.id} value={roomtype.id}>
                            {roomtype.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium">
                        Start Date
                    </label>
                    <input
                        type="date"
                        name="startDate"
                        className="border p-2 rounded w-full"
                        value={formData.startDate}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">
                        End Date
                    </label>
                    <input
                        type="date"
                        name="endDate"
                        className="border p-2 rounded w-full"
                        value={formData.endDate}
                        onChange={handleInputChange}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium">
                        Start Time
                    </label>
                    <input
                        type="time"
                        name="startTime"
                        className="border p-2 rounded w-full"
                        value={formData.startTime}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">
                        End Time
                    </label>
                    <input
                        type="time"
                        name="endTime"
                        className="border p-2 rounded w-full"
                        value={formData.endTime}
                        onChange={handleInputChange}
                    />
                </div>
            </div>
        </form>
    );
};

export default ReservationDetails;
