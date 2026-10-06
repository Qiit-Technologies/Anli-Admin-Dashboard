'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Bed } from 'lucide-react';
import { channelManagerService } from '@/services/channelManager';
import { cn } from '@/lib/utils';
import { endOfWeek, format } from 'date-fns';
import { getRoomTypesByHotelId } from '@/app/actions/roomType';
import { getRoomByHotelId } from '@/app/actions/room';
import { getGuestListByHotelId } from '@/app/actions/guest';
import useHotel from '@/hooks/useHotel';

interface AvailabilityCalendarProps {
    integrationId: number;
    hotelId: number;
}

interface RoomAvailability {
    roomTypeId: number;
    roomTypeName: string;
    date: string;
    availableRooms: number;
    totalRooms: number;
    rate: number;
    currency: string;
    isAvailable: boolean;
}

interface RoomType {
    id: number;
    name: string;
    description: string;
}

interface Room {
    id: number;
    roomNumber: number;
    roomtype: number;
    price: number;
    status: string;
    floor: number;
    roomCapacity: number;
    coverImage: string;
}

interface Guest {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    room: {
        id: number;
        roomNumber: number;
        roomtype: number;
    };
    startDate: string;
    endDate: string;
    isCheckedIn: boolean;
    isCheckedOut: boolean;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
    integrationId,
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
    const [currentWeek, setCurrentWeek] = useState(new Date());

    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [availability, setAvailability] = useState<RoomAvailability[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingCell, setEditingCell] = useState<{
        roomTypeId: number;
        date: string;
    } | null>(null);
    const [editValues, setEditValues] = useState({
        availableRooms: 0,
        rate: 0,
    });

    const { organization: hotel } = useHotel();

    useEffect(() => {
        if (hotel?.id) {
            loadRoomTypes();
            loadRooms();
            loadGuests();
        }
    }, [hotel?.id]);

    useEffect(() => {
        if (roomTypes.length > 0 && rooms.length > 0) {
            loadAvailability();
        }
    }, [
        integrationId,
        currentMonth,
        currentWeek,
        viewMode,
        roomTypes,
        rooms,
        guests,
    ]);

    const loadRoomTypes = async () => {
        try {
            const result = await getRoomTypesByHotelId();
            if (result && typeof result !== 'boolean' && result.data) {
                setRoomTypes(result.data);
            } else {
                console.error('Failed to load room types:', result);
            }
        } catch (err) {
            console.error('Failed to load room types:', err);
        }
    };

    const loadRooms = async () => {
        try {
            const result = await getRoomByHotelId();
            if (result && result.data) {
                setRooms(result.data);
            } else {
                console.error('Failed to load rooms:', result);
            }
        } catch (err) {
            console.error('Failed to load rooms:', err);
        }
    };

    const loadGuests = async () => {
        try {
            const result = await getGuestListByHotelId();
            if (result && result.data) {
                setGuests(result.data);
            } else {
                console.error('Failed to load guests:', result);
            }
        } catch (err) {
            console.error('Failed to load guests:', err);
        }
    };

    const loadAvailability = async () => {
        try {
            setLoading(true);
            let startDate: Date, endDate: Date;

            if (viewMode === 'month') {
                startDate = new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    1,
                );
                endDate = new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1,
                    0,
                );
            } else {
                startDate = new Date(currentWeek);
                endDate = endOfWeek(currentWeek);
            }

            // Calculate real availability based on rooms and bookings
            const calculatedAvailability: RoomAvailability[] = [];
            const currentDate = new Date(startDate);

            while (currentDate <= endDate) {
                const dateStr = currentDate.toISOString().split('T')[0];

                roomTypes.forEach((roomType) => {
                    // Get all rooms of this type
                    const roomsOfType = rooms.filter(
                        (room) => room.roomtype === roomType.id,
                    );
                    const totalRooms = roomsOfType.length;

                    // Get bookings for this room type on this date
                    const bookingsOnDate = guests.filter((guest) => {
                        if (!guest.room || guest.isCheckedOut) return false;

                        const guestRoom = rooms.find(
                            (r) => r.id === guest.room.id,
                        );
                        if (!guestRoom || guestRoom.roomtype !== roomType.id)
                            return false;

                        const start = new Date(guest.startDate);
                        const end = new Date(guest.endDate);
                        const checkDate = new Date(dateStr);

                        return checkDate >= start && checkDate < end;
                    });

                    const occupiedRooms = bookingsOnDate.length;
                    const availableRooms = Math.max(
                        0,
                        totalRooms - occupiedRooms,
                    );

                    // Get average rate for this room type
                    const roomRates = roomsOfType
                        .map((room) => room.price)
                        .filter((price) => price > 0);
                    const averageRate =
                        roomRates.length > 0
                            ? roomRates.reduce((sum, price) => sum + price, 0) /
                              roomRates.length
                            : 0;

                    calculatedAvailability.push({
                        roomTypeId: roomType.id,
                        roomTypeName: roomType.name,
                        date: dateStr,
                        availableRooms,
                        totalRooms,
                        rate: Math.round(averageRate),
                        currency: 'NGN', // This could be made dynamic based on hotel settings
                        isAvailable: availableRooms > 0,
                    });
                });

                currentDate.setDate(currentDate.getDate() + 1);
            }

