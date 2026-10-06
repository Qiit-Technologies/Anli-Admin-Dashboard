'use client';

import { getGuestListByHotelId } from '@/app/actions/guest';
import { useEffect, useState } from 'react';
import GuestManagementPage from './Guest';

export interface Guest {
    id: number;
    name: string;
    room: string;
    date: string;
    status: 'Checked-in' | 'Reserved';
}

export default function GuestList() {
    const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
    const [showCheckedIn, setShowCheckedIn] = useState(true);
    const [guestList, setGuestList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleViewProfile = (guest: Guest) => {
        setSelectedGuest(guest);
    };

    const toggleTable = () => {
        setShowCheckedIn(!showCheckedIn);
    };

    useEffect(() => {
        const fetchGuestData = async () => {
            try {
                const result = await getGuestListByHotelId();
                if (result && result.data) {
                    setGuestList(result.data);
                }
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchGuestData();
    }, []);

    // Filter based on status
    const checkedInGuests = guestList.filter(
        (guest) => guest.isCheckedIn === true,
    );
    const reservations = guestList.filter(
        (guest) => guest.isCheckedIn === false,
    );

    const currentGuests = showCheckedIn ? checkedInGuests : reservations;

    const handleBack = () => {
        setSelectedGuest(null);
    };
    return (
        <div className="p-4 max-w-[1200px] mx-auto">
            {selectedGuest ? (
                <div>
                    <GuestManagementPage
                        id={selectedGuest.id}
                        backButton={
                            <button
                                onClick={handleBack}
                                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition-colors"
                            >
                                Back to Guest List
                            </button>
                        }
                    />
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-semibold">
                                Guest Management
                            </h1>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-9 pr-4 py-2 border rounded-md w-[250px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="relative">
                            <button
                                onClick={toggleTable}
                                className="px-4 py-2 bg-blue text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                {showCheckedIn
                                    ? 'Show Reservations'
                                    : 'Show Checked-in'}
                            </button>
                        </div>
                    </div>
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">
                            {showCheckedIn
                                ? 'Checked-in Guests'
                                : 'Reservations'}
                        </h2>
                        <div className="border rounded-lg overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="text-left p-4 font-semibold text-gray-600">
                                            Guest Name
                                        </th>
                                        <th className="text-left p-4 font-semibold text-gray-600">
                                            Room
                                        </th>
                                        <th className="text-left p-4 font-semibold text-gray-600">
                                            Date
                                        </th>
                                        <th className="text-left p-4 font-semibold text-gray-600">
                                            Status
                                        </th>
                                        <th className="text-left p-4 font-semibold text-gray-600">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="p-4 text-center text-gray-600"
                                            >
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="p-4 text-center text-red-500"
                                            >
                                                {error}
                                            </td>
                                        </tr>
                                    ) : currentGuests.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="p-4 text-center text-gray-500"
                                            >
                                                No data available
                                            </td>
                                        </tr>
                                    ) : (
                                        currentGuests.map((guest, index) => (
                                            <tr
                                                key={guest.id}
                                                className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                            >
                                                <td className="p-4">
                                                    {guest.fullName}
                                                </td>
                                                <td className="p-4">
                                                    {guest?.roomNumber}
                                                </td>
                                                <td className="p-4">
                                                    {new Date(
                                                        guest.startDate,
                                                    ).toLocaleDateString(
                                                        'en-US',
                                                        {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                        },
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <span
                                                        className={`font-medium ${guest.isCheckedIn ? 'text-green-600' : 'text-yellow-600'}`}
                                                    >
                                                        {guest.isCheckedIn
                                                            ? 'Checked-In'
                                                            : 'Reserved'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <button
                                                        className="text-orion-blue hover:text-blue font-medium underline"
                                                        onClick={() =>
                                                            handleViewProfile(
                                                                guest,
                                                            )
                                                        }
                                                    >
                                                        View Profile
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
