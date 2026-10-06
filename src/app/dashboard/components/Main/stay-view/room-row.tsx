import type React from 'react';
import { FaEllipsisH } from 'react-icons/fa';
import { BookingCell } from './booking-cell';
import type { BookingStatus, Room, RoomType } from './types';

interface RoomRowProps {
    room: Room;
    roomType: RoomType;
    currentDate: Date;
    daysToShow: number;
    onRoomOptions: (
        e: React.MouseEvent,
        roomId: string,
        roomTypeId: string,
        roomType: string,
        roomNumber: string,
        currentStatus: BookingStatus,
        roomPrice?: string,
        roomFloor?: string,
        roomCapacity?: string,
    ) => void;
    onCellClick: (
        roomType: string,
        roomNumber: string,
        date: Date,
        guestDetails: any,
    ) => void;
    roomId: number;
    roomTypeId: number;
}

export function RoomRow({
    room,
    roomType,
    currentDate,
    daysToShow,
    onRoomOptions,
    onCellClick,
}: RoomRowProps) {
    const getBookingForDate = (roomNumber: string, date: Date) => {
        return (
            room.guests?.filter(
                (b) =>
                    b.roomNumber === roomNumber &&
                    new Date(b.startDate) <= date &&
                    new Date(b.endDate) >= date,
            ) || []
        );
    };

    const isBookingStart = (booking: any, date: Date) => {
        return (
            booking &&
            date.toDateString() === new Date(booking.startDate).toDateString()
        );
    };

    const isBookingEnd = (booking: any, date: Date) => {
        return (
            booking &&
            date.toDateString() === new Date(booking.endDate).toDateString()
        );
    };

    const isBookingMiddle = (booking: any, date: Date) => {
        return (
            booking &&
            date > new Date(booking.startDate) &&
            date < new Date(booking.endDate)
        );
    };

    return (
        <tr className="h-[25px]">
            <td className="border-b border-r px-2 sticky left-0 bg-white z-10 w-[200px]">
                <div className="flex justify-between items-center ">
                    <span className="text-sm">{room.roomNumber}</span>
                    <button
                        className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                        onClick={(e) =>
                            onRoomOptions(
                                e,
                                String(room.id),
                                String(roomType.id),
                                roomType.name,
                                room.roomNumber,
                                room.status,
                                String(room.price),
                                String(room.floor),
                                String(room.roomCapacity),
                            )
                        }
                    >
                        <FaEllipsisH className="text-xs" />
                    </button>
                </div>
            </td>
            {Array.from({ length: daysToShow }, (_, dayIndex) => {
                const date = new Date(currentDate);
                date.setDate(date.getDate() + dayIndex);
                const booking = getBookingForDate(room.roomNumber, date);

                return (
                    <td
                        key={`${room.roomNumber}-${dayIndex}`}
                        className="p-0"
                        style={{
                            width: '100px',
                            minWidth: '100px',
                            height: '30px',
                        }}
                    >
                        {booking.length > 0 ? (
                            booking.map((booking, index) => (
                                <BookingCell
                                    key={`${room.roomNumber}-${dayIndex}-${index}`}
                                    status={booking.status}
                                    guestName={booking.fullName}
                                    onClick={() =>
                                        onCellClick(
                                            roomType.name,
                                            room.roomNumber,
                                            date,
                                            booking,
                                        )
                                    }
                                    guestDetails={booking}
                                    isStart={isBookingStart(booking, date)}
                                    isEnd={isBookingEnd(booking, date)}
                                    isMiddle={isBookingMiddle(booking, date)}
                                    date={date}
                                    roomId={String(room.id)}
                                />
                            ))
                        ) : (
                            <BookingCell
                                key={`empty-${room.roomNumber}-${dayIndex}`}
                                status="AVAIL"
                                guestName=""
                                onClick={() =>
                                    onCellClick(
                                        roomType.name,
                                        room.roomNumber,
                                        date,
                                        null,
                                    )
                                }
                                isStart={false}
                                isEnd={false}
                                isMiddle={false}
                                date={date}
                                roomId={String(room.id)}
                            />
                        )}
                    </td>
                );
            })}
        </tr>
    );
}
