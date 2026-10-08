'use client';

import { PayrollHeader } from '@/components/account/payroll/PayrollHeader';
import { PayrollTabs } from '@/components/account/payroll/PayrollTabs';
import { Loader2 } from 'lucide-react';
import CustomTable from '@/components/front-of-house/tables/CustomTable';
import { getPayrollList } from '@/app/actions/payroll';
import useSWR from 'swr';
import { PayrollSummaryColumns } from '@/components/kitchen/tables/columns/PayrollSummaryColumns';
import { useState } from 'react';

export default function PayrollSummaryPage() {
    const [searchValue, setSearchValue] = useState('');
    const [activeTab, setActiveTab] = useState<
        'All' | 'Months' | 'Weeks' | 'Daily'
    >('All');

    const { data: payrollList, isLoading: payrollDataLoading } = useSWR(
        '/payroll/list',
        getPayrollList,
    );

    const handleFiltersClick = () => {
        console.log('Filters clicked');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-none px-4 sm:px-6 lg:px-8 py-8">
                {payrollDataLoading ? (
                    <div className="fixed inset-0 flex justify-center items-center w-full h-screen">
                        <Loader2 className="text-brand animate-spin w-10 h-10" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        <PayrollHeader
                            searchValue={searchValue}
                            onSearchChange={setSearchValue}
                            onFiltersClick={handleFiltersClick}
                        />
                        <PayrollTabs
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                        />
                        <CustomTable
                            variant="none"
                            hasHeader={false}
                            data={payrollList?.data || []}
                            columns={PayrollSummaryColumns}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
