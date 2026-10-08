import {
    getCheckInsByHotelId,
    getOneCheckInByHotelId,
} from '@/app/actions/checkIn';
import { checkOutGuest } from '@/app/actions/checkOut';
import { getEarlyCheckoutDetails } from '@/app/actions/guest';
import {
    EarlyCheckoutModal,
    type EarlyCheckoutDetails,
} from '@/components/front-office/checkout/EarlyCheckoutModal';
import Toast from '@/components/toast';
import { getNights } from '@/lib/helpers';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoClose } from 'react-icons/io5';

export interface User {
    id: number;
    fullName: string;
    amountPaid: number;
    outstanding: number;
    roomNumber: number;
    startDate: number;
    endDate: number;
}

interface CheckOutModalProps {
    isOpen: boolean;
    onClose: () => void;
    id?: number;
    reservation?: any;
}

const CheckOutModal: React.FC<CheckOutModalProps> = ({
    isOpen,
    onClose,
    id,
    reservation,
}) => {
    const [query, setQuery] = useState<string>('');
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [reservations, setReservations] = useState<any[]>([]);
    const [, setFetchTrigger] = useState(false);
    const [, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'GOOD' | 'BAD' | ''>('');
    const [checkOutNote, setCheckOutNote] = useState('');
    const [earlyCheckoutDetails, setEarlyCheckoutDetails] =
        useState<EarlyCheckoutDetails | null>(null);
    const [showEarlyCheckoutDialog, setShowEarlyCheckoutDialog] =
        useState(false);
    const [pendingTransferUnusedBalance, setPendingTransferUnusedBalance] =
        useState(false);

    useEffect(() => {
        const fetchReservations = async () => {
            const result = await getCheckInsByHotelId();
            if (result && result.data) {
                setReservations(result.data);
            }
        };

        fetchReservations();
    }, []);

    useEffect(() => {
        if (isOpen && id) {
            fetchDetails(id);
        } else {
            setSelectedUser(null);
        }
    }, [isOpen, id]);

    const fetchDetails = async (id: number) => {
        setIsLoading(true);
        try {
            const response = await getOneCheckInByHotelId(id);
            console.log(response.data);
            setSelectedUser(response.data);
        } catch (error: any) {
            console.error('Error fetching details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value.trim().toLowerCase();
        setQuery(query);

        if (!query) {
            setFilteredUsers([]);
            return;
        }

        const results = reservations.filter(
            (user) =>
                user.fullName.toLowerCase().includes(query) ||
                user.id.toString().includes(query) ||
                user.roomNumber.toString().includes(query),
        );

        setFilteredUsers(results);
    };

    const handleSelectUser = (user: User) => {
        setSelectedUser(user);
        setQuery(user.fullName);
        setFilteredUsers([]);
    };

    const handleSubmit = async (id: number, transferUnusedBalance = false) => {
        setError(null);
        setIsLoading(true);

        try {
            // Check for early checkout details first
            if (!transferUnusedBalance && !earlyCheckoutDetails) {
                const details = await getEarlyCheckoutDetails(id);
                if (details) {
                    setEarlyCheckoutDetails(details);
                    setShowEarlyCheckoutDialog(true);
                    setIsLoading(false);
                    return;
                }
            }

            const response = await checkOutGuest(
                id,
                status,
                checkOutNote,
                undefined,
                transferUnusedBalance,
            );
            if (response) {
                const successText = transferUnusedBalance
                    ? 'Checked out. Unused balance transferred to Account Payable.'
                    : response.message ===
                        'No housekeepers available for this hotel'
                      ? 'Guest was checked out successfully, but no housekeeper was assigned.'
                      : response.message;

                if (
                    response.message === 'Check Out successfully!' ||
                    response.message ===
                        'No housekeepers available for this hotel'
                ) {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={successText}
                            type="success"
                        />
                    ));
                    setFetchTrigger((prev) => !prev);
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
            onClose();
            setShowEarlyCheckoutDialog(false);
            setEarlyCheckoutDetails(null);
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Check-Out Quick Link</h2>
                    <button
                        onClick={onClose}
                        className="text-red-500 hover:text-red-700"
                    >
                        <IoClose className="h-5 w-5" />
                    </button>
                </div>
                <div className="mt-4 p-4 border rounded-md bg-gray-100">
                    <h2 className="text-lg font-semibold">Search Guest</h2>
                    <input
                        type="text"
                        value={query}
                        onChange={handleSearch}
                        placeholder="Search by Guest Name, Room No, Reservation No, etc"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {query &&
                    (filteredUsers.length > 0 ? (
                        <ul className="mt-2 bg-white border border-gray-300 rounded-md shadow-md">
                            {filteredUsers.map((user) => {
                                // Find reservation for the current user
                                const userReservation = reservations.find(
                                    (res) => res.userId === user.id,
                                );
                                return (
                                    <li
                                        key={user.id}
                                        onClick={() => handleSelectUser(user)}
                                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                    >
                                        <div className="grid grid-rows-2 gap-1">
                                            <div>
                                                <span className="font-semibold">
                                                    Guest Name:{' '}
                                                </span>
                                                <span>
                                                    {userReservation?.fullName ||
                                                        user.fullName}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-semibold">
                                                    Reservation No:{' '}
                                                </span>
                                                <span className="text-gray-500">
                                                    {user?.id}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-semibold">
                                                    Room No:{' '}
                                                </span>
                                                <span className="text-gray-500">
                                                    {user?.roomNumber}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-semibold">
                                                    Check-in Date:{' '}
                                                </span>
                                                <span className="text-gray-500">
                                                    {new Date(
                                                        user.startDate,
                                                    ).toLocaleDateString(
                                                        'en-US',
                                                        {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                        },
                                                    )}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-semibold">
                                                    Check-out Date:{' '}
                                                </span>
                                                <span className="text-gray-500">
                                                    {new Date(
                                                        user.endDate,
                                                    ).toLocaleDateString(
                                                        'en-US',
                                                        {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                        },
                                                    )}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-semibold">
                                                    Night Stayed:{' '}
                                                </span>
                                                <span className="text-gray-500">
                                                    {getNights(
                                                        user.startDate.toString(),
                                                        user.endDate.toString(),
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="mt-2 text-gray-500 text-sm">
                            No users found.
                        </p>
                    ))}

                <div className="mt-4 p-4 border rounded-md bg-gray-100">
                    <h3 className="font-semibold mb-2">Booking Summary</h3>
                    <div className="mb-2">
                        <label className="block text-sm font-medium">
                            Amount Paid:
                        </label>
                        <input
                            type="text"
                            value={
                                reservation?.amountPaid || selectedUser
                                    ? `₦${selectedUser?.amountPaid.toFixed(2)}`
                                    : ''
                            }
                            className="w-full px-4 py-2 border text-sm border-gray-300 rounded-md bg-gray-50"
                            readOnly
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block text-sm font-medium">
                            Outstanding:
                        </label>
                        <input
                            type="text"
                            value={
                                reservation?.outstanding || selectedUser
                                    ? `₦${selectedUser?.outstanding.toFixed(2)}`
                                    : ''
                            }
                            className="w-full px-4 py-2 border text-sm border-gray-300 rounded-md bg-gray-50"
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">
                            Status:
                        </label>
                        <div className="flex items-center gap-4 mt-2">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={status === 'GOOD'}
                                    onChange={() => setStatus('GOOD')}
                                    className="form-checkbox text-green-600"
                                />
                                <span>Good</span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={status === 'BAD'}
                                    onChange={() => setStatus('BAD')}
                                    className="form-checkbox text-red-600"
                                />
                                <span>Bad</span>
                            </label>
                        </div>

                        {status === 'BAD' && (
                            <div className="mt-3">
                                <label className="block text-sm font-medium">
                                    Note:
                                </label>
                                <textarea
                                    value={checkOutNote}
                                    onChange={(e) =>
                                        setCheckOutNote(e.target.value)
                                    }
                                    className="w-full px-4 py-2 border text-sm border-gray-300 rounded-md bg-gray-50"
                                    placeholder="Enter reason for bad status..."
                                />
                            </div>
                        )}
                    </div>
                </div>

                {selectedUser && (
                    <div className="mt-4 p-4 border rounded-md bg-gray-100">
                        <h3 className="font-semibold mb-2">Payment Status:</h3>
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

                <div className="flex justify-center gap-4">
                    <button
                        onClick={onClose}
                        className="mt-4 w-full bg-gray-400 text-white py-2 rounded-md hover:bg-blue-700"
                    >
                        Cancel
                    </button>

                    {selectedUser && (
                        <button
                            onClick={() => handleSubmit(selectedUser.id)}
                            className="mt-4 w-full bg-orion-blue text-white py-2 rounded-md hover:bg-blue-600"
                        >
                            Checkout
                        </button>
                    )}
                </div>
            </div>
            <EarlyCheckoutModal
                isOpen={showEarlyCheckoutDialog}
                onClose={() => {
                    setShowEarlyCheckoutDialog(false);
                    setEarlyCheckoutDetails(null);
                }}
                earlyCheckoutDetails={earlyCheckoutDetails}
                onCheckoutWithoutTransfer={() => {
                    if (selectedUser) {
                        setShowEarlyCheckoutDialog(false);
                        handleSubmit(selectedUser.id, false);
                    }
                }}
                onCheckoutWithTransfer={() => {
                    if (selectedUser) {
                        handleSubmit(selectedUser.id, true);
                    }
                }}
                isLoading={isLoading}
            />
        </div>
    );
};

export default CheckOutModal;
