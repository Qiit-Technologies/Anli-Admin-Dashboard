'use client';

import { getGuestListByHotelId } from '@/app/actions/guest';
import { createCleaningRequest } from '@/app/actions/houseKeeping';
import { getRoomByHotelId } from '@/app/actions/room';
import { getRoomTypesByHotelId } from '@/app/actions/roomType';
import RoomDetailModal from '@/app/room/RoomDetail';
import RoomTypeDetailModal from '@/app/room/RoomTypeDetails';
import { CleaningRequestDialog } from '@/components/house-keeping/common/modals/CleaningRequest';
import Toast from '@/components/toast';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Stat {
    title: string;
    value: number;
}

export default function RoomSystem() {
    const router = useRouter();
    const [rooms, setRooms] = useState<any>([]);
    const [roomTypes, setRoomTypes] = useState<any>([]);
    const handleNavigate = () => {
        router.push('/room');
    };
    const [showAllRooms, setShowAllRooms] = useState(false);
    const [showAllRoomTypes, setShowAllRoomTypes] = useState(false);
    const [guestList, setGuestList] = useState<any[]>([]);
    const [, setLoading] = useState(true);
    const [, setError] = useState<string | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
    const [selectedRoomType, setSelectedRoomType] = useState<any | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
    const displayedRooms =
        rooms.length > 0 && showAllRooms ? rooms : rooms.slice(0, 5);
    const displayedRoomTypes =
        rooms.length > 0 && showAllRoomTypes
            ? roomTypes
            : roomTypes.slice(0, 5);

    const occupiedRoom = rooms.filter((room: any) => room.isOccupied);

    useEffect(() => {
        const fetchGuestData = async () => {
            try {
                const result = await getGuestListByHotelId();
                if (result && result.data) {
                    setGuestList(result.data);
                }
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchGuestData();
    }, []);

    const checkedInGuests = guestList.filter(
        (guest) => guest.isCheckedIn === true,
    );
    const reservations = guestList.filter(
        (guest) => guest.isCheckedOut === true,
    );

    const stats: Stat[] = [
        { title: 'Amount of Rooms', value: rooms.length },
        { title: 'Check-Ins', value: checkedInGuests?.length },
        { title: 'Check-Outs', value: reservations?.length },
        { title: 'Room Type', value: roomTypes.length },
        { title: 'Occupied Rooms', value: occupiedRoom.length },
    ];

    useEffect(() => {
        const fetchRooms = async () => {
            const result = (await getRoomByHotelId()) as any;
            if (!result || result.error || !Array.isArray(result.data)) {
                setRooms([]);
                return;
            }
            setRooms(result.data);
        };

        const fetchRoomTypes = async () => {
            const result = (await getRoomTypesByHotelId()) as any;
            if (result && result.error) {
                console.log('Error:', result.error);
                setRoomTypes([]);
            } else if (Array.isArray(result?.data)) {
                setRoomTypes(result.data);
            } else {
                setRoomTypes([]);
            }
        };

        fetchRoomTypes();
        fetchRooms();
    }, []);

    const openModal = (roomtype: any) => {
        setSelectedRoomType(roomtype);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setSelectedRoomType(null);
    };

    const openRoomModal = (room: any) => {
        setSelectedRoom(room);
        setIsRoomModalOpen(true);
    };

    const closeRoomModal = () => {
        setIsRoomModalOpen(false);
        setSelectedRoom(null);
    };

    const handleCleaningRequest = async (data: {
        roomId: string;
        urgency: string;
        roomCondition: string;
    }) => {
        setError(null);
        setLoading(true);
        try {
            const response = await createCleaningRequest(
                data.roomId,
                data.urgency,
                data.roomCondition,
            );
            if (response) {
                if (
                    response.message ===
                    'Cleaning request created successfully!'
                ) {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
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
            setLoading(false);
        }
    };

    return (
        <>
            <div className="container mx-auto p-6 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {stats.map((stat) => (
                        <div
                            key={stat.title}
                            className="bg-white rounded-lg shadow p-4"
                        >
                            <h3 className="text-sm text-gray-600 font-medium">
                                {stat.title}
                            </h3>
                            <p className="text-2xl font-bold mt-2">
                                {stat.value}
                            </p>
                        </div>
                    ))}
                    <CleaningRequestDialog
                        onSubmit={handleCleaningRequest}
                        buttonComponent={
                            <button className="group bg-white transition-all shadow hover:bg-orion-blue rounded-lg p-4 flex items-center justify-between">
                                <h3 className="text-sm capitalize text-muted-foreground group-hover:text-white font-bold">
                                    Create Cleaning request
                                </h3>
                            </button>
                        }
                    />
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-xl font-bold">
                                Room and Room Type
                            </h2>
                            <p className="text-sm text-gray-500">
                                Manage who access to this workspace
                            </p>
                        </div>
                        <button
                            className="px-4 py-2 bg-orion-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                            onClick={handleNavigate}
                        >
                            Create
                        </button>
                    </div>

                    <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                        <div className="p-4 border rounded-lg">
                            <h2 className="text-lg font-semibold mb-4">
                                Rooms
                            </h2>
                            {rooms.length > 0 ? (
                                displayedRooms.map((room: any) => (
                                    <div
                                        key={room.id}
                                        className="flex items-center justify-between gap-4 mb-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            {room.coverImage ? (
                                                <img
                                                    src={room.coverImage} // Display the image if available
                                                    alt={
                                                        room?.roomtype?.name ||
                                                        'Room'
                                                    }
                                                    className="w-12 h-12 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-orange-100 rounded-lg" /> // Show the orange placeholder
                                            )}
                                            <div>
                                                <h3 className="font-medium">
                                                    {room?.roomtype?.name ||
                                                        'Unassigned'}
                                                </h3>
                                                <h3 className="font-medium">
                                                    {room.roomNumber}
                                                </h3>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openRoomModal(room)}
                                            className="text-blue hover:underline"
                                        >
                                            View full information
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">
                                    No rooms available.
                                </p>
                            )}
                            {rooms.length > 3 && (
                                <button
                                    className="text-blue-500 hover:underline"
                                    onClick={() =>
                                        setShowAllRooms(!showAllRooms)
                                    }
                                >
                                    {showAllRooms ? 'See Less' : 'See More'}
                                </button>
                            )}
                        </div>

                        <div className="p-4 border rounded-lg">
                            <h2 className="text-lg font-semibold mb-4">
                                Room Types
                            </h2>
                            {roomTypes.length > 0 ? (
                                displayedRoomTypes.map((room: any) => (
                                    <div
                                        key={room.id}
                                        className="flex items-center justify-between mb-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-orange-100 rounded-lg" />

                                            <div>
                                                <h3 className="font-medium">
                                                    {room.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {room.description}
                                                </p>
                                                <p className="text-sm font-medium mt-1">
                                                    {room.price}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openModal(room)}
                                            className="text-blue hover:underline"
                                        >
                                            View full information
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">
                                    No room types available.
                                </p>
                            )}
                            {roomTypes.length > 3 && (
                                <button
                                    className="text-blue-500 hover:underline"
                                    onClick={() =>
                                        setShowAllRoomTypes(!showAllRoomTypes)
                                    }
                                >
                                    {showAllRoomTypes ? 'See Less' : 'See More'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <RoomTypeDetailModal
                isOpen={isOpen}
                closeModal={closeModal}
                selectedRoom={selectedRoomType}
            />
            <RoomDetailModal
                isOpen={isRoomModalOpen}
                closeModal={closeRoomModal}
                selectedRoom={selectedRoom}
            />
        </>
    );
}
