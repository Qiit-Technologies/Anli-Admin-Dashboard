'use client';
import { getReservationsNeedingApproval } from '@/app/actions/guest';
import PendingInternalAccountBills from '@/components/admin/approvals/PendingInternalAccountBills';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import { AdminReservationColumns } from '@/components/front-office/tables/columns/AdminReservationsColumn';
import { useUser } from '@/context/useUser';
import useHotel from '@/hooks/useHotel';
import DashboardLoader from '@/components/DashboardLoader';
import useSWR from 'swr';

const ApprovalPage = () => {
    const { user } = useUser();
    const { organization } = useHotel();
    const {
        data: reservationsData,
        isLoading,
        error,
    } = useSWR('pending-approvals', getReservationsNeedingApproval);

    if (!user) {
        return (
            <div className="text-center flex flex-col h-screen items-center justify-center py-12">
                <DashboardLoader />
            </div>
        );
    }

    if (isLoading) {
        return <DashboardLoader />;
    }

    if (error || reservationsData?.error) {
        return (
            <PageWrapper>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-red-600">
                        Error loading approvals:{' '}
                        {error || reservationsData?.error}
                    </div>
                </div>
            </PageWrapper>
        );
    }

    const reservations = reservationsData?.data || [];
    const showRoman = organization?.id === 10;

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Approvals"
                    subtitle="Reservation and Internal Account bill approvals"
                />
            </PageHeader>

            <div className="space-y-8">
                <section className="space-y-3">
                    <div>
                        <h2 className="text-base font-semibold">
                            Reservation Approvals
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {reservations.length} pending approval
                            {reservations.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    {reservations.length === 0 ? (
                        <div className="text-center py-8 border rounded-lg">
                            <div className="text-muted-foreground">
                                No reservations pending approval
                            </div>
                        </div>
                    ) : (
                        <CustomTable
                            columns={AdminReservationColumns(user, showRoman)}
                            data={reservations}
                        />
                    )}
                </section>

                <section className="space-y-3">
                    <div>
                        <h2 className="text-base font-semibold">
                            Internal Account Bill Approvals
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Bills posted to Internal Accounts require approval
                            before balances update.
                        </p>
                    </div>
                    <PendingInternalAccountBills />
                </section>
            </div>
        </PageWrapper>
    );
};

export default ApprovalPage;
