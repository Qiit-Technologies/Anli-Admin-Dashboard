'use client';

import Header from '@/components/reservations/layout/Header';
import PaymentFilters from '@/components/reservations/payments/PaymentFilters';
import PaymentHeader from '@/components/reservations/payments/PaymentHeader';
import PaymentTable from '@/components/reservations/payments/PaymentTable';
import React, { useState } from 'react';

export default function Payments() {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [dateRange, setDateRange] = useState<{
        start?: string;
        end?: string;
    }>({});

    return (
        <main className="bg-white min-h-screen">
            <Header />

            <div className="p-6 flex flex-col gap-6">
                <PaymentHeader />
                <PaymentFilters
                    onSearchChange={setSearch}
                    onStatusChange={setStatus}
                    onDateChange={setDateRange}
                />

                <PaymentTable
                    search={search}
                    status={status}
                    startDate={dateRange.start}
                    endDate={dateRange.end}
                />
            </div>
        </main>
    );
}
