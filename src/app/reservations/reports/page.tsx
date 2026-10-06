'use client';

import Header from '@/components/reservations/layout/Header';
import ReportHeader from '@/components/reservations/reports/ReportsHeader';
import ReservationStatus from '@/components/reservations/reports/ReservationStatus';
import RevenueReport from '@/components/reservations/reports/RevenueReport';
import StatCard from '@/components/reservations/reports/StatCard';
import React, { useState } from 'react';
import useSWR from 'swr';
import { getReports } from '@/app/actions/reservation';

export default function Reports() {
    const [revenueRange, setRevenueRange] = useState<{
        start?: string;
        end?: string;
    }>({});
    const [statusRange, setStatusRange] = useState<{
        start?: string;
        end?: string;
    }>({});

    // Fetch Revenue Data
    const { data: revenueResponse, isLoading: revenueLoading } = useSWR(
        ['reservation-reports-revenue', revenueRange.start, revenueRange.end],
        () => getReports(revenueRange.start, revenueRange.end),
    );

    // Fetch Status Data
    const { data: statusResponse, isLoading: statusLoading } = useSWR(
        ['reservation-reports-status', statusRange.start, statusRange.end],
        () => getReports(statusRange.start, statusRange.end),
    );

    // General stats (using default range for now or sharing with one of them)
    // For simplicity, let's just fetch them once without range or with a default
    const { data: mainResponse, isLoading: mainLoading } = useSWR(
        ['reservation-reports-main', revenueRange.start, revenueRange.end],
        () => getReports(revenueRange.start, revenueRange.end),
    );

    const reportsData = {
        stats: mainResponse?.data?.stats || {
            completedReservation: 0,
            totalRevenue: 0,
            pendingPayment: 0,
            cancelledReservations: 0,
        },
        revenueReport: revenueResponse?.data?.revenueReport || [],
        reservationStatus: statusResponse?.data?.reservationStatus || [],
    };

    const handleExport = () => {
        if (!reportsData) return;

        const stats = reportsData.stats;
        const csvContent = [
            ['Metric', 'Value'],
            ['Completed Reservations', stats.completedReservation],
            ['Total Revenue', `$${stats.totalRevenue}`],
            ['Pending Payment', stats.pendingPayment],
            ['Cancelled Reservations', stats.cancelledReservations],
            [],
            ['Revenue Report'],
            ['Date', 'Revenue'],
            ...reportsData.revenueReport.map((r: any) => [r.date, r.revenue]),
            [],
            ['Reservation Status'],
            ['Status', 'Count'],
            ...reportsData.reservationStatus.map((s: any) => [
                s.status,
                s.count,
            ]),
        ]
            .map((row) => row.join(','))
            .join('\n');

        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute(
            'download',
            `report_${new Date().toISOString().split('T')[0]}.csv`,
        );
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <main className="bg-white min-h-screen">
            <Header />

            <div className="p-6 flex flex-col gap-6">
                <ReportHeader onExport={handleExport} />

                <div className="grid grid-cols-4 gap-4">
                    <StatCard
                        title="Completed Reservation"
                        value={reportsData.stats.completedReservation}
                        percentageChange={10}
                        loading={mainLoading}
                    />
                    <StatCard
                        title="Total revenue"
                        value={`₦${reportsData.stats.totalRevenue.toLocaleString()}`}
                        percentageChange={12}
                        loading={mainLoading}
                    />
                    <StatCard
                        title="Cancelled RSV"
                        value={reportsData.stats.cancelledReservations}
                        percentageChange={12}
                        showMenu
                        loading={mainLoading}
                    />
                    <StatCard
                        title="Pending Payment"
                        value={reportsData.stats.pendingPayment}
                        percentageChange={-2}
                        showMenu
                        loading={mainLoading}
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-2 gap-4">
                    <RevenueReport
                        data={reportsData.revenueReport}
                        loading={revenueLoading}
                        onDateChange={setRevenueRange}
                    />
                    <ReservationStatus
                        data={reportsData.reservationStatus}
                        loading={statusLoading}
                        onDateChange={setStatusRange}
                    />
                </div>
            </div>
        </main>
    );
}
