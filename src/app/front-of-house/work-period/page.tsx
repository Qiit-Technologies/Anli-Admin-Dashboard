'use client';

import React, { useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';
import PageWrapper from '@/components/common/PageWrapper';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import WorkPeriodEmptyState from '@/components/front-of-house/WorkPeriod/WorkPeriodEmptyState';
import WorkPeriodHistory from '@/components/front-of-house/WorkPeriod/WorkPeriodHistory';
import WorkPeriodActiveCard from '@/components/front-of-house/WorkPeriod/WorkPeriodActiveCard';
import WorkPeriodAreaSelectionModal from '@/components/front-of-house/WorkPeriod/WorkPeriodAreaSelectionModal';
import EndWorkPeriodActionModal from '@/components/front-of-house/WorkPeriod/EndWorkPeriodActionModal';
import SettleBillsConfirmationModal from '@/components/front-of-house/WorkPeriod/SettleBillsConfirmationModal';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
    batchStartWorkPeriods,
    batchEndWorkPeriods,
    getWorkPeriods,
} from '@/app/actions/work-period';
import { searchOrders } from '@/app/actions/order';
import { format, differenceInMinutes } from 'date-fns';
import { toast } from 'sonner';
import { useUser } from '@/context/useUser';
import NotificationsPopup from '@/components/NotificationDropdown';
import UserDropdown from '@/components/UserDropdown';
import { useSocket } from '@/hooks/useSocket';
import { Input } from '@/components/ui/input';

type AreaOption = {
    id: string | number;
    name: string;
    type: 'FAST_FOOD' | 'DINE_AREA';
};

