'use client';

import { useEffect, useState } from 'react';

import { deleteRoom, editRoom, markRoomStatus } from '@/app/actions/room';
import { getRoomTypesByHotelId } from '@/app/actions/roomType';
import Toast from '@/components/toast';
import toast from 'react-hot-toast';

import NewReservationModal from '@/app/dashboard/components/FrontOffice/dashboard/ReservationModal';
import { RoomDetails } from '@/app/dashboard/components/Main/stay-view/modals/edit-room';
import CustomLoader from '@/components/Loader';
import React from 'react';
import { CalendarNavigation } from './calendar-navigation';
import { GridHeader } from './grid-header';
import { Header } from './header';
import { RoomOptionsMenu } from './room-options-menu';
import { RoomRow } from './room-row';
import { BookingStatus } from './types';
const DAYS_TO_SHOW = 18;

export default function StayViewSystem() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<{
        roomType: string;
        roomNumber: string;
        date: Date;
        guestDetails: any;
    } | null>(null);
    const [roomOptionsMenu, setRoomOptionsMenu] = useState<{
        isOpen: boolean;
        position: { x: number; y: number };
        roomId: string;
        roomTypeId: string;
        roomType: string;
        roomNumber: string;
        currentStatus: BookingStatus;
        roomPrice?: string;
        roomFloor?: string;
        roomCapacity?: string;
    }>({
        isOpen: false,
        position: { x: 0, y: 0 },
        roomId: '',
        roomTypeId: '',
        roomType: '',
        roomNumber: '',
        currentStatus: '' as BookingStatus,
        roomPrice: '',
        roomFloor: '',
        roomCapacity: '',
    });
    const [roomTypes, setRoomTypes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        const fetchRoomTypes = async () => {
            setIsLoading(true);
            try {
                const result = (await getRoomTypesByHotelId()) as any;

                if (result?.error) {
                    console.log('Error:', result.error);
                } else if (result?.data) {
                    setRoomTypes(result.data);
                }
            } catch (error: any) {
                console.error('Fetching room types failed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoomTypes();
    }, []);

    const moveDate = (days: number) => {
        setCurrentDate((prevDate) => {
            const newDate = new Date(prevDate);
            newDate.setDate(newDate.getDate() + days);
            return newDate;
        });
    };

    const handleCellClick = (
        roomType: string,
        roomNumber: string,
        date: Date,
        guestDetails: any,
    ) => {
        setSelectedRoom({
            roomType,
            roomNumber,
            date,
            guestDetails,
        });
        setIsModalOpen(true);
    };

    const handleRoomOptions = (
        e: React.MouseEvent,
        roomId: string,
        roomTypeId: string,
        roomType: string,
        roomNumber: string,
        currentStatus: BookingStatus,
        roomPrice?: string,
        roomFloor?: string,
        roomCapacity?: string,
    ) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        setRoomOptionsMenu({
            isOpen: true,
            position: {
                x: rect.left,
                y: rect.bottom + window.scrollY,
            },
            roomId,
            roomTypeId,
            roomType,
            roomNumber,
            currentStatus,
            roomPrice,
            roomFloor,
            roomCapacity,
        });
    };

    const handleRoomAction = async (
        action: string,
        roomNumber?: string,
        status?: string,
        roomDetails?: RoomDetails,
        roomId?: string,
    ) => {
        if (action === 'clean') {
            const response = await markRoomStatus(
                Number(roomNumber),
                status as string,
            );
            if (response) {
                if (response.message === 'Room marked successfully') {
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
        } else if (action === 'edit' && roomDetails) {
            const response = await editRoom(String(roomId), roomDetails);
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
        } else if (action === 'delete' && roomId) {
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
        }
    };

    const handleDateSelect = (date: string) => {
        const newDate = new Date(date);
        setSelectedDate(newDate);
        setCurrentDate(newDate);
        setShowDatePicker(false);
    };

    return (
        <div className="h-screen bg-white">
            {isLoading ? (
                <CustomLoader />
            ) : (
                <>
                    <Header
                        selectedDate={selectedDate}
                        showDatePicker={showDatePicker}
                        onDatePickerToggle={() =>
                            setShowDatePicker(!showDatePicker)
                        }
                        onDateSelect={handleDateSelect}
                    />

                    <CalendarNavigation
                        currentDate={currentDate}
                        roomTypes={roomTypes}
                        onDateChange={moveDate}
                    />

                    <div className="border-y overflow-auto">
                        <div className="">
                            <div className="inline-block min-w-full">
                                <div
                                    className="w-full"
                                    style={{
                                        minWidth: `calc(200px + ${DAYS_TO_SHOW * 100}px)`,
                                    }}
                                >
                                    <table className="w-full border-collapse">
                                        <GridHeader
                                            currentDate={currentDate}
                                            daysToShow={DAYS_TO_SHOW}
                                        />
                                        <tbody>
                                            {roomTypes.map((roomType) => (
                                                <React.Fragment
                                                    key={roomType.id}
                                                >
                                                    <tr>
                                                        <td className="p-2 border-t border-b border-gray-300 sticky left-0 z-10 font-medium">
                                                            {roomType.name}
                                                        </td>
                                                        <td className="bg-white"></td>
                                                    </tr>
                                                    {roomType.rooms.map(
                                                        (room: any) => (
                                                            <RoomRow
                                                                key={room.id}
                                                                room={room}
                                                                roomType={
                                                                    roomType
                                                                }
                                                                currentDate={
                                                                    currentDate
                                                                }
                                                                daysToShow={
                                                                    DAYS_TO_SHOW
                                                                }
                                                                onRoomOptions={
                                                                    handleRoomOptions
                                                                }
                                                                onCellClick={
                                                                    handleCellClick
                                                                }
                                                                roomId={room.id}
                                                                roomTypeId={
                                                                    roomType.id
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {selectedRoom && (
                        <NewReservationModal
                            open={isModalOpen}
                            onClose={() => {
                                setIsModalOpen(false);
                                setSelectedRoom(null);
                            }}
                            onSubmit={() => console.log('')}
                            roomType={selectedRoom.roomType}
                            roomNumber={selectedRoom.roomNumber}
                            date={selectedRoom.date}
                            guestDetails={selectedRoom.guestDetails}
                            roomTypeId={roomOptionsMenu.roomTypeId}
                        />
                    )}

                    <RoomOptionsMenu
                        isOpen={roomOptionsMenu.isOpen}
                        onClose={() =>
                            setRoomOptionsMenu((prev) => ({
                                ...prev,
                                isOpen: false,
                            }))
                        }
                        currentStatus={roomOptionsMenu.currentStatus}
                        position={roomOptionsMenu.position}
                        roomType={roomOptionsMenu.roomType}
                        roomNumber={roomOptionsMenu.roomNumber}
                        onAction={handleRoomAction}
                        roomCapacity={roomOptionsMenu.roomCapacity}
                        roomFloor={roomOptionsMenu.roomFloor}
                        roomPrice={roomOptionsMenu.roomPrice}
                        roomId={roomOptionsMenu.roomId}
                        roomTypeId={roomOptionsMenu.roomTypeId}
                    />

                    {roomOptionsMenu.isOpen && (
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() =>
                                setRoomOptionsMenu((prev) => ({
                                    ...prev,
                                    isOpen: false,
                                }))
                            }
                        />
                    )}
                </>
            )}
        </div>
    );
}
