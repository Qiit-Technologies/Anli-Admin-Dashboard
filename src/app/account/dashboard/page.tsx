'use client';
import { useEffect } from 'react';
import BalanceAmounts from '@/components/account/balanceAmounts';
import CashFlows from '@/components/account/cashFlows';
import DashboardSkeleton from '@/components/account/DashboardSkeleton';
import AuthErrorFallback from '@/components/account/AuthErrorFallback';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { useAccountDashboard } from '@/hooks/useAccountDashboard';
import SearchInput from '@/components/common/SearchInput';
import CustomTable from '@/components/front-of-house/tables/CustomTable';
import { AccountOverviewColumns } from '@/components/kitchen/tables/columns/AccountColumns';
import { Button } from '@heroui/react';
import { LuBell } from 'react-icons/lu';
import Toast from '@/components/toast';
import { toast } from 'react-hot-toast';
import { useUser } from '@/context/useUser';

const BDS = () => {
    const {
        balanceSummary,
        revenueSummaryCard,
        expensesSummary,
        transactions,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        cashFlow,
        revenueSummary,
        fetchRevenueSummary,
        selectedDate,
        handleDateChange,
    } = useAccountDashboard();
    const { user } = useUser();

    // Use useEffect to show toast only once when error changes
    useEffect(() => {
        if (error) {
            if (error.includes('Authentication token not found')) {
                toast.custom(() => (
                    <Toast
                        title="Authentication Error"
                        description="Your session has expired. Please log in again."
                        type="error"
                    />
                ));
            } else {
                toast.custom(() => (
                    <Toast title="Error" description={error} type="error" />
                ));
            }
        }
    }, [error]); // Only re-run if error changes

    if (error) {
        if (error.includes('Authentication token not found')) {
            return (
                <PageWrapper>
                    <AuthErrorFallback />
                </PageWrapper>
            );
        }

        // Return empty placeholder state for components
        return (
            <PageWrapper>
                <PageHeader>
                    <PageHeadertitle
                        title="Dashboard"
                        subtitle={'Welcome back!'}
                    />
                    <div className="ml-auto flex items-center">
                        <SearchInput
                            className="w-full lg:w-[320px]"
                            value={searchQuery || ''}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled
                        />
                        <Button
                            variant="light"
                            isIconOnly
                            className="ml-4 bg-white rounded-full border text-gray-400"
                            disabled
                        >
                            <LuBell size={18} />
                        </Button>
                    </div>
                </PageHeader>
                <div className="opacity-50 pointer-events-none">
                    <BalanceAmounts
                        balanceSummary={null}
                        revenueSummary={null}
                        expensesSummary={null}
                        loading={false}
                        onDateChange={undefined}
                    />
                    <CashFlows data={null} revenueSummary={null} />
                    <CustomTable
                        isPaginated={false}
                        hasHeader
                        rightHeader={
                            <p className="text-[#101828] text-[18px] font-bold leading-7">
                                See All
                            </p>
                        }
                        title="Transactions Feed"
                        columns={AccountOverviewColumns}
                        data={[]}
                    />
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Dashboard"
                    subtitle={`Welcome back, ${user?.fullName}`}
                />
                <div className="ml-auto flex items-center">
                    <SearchInput
                        className="w-full lg:w-[320px]"
                        value={searchQuery || ''}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button
                        variant="light"
                        isIconOnly
                        className="ml-4 bg-white rounded-full border text-gray-400"
                    >
                        <LuBell size={18} />
                    </Button>
                </div>
            </PageHeader>
            <div>
                <BalanceAmounts
                    loading={loading}
                    balanceSummary={balanceSummary}
                    revenueSummary={revenueSummaryCard}
                    expensesSummary={expensesSummary}
                    onDateChange={handleDateChange}
                />
                {loading ? (
                    <DashboardSkeleton />
                ) : (
                    <>
                        <CashFlows
                            data={cashFlow || []}
                            revenueSummary={revenueSummary || null}
                            fetchRevenueSummary={fetchRevenueSummary}
                            selectedDate={selectedDate}
                        />
                        <CustomTable
                            paginationSize={5}
                            isPaginated={true}
                            hasHeader
                            rightHeader={<></>}
                            title="Transactions Feed"
                            columns={AccountOverviewColumns}
                            data={transactions}
                        />
                    </>
                )}
            </div>
        </PageWrapper>
    );
};

export default BDS;

// {
//     balanceRange === 'Custom' && (
//         <>
//             <input
//                 className="px-2 py-1 rounded-lg shadow border border-[#E1E4EA] text-[#0E121B] text-sm font-normal leading-5"
//                 type="date"
//                 onChange={(e) => handleStartChange('balance', e)}
//             />
//             <input
//                 className="px-2 py-1 rounded-lg shadow border border-[#E1E4EA] text-[#0E121B] text-sm font-normal leading-5"
//                 type="date"
//                 onChange={(e) => handleEndChange('balance', e)}
//             />
//         </>
//     );
// }
