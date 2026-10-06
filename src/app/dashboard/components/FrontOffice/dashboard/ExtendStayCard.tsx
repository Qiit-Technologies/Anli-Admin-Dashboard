import { getCheckInsByHotelId } from '@/app/actions/checkIn';
import { checkRoomAvailability } from '@/app/actions/guest';
import { extendStay } from '@/app/actions/reservation';
import { getRoomByHotelId } from '@/app/actions/room';
import { UnifiedAPActivation } from '@/components/front-office/common/UnifiedAPActivation';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { getNights } from '@/lib/helpers';
import { useRouter } from 'nextjs-toploader/app';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoMdClose } from 'react-icons/io';
import { LuSearch } from 'react-icons/lu';
import { Room } from '../../Main/stay-view/types';

const getPureDateString = (dateInput?: string | Date | null) => {
    if (!dateInput) return '';
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
        return dateInput.trim();
    }
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const getNextCheckoutDateString = (endDateStr?: string | Date | null) => {
    const pure = getPureDateString(endDateStr);
    if (!pure) return undefined;
    const [y, m, d] = pure.split('-').map(Number);
    const dateUtc = new Date(Date.UTC(y, m - 1, d + 1));
    const year = dateUtc.getUTCFullYear();
    const month = String(dateUtc.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dateUtc.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

interface CheckOutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ExtendStayModal: React.FC<CheckOutModalProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const router = useRouter();
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isGuestInfoOpen, setIsGuestInfoOpen] = useState(true);
    const [isExtendStayOpen, setIsExtendStayOpen] = useState(false);
    const [isRoomAvailabilityOpen, setIsRoomAvailabilityOpen] = useState(false);
    const [isUpdatedBillOpen, setIsUpdatedBillOpen] = useState(false);
    const [isPaymentOptionsOpen, setIsPaymentOptionsOpen] = useState(false);
    const [checkoutDate, setCheckoutDate] = useState('');
    const [checkoutTime, setCheckoutTime] = useState('');
    const [alternativeRoom, setAlternativeRoom] = useState('');
    const [reservations, setReservations] = useState<any[]>([]);
    const [fetchTrigger] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState(reservations);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    // Account Payable state
    const [selectedAPGuest, setSelectedAPGuest] = useState<any | null>(null);
    const [creditToApply, setCreditToApply] = useState<number>(0);
    const calculateAdditionalNights = () => {
        if (!selectedUser?.endDate || !checkoutDate) return 0;

        const pureEnd = getPureDateString(selectedUser.endDate);
        const pureCheckout = getPureDateString(checkoutDate);
        if (!pureEnd || !pureCheckout) return 0;

        const [y1, m1, d1] = pureEnd.split('-').map(Number);
        const [y2, m2, d2] = pureCheckout.split('-').map(Number);

        const utcEnd = Date.UTC(y1, m1 - 1, d1);
        const utcCheckout = Date.UTC(y2, m2 - 1, d2);

        const diffDays = Math.ceil((utcCheckout - utcEnd) / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };
    const additionalNights = calculateAdditionalNights();
    const additionalNightCharge =
        Number(selectedUser?.amountPaid + selectedUser?.outstanding) *
        additionalNights;
    const totalAdditionalCharges = additionalNightCharge;
    const [taxes] = useState(2000);
    const [updatedTotalBill, setUpdatedTotalBill] = useState(
        Number(selectedUser?.amountPaid) +
            Number(selectedUser?.outstanding) +
            totalAdditionalCharges +
            Number(taxes),
    );
    const [, setError] = useState<string | null>(null);
    const [, setIsLoading] = useState(false);
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        setUpdatedTotalBill(
            Number(selectedUser?.amountPaid) +
                Number(selectedUser?.outstanding) +
                Number(totalAdditionalCharges) +
                Number(taxes),
        );
    }, [totalAdditionalCharges, selectedUser, taxes]);

    // Auto-set credit to apply when selectedAPGuest or totalAdditionalCharges changes
    useEffect(() => {
        if (selectedAPGuest && totalAdditionalCharges > 0) {
            const availableCredit = selectedAPGuest.creditBalance || 0;
            const toApply = Math.min(totalAdditionalCharges, availableCredit);
            setCreditToApply(toApply);
        }
    }, [selectedAPGuest, totalAdditionalCharges]);

    useEffect(() => {
        const fetchReservations = async () => {
            const result = await getCheckInsByHotelId();
            if (result && result.data) {
                setReservations(result.data);
            }
        };

        const fetchRooms = async () => {
            const result = await getRoomByHotelId();
            if (result && result.data) {
                setRooms(result.data);
            }
        };

        fetchReservations();
        fetchRooms();
    }, [fetchTrigger]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        const results = reservations.filter((user) =>
            user.fullName.toLowerCase().includes(value.toLowerCase()),
        );
        setFilteredUsers(results);
    };

    const selectUser = (user: any) => {
        setSelectedUser(user);
        setQuery('');
        setFilteredUsers([]);
        // Check if this guest has an account payable balance
        if (user.guestProfile?.creditAccounts?.length > 0) {
            const guestBalance =
                user.guestProfile.creditAccounts[0].balance || 0;
            if (guestBalance > 0) {
                setSelectedAPGuest({
                    fullName: user.fullName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    creditBalance: guestBalance,
                    guestProfileId: user.guestProfile.id,
                });
            }
        } else {
            setSelectedAPGuest(null);
            setCreditToApply(0);
        }
    };

    const handleAPGuestSelect = (apGuest: any) => {
        setSelectedAPGuest(apGuest);
        const additionalCharge =
            (Number(selectedUser?.amountPaid) +
                Number(selectedUser?.outstanding)) *
                calculateAdditionalNights() || 0;
        const availableCredit = apGuest.creditBalance || 0;
        const toApply = Math.min(additionalCharge, availableCredit);
        setCreditToApply(toApply);
    };
    if (!isOpen) return null;

    const handleExtendStay = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (!selectedUser?.id || !checkoutDate) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Please fill in all required fields before proceeding."
                    type="error"
                />
            ));
            setIsLoading(false);
            return;
        }

        if (selectedUser.endDate && checkoutDate <= getPureDateString(selectedUser.endDate)) {
            toast.custom(() => (
                <Toast
                    title="Invalid Date"
                    description="New checkout date must be later than the current checkout date."
                    type="error"
                />
            ));
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('guestId', selectedUser.id);
        formData.append('newCheckoutDate', checkoutDate);
        formData.append('newCheckoutTime', '12:00 PM');
        formData.append('alternativeRoom', alternativeRoom || '');
        if (creditToApply > 0) {
            formData.append('creditToApply', creditToApply.toString());
            formData.append('guestProfileId', selectedAPGuest?.guestProfileId);
        }
        try {
            const response = await extendStay(formData);
            if (response) {
                if (response.message === 'Stay extended successfully!') {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
                    router.refresh();
                    onClose();
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
            setIsLoading(false);
        }
    };

    const handleCheckAvailability = async () => {
        setIsLoading(true);
        setError(null);

        if (!checkoutDate) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Please select a new checkout date."
                    type="error"
                />
            ));
            setIsLoading(false);
            return;
        }

        if (selectedUser.endDate && checkoutDate <= getPureDateString(selectedUser.endDate)) {
            toast.custom(() => (
                <Toast
                    title="Invalid Date"
                    description="New checkout date must be later than the current checkout date."
                    type="error"
                />
            ));
            setIsLoading(false);
            return;
        }

        try {
            const newEndDate = `${checkoutDate}T${checkoutTime}`;
            const result = await checkRoomAvailability({
                roomNumber: selectedUser?.roomNumber,
                roomType: selectedUser?.roomType?.id,
                guestId: selectedUser.id,
                currentEndDate: selectedUser.endDate,
                newEndDate,
            });

            if (result.error) {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={result.error}
                        type="error"
                    />
                ));
            } else if (result.data.available) {
                toast.custom(() => (
                    <Toast
                        title="Available!"
                        description="Room is available for extension."
                        type="success"
                    />
                ));
            } else {
                toast.custom(() => (
                    <Toast
                        title="Not Available"
                        description="Room is not available for the selected extended time."
                        type="error"
                    />
                ));
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[35vw] max-w-[50vw] max-h-[80vh] overflow-y-auto mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Extend Guest Stay</h2>
                    <button
                        onClick={() => {
                            onClose();
                            setSelectedUser('');
                        }}
                        className="text-red-500 hover:text-red-700"
                    >
                        <IoMdClose className="h-5 w-5" />
                    </button>
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        value={query}
                        onChange={handleSearch}
                        placeholder="Search by Guest Name, Room No, Reservation No, etc"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {query && (
                        <ul className="border border-gray-300 rounded-md mt-2 bg-white shadow-md">
                            {filteredUsers.map((user) => (
                                <li
                                    key={user.id}
                                    className="p-2 cursor-pointer hover:bg-gray-200"
                                    onClick={() => selectUser(user)}
                                >
                                    {user.fullName} - {user.roomNumber}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {checkoutDate && checkoutTime && (
                    <button
                        onClick={handleCheckAvailability}
                        className="mt-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
                    >
                        Check Availability
                    </button>
                )}
                <form onSubmit={handleExtendStay}>
                    <div className="mt-4 p-4 border rounded-md bg-gray-100">
                        {selectedUser && (
                            <button
                                type="button"
                                className="font-semibold text-lg mb-2 w-full text-left"
                                onClick={() =>
                                    setIsGuestInfoOpen(!isGuestInfoOpen)
                                }
                            >
                                Guest Information:
                            </button>
                        )}
                        {selectedUser ? (
                            <>
                                <div className="grid grid-cols-2">
                                    <label className="mb-0">Guest Name:</label>

                                    <span className="p-1 px-2 border rounded bg-white text-gray-600">
                                        {selectedUser?.fullName}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2">
                                    <label>Room No:</label>

                                    <span className="flex-1 p-1 px-2 border rounded bg-white text-gray-600">
                                        {selectedUser?.roomNumber} (
                                        {selectedUser?.roomType?.name ??
                                            'Unknown Type'}
                                        )
                                    </span>
                                </div>
                                <div className="grid grid-cols-2">
                                    <label>Reservation No:</label>

                                    <span className="flex-1 p-1 px-2 border rounded bg-white text-gray-600">
                                        {selectedUser?.id}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2">
                                    <label>Check-in Date:</label>
                                    <span className="flex-1 p-1 px-2 border rounded bg-white text-gray-600">
                                        {selectedUser?.startDate
                                            ? new Date(
                                                  selectedUser.startDate,
                                              ).toLocaleDateString('en-US', {
                                                  day: 'numeric',
                                                  month: 'long',
                                                  year: 'numeric',
                                              })
                                            : 'Not available'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2">
                                    <label>Current Check-out Date:</label>
                                    <span className="flex-1 p-1 px-2 border rounded bg-white text-gray-600">
                                        {selectedUser?.endDate
                                            ? new Date(
                                                  selectedUser.endDate,
                                              ).toLocaleDateString('en-US', {
                                                  day: 'numeric',
                                                  month: 'long',
                                                  year: 'numeric',
                                              })
                                            : 'Not available'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2">
                                    <label>Night Stayed:</label>

                                    <span className="flex-1 p-1 px-2 border rounded bg-white text-gray-600">
                                        {getNights(
                                            selectedUser?.startDate,
                                            selectedUser?.endDate,
                                        ) || 0}{' '}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-2">
                                <div className="w-32 h-32 rounded-full bg-brand/10 flex items-center justify-center">
                                    <LuSearch className="w-20 h-20 text-brand" />
                                </div>
                                <span>Search For Checked-In Guest</span>
                            </div>
                        )}
                    </div>

                    {selectedUser && (
                        <>
                            <div className="mt-4 p-4 border rounded-md bg-gray-100">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsExtendStayOpen(!isExtendStayOpen)
                                    }
                                    className="w-full text-left font-bold"
                                >
                                    Extend Stay:
                                </button>
                                {isExtendStayOpen && (
                                    <>
                                        <div className="flex items-center gap-4">
                                            <label className="w-[180px]">
                                                New Check-out Date:
                                            </label>
                                            <input
                                                type="date"
                                                value={checkoutDate}
                                                onChange={(e) =>
                                                    setCheckoutDate(
                                                        e.target.value,
                                                    )
                                                }
                                                className="flex-1 p-1 border rounded bg-white"
                                                placeholder="dd/mm/yyyy"
                                                min={
                                                    selectedUser?.endDate
                                                        ? getNextCheckoutDateString(
                                                              selectedUser.endDate,
                                                          )
                                                        : undefined
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <label className="w-[180px]">
                                                Additional Nights:
                                            </label>
                                            <input
                                                type="number"
                                                value={calculateAdditionalNights()}
                                                className="flex-1 p-1 border rounded bg-white"
                                                readOnly
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="mt-4 p-4 border rounded-md bg-gray-100">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsRoomAvailabilityOpen(
                                            !isRoomAvailabilityOpen,
                                        )
                                    }
                                    className="w-full text-left font-bold"
                                >
                                    Room Availability:
                                </button>
                                {isRoomAvailabilityOpen && (
                                    <>
                                        <div className="flex items-center gap-4">
                                            <label className="w-[180px]">
                                                Status:
                                            </label>
                                            <input
                                                type="text"
                                                value="Available"
                                                className="flex-1 p-1 border rounded bg-white text-gray-600"
                                                readOnly
                                            />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <label className="w-[180px]">
                                                Alternative Room:
                                            </label>
                                            <select
                                                value={alternativeRoom}
                                                onChange={(e) =>
                                                    setAlternativeRoom(
                                                        e.target.value,
                                                    )
                                                }
                                                className="flex-1 p-1 border rounded bg-white"
                                            >
                                                <option value="">
                                                    Select a room
                                                </option>
                                                {rooms
                                                    .filter(
                                                        (room: Room) =>
                                                            !room.isBooked &&
                                                            !room.isOccupied,
                                                    )
                                                    .map((room: Room) => (
                                                        <option
                                                            key={room.id}
                                                            value={
                                                                room.roomNumber
                                                            }
                                                        >
                                                            {room.roomNumber}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="mt-4 p-4 border rounded-md bg-gray-100">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsUpdatedBillOpen(!isUpdatedBillOpen)
                                    }
                                    className="w-full text-left font-bold"
                                >
                                    Updated Bill Summary:
                                </button>
                                {isUpdatedBillOpen && (
                                    <>
                                        <div className="flex items-center gap-4">
                                            <label className="w-[180px]">
                                                Current Charges:
                                            </label>
                                            <input
                                                type="text"
                                                value={`₦${(Number(selectedUser.amountPaid) + Number(selectedUser.outstanding)).toLocaleString()}`}
                                                readOnly
                                                className="flex-1 p-1 border rounded bg-white text-gray-600"
                                            />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <label className="w-[180px]">
                                                Additional Charges:
                                            </label>
                                            <input
                                                type="text"
                                                value={`₦${totalAdditionalCharges.toLocaleString()}`}
                                                readOnly
                                                className="flex-1 p-1 border rounded bg-white"
                                            />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <label className="w-[180px]">
                                                Taxes:
                                            </label>
                                            <input
                                                type="text"
                                                value={`₦${Number(taxes).toLocaleString()}`}
                                                readOnly
                                                className="flex-1 p-1 border rounded bg-white text-gray-600"
                                            />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <label className="w-[180px]">
                                                Updated Total Bill:
                                            </label>
                                            <input
                                                type="text"
                                                value={`₦${Number(updatedTotalBill).toLocaleString()}`}
                                                readOnly
                                                className="flex-1 p-1 border rounded bg-white text-gray-600"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            {totalAdditionalCharges > 0 && (
                                <div className="border border-gray-200 rounded-lg p-4 space-y-4 mt-4">
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
                                                            Selected Guest for
                                                            Payment
                                                        </p>
                                                        <p className="text-sm text-green-800">
                                                            {
                                                                selectedAPGuest.fullName
                                                            }
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
                                                            setSelectedAPGuest(
                                                                null,
                                                            );
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
                                                            const maxApply =
                                                                Math.min(
                                                                    selectedAPGuest.creditBalance ||
                                                                        0,
                                                                    totalAdditionalCharges,
                                                                );
                                                            if (
                                                                val <= maxApply
                                                            ) {
                                                                setCreditToApply(
                                                                    val,
                                                                );
                                                            }
                                                        }}
                                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orion-blue focus:border-transparent"
                                                        max={Math.min(
                                                            selectedAPGuest.creditBalance ||
                                                                0,
                                                            totalAdditionalCharges,
                                                        )}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    Max applicable: ₦
                                                    {Math.min(
                                                        selectedAPGuest.creditBalance ||
                                                            0,
                                                        totalAdditionalCharges,
                                                    )?.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {selectedUser && (
                        <div className="mt-4 p-4 border rounded-md bg-gray-100">
                            <h3 className="font-semibold mb-2">
                                Payment Status:
                            </h3>
                            <div className="flex justify-center gap-4">
                                <span
                                    className={`px-6 py-2 text-white font-semibold rounded-md ${
                                        selectedUser.outstanding === 0
                                            ? 'bg-orion-blue'
                                            : 'bg-gray-400'
                                    }`}
                                >
                                    Paid
                                </span>
                                <span
                                    className={`px-6 py-2 text-white font-semibold rounded-md ${
                                        selectedUser.outstanding > 0
                                            ? 'bg-orion-blue'
                                            : 'bg-gray-400'
                                    }`}
                                >
                                    Unpaid
                                </span>
                            </div>
                        </div>
                    )}

                    {selectedUser && (
                        <div className="flex justify-between mt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-orion-blue text-white px-4 py-2 rounded-md hover:bg-blue-600"
                            >
                                Confirm Extension
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ExtendStayModal;
