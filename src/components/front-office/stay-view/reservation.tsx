'use client';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { usePermissions } from '@/hooks/auth/usePermission';
import {
    getStayShellCategory,
    stayShellCardStripClass,
    stayShellPopoverClass,
} from '@/lib/front-office/stay-status';
import { cn } from '@/lib/utils';
import { Reservation as ReservationType } from '@/types/reservation';
import { Calendar, Edit } from 'lucide-react';
import { useState } from 'react';
import { FaHome } from 'react-icons/fa';
import { mutate } from 'swr';
import { MultiStepForm } from '../common/Form/MultiStepFrom';
import { StepperDialog } from '../common/Form/StepperDialog';
import ReservationDateModal from './modals/reservation-date-modal';

interface ReservationProps {
    reservation: ReservationType;
    compact?: boolean;
    slotLabel?: string;
}

export function Reservation({
    reservation,
    compact = false,
    slotLabel,
}: Readonly<ReservationProps>) {
    const { hasPermission } = usePermissions();

    const [reservationOpen, setReservationOpen] = useState(false);
    const [editDatesOpen, setEditDatesOpen] = useState(false);
    const getBgColor = () =>
        stayShellCardStripClass[getStayShellCategory(reservation)];

    const getPopoverColor = () =>
        stayShellPopoverClass[getStayShellCategory(reservation)];

    const getStayDuration = () => {
        const startDate = new Date(reservation.startDate);
        const endDate = new Date(reservation.endDate);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const guestInfoFields = [
        { label: 'Occupant Name', value: reservation.fullName },
        { label: 'Stay Duration', value: getStayDuration() },
        { label: 'Room Number', value: reservation.roomNumber },
        { label: 'Phone', value: reservation.phoneNumber },
        { label: 'Email', value: reservation.email },
        { label: 'Amount Paid', value: reservation.amountPaid },
    ];

    const handleMutate = () => {
        setReservationOpen(false);
        mutate('/hotelRooms');
        mutate('/hotelGuests');
    };

    const canCreateReservation = hasPermission(PERMISSIONS.CREATE_RESERVATION);

    return (
        <>
            <Popover>
                <PopoverTrigger asChild>
                    <div
                        role="button"
                        className={cn(
                            'rounded-3xl w-full border-l-8 text-sm flex items-center justify-between',
                            compact
                                ? 'p-1.5 gap-1.5 min-h-11 rounded-xl'
                                : 'p-2 gap-2 h-full',
                            getBgColor(),
                        )}
                    >
                        <div className="flex items-center min-w-0">
                            <FaHome
                                className={cn(
                                    'text-black',
                                    compact
                                        ? 'h-3.5 w-3.5 mr-1.5'
                                        : 'h-4 w-4 mr-2',
                                )}
                            />
                            <span className="truncate">
                                {reservation.fullName}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            {compact && slotLabel ? (
                                <span className="text-[10px] uppercase tracking-wide text-black/70 pr-1">
                                    {slotLabel}
                                </span>
                            ) : null}
                            {!reservation.isCheckedIn && (
                                <button
                                    disabled={!canCreateReservation}
                                    className={cn(
                                        !canCreateReservation
                                            ? 'cursor-not-allowed'
                                            : 'cursor-pointer',
                                        'p-1 hover:bg-black/10 rounded',
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditDatesOpen(true);
                                    }}
                                    title="Edit Dates"
                                >
                                    <Calendar
                                        className={cn(
                                            'text-muted-foreground',
                                            compact ? 'w-3.5 h-3.5' : 'w-4 h-4',
                                        )}
                                    />
                                </button>
                            )}
                            <button
                                disabled={!canCreateReservation}
                                className={cn(
                                    !canCreateReservation
                                        ? 'cursor-not-allowed'
                                        : 'cursor-pointer',
                                    'p-1 hover:bg-black/10 rounded',
                                )}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setReservationOpen(true);
                                }}
                                title="Edit Reservation"
                            >
                                <Edit
                                    className={cn(
                                        'text-muted-foreground',
                                        compact ? 'w-3.5 h-3.5' : 'w-4 h-4',
                                    )}
                                />
                            </button>
                        </div>
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    className={cn(
                        'shadow-none z-30 w-fit rounded-xl p-4 text-black',
                        getPopoverColor(),
                    )}
                    align="start"
                    alignOffset={20}
                    sideOffset={10}
                >
                    <div className="space-y-2">
                        <div className="grid gap-1">
                            {guestInfoFields.map((field, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-3 items-center gap-4"
                                >
                                    <span className="text-sm font-medium">
                                        {field.label}:
                                    </span>
                                    <span
                                        className={cn(
                                            'col-span-2 text-sm',
                                            'capitalize',
                                        )}
                                    >
                                        {field.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
            <StepperDialog
                open={reservationOpen}
                onOpenChange={setReservationOpen}
                title="Reservation"
                content={
                    <MultiStepForm
                        mode="update"
                        guestDetails={reservation}
                        onClose={() => handleMutate()}
                    />
                }
            />
            <ReservationDateModal
                open={editDatesOpen}
                onOpenChange={setEditDatesOpen}
                reservation={reservation}
                onSuccess={() => {
                    setEditDatesOpen(false);
                    handleMutate();
                }}
            />
        </>
    );
}
