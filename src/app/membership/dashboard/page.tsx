'use client';

import {
    getDashboardStatistics,
    getMembershipExpiryAlerts,
} from '@/app/actions/membership';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import BookingModal from '@/components/membership/bookings/bookingModal';
import ActivityTable from '@/components/membership/general/activityTable';
import Header from '@/components/membership/layout/header';
import { RegisterMemberButton } from '@/components/membership/members/RegisterMemberButton';
import RenewalModal from '@/components/membership/members/renewal-modal';
import { MembershipPlanBreakdown } from '@/components/membership/membership-plan-breakdown';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { PageGuard } from '@/components/permission/PageGuard';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { Button } from '@/components/ui/button';
import { Member } from '@/types/membership/membership';
import { ArrowUpRight, Loader2, QrCodeIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useState } from 'react';
import AlertsPanel from './components/AlertsPanel';
import BirthdayNotifications from './components/BirthdayNotifications';

interface DashboardStats {
    totalMembers: number;
    activeMembers: number;
    expiredMembers: number;
    totalReferrals: number;
    memberGrowth: number;
    referralGrowth: number;
    expiredGrowth: number;
    activeGrowth: number;
}

interface ExpiryAlert {
    id: string;
    name: string;
    tier: string;
    expiryDate: string;
    daysUntilExpiry: number;
    planId: string;
    planName: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
}

const Page = () => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showRenewalModal, setShowRenewalModal] = useState(false);
    const [selectedMemberForRenewal, setSelectedMemberForRenewal] =
        useState<Member | null>(null);
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
        null,
    );
    const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const statsResponse = await getDashboardStatistics();
            if (statsResponse.error) {
                setError(statsResponse.error);
            } else if (statsResponse.data) {
                setDashboardStats(statsResponse.data);
            }

            const alertsResponse = await getMembershipExpiryAlerts();
            if (alertsResponse.data) {
                setExpiryAlerts(alertsResponse.data);
            }
        } catch {
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const refreshExpiryAlerts = async () => {
        const [statsResponse, alertsResponse] = await Promise.all([
            getDashboardStatistics(),
            getMembershipExpiryAlerts(),
        ]);

        if (statsResponse.data) {
            setDashboardStats(statsResponse.data);
        }
        if (alertsResponse.data) {
            setExpiryAlerts(alertsResponse.data);
        }
    };

    const formatNumber = (num: number) => {
        if (isNaN(num) || num === null || num === undefined) {
            return '0';
        }
        return new Intl.NumberFormat().format(num);
    };

    const handleViewProfile = (alert: ExpiryAlert) => {
        router.push(`/membership/members/${alert.id}`);
    };

    const handleRenewNow = (alert: ExpiryAlert) => {
        const memberForRenewal = {
            id: alert.id,
            firstName: alert.firstName,
            lastName: alert.lastName,
            email: alert.email,
            phone: alert.phone,
            endDate: alert.expiryDate,
            dateOfBirth: alert.dateOfBirth,
            plan: alert.planId
                ? {
                      id: alert.planId,
                      name: alert.planName,
                  }
                : null,
        } as Member;

        setSelectedMemberForRenewal(memberForRenewal);
        setShowRenewalModal(true);
    };

    const handleDismissAlert = (alertId: string) => {
        setExpiryAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
    };

    return (
        <PageGuard permissions={[PERMISSIONS.VIEW_MEMBERSHIP_DASHBOARD]}>
        <main className=" bg-white">
            <Header isOpen={isOpen} setIsOpen={setIsOpen} />

            <div className="p-6 flex flex-col gap-10">
                <PageHeader className="gap-4 px-0">
                    <div className="max-w-sm">
                        <PageHeadertitle
                            title="Membership Dashboard"
                            subtitle={
                                'Monitor registrations, referrals, renewals, and guest activity in one place.'
                            }
                        />
                    </div>
                    <div className=" md:ml-auto w-full flex flex-col md:flex-row items-center gap-2">
                        <RegisterMemberButton
                            href="/membership/members/onboarding"
                            fullWidth
                            className="shadow-none p-3"
                        />
                        <PermissionGate
                            permissions={[PERMISSIONS.CHECK_IN_MEMBERS]}
                            blockType="hide"
                        >
                            <Link
                                href="/membership/members/qr-checkin"
                                className="w-full"
                            >
                                <Button
                                    variant={'outline'}
                                    className="border-orion-blue text-orion-blue w-full"
                                >
                                    <QrCodeIcon /> CheckIn
                                </Button>
                            </Link>
                        </PermissionGate>
                        <PermissionGate
                            permissions={[
                                PERMISSIONS.MANAGE_MEMBERSHIP_BOOKINGS,
                            ]}
                            blockType="hide"
                        >
                            <Button
                                variant={'outline'}
                                onClick={() => setShowModal(true)}
                                className="border border-orion-blue text-orion-blue w-full"
                            >
                                Booking
                            </Button>
                        </PermissionGate>
                    </div>
                </PageHeader>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card
                        title="Total Registered Members"
                        value={
                            loading
                                ? '--'
                                : dashboardStats
                                  ? formatNumber(dashboardStats.totalMembers)
                                  : '0'
                        }
                        {...(loading || !dashboardStats
                            ? {}
                            : getGrowthProps(dashboardStats.memberGrowth))}
                        color="#FEFAFA"
                        loading={loading}
                        href="/membership/members?status=all"
                    />
                    <Card
                        title="Total referrals on the system"
                        value={
                            loading
                                ? '--'
                                : dashboardStats
                                  ? formatNumber(dashboardStats.totalReferrals)
                                  : '0'
                        }
                        {...(loading || !dashboardStats
                            ? {}
                            : getGrowthProps(dashboardStats.referralGrowth))}
                        color="#F6FCFF"
                        loading={loading}
                        href="/membership/referrals"
                    />
                    <Card
                        title="Expired Membership"
                        value={
                            loading
                                ? '--'
                                : dashboardStats
                                  ? formatNumber(dashboardStats.expiredMembers)
                                  : '0'
                        }
                        {...(loading || !dashboardStats
                            ? {}
                            : getGrowthProps(dashboardStats.expiredGrowth))}
                        color="#F3F7FF"
                        loading={loading}
                        href="/membership/members?status=expired"
                    />
                    <Card
                        title="Active Members"
                        value={
                            loading
                                ? '--'
                                : dashboardStats
                                  ? formatNumber(dashboardStats.activeMembers)
                                  : '0'
                        }
                        {...(loading || !dashboardStats
                            ? {}
                            : getGrowthProps(dashboardStats.activeGrowth))}
                        color="#F6F8FB"
                        loading={loading}
                        href="/membership/members?status=active"
                    />
                </div>

                <div className="grid grid-cols-1 w-full lg:grid-cols-1 gap-6">
                    <MembershipPlanBreakdown />
                </div>

                <div className="grid grid-cols-1 w-full lg:grid-cols-2 gap-6">
                    <AlertsPanel
                        loading={loading}
                        expiryAlerts={expiryAlerts}
                        onDismissAlert={handleDismissAlert}
                        onRenewNow={handleRenewNow}
                        onViewProfile={handleViewProfile}
                    />

                    <BirthdayNotifications />
                </div>

                <div className="bg-white rounded-lg shadow-sm border">
                    <ActivityTable />
                </div>
            </div>

            <BookingModal
                open={showModal}
                onClose={() => setShowModal(false)}
            />

            {selectedMemberForRenewal && (
                <RenewalModal
                    open={showRenewalModal}
                    onClose={() => {
                        setShowRenewalModal(false);
                        setSelectedMemberForRenewal(null);
                    }}
                    onRenewed={refreshExpiryAlerts}
                    member={selectedMemberForRenewal}
                />
            )}
        </main>
        </PageGuard>
    );
};

