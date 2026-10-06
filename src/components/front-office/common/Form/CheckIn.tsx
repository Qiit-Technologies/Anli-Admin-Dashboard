'use client';
import { checkInGuest } from '@/app/actions/checkIn';
import { getAllReservations } from '@/app/actions/reservation';
import { DirtyRoomCheckInAlert } from '@/components/front-office/common/DirtyRoomCheckInAlert';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    getReservationRoomDisplayLabel,
    isReservationAssignedRoomDirty,
} from '@/lib/front-office/reservation-room-dirty';
import { UnifiedAPActivation } from '../UnifiedAPActivation';
import { useSteps } from '@/hooks/useSteps';
import { LoaderCircle, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface CheckInFormData {
    guestName: string;
    reservationId: string;
    roomNumber: string;
    roomType: string;
    checkInDate: string;
    checkInTime: string;
    numberOfGuests: number;
    paymentMethod: string;
    amountPaid: number;
    outstanding: number;
}

interface CheckInProps {
    onClose?: () => void;
}

const CheckInFlow = ({ onClose }: CheckInProps) => {
    const { currentStepIndex, next, back } = useSteps();
    const [reservations, setReservations] = useState<any[]>([]);
    const [filteredReservations, setFilteredReservations] = useState<any[]>([]);
    const [selectedReservation, setSelectedReservation] = useState<any | null>(
        null,
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingReservations, setLoadingReservations] = useState(true);

    const [formData, setFormData] = useState<CheckInFormData>({
        guestName: '',
        reservationId: '',
        roomNumber: '',
        roomType: '',
        checkInDate: '',
        checkInTime: '',
        numberOfGuests: 1,
        paymentMethod: '',
        amountPaid: 0,
        outstanding: 0,
    });

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                setLoadingReservations(true);
                const result = await getAllReservations();
                if (result && result.data) {
                    // Filter for pending reservations that haven't been checked in
                    const pendingReservations = result.data.filter(
                        (reservation: any) =>
                            !reservation.isCheckedIn &&
                            !reservation.isCheckedOut &&
                            reservation.status === 'GOOD',
                    );
                    setReservations(pendingReservations);
                    setFilteredReservations(pendingReservations);
                }
            } catch (error: any) {
                console.error('Error fetching reservations:', error);
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description="Failed to fetch reservations"
                        type="error"
                    />
                ));
            } finally {
                setLoadingReservations(false);
            }
        };

        fetchReservations();
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredReservations(reservations);
            return;
        }

        const filtered = reservations.filter((reservation: any) => {
            const searchLower = searchQuery.toLowerCase();
            return (
                reservation.fullName?.toLowerCase().includes(searchLower) ||
                reservation.id?.toString().includes(searchLower) ||
                reservation.roomNumber?.toString().includes(searchLower)
            );
        });

        setFilteredReservations(filtered);
    }, [searchQuery, reservations]);

    const handleReservationSelect = (reservation: any) => {
        setSelectedReservation(reservation);
        setFormData({
            guestName: reservation.fullName || '',
            reservationId: reservation.id?.toString() || '',
            roomNumber: reservation.roomNumber?.toString() || '',
            roomType: reservation.roomType?.name || '',
            checkInDate: new Date().toISOString().split('T')[0],
            checkInTime: new Date().toTimeString().slice(0, 5),
            numberOfGuests: reservation.numberOfGuests || 1,
            paymentMethod: reservation.paymentMethod || '',
            amountPaid: reservation.amountPaid || 0,
            outstanding: reservation.outstanding || 0,
        });
        next();
    };

    const [selectedAPGuest, setSelectedAPGuest] = useState<any | null>(null);
    const [creditToApply, setCreditToApply] = useState<number>(0);
    const [dirtyRoomDialogOpen, setDirtyRoomDialogOpen] = useState(false);

    const handleAPGuestSelect = (guest: any) => {
        setSelectedAPGuest(guest);
        const outstanding = formData.outstanding || 0;
        const availableCredit = guest.creditBalance || 0;
        // Auto-apply maximum possible credit up to outstanding amount
        const toApply = Math.min(outstanding, availableCredit);
        setCreditToApply(toApply);
    };

    const performCheckIn = async () => {
        if (!selectedReservation) return;

        try {
            setLoading(true);
            const payload = {
                creditToApply: creditToApply > 0 ? creditToApply : undefined,
                guestProfileId: selectedAPGuest?.guestProfileId,
            };

            const response = await checkInGuest(
                selectedReservation.id,
                payload,
            );

            if (
                response.message === 'Check In successfully!' ||
                response.message?.includes('success')
            ) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={`Successfully checked in ${selectedReservation.fullName}`}
                        type="success"
                    />
                ));
                onClose?.();
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response.message || 'Check-in failed'}
                        type="error"
                    />
                ));
            }
        } catch (error: any) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description={
                        error.message || 'An unexpected error occurred'
                    }
                    type="error"
                />
            ));
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = () => {
        if (!selectedReservation) return;
        if (isReservationAssignedRoomDirty(selectedReservation)) {
            setDirtyRoomDialogOpen(true);
            return;
        }
        void performCheckIn();
    };

    const steps = [
        {
            label: 'Select Reservation',
            component: (
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by guest name, reservation ID, or room number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orion-blue focus:border-transparent"
                        />
                    </div>

                    {loadingReservations ? (
                        <div className="flex items-center justify-center py-8">
                            <LoaderCircle className="animate-spin w-6 h-6" />
                            <span className="ml-2">
                                Loading reservations...
                            </span>
                        </div>
                    ) : filteredReservations.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {searchQuery
                                ? 'No reservations found matching your search.'
                                : 'No pending reservations available for check-in.'}
                        </div>
                    ) : (
                        <div className="max-h-64 overflow-y-auto space-y-2">
                            {filteredReservations.map((reservation: any) => (
                                <div
                                    key={reservation.id}
                                    onClick={() =>
                                        handleReservationSelect(reservation)
                                    }
                                    className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-orion-blue hover:bg-orion-blue/5 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {reservation.fullName}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Reservation #{reservation.id}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Room {reservation.roomNumber} (
                                                {reservation.roomType?.name})
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">
                                                {reservation.startDate
                                                    ? new Date(
                                                          reservation.startDate,
                                                      ).toLocaleDateString()
                                                    : 'N/A'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {reservation.numberOfGuests}{' '}
                                                guest
                                                {reservation.numberOfGuests > 1
                                                    ? 's'
                                                    : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ),
        },
        {
            label: 'Confirm Check-In',
            component: (
                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3">
                            Reservation Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">
                                    Guest Name:
                                </span>
                                <p className="font-medium">
                                    {formData.guestName}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-600">
                                    Reservation ID:
                                </span>
                                <p className="font-medium">
                                    #{formData.reservationId}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-600">Room:</span>
                                <p className="font-medium">
                                    {formData.roomNumber} ({formData.roomType})
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-600">Guests:</span>
                                <p className="font-medium">
                                    {formData.numberOfGuests}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-600">
                                    Check-in Date:
                                </span>
                                <p className="font-medium">
                                    {formData.checkInDate}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-600">
                                    Check-in Time:
                                </span>
                                <p className="font-medium">
                                    {formData.checkInTime}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">
                            Payment Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-blue-600">
                                    Amount Paid:
                                </span>
                                <p className="font-medium">
                                    ₦{formData.amountPaid?.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <span className="text-blue-600">
                                    Outstanding:
                                </span>
                                <p className="font-medium">
                                    ₦{formData.outstanding?.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <span className="text-blue-600">
                                    Payment Method:
                                </span>
                                <p className="font-medium capitalize">
                                    {formData.paymentMethod}
                                </p>
                            </div>
                        </div>
                    </div>

                    {formData.outstanding > 0 && (
                        <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                            <h3 className="font-semibold text-gray-900">
                                Apply Account Payable (Optional)
                            </h3>

                            {!selectedAPGuest ? (
                                <UnifiedAPActivation
                                    onSelect={handleAPGuestSelect}
                                />
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-green-50 p-3 rounded-md border border-green-100">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-medium text-green-900">
                                                    Selected Guest for Payment
                                                </p>
                                                <p className="text-sm text-green-800">
                                                    {selectedAPGuest.fullName}
                                                </p>
                                                <p className="text-xs text-green-600 mt-1">
                                                    Available Balance: ₦
                                                    {selectedAPGuest.creditBalance?.toLocaleString()}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedAPGuest(null);
                                                    setCreditToApply(0);
                                                }}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Amount to Apply
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                                ₦
                                            </span>
                                            <input
                                                type="number"
                                                value={creditToApply}
                                                onChange={(e) => {
                                                    const val = Number(
                                                        e.target.value,
                                                    );
                                                    // Ensure we don't exceed available balance or outstanding
                                                    const maxApply = Math.min(
                                                        selectedAPGuest.creditBalance ||
                                                            0,
                                                        formData.outstanding,
                                                    );
                                                    if (val <= maxApply) {
                                                        setCreditToApply(val);
                                                    }
                                                }}
                                                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orion-blue focus:border-transparent"
                                                max={Math.min(
                                                    selectedAPGuest.creditBalance ||
                                                        0,
                                                    formData.outstanding,
                                                )}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Max applicable: ₦
                                            {Math.min(
                                                selectedAPGuest.creditBalance ||
                                                    0,
                                                formData.outstanding,
                                            )?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-yellow-900 mb-2">
                            Check-in Confirmation
                        </h3>
                        <p className="text-sm text-yellow-800">
                            By proceeding, you confirm that the guest has
                            arrived and is ready to check in. The room will be
                            marked as occupied and the guest will be officially
                            checked in.
                            {creditToApply > 0 && (
                                <span className="block mt-2 font-medium">
                                    A credit of ₦
                                    {creditToApply.toLocaleString()} will be
                                    applied from{' '}
                                    {selectedAPGuest?.fullName
                                        ? `${selectedAPGuest.fullName}'s`
                                        : "the guest's"}{' '}
                                    account.
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            ),
        },
    ];

    const currentStep = steps[currentStepIndex];

    return (
        <>
            <DirtyRoomCheckInAlert
                open={dirtyRoomDialogOpen}
                onOpenChange={setDirtyRoomDialogOpen}
                roomLabel={getReservationRoomDisplayLabel(
                    selectedReservation ?? {},
                )}
                onConfirm={() => void performCheckIn()}
            />
            <div>
                <h1 className="text-xl font-semibold">Check In Guest</h1>
                <span className="text-sm text-gray-500">
                    Process guest check-in for pending reservations
                </span>
            </div>

            <div className="mt-6">
                <h1 className="mb-4 font-semibold">
                    {currentStepIndex === 0
                        ? 'Select Reservation'
                        : 'Confirm Check-in'}
                </h1>
                {currentStep.component}

                <div className="flex flex-col justify-between space-y-4 mt-6">
                    <div>
                        {currentStepIndex < steps.length - 1 ? (
                            <Button
                                className="bg-orion-blue w-full h-10 hover:bg-orion-blue"
                                onClick={next}
                                disabled={!selectedReservation}
                            >
                                Continue
                            </Button>
                        ) : (
                            <Button
                                disabled={loading}
                                className="w-full bg-orion-blue hover:bg-orion-blue h-10"
                                onClick={handleCheckIn}
                            >
                                {loading && (
                                    <LoaderCircle className="w-4 h-4 animate-spin mr-2" />
                                )}
                                Complete Check-in
                            </Button>
                        )}
                    </div>
                    {currentStepIndex > 0 && (
                        <Button
                            className="border-orion-blue text-orion-blue w-full h-10"
                            variant="outline"
                            onClick={back}
                        >
                            Back
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
};

export default CheckInFlow;
