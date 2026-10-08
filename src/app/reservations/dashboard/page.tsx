'use client';

import React, { useState } from 'react';
import Header from '@/components/reservations/layout/Header';
import DashboardHeader from '@/components/reservations/dashboard/DashboardHeader';
import StatsGrid from '@/components/reservations/dashboard/StatsGrid';
import TimeSheet from '@/components/reservations/dashboard/TimeSheet';
import NotificationCard from '@/components/reservations/dashboard/NotificationCard';
import ReservationsTable from '@/components/reservations/dashboard/ReservationsTable';
import {
    getDashboardData,
    dismissNotification,
    sendTableReservationReminder,
    getTableReservationById,
} from '@/app/actions/reservation';
import toast from 'react-hot-toast';
import Toast from '@/components/toast';

import { useReservationActions } from '@/components/reservations/common/useReservationActions';
import { Reservation } from '@/components/reservations/types';
import useSWR from 'swr';

const fetcher = (url: string, date: string) => {
    return getDashboardData(date).then((res) => res.data);
};

export default function ReservationDashboard() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const dateStr = selectedDate.toISOString().split('T')[0];

    const {
        data: dashboardData,
        isLoading,
        mutate,
    } = useSWR(['/table-reservations/dashboard', dateStr], () =>
        fetcher('/table-reservations/dashboard', dateStr),
    );

    const { handleEdit, handleView, reservationModals } = useReservationActions(
        {
            onEditSuccess: () => mutate(),
            onCancelSuccess: () => mutate(),
        },
    );

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
    };

    const handleDismissNotification = async (id: string) => {
        try {
            await dismissNotification(id);
            // Refresh to get updated notifications list
            mutate();
        } catch (error: any) {
            console.error('Failed to dismiss notification:', error);
        }
    };

    const [stats, timesheet, rawNotifications] =
        dashboardData && dashboardData.length > 0
            ? dashboardData
            : [null, [], []];

    // Filter for upcoming reservations and update action text
    const notifications = (rawNotifications || [])
        .filter((n: any) => {
            // Assume upcoming means not completed/cancelled or specific title indicator
            // If the description mentions "due in", it's upcoming.
            // If it says "Update Status", it might be any, but user wants only upcoming.
            const title = n.title?.toLowerCase() || '';
            const desc = n.description?.toLowerCase() || '';
            const isUpcoming =
                title.includes('upcoming') ||
                desc.includes('upcoming') ||
                desc.includes('due in') ||
                title.includes('new');

            return isUpcoming;
        })
        .map((n: any) => ({
            ...n,
            actionText: 'Send Reminder', // Replace "Update Status" or anything else
        }));

    const handleNotificationAction = async (id: string) => {
        const notification = notifications.find((n: any) => n.id === id);
        if (!notification) return;

        // If it's a "Send Reminder" action
        if (notification.actionText === 'Send Reminder') {
            try {
                const response = await sendTableReservationReminder(id);
                if (response.success) {
                    toast.custom(() => (
                        <Toast
                            title="Success"
                            description={
                                response.message || 'Reminder sent successfully'
                            }
                            type="success"
                        />
                    ));
                } else {
                    toast.custom(() => (
                        <Toast
                            title="Error"
                            description={
                                response.error || 'Failed to send reminder'
                            }
                            type="error"
                        />
                    ));
                }
            } catch (error: any) {
                console.error('Failed to send reminder:', error);
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description="An unexpected error occurred"
                        type="error"
                    />
                ));
            }
        }
    };

    const fetchAndEditReservation = async (reservationId: string) => {
        try {
            toast.loading('Loading reservation details...', { id: 'fetch-res' });
            const response = await getTableReservationById(reservationId);
            toast.dismiss('fetch-res');
            if (response.data) {
                const item = response.data;
                const mappedReservation: Reservation = {
                    id: String(item.id),
                    rsvId: `#RSV${item.id}`,
                    customerName: `${item.firstName} ${item.lastName}`,
                    tableType: item.tableType || '',
                    tableNumber: item.tableNumber || '',
                    spaceType: item.spaceType || '',
                    tableId: item.tableId,
                    rsvTime: item.time || item.rsvTime || '',
                    reservationDate: item.date || item.reservationDate || '',
                    status: item.status || 'Pending',
                    paymentStatus: item.paymentStatus || 'Pending Payment',
                    paymentType: item.paymentType || 'Cash',
                    amountPaid: item.totalCost ? `₦${item.totalCost}` : '₦0.00',
                };
                handleEdit(mappedReservation);
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={response.error || 'Failed to fetch reservation'}
                        type="error"
                    />
                ));
            }
        } catch (error: any) {
            toast.dismiss('fetch-res');
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="An unexpected error occurred"
                    type="error"
                />
            ));
        }
    };

    const handleNotificationEdit = async (id: string) => {
        const notification = notifications.find((n: any) => n.id === id);
        if (!notification) return;

        if (notification.reservation) {
            handleEdit(notification.reservation);
        } else if (notification.reservationId) {
            await fetchAndEditReservation(notification.reservationId);
        } else {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="No reservation linked to this notification"
                    type="error"
                />
            ));
        }
    };

    return (
        <main className="bg-[#F9FCFF] min-h-screen">
            <Header />
            {reservationModals}

            <div className="p-6 flex flex-col gap-6">
                <DashboardHeader onMutation={() => mutate()} />

                <StatsGrid data={stats} loading={isLoading} />

                <div className="flex flex-col lg:flex-row gap-4">
                    <TimeSheet
                        bookings={timesheet}
                        loading={isLoading}
                        onDateChange={handleDateChange}
                        date={selectedDate}
                        onBookingClick={(booking: any) => {
                            if (booking.reservation) {
                                handleEdit(booking.reservation);
                            } else if (booking.id) {
                                fetchAndEditReservation(booking.id);
                            }
                        }}
                    />
                    <NotificationCard
                        notifications={notifications}
                        onDismiss={handleDismissNotification}
                        onAction={handleNotificationAction}
                        onEdit={handleNotificationEdit}
                    />
                </div>

                <ReservationsTable
                    onEdit={handleEdit}
                    onView={handleView}
                    onUpdate={handleEdit}
                />
            </div>
        </main>
    );
}
