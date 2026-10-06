'use client';
import { checkInGuest } from '@/app/actions/checkIn';
import { getReservationByHotelId } from '@/app/actions/reservation';
import { User } from '@/app/dashboard/components/FrontOffice/dashboard/CheckOutCard';
import ReservationCard from '@/app/dashboard/components/FrontOffice/dashboard/ReservationCard';
import { useUser } from '@/context/useUser';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import NotificationsPopup from '../NotificationDropdown';
import Toast from '../toast';
import UserDropdown from '../UserDropdown';

const Header: React.FC<{ role: string }> = ({ role }: { role: string }) => {
    const { user } = useUser();
    const [fullName, setFullName] = React.useState('Anli');
    const [reservations, setReservations] = React.useState<any[]>([]);
    const [fetchTrigger, setFetchTrigger] = React.useState(false);
    const [, setError] = React.useState<string | null>(null);
    const [query, setQuery] = React.useState<string>('');
    const [, setSelectedUser] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState(true);

    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setFullName(user?.fullName || 'Anli');
    }, [user?.fullName]);

    useEffect(() => {
        const fetchReservations = async () => {
            setLoading(true);
            try {
                const result = await getReservationByHotelId();
                if (result?.data) {
                    setReservations(result.data);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchReservations();
    }, [fetchTrigger]);

    const filteredUsers = useMemo(() => {
        if (!query.trim()) return [];
        return reservations.filter((user) =>
            user.fullName.toLowerCase().includes(query.toLowerCase()),
        );
    }, [query, reservations]);

    const handleSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setQuery(e.target.value);
        },
        [],
    );

    const handleSelectUser = (user: User) => {
        setSelectedUser(user);
        setQuery('');
    };

    const handleSubmit = async (id: number) => {
        setError(null);
        setLoading(true);

        try {
            const response = await checkInGuest(id);
            if (response) {
                if (response.message === 'Check In successfully!') {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
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
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target as Node)
            ) {
                setQuery('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header
            id="header"
            className="flex items-center justify-between py-4 px-6 border-b bg-white"
            style={{ height: 'var(--header-height)' }}
        >
            {/* Left Section */}
            <div>
                <h1 className="text-xl font-semibold text-gray-900">
                    {fullName}
                </h1>
                <p className="text-sm text-gray-500">{role}</p>
            </div>

            {/* Center Search Bar */}
            <div className="relative flex-1 max-w-md mx-4" ref={searchRef}>
                <input
                    type="text"
                    placeholder="Search"
                    value={query}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-2 border rounded-md text-gray-700 focus:ring-2 focus:ring-indigo-500"
                />
                <div className="absolute left-3 top-2.5 text-gray-500">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-4.35-4.35m0 0a7.5 7.5 0 11-10.61-10.61 7.5 7.5 0 0110.61 10.61z"
                        />
                    </svg>
                </div>
                {query && (
                    <div className="absolute top-20 left-[-346px] w-[calc(100%+46rem)] bg-white border rounded-md shadow-lg mt-2 max-h-50 overflow-auto z-50">
                        {loading ? (
                            <p className="p-3 text-gray-500 text-sm">
                                Loading...
                            </p>
                        ) : filteredUsers.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-3">
                                {filteredUsers.map((user) => {
                                    const reservation = reservations.find(
                                        (res) => res.id === user.id,
                                    );
                                    return reservation ? (
                                        <div
                                            key={user.id}
                                            className="cursor-pointer hover:bg-gray-100 p-2 rounded-md"
                                            onClick={() =>
                                                handleSelectUser(user)
                                            }
                                        >
                                            <ReservationCard
                                                reservation={reservation}
                                                handleSubmit={handleSubmit}
                                            />
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        ) : (
                            <p className="p-3 text-gray-500 text-sm">
                                No results found
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-4">
                {/* Info Icon */}
                {/* <button
                        aria-label="Info"
                        className="p-2 rounded-full border-[1px] hover:bg-gray-100"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-6 h-6 text-gray-700"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </button> */}

                {/* Bell Icon */}
                <NotificationsPopup />

                {/* User Avatar */}
                <UserDropdown role={role} />
            </div>
        </header>
    );
};

export default Header;
