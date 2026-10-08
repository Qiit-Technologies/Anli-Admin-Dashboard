import {
    getAvailableRoomsByHotelId,
    getGuestsByHotelId,
    getOccupancyByHotelId,
    getOneCheckInByHotelId,
    getOneCheckOutByHotelId,
    getThirdPartyBookingsByHotelId,
} from '@/app/actions/metrics';
import { ChartCard } from '@/components/ChartCard';
import { ButtonProps } from '@heroui/react';
import { useEffect, useState } from 'react';
import { CategoryType, RawData, TransformedData } from './Metrics.types';

const titlesAndColors: Record<
    string,
    { title: string; categories: string[]; color: ButtonProps['color'] }
> = {
    checkIns: {
        title: 'Check Ins',
        categories: ['Pending', 'Checked in'],
        color: 'warning',
    },
    checkOuts: {
        title: 'Check Outs',
        categories: ['Pending', 'Checked out'],
        color: 'success',
    },
    occupancy: {
        title: 'Occupancy',
        categories: ['Vacant', 'Occupied'],
        color: 'danger',
    },
    available: {
        title: 'Available Rooms',
        categories: ['Unavailable', 'Available'],
        color: 'primary',
    },
    thirdPartyBookings: {
        title: 'Third Party Bookings',
        categories: ['Bookings.com', 'Expedia', 'Kayak', 'Others'],
        color: 'secondary',
    },
    guests: {
        title: 'Guests in house',
        categories: ['Adult', 'Child'],
        color: 'default',
    },
};

const transformCategories = (
    categories: string[],
    charts: Record<string, number>,
): CategoryType[] => {
    return categories.map((category) => ({
        name: category,
        value: charts[category.toLowerCase().replace(/\s/g, '')] || 0,
    }));
};

const transformData = (data: RawData): TransformedData[] =>
    Object.keys(data).map((key) => {
        const { title, categories, color } = titlesAndColors[key];
        const { total, charts } = data[key];
        const transformedCategories = transformCategories(categories, charts);

        return {
            title,
            total,
            color,
            categories: transformedCategories,
            chartData: transformedCategories,
        };
    });

function Metrics() {
    const [rawData, setRawData] = useState<RawData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const [
                    checkIns,
                    checkOuts,
                    occupancy,
                    available,
                    thirdPartyBookings,
                    guests,
                ] = await Promise.all([
                    getOneCheckInByHotelId(),
                    getOneCheckOutByHotelId(),
                    getOccupancyByHotelId(),
                    getAvailableRoomsByHotelId(),
                    getThirdPartyBookingsByHotelId(),
                    getGuestsByHotelId(),
                ]);

                if (
                    checkIns.error ||
                    checkOuts.error ||
                    occupancy.error ||
                    available.error ||
                    thirdPartyBookings.error ||
                    guests.error
                ) {
                    setError('Failed to fetch some data. Please try again.');
                    setLoading(false);
                    return;
                }

                setRawData({
                    checkIns: checkIns.data ?? 0,
                    checkOuts: checkOuts.data ?? 0,
                    occupancy: occupancy.data ?? 0,
                    available: available.data ?? 0,
                    thirdPartyBookings: thirdPartyBookings.data,
                    guests: guests.data ?? 0,
                });
            } catch (err) {
                setError('An unexpected error occurred. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);
    if (loading) return <p>Loading data...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!rawData) return <p>No data available.</p>;

    const transformedData = transformData(rawData);

    return (
        <dl className="scroll-container grid grid-flow-col auto-cols-max gap-1 w-full overflow-x-auto p-2">
            {transformedData.map((item, index) => (
                <ChartCard key={index} {...item} />
            ))}
        </dl>
    );
}

export default Metrics;