const WorkPeriodPage = () => {
    // Modals
    const [showStartModal, setShowStartModal] = useState(false);
    const [showEndModal, setShowEndModal] = useState(false);
    // After selecting areas to end → show settle/leave action modal
    const [showActionModal, setShowActionModal] = useState(false);
    const [pendingEndAreas, setPendingEndAreas] = useState<AreaOption[]>([]);
    const [endPeriodError, setEndPeriodError] = useState<string | null>(null);

    const [isBatchStarting, setIsBatchStarting] = useState(false);
    const [isBatchEnding, setIsBatchEnding] = useState(false);

    // Confirmation Modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSettleConfirmModal, setShowSettleConfirmModal] = useState(false);
    const [, setIsSettling] = useState(false);
    const [confirmationSource, setConfirmationSource] = useState<
        'action' | 'end' | null
    >(null);

    const router = useRouter();

    const { data: response, isLoading } = useSWR(
        '/restaurants/work-period',
        () => getWorkPeriods(),
    );

    useSocket((event) => {
        if (event === 'work-period-update') {
            mutate('/restaurants/work-period');
        }
    });

    const { user } = useUser();

    const { data: areasResponse } = useSWR(
        '/restaurants/dine-in-areas',
        async () => {
            const authToken = (
                await import('@/app/actions/auth/auth-token')
            ).getAuthToken();
            const api = (await import('@/lib/axios')).default;
            const { data } = await api.get('/restaurants/dine-in-areas', {
                headers: { Authorization: `Bearer ${await authToken}` },
            });
            return data;
        },
    );

    const periods: any[] = response?.data || [];

    // All currently active periods (one per area)
    const activePeriods: any[] = useMemo(
        () => periods.filter((p: any) => p.isActive),
        [periods],
    );
    const hasAnyActivePeriod = activePeriods.length > 0;

    // Full area list (Fast Food + all Dine Areas)
    const allAreas: AreaOption[] = useMemo(() => {
        const areasData = Array.isArray(areasResponse)
            ? areasResponse
            : areasResponse?.data || [];
        const dineAreas: AreaOption[] = areasData.map((area: any) => ({
            id: area.id,
            name: area.name,
            type: 'DINE_AREA' as const,
        }));
        return [
            { id: 'fast-food', name: 'Fast Food', type: 'FAST_FOOD' as const },
            ...dineAreas,
        ];
    }, [areasResponse]);

    // Areas without an active period (eligible to start)
    const startableAreas: AreaOption[] = useMemo(() => {
        const activeAreaKeys = new Set(
            activePeriods.map((p: any) => {
                if (p.areaType === 'FAST_FOOD') return 'fast-food';
                return p.dineInArea?.id?.toString() ?? '';
            }),
        );
        return allAreas.filter((a) => !activeAreaKeys.has(a.id.toString()));
    }, [allAreas, activePeriods]);

    // Active periods expressed as AreaOption (for the end modal)
    const endableAreas: AreaOption[] = useMemo(() => {
        return activePeriods.map((p: any) =>
            p.areaType === 'FAST_FOOD'
                ? {
                      id: 'fast-food',
                      name: 'Fast Food',
                      type: 'FAST_FOOD' as const,
                  }
                : {
                      id: p.dineInArea?.id ?? '',
                      name: p.dineInArea?.name ?? 'Dine Area',
                      type: 'DINE_AREA' as const,
                  },
        );
    }, [activePeriods]);

    const formattedHistory = useMemo(() => {
        return periods.map((p: any) => {
            const startDate = new Date(p.startTime);
            const endDate = p.endTime ? new Date(p.endTime) : null;

            let duration = undefined;
            const end = endDate || (p.isActive ? new Date() : null);
            if (end) {
                const totalMinutes = differenceInMinutes(end, startDate);
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                duration = `${hours}h ${minutes}m`;
            }

            const areaLabel =
                p.areaType === 'FAST_FOOD'
                    ? 'Fast Food'
                    : p.dineInArea?.name || 'Dine Area';

            return {
                id: p.id.toString(),
                area: areaLabel,
                start: format(startDate, 'MMMM – EEEE d, h:mm a')
                    .replace('AM', 'Am')
                    .replace('PM', 'Pm'),
                end: endDate
                    ? format(endDate, 'MMMM – EEEE d, h:mm a')
                          .replace('AM', 'Am')
                          .replace('PM', 'Pm')
                    : undefined,
                duration,
                isActive: p.isActive,
                startTime: p.startTime,
                monthYearKey: format(startDate, 'MMMM yyyy'),
            };
        });
    }, [periods]);

    // Group work periods by month/year
    const groupedHistory = useMemo(() => {
        const groups: { [key: string]: typeof formattedHistory } = {};
        formattedHistory.forEach((period) => {
            if (!groups[period.monthYearKey]) {
                groups[period.monthYearKey] = [];
            }
            groups[period.monthYearKey].push(period);
        });
        return groups;
    }, [formattedHistory]);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // Handle search debounce
    React.useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery.trim().length > 0) {
                setIsSearching(true);
                setSearchError(null);
                try {
                    const result = await searchOrders(searchQuery.trim());
                    if (result.error) {
                        setSearchError(result.error);
                        setSearchResults([]);
                    } else {
                        setSearchResults(result.data || []);
                    }
                } catch {
                    setSearchError('An error occurred while searching');
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setSearchError(null);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Filter grouped history based on search results
    const filteredGroups = useMemo(() => {
        if (searchQuery.trim().length === 0) {
            return groupedHistory;
        }
        // Get unique work period IDs from search results
        const matchingWorkPeriodIds = new Set(
            searchResults
                .map((result: any) => result.workPeriod?.id)
                .filter(Boolean),
        );
        // Filter groups and periods to only include matching work periods
        const filtered: typeof groupedHistory = {};
        Object.entries(groupedHistory).forEach(([monthYear, periods]) => {
            const matchingPeriods = periods.filter((period) =>
                matchingWorkPeriodIds.has(parseInt(period.id)),
            );
            if (matchingPeriods.length > 0) {
                filtered[monthYear] = matchingPeriods;
            }
        });
        return filtered;
    }, [groupedHistory, searchResults, searchQuery]);

    const highlightedPeriodId = useMemo(() => {
        if (searchResults.length > 0) {
            // Find the first search result with a work period
            const firstResultWithWorkPeriod = searchResults.find(
                (result: any) => result.workPeriod,
            );
            if (firstResultWithWorkPeriod) {
                return firstResultWithWorkPeriod.workPeriod.id.toString();
            }
        }
        return undefined;
    }, [searchResults]);

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /** Resolve AreaOption[] → backend payload items */
    const toStartPayload = (areas: AreaOption[]) =>
        areas.map((a) => ({
            areaType: a.type,
            areaId: a.type === 'DINE_AREA' ? Number(a.id) : undefined,
        }));

    /** Resolve AreaOption[] → workPeriodIds[] */
    const toWorkPeriodIds = (areas: AreaOption[]): number[] => {
        return areas.flatMap((a) => {
            const match = activePeriods.find((p: any) => {
                if (a.type === 'FAST_FOOD') return p.areaType === 'FAST_FOOD';
                return p.dineInArea?.id === Number(a.id);
            });
            return match ? [match.id] : [];
        });
    };

    // ─── Handlers ────────────────────────────────────────────────────────────

    /**
     * Called by the START modal's onConfirm.
     * If settleAll is truthy here it has no meaning (it's a start action);
     * the param exists only because of the shared onConfirm signature.
     */
    const handleStartConfirm = async (selectedAreas: AreaOption[]) => {
        setIsBatchStarting(true);
        setShowStartModal(false);
        try {
            const payload = toStartPayload(selectedAreas);
            const result = await batchStartWorkPeriods(
                payload,
                new Date().toISOString(),
            );
            if (result.error) {
                toast.error(result.error);
            } else {
                const started = result.data?.started ?? [];
                const errors = result.data?.errors ?? [];
                if (started.length > 0) {
                    toast.success(
                        `Started ${started.length} work period${started.length > 1 ? 's' : ''} successfully`,
                    );
                }
                if (errors.length > 0) {
                    errors.forEach((e: any) =>
                        toast.error(`${e.area?.areaType}: ${e.error}`),
                    );
                }
                await mutate('/restaurants/work-period');
            }
        } finally {
            setIsBatchStarting(false);
        }
    };

    /**
     * Called when user picks which areas to end in the END modal.
     * Opens the settle/leave action modal for the final decision.
     */
    const handleEndConfirm = (
        selectedAreas: AreaOption[],
        settleAll?: boolean,
    ) => {
        setPendingEndAreas(selectedAreas);
        setShowEndModal(false);

        if (settleAll !== undefined && settleAll) {
            // "Settle Bills & End All" shortcut — show confirmation
            setIsSettling(true);
            setConfirmationSource('end');
            setShowSettleConfirmModal(true);
        } else if (settleAll !== undefined && !settleAll) {
            // End without settling
            executeBatchEnd(selectedAreas, false);
        } else {
            setShowActionModal(true);
        }
    };

    /** Execute the actual batch-end API call */
    const executeBatchEnd = async (
        areas: AreaOption[],
        settleBills: boolean,
    ) => {
        setIsBatchEnding(true);
        setEndPeriodError(null);
        try {
            const ids = toWorkPeriodIds(areas);
            if (ids.length === 0) {
                const msg = 'Could not find matching active work periods';
                setEndPeriodError(msg);
                toast.error(msg);
                setShowActionModal(true);
                return;
            }
            const result = await batchEndWorkPeriods(
                ids,
                new Date().toISOString(),
                settleBills,
            );
            if (result.error) {
                setEndPeriodError(result.error);
                toast.error(result.error);
                setShowActionModal(true);
                return;
            }
            const payload = result.data as {
                ended?: unknown[];
                errors?: { workPeriodId: number; error: string }[];
            };
            const partialErrors = payload?.errors ?? [];
            if (partialErrors.length > 0) {
                partialErrors.forEach((e) => toast.error(e.error));
            }
            const endedCount = payload?.ended?.length ?? ids.length;
            if (endedCount > 0) {
                toast.success(
                    `Ended ${endedCount} work period${endedCount > 1 ? 's' : ''} successfully`,
                );
                setShowActionModal(false);
                await mutate('/restaurants/work-period');
            } else if (partialErrors.length > 0) {
                setEndPeriodError(partialErrors[0].error);
                setShowActionModal(true);
            }
        } finally {
            setIsBatchEnding(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <PageWrapper className="bg-[#fcfcfc]">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="bg-[#fcfcfc] !p-0 !lg:p-0 gap-0">
            {/* ── Page header ── */}
            <div className="border-b border-gray-200">
                <div className="pt-6 px-8 pb-4 flex items-center justify-between">
                    <PageHeader>
                        <PageHeadertitle
                            title="Work Period"
                            subtitle="Manage work periods per area — Fast Food & Dine-in Areas"
                        />
                    </PageHeader>

                    <div className="flex items-center gap-3">
                        <NotificationsPopup />
                        {user && <UserDropdown role={user.roles?.name || ''} />}
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="mt-4">
                {periods.length === 0 ? (
                    /* First-ever use: nothing started yet */
                    <div className="max-w-4xl mx-auto px-8">
                        <WorkPeriodEmptyState
                            onStart={() => setShowStartModal(true)}
                            loading={isBatchStarting}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {/* Toolbar row */}
                        <div className="pt-4 px-8 pb-4 flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <h2 className="text-[18px] font-semibold text-[#000000] shrink-0">
                                    {format(new Date(), 'MMMM yyyy')}
                                </h2>
                                <div className="relative flex-1 max-w-md min-w-[200px]">
                                    <Input
                                        type="text"
                                        placeholder="Search by Docket ID, Order ID, Guest Name, or Phone..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-0  focus:border-orion-blue outline-none transition-all focus-visible:ring-orion-blue"
                                    />
                                    {isSearching && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin rounded-full h-4 w-4 border-b-2 border-orion-blue" />
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {startableAreas.length > 0 && (
                                    <Button
                                        onClick={() => setShowStartModal(true)}
                                        disabled={isBatchStarting}
                                        className="bg-[#007BFF] hover:bg-[#0069D9] text-white py-2 px-4 rounded-[10px] font-bold text-[14px] shadow-sm"
                                    >
                                        {isBatchStarting
                                            ? 'Starting…'
                                            : '＋ Start Period'}
                                    </Button>
                                )}
                                {hasAnyActivePeriod && (
                                    <Button
                                        variant="ghost"
                                        onClick={() => setShowEndModal(true)}
                                        disabled={isBatchEnding}
                                        className="border-1 border-[#007BFF] text-[#007BFF] hover:bg-blue-50 py-2 px-4 rounded-[10px] font-bold text-[14px] bg-transparent"
                                    >
                                        {isBatchEnding
                                            ? 'Ending…'
                                            : 'End Period'}
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="border-b border-[#E5E7EB] w-full" />

                        <div className="flex py-8 px-6">
                            {searchQuery.trim() &&
                            Object.keys(filteredGroups).length === 0 ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <p className="text-gray-500 text-lg">
                                        No matching work periods found
                                    </p>
                                </div>
                            ) : (
                                <WorkPeriodHistory
                                    groupedPeriods={filteredGroups}
                                    highlightedPeriodId={highlightedPeriodId}
                                    onPeriodClick={(id) => {
                                        const period = periods.find(
                                            (p: any) =>
                                                String(p.id) === String(id),
                                        );
                                        const params = new URLSearchParams();
                                        params.set('workPeriodId', id);
                                        if (period?.startTime) {
                                            const dt = new Date(
                                                period.startTime,
                                            );
                                            params.set(
                                                'startDate',
                                                dt.toISOString().split('T')[0],
                                            );
                                            params.set(
                                                'startTime',
                                                dt.toTimeString().slice(0, 5),
                                            );
                                        }
                                        if (period?.endTime) {
                                            const dt = new Date(period.endTime);
                                            params.set(
                                                'endDate',
                                                dt.toISOString().split('T')[0],
                                            );
                                            params.set(
                                                'endTime',
                                                dt.toTimeString().slice(0, 5),
                                            );
                                        }
                                        // Find the matching order in search results for this work period
                                        if (searchResults.length > 0) {
                                            const matchingOrder =
                                                searchResults.find(
                                                    (result) =>
                                                        result.workPeriod &&
                                                        String(
                                                            result.workPeriod
                                                                .id,
                                                        ) === String(id),
                                                );
                                            if (matchingOrder) {
                                                params.set(
                                                    'highlightOrderId',
                                                    matchingOrder.id.toString(),
                                                );
                                            }
                                        }
                                        router.push(
                                            `/front-of-house/order-history?${params.toString()}`,
                                        );
                                    }}
                                />
                            )}
                            <div className="w-px bg-[#D1D5DB] self-stretch" />
                            <div className="pl-12 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-220px)] pr-2">
                                {hasAnyActivePeriod ? (
                                    activePeriods.map((period: any) => {
                                        const areaLabel =
                                            period.areaType === 'FAST_FOOD'
                                                ? 'Fast Food'
                                                : period.dineInArea?.name ||
                                                  'Dine Area';
                                        return (
                                            <WorkPeriodActiveCard
                                                key={period.id}
                                                areaName={areaLabel}
                                                dayOfWork={format(
                                                    new Date(period.startTime),
                                                    'dd/MM/yyyy',
                                                )}
                                                timeOfWork={format(
                                                    new Date(period.startTime),
                                                    'h:mma',
                                                ).toLowerCase()}
                                                startTime={period.startTime}
                                                onClick={() =>
                                                    router.push(
                                                        `/front-of-house/order-history?workPeriodId=${period.id}`,
                                                    )
                                                }
                                                onEnd={() => {
                                                    // Pre-select just this card's area and go straight to action modal
                                                    const area: AreaOption =
                                                        period.areaType ===
                                                        'FAST_FOOD'
                                                            ? {
                                                                  id: 'fast-food',
                                                                  name: 'Fast Food',
                                                                  type: 'FAST_FOOD',
                                                              }
                                                            : {
                                                                  id: period
                                                                      .dineInArea
                                                                      ?.id,
                                                                  name: period
                                                                      .dineInArea
                                                                      ?.name,
                                                                  type: 'DINE_AREA',
                                                              };
                                                    setPendingEndAreas([area]);
                                                    setShowActionModal(true);
                                                }}
                                            />
                                        );
                                    })
                                ) : (
                                    <div className="w-[380px] p-8 bg-white rounded-[20px] border border-[#E5E7EB] h-fit text-center">
                                        <p className="text-[#5E6470] text-[15px] mb-6">
                                            No active work period
                                        </p>
                                        <Button
                                            onClick={() =>
                                                setShowStartModal(true)
                                            }
                                            disabled={isBatchStarting}
                                            className="w-full bg-[#007BFF] hover:bg-[#0069D9] text-white py-6 rounded-[10px] font-bold text-[16px] shadow-sm"
                                        >
                                            {isBatchStarting
                                                ? 'Starting…'
                                                : 'Start New Period'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Start modal: multi-select which areas to start ── */}
            <WorkPeriodAreaSelectionModal
                isOpen={showStartModal}
                onClose={() => setShowStartModal(false)}
                areas={startableAreas}
                mode="start"
                date={format(new Date(), 'dd/MM/yyyy')}
                onConfirm={(areas) => handleStartConfirm(areas)}
                isLoading={isBatchStarting}
            />

            {/* ── End modal: multi-select which active areas to end ── */}
            <WorkPeriodAreaSelectionModal
                isOpen={showEndModal}
                onClose={() => setShowEndModal(false)}
                areas={endableAreas}
                mode="end"
                date={
                    activePeriods[0]
                        ? format(
                              new Date(activePeriods[0].startTime),
                              'dd/MM/yyyy',
                          )
                        : format(new Date(), 'dd/MM/yyyy')
                }
                onConfirm={handleEndConfirm}
                isLoading={isBatchEnding}
            />

            {/* ── Action modal: settle or leave bills (for selected areas) ── */}
            <EndWorkPeriodActionModal
                isOpen={showActionModal}
                onClose={() => {
                    setShowActionModal(false);
                    setEndPeriodError(null);
                }}
                areaName={
                    pendingEndAreas.length === 1
                        ? pendingEndAreas[0].name
                        : `${pendingEndAreas.length} areas`
                }
                errorMessage={endPeriodError}
                isEnding={isBatchEnding}
                onSettle={() => {
                    setEndPeriodError(null);
                    setIsSettling(true);
                    setConfirmationSource('action');
                    setShowSettleConfirmModal(true);
                    setShowActionModal(false);
                }}
                onLeave={() => executeBatchEnd(pendingEndAreas, false)}
            />

            {/* ── Settle Bills Custom Confirmation modal ── */}
            <SettleBillsConfirmationModal
                isOpen={showSettleConfirmModal}
                onClose={() => {
                    setShowSettleConfirmModal(false);
                    if (confirmationSource === 'action') {
                        setShowActionModal(true);
                    } else if (confirmationSource === 'end') {
                        setShowEndModal(true);
                    }
                    setConfirmationSource(null);
                }}
                onContinue={async () => {
                    await executeBatchEnd(pendingEndAreas, true);
                    setShowSettleConfirmModal(false);
                }}
                onManualSettle={() => {
                    router.push('/front-of-house/incoming-orders?tab=running');
                    setShowSettleConfirmModal(false);
                }}
                areaName={
                    pendingEndAreas.length === 1
                        ? pendingEndAreas[0].name
                        : `${pendingEndAreas.length} areas`
                }
                isLoading={isBatchEnding}
            />

            {/* ── Confirmation modal (Generic) ── */}
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => {
                    setShowConfirmModal(false);
                    setConfirmationSource(null);
                }}
                onConfirm={async () => {
                    setShowConfirmModal(false);
                }}
                title="Are you sure?"
                description="This action cannot be undone."
                isLoading={isBatchEnding}
            />
        </PageWrapper>
    );
};

export default WorkPeriodPage;
