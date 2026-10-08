import { addMonths, format, subMonths } from 'date-fns';
import { useState } from 'react';
import {
    FaCalendarAlt,
    FaChevronLeft,
    FaChevronRight,
    FaClock,
    FaFileAlt,
    FaUsers,
} from 'react-icons/fa';

// Generate booking data

const bookingData = [
    { date: '2025-01-01', label: 'Mon', bookings: 50, revenue: 1000 },
    { date: '2025-01-02', label: 'Tue', bookings: 80, revenue: 1500 },
    { date: '2025-01-03', label: 'Wed', bookings: 30, revenue: 700 },
    { date: '2025-01-04', label: 'Thu', bookings: 60, revenue: 1200 },
    { date: '2025-01-05', label: 'Fri', bookings: 90, revenue: 2000 },
    { date: '2025-01-06', label: 'Sat', bookings: 40, revenue: 900 },
    { date: '2025-01-07', label: 'Sun', bookings: 70, revenue: 1700 },
];

// Generate calendar data
const generateCalendarData = (year: number, month: number) => {
    const bookings: Record<
        number,
        {
            count: number;
            type: 'low' | 'medium' | 'high';
            customer: string;
            status: string;
        }
    > = {};

    const customers = [
        'John Doe',
        'Jane Smith',
        'Mike Johnson',
        'Emily Davis',
        'Chris Brown',
    ];
    const statuses = ['Confirmed', 'Pending', 'Cancelled'];

    for (let i = 1; i <= 28; i++) {
        if (Math.random() > 0.7) {
            const count = Math.floor(Math.random() * 100) + 1;
            let type: 'low' | 'medium' | 'high';

            if (count < 40) type = 'low';
            else if (count < 70) type = 'medium';
            else type = 'high';

            // Generate random customer and status
            const customer =
                customers[Math.floor(Math.random() * customers.length)];
            const status =
                statuses[Math.floor(Math.random() * statuses.length)];

            bookings[i] = { count, type, customer, status };
        }
    }

    return { year, month, bookings };
};

// Stats Component
function Stats() {
    const stats = [
        { label: 'New Bookings', value: '75', icon: FaCalendarAlt },
        { label: 'Total Bookings', value: '680', icon: FaFileAlt },
        { label: 'Check In', value: '50', icon: FaUsers },
        { label: 'Check Out', value: '7', icon: FaClock },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <stat.icon className="h-6 w-6 text-blue" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                </div>
            ))}
        </div>
    );
}

// Calendar Component
function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const calendarData = generateCalendarData(
        currentDate.getFullYear(),
        currentDate.getMonth(),
    );

    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const getBookingClass = (day: number, isSelected: boolean | null) => {
        if (isSelected) return 'bg-blue text-white hover:bg-blue';

        const booking = calendarData.bookings[day];
        if (!booking) return 'hover:bg-gray-50';

        const classes = {
            high: 'bg-blue text-white hover:bg-blue',
            medium: 'bg-blue hover:bg-blue',
            low: 'bg-orange-200 hover:bg-orange-300',
        };

        return classes[booking.type];
    };

    const getDaysInMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        return {
            daysInMonth: lastDay.getDate(),
            startingDay: firstDay.getDay(),
        };
    };

    const { daysInMonth, startingDay } = getDaysInMonth();

    // Function to open the modal with booking details
    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDate(null);
    };

    const getBookingDetails = (date: Date) => {
        const day = date.getDate();
        return calendarData.bookings[day] || null;
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm mb-8">
            {/* Calendar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-lg font-semibold">
                    Recent Booking Schedule
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FaChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium min-w-28 text-center">
                        {format(currentDate, 'MMMM yyyy')}
                    </span>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FaChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 sm:gap-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                    (day) => (
                        <div
                            key={day}
                            className="text-center text-xs sm:text-sm text-gray-600 font-medium"
                        >
                            {day}
                        </div>
                    ),
                )}

                {Array.from({ length: startingDay }).map((_, index) => (
                    <div key={`empty-${index}`} className="aspect-square" />
                ))}

                {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const date = new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        day,
                    );
                    const isSelected =
                        selectedDate &&
                        format(date, 'yyyy-MM-dd') ===
                            format(selectedDate, 'yyyy-MM-dd');
                    const booking = calendarData.bookings[day];

                    return (
                        <button
                            key={i}
                            onClick={() => handleDayClick(date)}
                            className={`aspect-square rounded-lg text-xs sm:text-sm p-1 sm:p-2 relative 
                            transition-colors ${getBookingClass(day, isSelected)}`}
                        >
                            {day}
                            {booking && (
                                <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-white opacity-75" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Booking Details Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h2 className="text-lg font-semibold mb-4">
                            Booking Details
                        </h2>
                        {selectedDate && getBookingDetails(selectedDate) ? (
                            <div>
                                <p>
                                    <strong>Date:</strong>{' '}
                                    {format(selectedDate, 'MMMM dd, yyyy')}
                                </p>
                                <p>
                                    <strong>Type:</strong>{' '}
                                    {getBookingDetails(selectedDate)?.type}
                                </p>
                                <p>
                                    <strong>Customer:</strong>{' '}
                                    {getBookingDetails(selectedDate)?.customer}
                                </p>
                                <p>
                                    <strong>Status:</strong>{' '}
                                    {getBookingDetails(selectedDate)?.status}
                                </p>
                            </div>
                        ) : (
                            <p>No booking details available for this date.</p>
                        )}
                        <button
                            onClick={handleCloseModal}
                            className="mt-4 bg-blue text-white px-4 py-2 rounded hover:bg-blue"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// BarChart Component
function BarChart() {
    const maxBookings = Math.max(1, ...bookingData.map((d) => d.bookings));
    const minHeight = 5; // Ensure bars have a minimum height for visibility

    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-6">Reservation Stats</h2>
            <div className="h-64 flex items-end justify-between gap-1 sm:gap-2">
                {bookingData.map((item, index) => {
                    // Normalize the bar height using logarithmic scaling
                    const heightPercentage =
                        (Math.log10(item.bookings + 1) /
                            Math.log10(maxBookings + 1)) *
                        100;

                    return (
                        <div
                            key={index}
                            className="flex flex-col items-center gap-2 flex-1"
                        >
                            <div className="relative w-full group">
                                <div
                                    className="w-full bg-blue border border-blue rounded-t-lg transition-all group-hover:opacity-90"
                                    style={{
                                        height: `${Math.max(heightPercentage, minHeight)}%`,
                                    }}
                                />
                                <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-800 text-blue-200 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {item.bookings} bookings
                                    <br />${item.revenue.toLocaleString()}
                                </div>
                            </div>
                            <span className="text-xs sm:text-sm text-gray-600">
                                {item.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// RoomStats Component
function RoomStats() {
    return (
        <div className="grid grid-rows-2 gap-6">
            <div className="bg-gradient-to-r from-blue to-blue p-6 rounded-xl text-white">
                <h3 className="text-lg mb-2">Available Room Today</h3>
                <p className="text-3xl font-bold">130</p>
            </div>
            <div className="bg-gradient-to-r from-orange-300 to-orange-500 p-6 rounded-xl text-white">
                <h3 className="text-lg mb-2">Sold Out Room Today</h3>
                <p className="text-3xl font-bold">15</p>
            </div>
        </div>
    );
}

// Main App Component
function MainDashboard() {
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <Stats />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BarChart />
                <RoomStats />
            </div>
            <Calendar />
        </div>
    );
}

export default MainDashboard;
