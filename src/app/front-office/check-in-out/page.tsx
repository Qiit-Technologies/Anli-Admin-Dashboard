'use client';
import { checkOutGuest } from '@/app/actions/checkOut';
import { getEarlyCheckoutDetails } from '@/app/actions/guest';
import { getCheckedInGuests } from '@/app/actions/reservation';
import BrandButton from '@/components/common/Button';
import { CustomSheet } from '@/components/common/CustomSheet';
import {
    HeaderActions,
    PageHeader,
    PageHeadertitle,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import CheckInOutSkeleton from '@/components/front-office/check-in-out/CheckInOutSkeleton';
import { CheckInOutGroupCard } from '@/components/front-office/check-in-out/CheckInOutGroupCard';
import ReservationCard from '@/components/front-office/common/Card/ReservationCard';
import { ColorLegend } from '@/components/front-office/common/ColorLegend';
import { EmptyState } from '@/components/front-office/common/EmptyState';
import { ErrorBanner } from '@/components/front-office/common/ErrorBanner';
import ExtendStayFlow from '@/components/front-office/common/Form/ExtendStay';
import { SearchBar } from '@/components/front-office/common/Search';
import { EarlyCheckoutModal } from '@/components/front-office/checkout/EarlyCheckoutModal';
import { GroupReservationWorkspace } from '@/components/front-office/group-reservation/GroupReservationWorkspace';
import { useGroupReservationQuery } from '@/components/front-office/group-reservation/useGroupReservationQuery';
import type { GroupBooking } from '@/components/front-office/group-reservation/types';
import { createCheckInOutColumns } from '@/components/front-office/tables/columns/CheckInOutColumn';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/context/useUser';
import { useListData } from '@/hooks/useListData';
import { cn } from '@/lib/utils';
import { Grid, List } from 'lucide-react';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

type CheckedInGuest = {
    id: number;
    fullName?: string;
    roomNumber?: string | number;
    groupReservationId?: number | null;
    groupReservationCode?: string | null;
    totalDue?: number;
    [key: string]: unknown;
};

function masterGuestId(booking: GroupBooking, guests: CheckedInGuest[]) {
    const contact = (booking.contactName || '').trim().toLowerCase();
    if (contact) {
        const fromGroup = booking.guests.find(
            (guest) => guest.name.trim().toLowerCase() === contact,
        );
        if (fromGroup?.backendId) return fromGroup.backendId;
        const fromStay = guests.find(
            (guest) =>
                String(guest.fullName || '')
                    .trim()
                    .toLowerCase() === contact,
        );
        if (fromStay) return fromStay.id;
    }
    return guests[0]?.id;
}

function partitionCheckedInGuests(
    reservations: CheckedInGuest[],
    groupBookings: GroupBooking[],
) {
    const bookingByBackendId = new Map(
        groupBookings
            .filter((booking) => Number.isFinite(booking.backendId))
            .map((booking) => [Number(booking.backendId), booking]),
    );
    const bookingByCode = new Map(
        groupBookings.map((booking) => [booking.id.toLowerCase(), booking]),
    );

    const groupBuckets = new Map<
        string,
        { booking: GroupBooking; guests: CheckedInGuest[] }
    >();
    const individuals: CheckedInGuest[] = [];

    for (const guest of reservations) {
        const groupId = Number(guest.groupReservationId);
        if (!Number.isFinite(groupId) || groupId <= 0) {
            individuals.push(guest);
            continue;
        }

        const code = String(guest.groupReservationCode || '').trim();
        const booking =
            bookingByBackendId.get(groupId) ||
            (code ? bookingByCode.get(code.toLowerCase()) : undefined) ||
            ({
                id: code || `GRP-${groupId}`,
                backendId: groupId,
                name: code || `Group ${groupId}`,
                groupType: 'other',
                status: 'active',
                amount: 0,
                deposit: 0,
                discount: 0,
                outstanding: 0,
                startDate: '—',
                endDate: '—',
                contactName: '',
                contactPhone: '',
                guests: [],
                roomCount: 0,
            } satisfies GroupBooking);

        const key = String(booking.backendId || booking.id);
        const existing = groupBuckets.get(key);
        if (existing) {
            existing.guests.push(guest);
            if (
                existing.booking.guests.length === 0 &&
                booking.guests.length > 0
            ) {
                existing.booking = booking;
            }
        } else {
            groupBuckets.set(key, { booking, guests: [guest] });
        }
    }

    return {
        groupSections: Array.from(groupBuckets.values()).sort((a, b) =>
            a.booking.name.localeCompare(b.booking.name),
        ),
        individuals,
    };
}

function CheckInOutList() {
    const [isCheckingOut, setIsCheckingOut] = useState<Set<number>>(new Set());
    const [activeTab, setActiveTab] = useState('all');
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
    const [guestStayOpen, setGuestStayOpen] = useState(false);
    const [showEarlyCheckoutDialog, setShowEarlyCheckoutDialog] =
        useState(false);
    const [earlyCheckoutDetails, setEarlyCheckoutDetails] = useState<any>(null);
    const [pendingCheckoutGuestId, setPendingCheckoutGuestId] = useState<
        number | null
    >(null);
    const [
        pendingTransferOutstandingToPmFolio,
        setPendingTransferOutstandingToPmFolio,
    ] = useState(false);
    const [groupBookings, setGroupBookings] = useState<GroupBooking[]>([]);
    const [groupReload, setGroupReload] = useState(0);
    const { user } = useUser();
    const query = useGroupReservationQuery();

    const handleGroupBookings = useCallback((bookings: GroupBooking[]) => {
        setGroupBookings(bookings);
    }, []);

    const {
        filteredData: filteredReservations,
        error,
        isLoading,
        searchQuery,
        setSearchQuery,
        refresh,
        handleDeleteSuccess,
        refetch,
        mutate: mutateList,
    } = useListData({
        fetchFunction: getCheckedInGuests,
        searchFields: ['fullName', 'id'],
    });

    useEffect(() => {
        const handleGuestDataUpdate = () => {
            refetch();
            setGroupReload((n) => n + 1);
        };
        window.addEventListener('guest-data-updated', handleGuestDataUpdate);

        return () => {
            window.removeEventListener(
                'guest-data-updated',
                handleGuestDataUpdate,
            );
        };
    }, [refetch]);

    const checkedIn = filteredReservations as CheckedInGuest[];

    const { roomNumbers, groupedByRoom } = useMemo(() => {
        const grouped = checkedIn.reduce(
            (acc, reservation) => {
                const roomNumber =
                    reservation.roomNumber?.toString() || 'Unknown';
                if (!acc[roomNumber]) {
                    acc[roomNumber] = [];
                }
                acc[roomNumber].push(reservation);
                return acc;
            },
            {} as Record<string, CheckedInGuest[]>,
        );

        const numbers = Object.keys(grouped).sort((a, b) => {
            if (a === 'Unknown') return 1;
            if (b === 'Unknown') return -1;
            return parseInt(a) - parseInt(b);
        });

        return {
            roomNumbers: numbers,
            groupedByRoom: grouped,
        };
    }, [checkedIn]);

    const currentReservations = useMemo(() => {
        if (activeTab === 'all') return checkedIn;
        return groupedByRoom[activeTab] || [];
    }, [activeTab, checkedIn, groupedByRoom]);

    const { groupSections, individuals } = useMemo(
        () => partitionCheckedInGuests(currentReservations, groupBookings),
        [currentReservations, groupBookings],
    );

    const executeCheckout = async (
        id: number,
        options?: { transferOutstandingToPmFolio?: boolean },
        transferUnusedBalanceToPayable?: boolean,
    ) => {
        if (isCheckingOut.has(id)) return;

        setIsCheckingOut((prev) => new Set(prev).add(id));

        try {
            const response = await checkOutGuest(
                id,
                'GOOD',
                undefined,
                options?.transferOutstandingToPmFolio,
                transferUnusedBalanceToPayable,
            );

            const checkoutSucceeded =
                response?.message === 'Check Out successfully!' ||
                response.message === 'No housekeepers available for this hotel';

            if (checkoutSucceeded) {
                mutateList((prev) => prev?.filter((item) => item.id !== id), {
                    revalidate: false,
                });
                await refetch();
                setGroupReload((n) => n + 1);
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('guest-data-updated'));
                }

                const description = transferUnusedBalanceToPayable
                    ? 'Checked out. Unused balance transferred to Account Payable.'
                    : options?.transferOutstandingToPmFolio &&
                        response?.message === 'Check Out successfully!'
                      ? 'Checked out. Outstanding balance posted to PM folio. Room released.'
                      : response.message ===
                          'No housekeepers available for this hotel'
                        ? 'Guest was checked out successfully, but no housekeeper was assigned.'
                        : response.message;

                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={description}
                        type={
                            response.message ===
                            'No housekeepers available for this hotel'
                                ? 'info'
                                : 'success'
                        }
                    />
                ));
            } else {
                const errorMsg = response?.message || 'Check-out failed';
                toast.custom(() => (
                    <Toast title="Error!" description={errorMsg} type="error" />
                ));
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'An unexpected error occurred during check-out';
            console.error('Check-out error:', err);

            toast.custom(() => (
                <Toast title="Error!" description={errorMessage} type="error" />
            ));
        } finally {
            setIsCheckingOut((prev) => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
            setShowEarlyCheckoutDialog(false);
            setEarlyCheckoutDetails(null);
            setPendingCheckoutGuestId(null);
            setPendingTransferOutstandingToPmFolio(false);
        }
    };

    const handleSubmit = async (
        id: number,
        options?: { transferOutstandingToPmFolio?: boolean },
        transferUnusedBalanceToPayable?: boolean,
        skipEarlyCheckout?: boolean,
    ) => {
        if (!skipEarlyCheckout) {
            const details = await getEarlyCheckoutDetails(id);
            if (details) {
                setEarlyCheckoutDetails(details);
                setPendingCheckoutGuestId(id);
                setPendingTransferOutstandingToPmFolio(
                    options?.transferOutstandingToPmFolio || false,
                );
                setShowEarlyCheckoutDialog(true);
                return;
            }
        }

        await executeCheckout(id, options, transferUnusedBalanceToPayable);
    };

    const openGroup = (recordId: string) => {
        query.setParams({ recordId, manage: '1' });
    };

    const extendGroup = (recordId: string) => {
        query.setParams({ recordId, modal: 'extendStay', manage: null });
    };

    const bulkCheckoutGroup = (recordId: string) => {
        query.setParams({ recordId, modal: 'bulkCheckOut', manage: null });
    };

    const renderGuestCard = (reservation: CheckedInGuest) => (
        <ReservationCard
            key={reservation.id}
            reservation={reservation as any}
            user={user}
            handleSubmit={handleSubmit}
            onDeleteSuccess={handleDeleteSuccess}
            mode="edit"
        />
    );

    const renderGroupedCards = () => {
        if (groupSections.length === 0 && individuals.length === 0) {
            return (
                <EmptyState
                    type="no-search-results"
                    title={`No ${activeTab === 'all' ? '' : activeTab} checked-in guests found`}
                    description={
                        searchQuery
                            ? 'No guests match your search criteria.'
                            : 'No guests found for this room.'
                    }
                    actionLabel={searchQuery ? 'Clear Search' : 'Refresh'}
                    onAction={
                        searchQuery ? () => setSearchQuery('') : refresh
                    }
                />
            );
        }

        return (
            <div className="grid grid-flow-row-dense grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {groupSections.map(({ booking, guests }) => {
                    const totalFromGroup = booking.guests.length;
                    const totalCount = Math.max(totalFromGroup, guests.length);
                    const checkedInFromGroup = booking.guests.filter(
                        (guest) => guest.stayStatus === 'checked-in',
                    ).length;
                    const checkedInCount = Math.max(
                        checkedInFromGroup,
                        guests.length,
                    );
                    const masterId = masterGuestId(booking, guests);
                    const staysDue = guests.reduce(
                        (sum, guest) => sum + Number(guest.totalDue || 0),
                        0,
                    );
                    return (
                        <CheckInOutGroupCard
                            key={booking.backendId || booking.id}
                            booking={booking}
                            checkedInCount={checkedInCount}
                            totalCount={totalCount}
                            roomCardCount={guests.length}
                            staysDue={staysDue}
                            onOpenGroup={openGroup}
                            onExtendGroup={extendGroup}
                            onBulkCheckout={bulkCheckoutGroup}
                        >
                            {guests.map((reservation) => (
                                <ReservationCard
                                    key={reservation.id}
                                    reservation={reservation as any}
                                    user={user}
                                    handleSubmit={handleSubmit}
                                    onDeleteSuccess={handleDeleteSuccess}
                                    mode="edit"
                                    appearance="group"
                                    groupStay={{
                                        isMaster: reservation.id === masterId,
                                        groupCode: booking.id,
                                        billingMode:
                                            booking.billingMode === 'individual'
                                                ? 'individual'
                                                : 'group',
                                        otherInHouseCount: Math.max(
                                            0,
                                            guests.length - 1,
                                        ),
                                    }}
                                />
                            ))}
                        </CheckInOutGroupCard>
                    );
                })}

                {individuals.map(renderGuestCard)}
            </div>
        );
    };

    const renderRightContent = () => {
        return (
            <div className="flex items-center gap-2">
                <div className="flex items-center border rounded-lg p-1">
                    <Button
                        size="sm"
                        onClick={() => setViewMode('cards')}
                        className={cn(
                            'h-7 px-2',
                            viewMode === 'cards'
                                ? 'bg-orion-blue text-white'
                                : 'bg-white text-black',
                            'shadow-none hover:bg-orion-blue hover:text-white',
                        )}
                    >
                        <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setViewMode('table')}
                        className={cn(
                            'h-7 px-2',
                            viewMode === 'table'
                                ? 'bg-orion-blue text-white'
                                : 'bg-white text-black',
                            'shadow-none hover:bg-orion-blue hover:text-white',
                        )}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>

                <PermissionGate
                    permissions={[PERMISSIONS.EXTEND_GUEST_STAY]}
                    blockType="hide"
                >
                    <BrandButton
                        onClick={() => setGuestStayOpen(true)}
                        size="sm"
                    >
                        Extend Stay
                    </BrandButton>
                </PermissionGate>
                {guestStayOpen && (
                    <CustomSheet
                        trigger={<div />}
                        title="Extend Guest Stay"
                        open={guestStayOpen}
                        setOpen={setGuestStayOpen}
                    >
                        <ExtendStayFlow
                            onClose={() => setGuestStayOpen(false)}
                        />
                    </CustomSheet>
                )}
            </div>
        );
    };

    if (isLoading) {
        return <CheckInOutSkeleton />;
    }

    return (
        <div className="flex flex-col h-full overflow-auto bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="Check In & Out"
                    subtitle={`${currentReservations.length} of ${checkedIn.length} checked in${activeTab !== 'all' ? ` in Room ${activeTab}` : ''}${
                        groupSections.length
                            ? ` · ${groupSections.length} group${groupSections.length === 1 ? '' : 's'}`
                            : ''
                    }`}
                />
                <HeaderActions />
            </PageHeader>
            <PageWrapper className="gap-2">
                {error && <ErrorBanner error={error} onRetry={refresh} />}

                <ColorLegend className="mb-4" />

                <SearchBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onRefresh={refresh}
                    isLoading={isLoading}
                    rightContent={renderRightContent()}
                />

                {checkedIn.length === 0 ? (
                    <EmptyState
                        type="no-data"
                        title="No checked-in guests found"
                        description={
                            error
                                ? 'There was an error loading checked-in guests.'
                                : 'All guests have been checked out or none are currently checked in.'
                        }
                        actionLabel="Refresh"
                        onAction={refresh}
                    />
                ) : (
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <TabsList className="w-full px-0 justify-start gap-4 bg-transparent">
                            <TabsTrigger
                                value="all"
                                className="text-base capitalize px-0 data-[state=active]:text-hexbrand data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-hexbrand"
                            >
                                All
                                <span className="text-xs bg-muted ml-2 px-1.5 py-0.5 rounded-full">
                                    {checkedIn.length}
                                </span>
                            </TabsTrigger>
                            {roomNumbers.map((roomNumber) => (
                                <TabsTrigger
                                    key={roomNumber}
                                    value={roomNumber}
                                    className="text-base capitalize px-0 data-[state=active]:text-hexbrand data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-hexbrand"
                                >
                                    Room {roomNumber}
                                    <span className="text-xs bg-muted ml-2 px-1.5 py-0.5 rounded-full">
                                        {groupedByRoom[roomNumber]?.length || 0}
                                    </span>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value="all" className="mt-4">
                            {viewMode === 'cards' ? (
                                renderGroupedCards()
                            ) : (
                                <CustomTable
                                    columns={createCheckInOutColumns(user)}
                                    data={checkedIn}
                                />
                            )}
                        </TabsContent>

                        {roomNumbers.map((roomNumber) => (
                            <TabsContent
                                key={roomNumber}
                                value={roomNumber}
                                className="mt-4"
                            >
                                {viewMode === 'cards' ? (
                                    renderGroupedCards()
                                ) : (
                                    <CustomTable
                                        columns={createCheckInOutColumns(user)}
                                        data={
                                            groupedByRoom[roomNumber] || []
                                        }
                                    />
                                )}
                            </TabsContent>
                        ))}
                    </Tabs>
                )}

                <GroupReservationWorkspace
                    hideList
                    reloadToken={groupReload}
                    onBookings={handleGroupBookings}
                    onCreate={() => undefined}
                />
            </PageWrapper>
            <EarlyCheckoutModal
                isOpen={showEarlyCheckoutDialog}
                onClose={() => {
                    setShowEarlyCheckoutDialog(false);
                    setEarlyCheckoutDetails(null);
                    setPendingCheckoutGuestId(null);
                    setPendingTransferOutstandingToPmFolio(false);
                }}
                earlyCheckoutDetails={earlyCheckoutDetails}
                onCheckoutWithoutTransfer={() => {
                    if (pendingCheckoutGuestId) {
                        handleSubmit(
                            pendingCheckoutGuestId,
                            {
                                transferOutstandingToPmFolio:
                                    pendingTransferOutstandingToPmFolio,
                            },
                            false,
                            true,
                        );
                    }
                }}
                onCheckoutWithTransfer={() => {
                    if (pendingCheckoutGuestId) {
                        handleSubmit(
                            pendingCheckoutGuestId,
                            {
                                transferOutstandingToPmFolio:
                                    pendingTransferOutstandingToPmFolio,
                            },
                            true,
                            true,
                        );
                    }
                }}
                isLoading={isCheckingOut.has(pendingCheckoutGuestId ?? 0)}
            />
        </div>
    );
}

export default function CheckInOut() {
    return (
        <Suspense fallback={<CheckInOutSkeleton />}>
            <CheckInOutList />
        </Suspense>
    );
}