export default Page;

const TrendIcon = ({ direction }: { direction: 'up' | 'down' }) => {
    return (
        <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d={
                    direction === 'up'
                        ? 'M6 2L10 6H2L6 2Z'
                        : 'M6 10L2 6H10L6 10Z'
                }
                fill="currentColor"
            />
        </svg>
    );
};

const Card = ({
    title,
    value,
    growth,
    decline,
    color = 'bg-white',
    loading = false,
    href,
}: {
    title: string;
    value: string;
    growth?: string;
    decline?: string;
    color?: string;
    loading?: boolean;
    href?: string;
}) => {
    const content = (
        <div
            className={`p-4 sm:p-5 rounded-md border border-gray-200 flex flex-col justify-between h-full transition hover:border-orion-blue hover:shadow-sm`}
            style={{ backgroundColor: color }}
        >
            <div className="flex items-start justify-between gap-3">
                <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">
                    {title}
                </h4>
                {href && !loading && (
                    <ArrowUpRight className="h-4 w-4 text-gray-400" />
                )}
            </div>
            <div className="flex flex-row justify-between">
                <div>
                    <div className="font-semibold text-2xl sm:text-3xl md:text-4xl text-gray-900 flex items-center gap-2">
                        {loading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        ) : (
                            value
                        )}
                    </div>

                    {!loading && growth && (
                        <p className="flex items-center gap-1 text-green-600 text-xs sm:text-sm font-medium mt-1">
                            <TrendIcon direction="up" />
                            {growth}{' '}
                            <span className="text-gray-500">vs last 24hr</span>
                        </p>
                    )}

                    {!loading && decline && (
                        <p className="flex items-center gap-1 text-red-600 text-xs sm:text-sm font-medium mt-1">
                            <TrendIcon direction="down" />
                            {decline}{' '}
                            <span className="text-gray-500">last mth</span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );

    if (!href || loading) return content;

    return (
        <Link href={href} aria-label={`View ${title}`}>
            {content}
        </Link>
    );
};

const formatGrowth = (growth: number): string => {
    const absGrowth = Math.abs(growth);
    return `${absGrowth}% ${growth >= 0 ? 'Growth' : 'Decline'}`;
};

const getGrowthProps = (growth: number) => {
    if (growth >= 0) {
        return { growth: formatGrowth(growth) };
    } else {
        return { decline: formatGrowth(growth) };
    }
};
