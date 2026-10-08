'use client';

import {
    getMembershipExpiryAlerts,
    getTodaysBirthdays,
    getUpcomingBirthdays,
} from '@/app/actions/membership';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import AlertCard from '@/app/membership/dashboard/components/AlertCard';
import BirthdayNotifications from '@/app/membership/dashboard/components/BirthdayNotifications';
import Header from '@/components/membership/layout/header';
import RenewalModal from '@/components/membership/members/renewal-modal';
import { RegisterMemberButton } from '@/components/membership/members/RegisterMemberButton';
import { Member, MemberStatusEnum } from '@/types/membership/membership';
import { AlertTriangle, Cake, Clock, Loader2, ShieldCheck } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

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

interface BirthdayResponse {
    data?: {
        birthdays?: Member[];
        count?: number;
    };
    error?: string;
}

const AlertMetric = ({
    label,
    value,
    icon: Icon,
    tone,
}: {
    label: string;
    value: number;
    icon: typeof AlertTriangle;
    tone: string;
}) => (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <span className={`rounded-full p-2 ${tone}`}>
                <Icon className="h-4 w-4" />
            </span>
        </div>
        <p className="mt-3 text-2xl font-semibold text-gray-900 tabular-nums">
            {value.toLocaleString()}
        </p>
    </div>
);

export default function MembershipAlertsPage() {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>([]);
    const [todaysBirthdays, setTodaysBirthdays] = useState<Member[]>([]);
    const [upcomingBirthdays, setUpcomingBirthdays] = useState<Member[]>([]);
    const [showRenewalModal, setShowRenewalModal] = useState(false);
    const [selectedMemberForRenewal, setSelectedMemberForRenewal] =
        useState<Member | null>(null);

    useEffect(() => {
        const loadAlerts = async () => {
            try {
                setLoading(true);
                const [expiryResponse, todayResponse, upcomingResponse] =
                    await Promise.all([
                        getMembershipExpiryAlerts(),
                        getTodaysBirthdays() as Promise<BirthdayResponse>,
                        getUpcomingBirthdays(30) as Promise<BirthdayResponse>,
                    ]);

                if (expiryResponse.data) {
                    setExpiryAlerts(expiryResponse.data);
                }
                if (todayResponse.data?.birthdays) {
                    setTodaysBirthdays(todayResponse.data.birthdays);
                }
                if (upcomingResponse.data?.birthdays) {
                    setUpcomingBirthdays(upcomingResponse.data.birthdays);
                }
            } catch (error: any) {
                toast.error('Failed to load membership alerts');
            } finally {
                setLoading(false);
            }
        };

        loadAlerts();
    }, []);

    const refreshExpiryAlerts = async () => {
        const expiryResponse = await getMembershipExpiryAlerts();
        if (expiryResponse.data) {
            setExpiryAlerts(expiryResponse.data);
        }
    };

    const urgentRenewals = useMemo(
        () => expiryAlerts.filter((alert) => alert.daysUntilExpiry <= 7).length,
        [expiryAlerts],
    );

    const sortedRenewalQueue = useMemo(
        () =>
            [...expiryAlerts].sort(
                (a, b) => a.daysUntilExpiry - b.daysUntilExpiry,
            ),
        [expiryAlerts],
    );

    const handleDismissAlert = (alertId: string) => {
        setExpiryAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
    };

    const handleViewProfile = (alert: ExpiryAlert) => {
        router.push(`/membership/members/${alert.id}`);
    };

    const handleRenewNow = (alert: ExpiryAlert) => {
        setSelectedMemberForRenewal({
            id: alert.id,
            firstName: alert.firstName,
            lastName: alert.lastName,
            email: alert.email,
            phone: alert.phone,
            endDate: alert.expiryDate,
            dateOfBirth: alert.dateOfBirth,
            status: MemberStatusEnum.ACTIVE,
            plan: alert.planId
                ? {
                      id: Number(alert.planId),
                      name: alert.planName,
                  }
                : null,
        } as Member);
        setShowRenewalModal(true);
    };

    return (
        <PageWrapper className="lg:px-0 lg:py-0" permissions={[PERMISSIONS.VIEW_MEMBERSHIP_REPORTS]}>
            <Header isOpen={menuOpen} setIsOpen={setMenuOpen} />
            <main className="min-h-screen bg-gray-50">
                <PageHeader>
                    <PageHeadertitle
                        title="Membership Alerts"
                        subtitle="Renewal, birthday, and member attention signals in one operational view."
                    />
                    <div className="ml-auto flex items-center gap-2">
                        <RegisterMemberButton />
                    </div>
                </PageHeader>

                <div className="p-4 lg:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <AlertMetric
                            label="Renewals due"
                            value={expiryAlerts.length}
                            icon={Clock}
                            tone="bg-orange-50 text-orange-600"
                        />
                        <AlertMetric
                            label="Due in 7 days"
                            value={urgentRenewals}
                            icon={AlertTriangle}
                            tone="bg-red-50 text-red-600"
                        />
                        <AlertMetric
                            label="Birthdays today"
                            value={todaysBirthdays.length}
                            icon={Cake}
                            tone="bg-pink-50 text-pink-600"
                        />
                        <AlertMetric
                            label="Next 30 days"
                            value={upcomingBirthdays.length}
                            icon={ShieldCheck}
                            tone="bg-green-50 text-green-600"
                        />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-6">
                        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b border-gray-100 p-5">
                                <div>
                                    <h2 className="text-base font-semibold text-gray-900">
                                        Renewal Queue
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        Members closest to expiry should be
                                        handled first.
                                    </p>
                                </div>
                            </div>

                            <div className="p-5">
                                {loading ? (
                                    <div className="flex justify-center py-12 text-gray-500">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Loading alerts...
                                    </div>
                                ) : expiryAlerts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <ShieldCheck className="mb-3 h-10 w-10 text-green-500" />
                                        <p className="text-sm font-medium text-gray-900">
                                            No renewal alerts
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            All tracked memberships are outside
                                            the expiry window.
                                        </p>
                                    </div>
                                ) : (
                                    <ul className="flex max-h-[min(70vh,720px)] flex-col gap-3 overflow-y-auto pr-1">
                                        {sortedRenewalQueue.map((alert) => (
                                            <li key={alert.id}>
                                                <AlertCard
                                                    alert={alert}
                                                    onDismiss={
                                                        handleDismissAlert
                                                    }
                                                    onRenewNow={handleRenewNow}
                                                    onViewProfile={
                                                        handleViewProfile
                                                    }
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </section>

                        <BirthdayNotifications className="shadow-sm" />
                    </div>
                </div>
            </main>

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
        </PageWrapper>
    );
}
