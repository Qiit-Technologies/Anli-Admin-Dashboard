'use client';

import { deleteRoom, editRoom, markRoomStatus } from '@/app/actions/room';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import Toast from '@/components/toast';
import { Badge } from '@/components/ui/badge';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { usePermissions } from '@/hooks/auth/usePermission';
import useHotel from '@/hooks/useHotel';
import { formatCurrency } from '@/lib/utils';
import useStayViewStore from '@/store/useSV';
import { format, startOfDay } from 'date-fns';
import { ArrowDown, ArrowUp, EllipsisVertical, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';
import { MultiStepForm } from '../common/Form/MultiStepFrom';
import { StepperDialog } from '../common/Form/StepperDialog';
import type { SVRoomType } from './lib/types';
import { RoomDetails } from './modals/edit-room';
import { Reservation } from './reservation';
import RoomOptions from './RoomOptions';

interface RoomTypeSectionProps {
    roomType: SVRoomType;
}

const toDayKey = (value: Date | string) => format(new Date(value), 'yyyy-MM-dd');

export function RoomTypeSection({ roomType }: RoomTypeSectionProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [newReservationOpen, setNewReservationOpen] = useState(false);
    const [selectedStartDate, setSelectedStartDate] = useState<Date>();
    const [selectedEndDate, setSelectedEndDate] = useState<Date>();
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<string>();
    const { getCurrentViewDates, viewMode } = useStayViewStore();
    const { hasPermission } = usePermissions();
    const { organization } = useHotel();
    const showRoman = organization?.id === 10;

    const currentDates = getCurrentViewDates();
    const daysToShow = currentDates.length;

    const handleEmptyCellClick = (date: Date, roomNumber: string) => {
        const normalizedDate = startOfDay(new Date(date));

        if (selectionMode) {
            if (!selectedStartDate) {
                setSelectedStartDate(normalizedDate);
                setSelectedRoom(roomNumber);
            } else {
                const endDate = normalizedDate;

                if (endDate < selectedStartDate) {
                    setSelectedEndDate(selectedStartDate);
                    setSelectedStartDate(endDate);
                } else {
                    setSelectedEndDate(endDate);
                }

                const dateRange = [];
                const currentDate = new Date(selectedStartDate);

                while (currentDate <= endDate) {
                    dateRange.push(new Date(currentDate));
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                setNewReservationOpen(true);
                setSelectionMode(false);
            }
        } else {
            setSelectedRoom(roomNumber);
            setSelectedStartDate(normalizedDate);
            setSelectedEndDate(normalizedDate);
            setNewReservationOpen(true);
        }
    };

    const handleMutate = () => {
        setNewReservationOpen(false);
        mutate('/hotelRooms');
        mutate('/hotelGuests');
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
                String(roomNumber) as any,
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
                    // Refresh data without page reload
                    mutate('/hotelRooms');
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
                    // Refresh data without page reload
                    mutate('/hotelRooms');
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
                    // Refresh data without page reload
                    mutate('/hotelRooms');
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

    const gridStyleCol = {
        display: 'grid',
        gridTemplateColumns: `200px repeat(${daysToShow}, minmax(100px, 1fr))`,
    };

    const renderKey = `${viewMode}-${daysToShow}`;

    const canCreateReservation = hasPermission(PERMISSIONS.CREATE_RESERVATION);
    const roomsInType = Array.isArray(roomType.rooms) ? roomType.rooms : [];

    return (
        <>
            <Collapsible
                key={renderKey}
                open={isOpen}
                onOpenChange={setIsOpen}
                className="w-full"
            >
                <CollapsibleTrigger
                    style={gridStyleCol}
                    className={`sticky bg-gray-50 left-0 w-full grid grid-cols-[200px_repeat(${daysToShow},minmax(100px,1fr))]`}
                >
                    <div className="p-4 px-2 flex items-center justify-start gap-1 font-medium sticky left-0 border-r bg-white z-10">
                        {isOpen ? (
                            <ArrowUp className="h-4 w-4" />
                        ) : (
                            <ArrowDown className="h-4 w-4" />
                        )}
                        <span>
                            {roomType.name} ({roomsInType.length})
                        </span>
                    </div>
                    {Array(daysToShow)
                        .fill(0)
                        .map((_, index) => (
                            <div
                                key={index}
                                className="border-r last:border-r-0"
                            >
                                <div className="h-full w-full flex flex-col gap-2 items-center justify-center">
                                    <Badge className="font-medium w-4 h-4 flex items-center bg-emerald-200 text-emerald-700 shadow-none justify-center text-xs rounded-md px-2">
                                        {roomsInType.length}
                                    </Badge>
                                    <span className="text-sm font-medium">
                                        {formatCurrency(
                                            Number(
                                                roomsInType[0]?.price || 0,
                                            ),
                                        )}
                                    </span>
                                </div>
                            </div>
                        ))}
                </CollapsibleTrigger>
                <CollapsibleContent>
                    {roomsInType.map((room) => (
                        <div
                            key={`${renderKey}-${room.id}`}
                            style={gridStyleCol}
                            className={`grid min-h-16 grid-cols-[200px_repeat(${daysToShow},minmax(100px,1fr))] border-t`}
                        >
                            <div className="p-4 px-6 border-r flex items-center justify-start gap-2 sticky left-0 bg-white z-10">
                                {/* <Checkbox
                                    id={`room-${room.id}`}
                                    checked={room.selected}
                                    onClick={() => {
                                        setSelectionMode(!selectionMode);
                                    }}
                                /> */}
                                <label
                                    htmlFor={`room-${room.id}`}
                                    className="text-sm m-0"
                                >
                                    {room.number}
                                    {showRoman && room.roomNumberRoman
                                        ? ` (${room.roomNumberRoman})`
                                        : ''}
                                </label>

                                <RoomOptions
                                    roomId={room.id}
                                    roomTypeId={roomType.id}
                                    roomType={roomType.name}
                                    roomNumber={room.number}
                                    currentStatus="AVAIL"
                                    roomPrice={room.price}
                                    roomFloor={String(room.floor)}
                                    roomCapacity={String(room.roomCapacity)}
                                    onAction={(
                                        action,
                                        roomNumber,
                                        status,
                                        details,
                                        roomId,
                                    ) => {
                                        handleRoomAction(
                                            action,
                                            roomNumber,
                                            status,
                                            details,
                                            roomId,
                                        );
                                    }}
                                >
                                    <button className="ml-auto">
                                        <EllipsisVertical className="h-4 w-4" />
                                    </button>
                                </RoomOptions>
                            </div>

                            {(() => {
                                const cells = [];
                                let dateIndex = 0;
                                const roomReservations = room.reservations || [];

                                const getSplitPairAtDate = (date: Date) => {
                                    const dateKey = toDayKey(date);
                                    const ending = roomReservations.find(
                                        (r) =>
                                            r &&
                                            toDayKey(r.endDate) === dateKey &&
                                            toDayKey(r.startDate) !== dateKey,
                                    );
                                    if (!ending) return null;
                                    const starting = roomReservations.find(
                                        (r) =>
                                            r &&
                                            toDayKey(r.startDate) === dateKey &&
                                            r.id !== ending.id,
                                    );
                                    if (!starting) return null;
                                    return { amReservation: ending, pmReservation: starting };
                                };

                                const renderEmptySlot = (
                                    date: Date,
                                    key: string,
                                    className = '',
                                ) => {
                                    const isPastDate =
                                        startOfDay(date) < startOfDay(new Date());
                                    if (
                                        selectionMode &&
                                        room.number !== selectedRoom
                                    ) {
                                        return (
                                            <div
                                                role="button"
                                                key={key}
                                                className={`border-r last:border-r-0 p-2 ${className}`}
                                            >
                                                <X />
                                            </div>
                                        );
                                    }
                                    if (isPastDate) {
                                        return (
                                            <div
                                                key={key}
                                                className={`border-r cursor-not-allowed last:border-r-0 p-2 ${className}`}
                                            >
                                                <X className="text-muted-foreground w-4 h-4 opacity-20" />
                                            </div>
                                        );
                                    }
                                    return (
                                        <div
                                            role="button"
                                            key={key}
                                            onClick={() => {
                                                if (canCreateReservation) {
                                                    handleEmptyCellClick(
                                                        date,
                                                        room.number,
                                                    );
                                                } else {
                                                    toast.custom(() => (
                                                        <Toast
                                                            title="Permission Denied"
                                                            description="You do not have permission to create reservations."
                                                            type="error"
                                                        />
                                                    ));
                                                }
                                            }}
                                            className={`border-r flex items-center justify-center hover:bg-gray-100 cursor-pointer last:border-r-0 p-2 ${className}`}
                                        >
                                            <span className="text-xs text-gray-200">
                                                click to book
                                            </span>
                                        </div>
                                    );
                                };

                                while (dateIndex < currentDates.length) {
                                    const date = currentDates[dateIndex];
                                    const dateStr = format(date, 'yyyy-MM-dd');
                                    const splitPair = getSplitPairAtDate(date);

                                    if (splitPair) {
                                        cells.push(
                                            <div
                                                key={`${renderKey}-split-${room.id}-${dateStr}`}
                                                className="border-r last:border-r-0 p-1 flex flex-col gap-1 bg-white"
                                                title="Split stay boundary: AM checkout, PM check-in"
                                            >
                                                <div className="min-h-12 border rounded-sm overflow-hidden">
                                                    <Reservation
                                                        reservation={
                                                            splitPair.amReservation as any
                                                        }
                                                        compact
                                                        slotLabel="AM"
                                                    />
                                                </div>
                                                <div className="min-h-12 border rounded-sm overflow-hidden">
                                                    <Reservation
                                                        reservation={
                                                            splitPair.pmReservation as any
                                                        }
                                                        compact
                                                        slotLabel="PM"
                                                    />
                                                </div>
                                            </div>,
                                        );
                                        dateIndex++;
                                        continue;
                                    }

                                    const reservation = roomReservations.find(
                                        (r) => {
                                            if (!r) return false;
                                            const startDate = format(
                                                new Date(r.startDate),
                                                'yyyy-MM-dd',
                                            );
                                            const endDate = format(
                                                new Date(r.endDate),
                                                'yyyy-MM-dd',
                                            );
                                            return (
                                                startDate <= dateStr &&
                                                endDate >= dateStr
                                            );
                                        },
                                    );

                                    if (reservation) {
                                        const isFirstDayOfReservation =
                                            format(
                                                new Date(reservation.startDate),
                                                'yyyy-MM-dd',
                                            ) === dateStr;
                                        const isFirstVisibleDayOfOngoingReservation =
                                            dateIndex === 0;
                                        const previousSplitPair =
                                            dateIndex > 0
                                                ? getSplitPairAtDate(
                                                      currentDates[
                                                          dateIndex - 1
                                                      ],
                                                  )
                                                : null;
                                        const isDayAfterSplitStart =
                                            previousSplitPair?.pmReservation
                                                ?.id === reservation.id;

                                        if (
                                            isFirstDayOfReservation ||
                                            isFirstVisibleDayOfOngoingReservation ||
                                            isDayAfterSplitStart
                                        ) {
                                            const reservationEndDate = new Date(
                                                reservation.endDate,
                                            );
                                            let span = 0;
                                            let tempIndex = dateIndex;

                                            while (
                                                tempIndex <
                                                    currentDates.length &&
                                                startOfDay(
                                                    currentDates[tempIndex],
                                                ) <=
                                                    startOfDay(
                                                        reservationEndDate,
                                                    ) &&
                                                !getSplitPairAtDate(
                                                    currentDates[tempIndex],
                                                )
                                            ) {
                                                span++;
                                                tempIndex++;
                                            }

                                            cells.push(
                                                <div
                                                    role="button"
                                                    key={`${renderKey}-reservation-${reservation.id}`}
                                                    className="relative p-2 border-r last:border-r-0"
                                                    style={{
                                                        gridColumn: `span ${span}`,
                                                    }}
                                                >
                                                    <Reservation
                                                        reservation={
                                                            reservation as any
                                                        }
                                                    />
                                                </div>,
                                            );
                                            dateIndex += span;
                                        } else {
                                            dateIndex++;
                                        }
                                    } else {
                                        cells.push(
                                            renderEmptySlot(
                                                date,
                                                `${renderKey}-empty-${dateIndex}`,
                                            ),
                                        );
                                        dateIndex++;
                                    }
                                }

                                return cells;
                            })()}
                        </div>
                    ))}
                </CollapsibleContent>
            </Collapsible>
            <StepperDialog
                open={newReservationOpen}
                onOpenChange={setNewReservationOpen}
                title="New Reservation"
                content={
                    <MultiStepForm
                        mode="add"
                        initialValues={{
                            roomtype: Number(roomType.id),
                            startDate: selectedStartDate
                                ? format(selectedStartDate, 'yyyy-MM-dd')
                                : undefined,
                            endDate: selectedEndDate
                                ? format(selectedEndDate, 'yyyy-MM-dd')
                                : undefined,
                            roomNumber: selectedRoom,
                        }}
                        onClose={() => handleMutate()}
                    />
                }
            />
        </>
    );
}
