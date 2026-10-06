'use client';
import React, { useEffect, useState } from 'react';
import AgingPayablesReceivablesHeader from './AgingPayablesReceivablesHeader';
import AgingPayablesReceivablesFilters from './AgingPayablesReceivablesFilters';
import AgingPayablesReceivablesTable from './AgingPayablesReceivablesTable';
import ReportsTopBar from '../common/ReportsTopBar';
import { fetchInvoiceReport } from '@/app/actions/report';
import useSWR from 'swr';
import { formatCurrency } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function AgingPayablesReceivablesReport() {
    const [type, setType] = useState<'payables' | 'receivables'>('payables');

    const [dataToUse, setDataToUse] = useState<[]>([]);
    const [startDate, setStartDate] = useState<string | undefined>();
    const [endDate, setEndDate] = useState<string | undefined>();

    const { data: res, isLoading } = useSWR(
        ['fetchInvoiceReport', startDate, endDate],
        () => fetchInvoiceReport(startDate, endDate),
    );
    const fetchedInvoices = res?.data;

    useEffect(() => {
        const compiledData: any = [];
        for (const invoice of fetchedInvoices?.allInvoices || []) {
            compiledData.push({
                invoice: `INV-${invoice?.id}`,
                vendor: invoice?.createdBy?.fullName || 'N/A',
                due: '-',
                amount: formatCurrency(invoice?.totalPrice || 0),
                overdue: '-',
                state: invoice?.paymentStatus || 'N/A',
                ref: `INV-${invoice.id}`,
                customer: invoice?.guestName || 'N/A',
                date: invoice.createdAt
                    ? new Date(invoice.createdAt).toISOString().split('T')[0]
                    : 'N/A',
            });
        }
        setDataToUse(compiledData);
    }, [fetchedInvoices?.allInvoices]);

    return (
        <>
            <div className="w-full bg-[#fff] flex flex-col px-4 md:px-8">
                <ReportsTopBar />
            </div>
            <div className="w-full h-[1px] bg-[#D3D3D3]"></div>
            <div className="bg-white min-h-screen px-2 py-2 sm:px-4 md:px-8 md:py-6">
                <AgingPayablesReceivablesHeader
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                />
                <AgingPayablesReceivablesFilters
                    type={type}
                    setType={setType}
                />

                {isLoading ? (
                    <div className="flex justify-center items-center fixed top-0 left-0 z-100 w-screen h-screen">
                        <Loader2 className="text-brand animate-spin w-10 h-10" />
                    </div>
                ) : (
                    <AgingPayablesReceivablesTable
                        invoice={dataToUse}
                        type={type}
                    />
                )}
            </div>
        </>
    );
}
