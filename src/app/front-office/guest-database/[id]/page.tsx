/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { getGuestHistoryById, getGuestInfoById } from '@/app/actions/guest';
import PageWrapper from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BillingTab } from '@/components/front-office/guest-database/tabs/BillingTab';
import { FeedbackNotesTab } from '@/components/front-office/guest-database/tabs/FeedbackNotesTab';
import { OverviewTab } from '@/components/front-office/guest-database/tabs/OverviewTab';
import { VisitHistoryTab } from '@/components/front-office/guest-database/tabs/VisitHistoryTab';
import {
    BillingTransaction,
    FeedbackNote,
    GuestProfileOverview,
    VisitRecord,
} from '@/components/front-office/guest-database/types';
import { cn } from '@/lib/utils';
import { Archive, ArrowLeft, Download, Printer } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const formatDate = (value?: string | null) => {
    if (!value) return '--';
    try {
        return new Date(value).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch {
        return '--';
    }
};

const GuestDatabaseProfile = () => {
    const router = useRouter();
    const params = useParams();
    const guestId = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [guestPayload, setGuestPayload] = useState<any>(null);
    const [historyPayload, setHistoryPayload] = useState<any[]>([]);

    useEffect(() => {
        const fetchGuestProfile = async () => {
            if (!guestId) return;
            try {
                setLoading(true);
                const infoResponse = await getGuestInfoById(guestId);
                if (infoResponse?.error) {
                    setError(infoResponse.error);
                    setLoading(false);
                    return;
                }
                setGuestPayload(infoResponse?.data ?? null);

                const phoneNumber = infoResponse?.data?.guest?.phoneNumber;
                if (phoneNumber) {
                    const historyResponse =
                        await getGuestHistoryById(phoneNumber);
                    if (!historyResponse?.error) {
                        setHistoryPayload(historyResponse?.data ?? []);
                    }
                }
                setError(null);
            } catch (err: any) {
                setError(
                    err?.message ||
                        'Unable to load guest information right now.',
                );
            } finally {
                setLoading(false);
            }
        };

        fetchGuestProfile();
    }, [guestId]);

    const formatTime = (timeString?: string | null) => {
        if (!timeString) return '--';
        try {
            const [hours, minutes] = timeString.split(':');
            return `${hours}:${minutes}`;
        } catch {
            return '--';
        }
    };

    const visitHistory: VisitRecord[] = useMemo(() => {
        if (!historyPayload?.length) return [];

        return historyPayload.map((record: any, index: number) => {
            const status = record.isCheckedOut
                ? 'Completed'
                : record.isCheckedIn
                  ? 'Upcoming'
                  : 'Upcoming';

            const roomTable = record.room?.roomNumber
                ? `Room ${record.room.roomNumber}`
                : record.tableNumber
                  ? `Table ${record.tableNumber}`
                  : 'N/A';

            return {
                id: record?.id ? `VIS-${record.id}` : `VIS-${index + 1}`,
                date: formatDate(record?.startDate),
                checkIn: formatTime(record?.startTime) || '--',
                checkOut: formatTime(record?.endTime) || '--',
                roomTable,
                amount: record?.amountPaid ?? 0,
                paymentMethod: record?.paymentMethod || 'N/A',
                status,
                notes: record?.bookingCode || record?.notes || '',
            };
        });
    }, [historyPayload]);

    const billingTransactions: BillingTransaction[] = useMemo(() => {
        if (!historyPayload?.length) return [];

        return historyPayload.map((record: any, index: number) => {
            const roomTable = record.room?.roomNumber
                ? `Room ${record.room.roomNumber}`
                : record.tableNumber
                  ? `Table ${record.tableNumber}`
                  : '';

            const nights =
                record.startDate && record.endDate
                    ? Math.ceil(
                          (new Date(record.endDate).getTime() -
                              new Date(record.startDate).getTime()) /
                              (1000 * 60 * 60 * 24),
                      )
                    : 0;

            let description = '';
            if (roomTable && nights > 0) {
                description = `${roomTable} - ${nights} night${nights > 1 ? 's' : ''}`;
                if (record.services?.length) {
                    description += ` + Room Service`;
                }
            } else if (record.customerType?.toLowerCase() === 'restaurant') {
                description = 'Restaurant';
                if (record.items?.length) {
                    const items = record.items
                        .slice(0, 2)
                        .map((item: any) => item.name || item.title)
                        .join(' + ');
                    description += ` + ${items}`;
                    if (record.items.length > 2) {
                        description += ' + ...';
                    }
                }
            } else {
                description = record.roomType?.name || 'Service';
            }

            return {
                id: record?.id ? `BILL-${record.id}` : `BILL-${index + 1}`,
                date: formatDate(record?.startDate),
                description,
                amount: record?.amountPaid ?? 0,
                paymentMethod: record?.paymentMethod || 'N/A',
                status: record?.isCheckedOut ? 'Paid' : 'Unpaid',
            };
        });
    }, [historyPayload]);

    const feedbackNotes: FeedbackNote[] = useMemo(() => {
        const guestInfo = guestPayload?.guest;
        const currentStay = guestPayload?.stay?.[0];
        const notes: FeedbackNote[] = [];

        // Add guest feedback if available
        if (guestInfo?.feedbackNotes) {
            notes.push({
                id: guestInfo.id || 0,
                title: 'Guest Feedback',
                content: guestInfo.feedbackNotes,
                createdAt: formatDate(
                    guestInfo.updatedAt || guestInfo.createdAt,
                ),
                author: guestInfo.fullName || 'Guest',
                room: currentStay?.room?.roomNumber
                    ? `Room ${currentStay.room.roomNumber}`
                    : undefined,
                rating: guestInfo.rating || 5, // Default to 5 if not specified
                ratingDate: formatDate(currentStay?.startDate),
                isStaffNote: false,
            });
        }

        // Add staff notes if available (from checkOutNote or other fields)
        if (currentStay?.checkOutNote) {
            notes.push({
                id: `staff-${currentStay.id}`,
                title: 'Staff Notes',
                content: currentStay.checkOutNote,
                createdAt: formatDate(
                    currentStay.updatedAt || currentStay.createdAt,
                ),
                author: 'Staff',
                isStaffNote: true,
            });
        }

        return notes;
    }, [guestPayload]);

    const currentStay = guestPayload?.stay?.[0];
    const guestInfo = guestPayload?.guest;

    const overviewData: GuestProfileOverview | null = useMemo(() => {
        if (!guestInfo) return null;

        const totalPaid = currentStay?.amountPaid || 0;
        const outstanding = currentStay?.outstanding || 0;
        const loyaltyTier = guestInfo?.loyaltyTier || 'Standard';

        return {
            guestId: guestInfo?.id
                ? `G${String(guestInfo.id).padStart(3, '0')}`
                : '—',
            name: guestInfo?.fullName || 'Guest profile',
            loyaltyTier,
            loyaltyPoints: guestInfo?.loyaltyPoints ?? 0,
            nationality: guestInfo?.nationality || 'Not specified',
            memberSince: formatDate(guestInfo?.createdAt),
            customerType: guestInfo?.customerType || 'Hotel',
            totalVisits:
                visitHistory.length ||
                guestInfo?.totalVisits ||
                (currentStay ? 1 : 0),
            lastVisit:
                visitHistory[0]?.date ||
                formatDate(currentStay?.startDate) ||
                '--',
            totalBilled: totalPaid + outstanding,
            totalPaid,
            outstandingBalance: outstanding,
            contact: {
                phone: guestInfo?.phoneNumber || 'N/A',
                email: guestInfo?.email || 'N/A',
                address: guestInfo?.address || 'Not provided',
                preferredContact:
                    guestInfo?.preferredContactMethod || 'Not specified',
                emailConsent: guestInfo?.emailConsent ?? false,
            },
        };
    }, [guestInfo, currentStay, visitHistory]);

    if (loading) {
        return (
            <PageWrapper>
                <div className="flex h-64 items-center justify-center text-sm text-slate-500">
                    Loading guest...
                </div>
            </PageWrapper>
        );
    }

    if (error || !overviewData) {
        return (
            <PageWrapper>
                <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-sm text-red-500">
                    {error || 'Unable to load guest information.'}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.back()}
                    >
                        Go back
                    </Button>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className="space-y-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-800"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>

                {/* Grey Header Section */}
                <div className="rounded-2xl bg-[#EAECF0] p-6">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-semibold text-slate-900">
                                    {overviewData.name}
                                </h1>
                                <span
                                    className={cn(
                                        'rounded-full px-3 py-1 text-xs font-semibold capitalize',
                                        overviewData.loyaltyTier.toLowerCase() ===
                                            'gold'
                                            ? 'bg-amber-500 text-white'
                                            : overviewData.loyaltyTier.toLowerCase() ===
                                                'platinum'
                                              ? 'bg-purple-500 text-white'
                                              : 'bg-slate-500 text-white',
                                    )}
                                >
                                    {overviewData.loyaltyTier}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                                <span>Guest ID: {overviewData.guestId}</span>
                                <span className="text-slate-400">•</span>
                                <span>{overviewData.nationality}</span>
                                <span className="text-slate-400">•</span>
                                <span>
                                    Member since {overviewData.memberSince}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 bg-white"
                            >
                                <Download size={16} />
                                Export Report
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 bg-white"
                            >
                                <Printer size={16} />
                                Print
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 bg-white"
                            >
                                <Archive size={16} />
                                Archive
                            </Button>
                            <Button className="gap-2 bg-orion-blue text-white hover:bg-orion-blue/90">
                                Edit Guest
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tabs Section - Separate, not in card */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="w-full justify-start gap-2 overflow-x-auto rounded-lg bg-slate-100 p-1.5 shadow-sm">
                        {[
                            { label: 'Overview', value: 'overview' },
                            { label: 'Visit History', value: 'visits' },
                            { label: 'Billing', value: 'billing' },
                            {
                                label: 'Feedback & Notes',
                                value: 'feedback',
                            },
                        ].map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className={cn(
                                    'rounded-md px-4 py-2 text-sm font-medium transition-all',
                                    'data-[state=active]:bg-orion-blue data-[state=active]:text-white',
                                    'data-[state=inactive]:bg-transparent data-[state=inactive]:text-slate-600 hover:data-[state=inactive]:bg-slate-200',
                                )}
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* Tab Content in Card */}
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white">
                        <TabsContent
                            value="overview"
                            className="px-6 pb-6 pt-4"
                        >
                            <OverviewTab profile={overviewData} />
                        </TabsContent>

                        <TabsContent value="visits" className="px-6 pb-6 pt-4">
                            <VisitHistoryTab visits={visitHistory} />
                        </TabsContent>

                        <TabsContent value="billing" className="px-6 pb-6 pt-4">
                            <BillingTab
                                summary={{
                                    totalBilled: overviewData.totalBilled,
                                    totalPaid: overviewData.totalPaid,
                                    outstanding:
                                        overviewData.outstandingBalance,
                                }}
                                transactions={billingTransactions}
                            />
                        </TabsContent>

                        <TabsContent
                            value="feedback"
                            className="px-6 pb-6 pt-4"
                        >
                            <FeedbackNotesTab notes={feedbackNotes} />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </PageWrapper>
    );
};

export default GuestDatabaseProfile;
