'use client';

import { getGuestListByHotelId } from '@/app/actions/guest';
import { createCleaningRequest } from '@/app/actions/houseKeeping';
import { deleteRoom } from '@/app/actions/room';
import { deleteRoomType } from '@/app/actions/roomType';
import RoomDetailModal from '@/app/room/RoomDetail';
import RoomTypeDetailModal from '@/app/room/RoomTypeDetails';
import { CustomSheet } from '@/components/common/CustomSheet';
import UploadForm from '@/components/common/Form/Upload';
import {
    HeaderActions,
    PageHeader,
    PageHeadertitle,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CreateRoomFlow, {
    CreateRoomTypeForm,
} from '@/components/front-office/common/Form/CreateRoom';
import EditRoomForm from '@/components/front-office/EditRoomForm';
import EditRoomTypeForm from '@/components/front-office/EditRoomTypeForm';
import { CleaningRequestDialog } from '@/components/house-keeping/common/modals/CleaningRequest';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/context/useUser';
import useHotel from '@/hooks/useHotel';
import { useRooms } from '@/hooks/useRooms';
import RoomManagementSkeleton from '@/components/front-office/room-management/RoomManagementSkeleton';
import useRoomTypes from '@/hooks/useRoomTypes';
import {
    Bed,
    Building2,
    Calendar,
    Eye,
    Hotel,
    Plus,
    Settings,
    Trash2,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Stat {
    title: string;
    value: number;
    icon: any;
    color: string;
}

export default function RoomSystem() {
    const { user } = useUser();
    const { roomTypes } = useRoomTypes();
    const { rooms, isLoading: roomsLoading } = useRooms();
    const safeRooms = Array.isArray(rooms) ? rooms : [];
    const safeRoomTypes = Array.isArray(roomTypes) ? roomTypes : [];
    const { organization } = useHotel();
    const showRoman = organization?.id === 10;
    const [createRoomOpen, setCreateRoomOpen] = useState(false);
    const [roomTypeOpen, setRoomTypeOpen] = useState(false);
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
        safeRooms.length > 0 && showAllRooms ? safeRooms : safeRooms.slice(0, 5);
    const displayedRoomTypes =
        safeRoomTypes.length > 0 && showAllRoomTypes
            ? safeRoomTypes
            : safeRoomTypes.slice(0, 5);
    const occupiedRoom = safeRooms.filter((room: any) => room.isOccupied);

    useEffect(() => {
        const fetchGuestData = async () => {
            try {
                const result = await getGuestListByHotelId();
                if (result && Array.isArray(result.data)) {
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
        {
            title: 'Total Rooms',
            value: safeRooms.length,
            icon: Building2,
            color: 'bg-blue-500',
        },
        {
            title: 'Check-Ins',
            value: checkedInGuests?.length,
            icon: Users,
            color: 'bg-green-500',
        },
        {
            title: 'Check-Outs',
            value: reservations?.length,
            icon: Calendar,
            color: 'bg-orange-500',
        },
        {
            title: 'Room Types',
            value: safeRoomTypes.length,
            icon: Bed,
            color: 'bg-purple-500',
        },
        {
            title: 'Occupied Rooms',
            value: occupiedRoom.length,
            icon: Hotel,
            color: 'bg-red-500',
        },
    ];

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

    const handleDeleteRoom = async (roomId: string) => {
        const response = await deleteRoom(String(roomId));
        if (response) {
            if (response.message === 'Room deleted successfully') {
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
    };

    const handleDeleteRoomType = async (roomTypeId: string) => {
        const response = await deleteRoomType(String(roomTypeId));
        if (response) {
            if (response.message === 'Room type deleted successfully') {
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
    };

    // Show skeleton while loading rooms
    if (roomsLoading) {
        return <RoomManagementSkeleton />;
    }

    return (
        <div className="flex flex-col h-full overflow-auto bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="Room Management"
                    subtitle={`Welcome to your room management system.`}
                />
                <HeaderActions />
            </PageHeader>
            <PageWrapper>
                <div className="container mx-auto p-6 px-0 space-y-8">
                    {/* Clean Stats Section */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {stats.map((stat) => {
                            const IconComponent = stat.icon;
                            return (
                                <div
                                    key={stat.title}
                                    className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">
                                                {stat.title}
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                                {stat.value}
                                            </p>
                                        </div>
                                        <div className="bg-gray-100 p-3 rounded-lg">
                                            <IconComponent className="w-5 h-5 text-gray-600" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Clean Main Content Section */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Room Management
                                </h2>
                                <p className="text-gray-600">
                                    Manage your hotel rooms and room types
                                    efficiently
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <CleaningRequestDialog
                                    onSubmit={handleCleaningRequest}
                                    buttonComponent={
                                        <Button
                                            variant={'outline'}
                                            className="px-3 py-2 text-sm border-orion-blue text-orion-blue rounded-md hover:bg-orion-blue hover:text-white transition-colors"
                                        >
                                            <Settings className="w-4 h-4 mr-2" />
                                            Cleaning Request
                                        </Button>
                                    }
                                />
                                {user?.roles.name === 'administrator' && (
                                    <CustomSheet
                                        noTitle
                                        title="Create Room Type"
                                        open={roomTypeOpen}
                                        setOpen={setRoomTypeOpen}
                                        trigger={
                                            <Button
                                                variant={'outline'}
                                                className="px-3 py-2 text-sm border-orion-blue text-orion-blue rounded-md hover:bg-orion-blue hover:text-white transition-colors"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Room Type
                                            </Button>
                                        }
                                    >
                                        <div className="border rounded-lg p-4">
                                            <Tabs
                                                defaultValue="single"
                                                className="w-full"
                                            >
                                                <TabsList className="w-full border-b px-0 justify-start gap-4 rounded-none bg-transparent">
                                                    {['single', 'bulk'].map(
                                                        (tab) => (
                                                            <TabsTrigger
                                                                className="text-base px-0 data-[state=active]:text-hexbrand data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-hexbrand"
                                                                key={tab}
                                                                value={tab}
                                                            >
                                                                {tab}
                                                            </TabsTrigger>
                                                        ),
                                                    )}
                                                </TabsList>
                                                <TabsContent value="single">
                                                    <div className="mt-4">
                                                        <CreateRoomTypeForm
                                                            onClose={() =>
                                                                setRoomTypeOpen(
                                                                    false,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </TabsContent>
                                                <TabsContent value="bulk">
                                                    <UploadForm
                                                        closeBus={() =>
                                                            setRoomTypeOpen(
                                                                false,
                                                            )
                                                        }
                                                    />
                                                </TabsContent>
                                            </Tabs>
                                        </div>
                                    </CustomSheet>
                                )}
                                {user?.roles.name === 'administrator' && (
                                    <CustomSheet
                                        noTitle
                                        title="Create Room"
                                        open={createRoomOpen}
                                        setOpen={setCreateRoomOpen}
                                        trigger={
                                            <Button className="px-3 py-2 text-sm bg-orion-blue text-white rounded-md hover:bg-orion-blue/90 transition-colors flex items-center">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Create New Room
                                            </Button>
                                        }
                                    >
                                        <CreateRoomFlow
                                            onClose={() => {
                                                setCreateRoomOpen(false);
                                            }}
                                        />
                                    </CustomSheet>
                                )}
                            </div>
                        </div>

                        <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
                            {/* Clean Rooms Section */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                                            Rooms
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            Manage individual room details
                                        </p>
                                    </div>
                                    <div className="bg-blue-100 p-2 rounded-lg">
                                        <Bed className="w-5 h-5 text-blue-600" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {safeRooms.length > 0 ? (
                                        displayedRooms.map((room: any) => (
                                            <div
                                                key={room.id}
                                                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        {room.coverImage ? (
                                                            <img
                                                                src={
                                                                    room.coverImage
                                                                }
                                                                alt={
                                                                    room
                                                                        ?.roomtype
                                                                        ?.name ||
                                                                    'Room'
                                                                }
                                                                className="w-12 h-12 rounded-lg object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                                                                <Bed className="w-6 h-6 text-orange-600" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">
                                                                {
                                                                    room
                                                                        ?.roomtype
                                                                        ?.name ||
                                                                    'Unassigned'
                                                                }
                                                            </h3>
                                                            <p className="text-sm text-gray-600">
                                                                Room{' '}
                                                                {room.roomNumber ??
                                                                    'N/A'}
                                                                {showRoman &&
                                                                    room.roomNumberRoman &&
                                                                    ` (${room.roomNumberRoman})`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() =>
                                                                openRoomModal(
                                                                    room,
                                                                )
                                                            }
                                                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>

                                                        {user?.roles.name ===
                                                            'administrator' && (
                                                            <EditRoomForm
                                                                roomCapacity={
                                                                    room.roomCapacity
                                                                }
                                                                roomFloor={
                                                                    room.floor
                                                                }
                                                                roomPrice={
                                                                    room.price
                                                                }
                                                                roomId={room.id}
                                                                roomTypeId={
                                                                    room
                                                                        ?.roomtype
                                                                        ?.id
                                                                }
                                                                roomType={
                                                                    room
                                                                        ?.roomtype
                                                                        ?.name ||
                                                                    'Unassigned'
                                                                }
                                                                roomNumber={
                                                                    room.roomNumber ??
                                                                    'N/A'
                                                                }
                                                            />
                                                        )}
                                                        {user?.roles.name ===
                                                            'administrator' && (
                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteRoom(
                                                                        room.id,
                                                                    )
                                                                }
                                                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                title="Delete Room"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <Bed className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-500">
                                                No rooms available.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {safeRooms.length > 3 && (
                                    <button
                                        className="w-full mt-4 text-orion-blue hover:text-orion-blue/80 font-medium py-2 rounded-lg hover:bg-blue-50 transition-all duration-300"
                                        onClick={() =>
                                            setShowAllRooms(!showAllRooms)
                                        }
                                    >
                                        {showAllRooms ? 'See Less' : 'See More'}
                                    </button>
                                )}
                            </div>

                            {/* Clean Room Types Section */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                                            Room Types
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            Manage room categories and pricing
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-orion-blue to-orion-blue/20 p-2 rounded-lg">
                                        <Hotel className="w-5 h-5 text-white" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {safeRoomTypes.length > 0 ? (
                                        displayedRoomTypes.map((room: any) => (
                                            <div
                                                key={room.id}
                                                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-orion-blue to-orion-blue/20 rounded-lg flex items-center justify-center">
                                                            <Hotel className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">
                                                                {room.name}
                                                            </h3>
                                                            <p className="text-sm text-gray-600">
                                                                {
                                                                    room.description
                                                                }
                                                            </p>
                                                            <p className="text-sm font-medium text-green-600 mt-1">
                                                                {room.price}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() =>
                                                                openModal(room)
                                                            }
                                                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>

                                                        {user?.roles.name ===
                                                            'administrator' && (
                                                            <EditRoomTypeForm
                                                                name={room.name}
                                                                description={
                                                                    room.description
                                                                }
                                                                roomTypeId={
                                                                    room.id
                                                                }
                                                            />
                                                        )}
                                                        {user?.roles.name ===
                                                            'administrator' && (
                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteRoomType(
                                                                        room.id,
                                                                    )
                                                                }
                                                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                title="Delete Room Type"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <Hotel className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-500">
                                                No room types available.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {safeRoomTypes.length > 3 && (
                                    <button
                                        className="w-full mt-4 text-orion-blue hover:text-orion-blue/80 font-medium py-2 rounded-lg hover:bg-blue-50 transition-all duration-300"
                                        onClick={() =>
                                            setShowAllRoomTypes(
                                                !showAllRoomTypes,
                                            )
                                        }
                                    >
                                        {showAllRoomTypes
                                            ? 'See Less'
                                            : 'See More'}
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
            </PageWrapper>
        </div>
    );
}
