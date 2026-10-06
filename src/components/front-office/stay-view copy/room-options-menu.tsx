'use client';

import { getRoomBookings } from '@/app/actions/room';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type React from 'react';
import { useState } from 'react';
import {
    FaBed,
    FaBroom,
    FaEdit,
    FaExclamationTriangle,
    FaHistory,
    FaTrash,
} from 'react-icons/fa';
import { BookingHistoryModal } from '../stay-view/modals/booking-history';
import { DeleteRoomModal } from '../stay-view/modals/delete-room';
import EditRoomModal, { RoomDetails } from '../stay-view/modals/edit-room';
import { RoomStatusModal } from '../stay-view/modals/room-status';
import { BookingStatus } from './types';

interface RoomOptionsMenuProps {
    isOpen: boolean;
    onClose: () => void;
    position: { x: number; y: number };
    roomId: string;
    roomTypeId: string;
    roomType: string;
    roomNumber: string;
    onAction: (
        action: string,
        roomNumber?: string,
        status?: string,
        details?: RoomDetails,
        roomId?: string,
    ) => void;
    currentStatus: BookingStatus;
    currentBooking?: {
        guestName: string;
        checkIn: Date;
        checkOut: Date;
    };
    roomPrice?: string;
    roomFloor?: string;
    roomCapacity?: string;
}

interface MenuOption {
    label: string;
    icon: React.ComponentType;
    action: string;
    description: string;
    color?: string;
    disabled?: boolean;
    showWarning?: boolean;
    group: 'status' | 'actions' | 'management' | 'danger';
}

export function RoomOptionsMenu({
    isOpen,
    onClose,
    position,
    roomType,
    roomNumber,
    onAction,
    currentStatus,
    currentBooking,
    roomPrice,
    roomFloor,
    roomCapacity,
    roomId,
    roomTypeId,
}: RoomOptionsMenuProps) {
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [roomBookings, setRoomBookings] = useState();
    const [selectedRoom, setSelectedRoom] = useState<RoomDetails>({
        roomId: '',
        roomType: '',
        roomNumber: '',
        roomCapacity: '',
        roomFloor: '',
        roomPrice: '',
        roomTypeId: '',
    });

    const [newRoomId, setNewRoomId] = useState('');

    if (!isOpen) return null;
    const options: MenuOption[] = [
        {
            label: 'Room Status',
            icon: FaBed,
            action: 'status',
            description: 'View room status details',
            color: 'text-blue-600',
            group: 'status',
        },
        {
            label: 'Booking History',
            icon: FaHistory,
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
            icon: FaBroom,
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
            icon: FaEdit,
            action: 'edit',
            description: 'Modify room details',
            group: 'management',
        },
        {
            label: 'Delete Room',
            icon: FaTrash,
            action: 'delete',
            description: 'Remove room from system',
            color: 'text-red-600',
            showWarning: true,
            disabled: currentStatus !== 'AVAIL',
            group: 'danger',
        },
    ];

    const groupedOptions = {
        status: options.filter((opt) => opt.group === 'status'),
        actions: options.filter((opt) => opt.group === 'actions'),
        management: options.filter((opt) => opt.group === 'management'),
        danger: options.filter((opt) => opt.group === 'danger'),
    };

    const handleOptionClick = async (option: MenuOption) => {
        if (option.disabled) return;
        switch (option.action) {
            case 'status':
                setShowStatusModal(true);
                break;
            case 'delete':
                if (!roomId) return;
                setNewRoomId(roomId);
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
            <div
                className="fixed bg-white rounded-lg shadow-lg border z-50 w-64"
                style={{
                    top: position.y,
                    left: position.x,
                    maxHeight: 'calc(100vh - 100px)',
                    overflowY: 'auto',
                }}
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
                                • {currentStatus as BookingStatus}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => onClose()}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="py-1">
                    {Object.entries(groupedOptions).map(([group, options]) => (
                        <div key={group}>
                            {options.map((option) => (
                                <button
                                    key={option.action}
                                    className={`w-full px-4 py-2 text-left flex items-center gap-3 group
                    ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                                    onClick={() =>
                                        !option.disabled &&
                                        handleOptionClick(option)
                                    }
                                    disabled={option.disabled}
                                >
                                    <option.icon
                                        //@ts-expect-error Missing type definition for option.icon
                                        className={`w-4 h-4 ${option.color || 'text-gray-500'}`}
                                    />
                                    <div className="flex-1">
                                        <div
                                            className={
                                                option.color || 'text-gray-700'
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
                    ))}
                </div>
            </div>

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
            {showDeleteModal && selectedRoom && (
                <DeleteRoomModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={() =>
                        onAction('delete', '', '', undefined, newRoomId)
                    }
                    roomType={selectedRoom?.roomType}
                    roomNumber={selectedRoom?.roomNumber}
                    roomId={newRoomId}
                />
            )}

            <BookingHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                roomType={roomType}
                roomNumber={roomNumber}
                bookingHistory={roomBookings ?? []}
            />

            {showEditModal && selectedRoom && (
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
                    {...selectedRoom}
                />
            )}
        </>
    );
}
