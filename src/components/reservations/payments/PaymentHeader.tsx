import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import React from 'react';

export default function PaymentHeader() {
    return (
        <div className="flex items-center justify-between">
            <PageHeader>
                <PageHeadertitle
                    title="Payments"
                    subtitle="All details about the reservations payments"
                />
            </PageHeader>
        </div>
    );
}
