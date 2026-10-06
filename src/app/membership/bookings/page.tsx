'use client';

import { getBookings } from '@/app/actions/membership';
import BrandButton from '@/components/common/Button';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import CustomTable from '@/components/common/table/CustomTable';
import BookingModal from '@/components/membership/bookings/bookingModal';
import MembershipExportButton from '@/components/membership/export/MembershipExportButton';
import MembershipFilterBar from '@/components/membership/filters/MembershipFilterBar';
import Header from '@/components/membership/layout/header';
import { bookingColumn } from '@/components/membership/table/columns/booking-column';
import { BookingStatus, MemberBooking } from '@/types/membership/membership';
import { PlusIcon } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

function BookingsContent() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bookingStatus, setBookingStatus] = useState<'all' | BookingStatus>(
        'all',
    );
    const [memberStatus, setMemberStatus] = useState('all');
    const [facilityFilter, setFacilityFilter] = useState('all');

    const {
        data: bookingsData,
        error,
        isLoading,
    } = useSWR('/membership/booking', () =>
        getBookings({ page: 1, limit: 100 }),
    );

    const bookings = useMemo(() => {
        const list = bookingsData?.data?.bookings;
        return Array.isArray(list) ? (list as MemberBooking[]) : [];
    }, [bookingsData]);

    const hasBookings = bookings.length > 0;

    const facilities = useMemo(() => {
        const uniqueFacilities = new Set<string>();
        bookings.forEach((booking) => {
            const name = booking.facility?.name;
            if (name) uniqueFacilities.add(name);
        });
        return Array.from(uniqueFacilities).sort();
    }, [bookings]);

    const filteredBookings = useMemo(() => {
        return bookings.filter((booking) => {
            const bookingStatusMatches =
                bookingStatus === 'all' || booking.status === bookingStatus;
            const memberStatusMatches =
                memberStatus === 'all' ||
                booking.member?.status === memberStatus;
            const facilityName = booking.facility?.name;
            const facilityMatches =
                facilityFilter === 'all' || facilityName === facilityFilter;
            return (
                bookingStatusMatches && memberStatusMatches && facilityMatches
            );
        });
    }, [bookings, bookingStatus, facilityFilter, memberStatus]);

    const exportRows = useMemo(
        () =>
            filteredBookings.map((booking) => ({
                'Booking ID': booking.id,
                Member: `${booking.member?.firstName || ''} ${booking.member?.lastName || ''}`.trim(),
                'Membership ID':
                    booking.member?.membershipId || booking.member?.id || '',
                'Member Status': booking.member?.status || '',
                Facility: booking.facility?.name || '',
                Fee: booking.facility?.fee || 0,
                'Booking Status': booking.status,
                'Start Time': booking.startTime || '',
                'End Time': booking.endTime || '',
                'Created At': booking.createdAt || '',
            })),
        [filteredBookings],
    );

    const facilitySummary = useMemo(() => {
        const facilityCount = filteredBookings.reduce(
            (acc, booking) => {
                const facilityName =
                    booking.facility?.name ?? 'Unknown facility';
                acc[facilityName] = (acc[facilityName] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>,
        );

        return Object.entries(facilityCount).map(([name, count]) => ({
            name,
            count,
        }));
    }, [filteredBookings]);

    const handleAddBooking = () => {
        setIsModalOpen(true);
    };

    return (
        <div className="py-6 px-4 lg:px-8">
            <PageHeader>
                <PageHeadertitle
                    title="Manage Bookings"
                    subtitle="View and manage all facility bookings"
                />
                <div className="ml-auto flex items-center">
                    <BrandButton
                        className="shadow-none p-3"
                        onClick={handleAddBooking}
                    >
                        New Booking
                    </BrandButton>
                </div>
            </PageHeader>

            {isLoading && (
                <>
                    <div className="mt-8 mb-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4"
                                >
                                    <div className="mb-2 h-5 w-24 animate-pulse rounded bg-gray-200" />
                                    <div className="h-8 w-12 animate-pulse rounded bg-gray-200" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <SkeletonLoader type="table" rows={8} />
                </>
            )}

            {error && !isLoading && (
                <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
                    Error loading bookings: {error.message}
                </div>
            )}

            {!isLoading && !error && !hasBookings && (
                <div className="mt-10 flex items-center justify-center">
                    <div className="rounded-xl bg-[#F7F7F7] p-10 sm:w-[700px]">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <Image
                                src="/team.svg"
                                width={400}
                                height={250}
                                alt="No bookings"
                            />
                            <p className="mt-4 text-center text-md font-medium text-[#031127]">
                                No bookings yet. Create the first facility
                                booking for a member.
                            </p>
                            <BrandButton
                                icon={<PlusIcon />}
                                className="shadow-none p-3"
                                onClick={handleAddBooking}
                            >
                                Create New Booking
                            </BrandButton>
                        </div>
                    </div>
                </div>
            )}

            {!isLoading && !error && hasBookings && (
                <>
                    {facilitySummary.length > 0 && (
                        <div className="mt-8 mb-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {facilitySummary.map((facility) => (
                                    <div
                                        key={facility.name}
                                        className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4"
                                    >
                                        <h4 className="font-medium text-gray-900">
                                            {facility.name}
                                        </h4>
                                        <p className="mt-2 text-2xl font-bold text-gray-900">
                                            {facility.count}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-6">
                        <MembershipFilterBar
                            groups={[
                                {
                                    id: 'booking-status',
                                    label: 'Booking status',
                                    value: bookingStatus,
                                    onChange: (value) =>
                                        setBookingStatus(
                                            value as 'all' | BookingStatus,
                                        ),
                                    options: [
                                        { label: 'All', value: 'all' },
                                        {
                                            label: 'Confirmed',
                                            value: BookingStatus.CONFIRMED,
                                        },
                                        {
                                            label: 'Cancelled',
                                            value: BookingStatus.CANCELLED,
                                        },
                                        {
                                            label: 'Completed',
                                            value: BookingStatus.COMPLETED,
                                        },
                                    ],
                                },
                                {
                                    id: 'member-status',
                                    label: 'Member status',
                                    value: memberStatus,
                                    onChange: setMemberStatus,
                                    options: [
                                        { label: 'All', value: 'all' },
                                        { label: 'Active', value: 'active' },
                                        { label: 'Expired', value: 'expired' },
                                        {
                                            label: 'Inactive',
                                            value: 'inactive',
                                        },
                                        {
                                            label: 'Suspended',
                                            value: 'suspended',
                                        },
                                    ],
                                },
                            ]}
                            selects={[
                                {
                                    id: 'facility-filter',
                                    label: 'Facility',
                                    value: facilityFilter,
                                    onChange: setFacilityFilter,
                                    options: [
                                        {
                                            label: 'All facilities',
                                            value: 'all',
                                        },
                                        ...facilities.map((facility) => ({
                                            label: facility,
                                            value: facility,
                                        })),
                                    ],
                                },
                            ]}
                            showing={filteredBookings.length}
                            total={bookings.length}
                            itemLabel="bookings"
                            actions={
                                <MembershipExportButton
                                    data={exportRows}
                                    filename="membership-bookings"
                                    reportTitle="Facility bookings"
                                    subtitle={`${filteredBookings.length} of ${bookings.length} bookings`}
                                    sheetName="Bookings"
                                />
                            }
                        />
                    </div>

                    <div className="mt-8">
                        {filteredBookings.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
                                <p className="text-sm font-medium text-gray-900">
                                    No bookings match the current filters
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Adjust the filters above or create a new
                                    booking.
                                </p>
                            </div>
                        ) : (
                            <CustomTable
                                variant="default"
                                title="Recent Bookings"
                                data={filteredBookings}
                                presetDateFilter={{
                                    enabled: true,
                                    column: 'startTime',
                                }}
                                columns={bookingColumn}
                            />
                        )}
                    </div>
                </>
            )}

            <BookingModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}

export default function Page() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <PageWrapper className="lg:px-0 lg:py-0" permissions={[PERMISSIONS.MANAGE_MEMBERSHIP_BOOKINGS]}>
            <Header isOpen={menuOpen} setIsOpen={setMenuOpen} />
            <BookingsContent />
        </PageWrapper>
    );
}