            setAvailability(calculatedAvailability);
        } catch (err) {
            console.error('Failed to load availability:', err);
        } finally {
            setLoading(false);
        }
    };

    const goToPreviousMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
        );
    };

    const goToNextMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
        );
    };

    const goToPreviousWeek = () => {
        const newWeek = new Date(currentWeek);
        newWeek.setDate(newWeek.getDate() - 7);
        setCurrentWeek(newWeek);
    };

    const goToNextWeek = () => {
        const newWeek = new Date(currentWeek);
        newWeek.setDate(newWeek.getDate() + 7);
        setCurrentWeek(newWeek);
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentMonth(today);
        setCurrentWeek(today);
    };

    const getCurrentViewDates = () => {
        if (viewMode === 'month') {
            const startDate = new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                1,
            );
            const endDate = new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() + 1,
                0,
            );
            const dates = [];
            const currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                dates.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
            }
            return dates;
        } else {
            const startDate = new Date(currentWeek);
            const endDate = endOfWeek(currentWeek);
            const dates = [];
            const currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                dates.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
            }
            return dates;
        }
    };

    const handleCellClick = (roomTypeId: number, date: string) => {
        const existingData = availability.find(
            (a) => a.roomTypeId === roomTypeId && a.date === date,
        );
        if (existingData) {
            setEditValues({
                availableRooms: existingData.availableRooms,
                rate: existingData.rate,
            });
            setEditingCell({ roomTypeId, date });
        }
    };

    const handleSaveEdit = async () => {
        if (!editingCell) return;

        try {
            // Update local state first
            setAvailability((prev) =>
                prev.map((item) =>
                    item.roomTypeId === editingCell.roomTypeId &&
                    item.date === editingCell.date
                        ? {
                              ...item,
                              availableRooms: editValues.availableRooms,
                              rate: editValues.rate,
                          }
                        : item,
                ),
            );

            // Save to backend via channel manager service
            try {
                await channelManagerService.updateAvailability(
                    integrationId,
                    editingCell.roomTypeId,
                    editingCell.date,
                    {
                        availableRooms: editValues.availableRooms,
                        rate: editValues.rate,
                    },
                );
            } catch (error: any) {
                console.error('Failed to update via channel manager:', error);
                // Revert local state if backend update fails
                loadAvailability();
            }

            setEditingCell(null);
        } catch (err) {
            console.error('Failed to update availability:', err);
        }
    };

    const getAvailabilityForDate = (roomTypeId: number, date: string) => {
        return availability.find(
            (a) => a.roomTypeId === roomTypeId && a.date === date,
        );
    };

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const getViewTitle = () => {
        if (viewMode === 'month') {
            return format(currentMonth, 'MMMM yyyy');
        } else {
            const weekStart = currentWeek;
            const weekEnd = endOfWeek(weekStart);
            return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
        }
    };

    const getPreviousHandler = () => {
        if (viewMode === 'month') return goToPreviousMonth;
        return goToPreviousWeek;
    };

    const getNextHandler = () => {
        if (viewMode === 'month') return goToNextMonth;
        return goToNextWeek;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!hotel?.id) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-gray-500">
                        Loading hotel information...
                    </p>
                </div>
            </div>
        );
    }

    if (roomTypes.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-gray-500">
                        No room types found for this hotel.
                    </p>
                    <p className="text-sm text-gray-400">
                        Please add room types first.
                    </p>
                </div>
            </div>
        );
    }

    const dates = getCurrentViewDates();

    return (
        <div className="flex flex-col w-full z-30 h-full relative bg-white">
            {/* Header - Matching StayView design */}
            <div className="flex flex-col lg:flex-row gap-4 justify-start lg:justify-between items-start lg:items-center my-4 px-6">
                <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold">
                        {getViewTitle()}
                    </h2>
                    {viewMode === 'week' && (
                        <span className="text-xs text-gray-500">(7 days)</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 border rounded-lg p-1 bg-gray-50">
                        <Button
                            variant={viewMode === 'month' ? 'default' : 'ghost'}
                            className={cn(
                                viewMode === 'month'
                                    ? 'bg-hexbrand text-white'
                                    : 'text-gray-700',
                                'hover:bg-hexbrand hover:text-white',
                            )}
                            size="sm"
                            onClick={() => setViewMode('month')}
                        >
                            Month
                        </Button>
                        <Button
                            variant={viewMode === 'week' ? 'default' : 'ghost'}
                            size="sm"
                            className={cn(
                                viewMode === 'week'
                                    ? 'bg-hexbrand text-white'
                                    : 'text-gray-700',
                                'hover:bg-hexbrand hover:text-white',
                            )}
                            onClick={() => setViewMode('week')}
                        >
                            Week
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-hexbrand shadow-sm flex items-center gap-3 text-white rounded-lg px-4 py-[6px]">
                            <button
                                className="border rounded-full"
                                onClick={getPreviousHandler()}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                className="border border-transparent hover:border-white rounded-lg px-2"
                                onClick={goToToday}
                            >
                                Today
                            </button>
                            <button
                                className="border rounded-full"
                                onClick={getNextHandler()}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <hr />

            {/* Calendar Grid - Matching StayView layout */}
            <div className="overflow-x-auto border-b">
                <div className="min-w-max">
                    {/* Calendar Header */}
                    <div className="flex border-b bg-gray-50">
                        <div className="w-48 p-3 font-medium text-sm border-r">
                            Room Type
                        </div>
                        {dates.map((date, index) => (
                            <div
                                key={index}
                                className="w-24 p-3 text-center border-r text-sm font-medium"
                            >
                                <div className="font-semibold">
                                    {date.getDate()}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {format(date, 'EEE')}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Room Type Rows */}
                    {roomTypes.map((roomType) => (
                        <div key={roomType.id} className="flex border-b">
                            <div className="w-48 p-3 border-r bg-gray-50">
                                <div className="flex items-center space-x-2">
                                    <Bed className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">
                                        {roomType.name}
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        {
                                            rooms.filter(
                                                (r) =>
                                                    r.roomtype === roomType.id,
                                            ).length
                                        }{' '}
                                        rooms
                                    </Badge>
                                </div>
                            </div>
                            {dates.map((date, index) => {
                                const dateStr = formatDate(date);
                                const availabilityData = getAvailabilityForDate(
                                    roomType.id,
                                    dateStr,
                                );
                                const isEditing =
                                    editingCell?.roomTypeId === roomType.id &&
                                    editingCell?.date === dateStr;

                                return (
                                    <div
                                        key={index}
                                        className="w-24 p-2 border-r"
                                    >
                                        {isEditing ? (
                                            <div className="space-y-2">
                                                <div>
                                                    <Label className="text-xs">
                                                        Available
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        value={
                                                            editValues.availableRooms
                                                        }
                                                        onChange={(e) =>
                                                            setEditValues(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    availableRooms:
                                                                        parseInt(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ) || 0,
                                                                }),
                                                            )
                                                        }
                                                        className="h-6 text-xs"
                                                        min={0}
                                                        max={
                                                            rooms.filter(
                                                                (r) =>
                                                                    r.roomtype ===
                                                                    roomType.id,
                                                            ).length
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">
                                                        Rate
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        value={editValues.rate}
                                                        onChange={(e) =>
                                                            setEditValues(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    rate:
                                                                        parseInt(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ) || 0,
                                                                }),
                                                            )
                                                        }
                                                        className="h-6 text-xs"
                                                        min={0}
                                                    />
                                                </div>
                                                <div className="flex space-x-1">
                                                    <Button
                                                        size="sm"
                                                        onClick={handleSaveEdit}
                                                        className="h-6 text-xs"
                                                    >
                                                        Save
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            setEditingCell(null)
                                                        }
                                                        className="h-6 text-xs"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className="cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-blue-200"
                                                onClick={() =>
                                                    handleCellClick(
                                                        roomType.id,
                                                        dateStr,
                                                    )
                                                }
                                            >
                                                {availabilityData ? (
                                                    <>
                                                        <div className="text-sm font-medium">
                                                            {
                                                                availabilityData.availableRooms
                                                            }
                                                            /
                                                            {
                                                                availabilityData.totalRooms
                                                            }
                                                        </div>
                                                        <div className="text-xs text-green-600 font-medium">
                                                            ₦
                                                            {
                                                                availabilityData.rate
                                                            }
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {availabilityData.isAvailable
                                                                ? 'Available'
                                                                : 'Unavailable'}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-xs text-gray-400">
                                                        No data
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Legend - Matching StayView */}
            <div className="sticky bottom-0 inset-x-0 border-t flex items-center gap-6 bg-white z-40 shadow-md p-4">
                <div className="font-semibold">Availability Guide:</div>
                <ul className="flex gap-4 text-sm">
                    <li className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-green-700 rounded-full inline-block"></span>
                        <span>Available</span>
                    </li>
                    <li className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-orange-700 rounded-full inline-block"></span>
                        <span>Low Availability</span>
                    </li>
                    <li className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-red-700 rounded-full inline-block"></span>
                        <span>Unavailable</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};
