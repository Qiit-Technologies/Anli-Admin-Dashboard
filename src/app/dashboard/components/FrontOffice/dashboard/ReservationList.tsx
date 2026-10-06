import { checkInGuest } from '@/app/actions/checkIn';
import { getReservationByHotelId } from '@/app/actions/reservation';
import ExportButton from '@/components/ExportButton';
import Toast from '@/components/toast';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { BiSearch } from 'react-icons/bi';
import { FiUsers } from 'react-icons/fi';
import { MdKeyboardArrowLeft, MdOutlineHotel } from 'react-icons/md';
import ReservationCard from './ReservationCard';
import { Pagination } from '@heroui/react';

export default function ReservationList() {
    const [reservations, setReservation] = useState<any>([]);
    const [fetchTrigger, setFetchTrigger] = useState(false);
    const [, setError] = useState<string | null>(null);
    const [, setIsLoading] = useState(false);
    const [filteredReservations, setFilteredReservations] = useState<any>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);

    useEffect(() => {
        const fetchReservations = async () => {
            const result = (await getReservationByHotelId()) as any;
            if (result && result.error) {
                console.log('Error:', result.error);
            } else if (result && result.data) {
                setReservation(result.data);
                setFilteredReservations(result.data);
            }
        };

        fetchReservations();
    }, [fetchTrigger]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredReservations(reservations);
            return;
        }
        const lowerCaseQuery = searchQuery.toLowerCase();

        const filtered = reservations.filter((res: any) => {
            const fullNameMatch = res.fullName
                .toLowerCase()
                .includes(lowerCaseQuery);
            return fullNameMatch;
        });
        setFilteredReservations(filtered);
    }, [searchQuery, reservations]);

    const handleSubmit = async (id: number) => {
        setError(null);
        setIsLoading(true);

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
            setIsLoading(false);
        }
    };

    const handleDeleteSuccess = (deletedId: number) => {
        setReservation((prev: any) =>
            prev.filter((res: any) => res.id !== deletedId),
        );
    };

    const handlePageChange = (page: number) => setCurrentPage(page);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredReservations.slice(
        startIndex,
        startIndex + itemsPerPage,
    );
    return (
        <>
            <div className="py-2 px-4">
                <div className="flex items-center justify-between  bg-white p-1.5 border rounded-xl">
                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-gray-50 rounded-lg">
                            <MdKeyboardArrowLeft className="h-8 w-8 text-gray-600 border rounded-full p-1.5" />
                        </button>
                        <div className="relative">
                            <BiSearch className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                type="search"
                                placeholder="Search by name or reservation ID"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg w-[320px] text-sm focus:outline-none focus:ring-1 focus:ring-gray-200"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 pr-2">
                        <ExportButton
                            data={filteredReservations}
                            filename="reservations"
                        />
                        <button className="px-3 py-2 bg-gray-100 border border-gray-200 text-gray-700 rounded-md flex items-center gap-2 hover:bg-gray-50 transition-colors">
                            <FiUsers className="h-5 w-5 text-gray-600" />
                            <span className="text-sm font-medium">
                                Make Group
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="px-4 py-2">
                <header className="text-[16px] font-bold">Reservations</header>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-4">
                {currentItems?.length > 0 ? (
                    currentItems?.map((reservation: any) => (
                        <ReservationCard
                            key={reservation.id}
                            reservation={reservation}
                            handleSubmit={handleSubmit}
                            onDeleteSuccess={handleDeleteSuccess}
                        />
                    ))
                ) : (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center text-gray-500">
                        <MdOutlineHotel className="text-6xl text-gray-400" />
                        <p className="text-lg font-semibold mt-2">
                            No reservations found
                        </p>
                        <p className="text-sm text-gray-400">
                            Try refreshing or adding a new booking.
                        </p>
                    </div>
                )}{' '}
            </div>

            {filteredReservations?.length > 0 && (
                <div className="px-4 pb-6 flex flex-col items-center gap-4">
                    <Pagination
                        initialPage={1}
                        total={Math.ceil(
                            filteredReservations?.length / itemsPerPage,
                        )}
                        color="primary"
                        loop
                        showControls
                        isCompact
                        onChange={handlePageChange}
                    />
                </div>
            )}
        </>
    );
}
