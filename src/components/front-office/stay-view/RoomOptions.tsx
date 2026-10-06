'use client';

import { getRoomBookings } from '@/app/actions/room';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import type React from 'react';
import { useState } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

import { Bed, Brush, Edit, History, LucideIcon } from 'lucide-react';
import { BookingHistoryModal } from './modals/booking-history';
import { DeleteRoomModal } from './modals/delete-room';
import EditRoomModal, { RoomDetails } from './modals/edit-room';
import { RoomStatusModal } from './modals/room-status';

type BookingStatus = 'BOOKED' | 'DIRTY' | 'AVAIL';

interface RoomOptionsProps {
    children: React.ReactNode;
    roomId: string;
    roomTypeId: string;
    roomType: string;
    roomNumber: string;
    currentStatus: BookingStatus;
    currentBooking?: {
        guestName: string;
        checkIn: Date;
        checkOut: Date;
    };
    roomPrice?: string;
    roomFloor?: string;
    roomCapacity?: string;
    onAction: (
        action: string,
        roomNumber?: string,
        status?: string,
        details?: RoomDetails,
        roomId?: string,
    ) => void;
}

interface MenuOption {
    label: string;
    icon: LucideIcon;
    action: string;
    description: string;
    color?: string;
    disabled?: boolean;
    showWarning?: boolean;
    group: 'status' | 'actions' | 'management' | 'danger';
}

const RoomOptions = ({
    children,
    roomId,
    roomTypeId,
    roomType,
    roomNumber,
    currentStatus,
    currentBooking,
    roomPrice,
    roomFloor,
    roomCapacity,
    onAction,
}: RoomOptionsProps) => {
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [roomBookings, setRoomBookings] = useState();
    const [, setSelectedRoom] = useState<RoomDetails>({
        roomId: '',
        roomType: '',
        roomNumber: '',
        roomCapacity: '',
        roomFloor: '',
        roomPrice: '',
        roomTypeId: '',
    });

    const options: MenuOption[] = [
        {
            label: 'Room Status',
            icon: Bed,
            action: 'status',
            description: 'View room status details',
            color: 'text-blue-600',
            group: 'status',
        },
        {
            label: 'Booking History',
            icon: History,
            action: 'history',
            description: 'View past bookings',
            color: 'text-green-600',
            group: 'status',
        },
        {
            label:
                currentStatus === 'DIRTY'
                    ? 'Mark as Available'
                    : 'Mark for Cleaning',
            icon: Brush,
            action: 'clean',
            description:
                currentStatus === 'DIRTY'
                    ? 'Set room as available'
                    : 'Schedule room cleaning',
            color: 'text-yellow-600',
            group: 'actions',
        },
        {
            label: 'Edit Room',
            icon: Edit,
            action: 'edit',
            description: 'Modify room details',
            group: 'management',
        },
        // {
        //     label: 'Delete Room',
        //     icon: Trash,
        //     action: 'delete',
        //     description: 'Remove room from system',
        //     color: 'text-red-600',
        //     showWarning: true,
        //     disabled: currentStatus !== 'AVAIL',
        //     group: 'danger',
        // },
    ];

    const groupedOptions = {
        status: options.filter((opt) => opt.group === 'status'),
        actions: options.filter((opt) => opt.group === 'actions'),
        management: options.filter((opt) => opt.group === 'management'),
        danger: options.filter((opt) => opt.group === 'danger'),
    };

    const handleOptionClick = async (option: MenuOption, e?: React.MouseEvent) => {
        if (option.disabled) return;
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        switch (option.action) {
            case 'status':
                setShowStatusModal(true);
                break;
            case 'delete':
                if (!roomId) return;
                setShowDeleteModal(true);
                break;
            case 'edit':
                setSelectedRoom({
                    roomId,
                    roomType,
                    roomNumber,
                    roomCapacity,
                    roomFloor,
                    roomPrice,
                    roomTypeId,
                });
                setShowEditModal(true);
                break;
            case 'history':
                setShowHistoryModal(true);
                await fetchBookingsForRoom(Number(roomNumber));
                break;
            case 'clean':
                onAction(
                    option.action,
                    roomNumber,
                    currentStatus === 'DIRTY' ? 'AVAIL' : 'DIRTY',
                );
                break;
            default:
                onAction(option.action);
        }
    };

    const fetchBookingsForRoom = async (roomNumber: number) => {
        const response = await getRoomBookings(Number(roomNumber));
        if (response.data) {
            setRoomBookings(response.data);
        }
    };

    const mockMaintenanceData = {
        lastCheck: new Date(2024, 1, 1),
        nextCheck: new Date(2024, 4, 1),
        issues: [
            'Light bulb needs replacement in bathroom',
            'AC filter due for cleaning',
        ],
    };

    return (
        <>
            <Popover>
                <PopoverTrigger asChild>{children}</PopoverTrigger>
                <PopoverContent
                    className="w-64 overflow-hidden z-30 p-0 rounded-lg shadow-lg border"
                    align="start"
                >
                    <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                        <div>
                            <div className="font-medium">{roomType}</div>
                            <div className="text-sm text-gray-500">
                                Room {roomNumber}
                                <span
                                    className={`ml-2 ${
                                        currentStatus === 'BOOKED'
                                            ? 'text-green-600'
                                            : currentStatus === 'AVAIL'
                                              ? 'text-blue'
                                              : 'text-red-600'
                                    }`}
                                >
                                    • {currentStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="py-1">
                        {Object.entries(groupedOptions).map(
                            ([group, options]) => (
                                <div key={group}>
                                    {options.map((option) => (
                                        <button
                                            key={option.action}
                                            type="button"
                                            className={`w-full px-4 py-2 text-left flex items-center gap-3 group
                                        ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (!option.disabled) {
                                                    handleOptionClick(option, e);
                                                }
                                            }}
                                            disabled={option.disabled}
                                        >
                                            <option.icon
                                                className={`w-4 h-4 ${option.color || 'text-gray-500'}`}
                                            />
                                            <div className="flex-1">
                                                <div
                                                    className={
                                                        option.color ||
                                                        'text-gray-700'
                                                    }
                                                >
                                                    {option.label}
                                                    {option.showWarning && (
                                                        <FaExclamationTriangle className="inline ml-2 w-3 h-3" />
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 group-hover:text-gray-700">
                                                    {option.description}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                    {group !== 'danger' && (
                                        <div className="border-t my-1" />
                                    )}
                                </div>
                            ),
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            <RoomStatusModal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                roomType={roomType}
                roomNumber={roomNumber}
                status={currentStatus}
                currentBooking={currentBooking}
                lastCleaned={new Date(2024, 1, 15)}
                maintenance={mockMaintenanceData}
            />

            <DeleteRoomModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={() => onAction('delete', '', '', undefined, roomId)}
                roomType={roomType}
                roomNumber={roomNumber}
                roomId={roomId}
            />

            <BookingHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                roomType={roomType}
                roomNumber={roomNumber}
                bookingHistory={roomBookings ?? []}
            />

            {showEditModal && (
                <EditRoomModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSave={(updatedRoom) =>
                        onAction('edit', '', '', updatedRoom)
                    }
                    roomCapacity={roomCapacity}
                    roomFloor={roomFloor}
                    roomPrice={roomPrice}
                    roomId={roomId}
                    roomTypeId={roomTypeId}
                    roomType={roomType}
                    roomNumber={roomNumber}
                />
            )}
        </>
    );
};

export default RoomOptions;
