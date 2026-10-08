'use client';

import React, { useEffect, useState } from 'react';
import PayrollSummaryHeader from './PayrollSummaryHeader';
import PayrollSummaryFilters from './PayrollSummaryFilters';
import PayrollSummaryCards from './PayrollSummaryCards';
import PayrollSummaryTable from './PayrollSummaryTable';
import ReportsTopBar from '../common/ReportsTopBar';
import useSWR from 'swr';
import { fetchPayrollReport } from '@/app/actions/report';
import { formatCurrency } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export type PayrollType = {
    name: string;
    department: string;
    workMode: string;
    amount: string;
    payment: string;
    account: string;
    state: string;
};

const PayrollSummaryReport = () => {
    const [startDate, setStartDate] = useState<string | undefined>();
    const [endDate, setEndDate] = useState<string | undefined>();

    const { data: res, isLoading } = useSWR(
        ['fetchPayrollReport', startDate, endDate],
        () => fetchPayrollReport(startDate, endDate),
    );
    const payrollData = res?.data;

    const [search, setSearch] = useState('');
    const [dataToUse, setDataToUse] = useState<PayrollType[]>([]);
    const [stats, setStats] = useState<{
        totalStaffsPaid: number;
        totalPayrollAmount: number;
        disbursedVia: string;
    }>({
        totalStaffsPaid: 0,
        totalPayrollAmount: 0,
        disbursedVia: '',
    });

    useEffect(() => {
        const compiledData = [];
        let totalStaffsPaid = 0;
        let totalPayrollAmount = 0;
        for (const payroll of payrollData?.allPayrolls || []) {
            console.log('payroll', payroll);
            for (const employees of payroll?.employees || []) {
                const staff = employees?.staff;
                const data = {
                    name: staff?.fullName,
                    department: payroll?.department?.name || 'N/A',
                    workMode: staff?.workMode,
                    amount: formatCurrency(payroll?.totalNetSalary),
                    payment: 'Bank Transfer',
                    account: staff?.accountName || '-',
                    state: payroll?.status,
                };
                compiledData.push(data);
                if (payroll?.status === 'paid') totalStaffsPaid += 1;
                totalPayrollAmount += Number(payroll?.totalNetSalary);
            }
        }
        setDataToUse(compiledData);
        setStats({
            totalStaffsPaid,
            totalPayrollAmount,
            disbursedVia: '-',
        });
    }, [payrollData?.allPayrolls]);

    return (
        <>
            <div className="w-full bg-[#fff] flex flex-col px-4 md:px-8">
                <ReportsTopBar />
            </div>
            <div className="w-full h-[1px] bg-[#D3D3D3]"></div>
            <div className="bg-white min-h-screen px-2 py-2 sm:px-4 md:px-8 md:py-6">
                <PayrollSummaryHeader
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                />
                <PayrollSummaryFilters />
                {isLoading ? (
                    <div className="flex justify-center items-center fixed top-0 left-0 z-100 w-screen h-screen">
                        <Loader2 className="text-brand animate-spin w-10 h-10" />
                    </div>
                ) : (
                    <>
                        <PayrollSummaryCards stats={stats} />
                        <PayrollSummaryTable
                            search={search}
                            setSearch={setSearch}
                            dataToUse={dataToUse}
                        />
                    </>
                )}
            </div>
        </>
    );
};

export default PayrollSummaryReport;
