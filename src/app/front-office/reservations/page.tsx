'use client';
import { checkInGuest } from '@/app/actions/checkIn';
import { getAllReservations } from '@/app/actions/reservation';
import BrandButton from '@/components/common/Button';
import {
    HeaderActions,
    PageHeader,
    PageHeadertitle,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import ReservationCard from '@/components/front-office/common/Card/ReservationCard';
import { ColorLegend } from '@/components/front-office/common/ColorLegend';
import { EmptyState } from '@/components/front-office/common/EmptyState';
import { ErrorBanner } from '@/components/front-office/common/ErrorBanner';
import { MultiStepForm } from '@/components/front-office/common/Form/MultiStepFrom';
import { StepperDialog } from '@/components/front-office/common/Form/StepperDialog';
import { SearchBar } from '@/components/front-office/common/Search';
import { GroupReservationCard } from '@/components/front-office/group-reservation/GroupReservationCard';
import { GroupReservationWorkspace } from '@/components/front-office/group-reservation/GroupReservationWorkspace';
import { useGroupReservationQuery } from '@/components/front-office/group-reservation/useGroupReservationQuery';
import { shouldShowGroupOnReservationsList } from '@/components/front-office/group-reservation/booking-stats';
import type { GroupBooking } from '@/components/front-office/group-reservation/types';
import { useReservationColumns } from '@/components/front-office/tables/columns/ReservationsColumn';
import ShareBookingModal from '@/components/front-office/common/ShareBookingModal';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/context/useUser';
import { useListData } from '@/hooks/useListData';
import { cn } from '@/lib/utils';
import { Grid, List, Share2 } from 'lucide-react';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import ReservationsSkeleton from '@/components/front-office/reservations/ReservationsSkeleton';

function matchesGroupSearch(booking: GroupBooking, query: string) {
    if (!query.trim()) return true;
    const needle = query.toLowerCase();
    return [
        booking.name,
        booking.id,
        booking.contactName,
        booking.contactPhone,
        booking.groupType,
    ]
        .join(' ')
        .toLowerCase()
        .includes(needle);
}

function ReservationList() {
    const [isCheckingIn, setIsCheckingIn] = useState<Set<number>>(new Set());
    const [reservationOpen, setReservationOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [groupBookings, setGroupBookings] = useState<GroupBooking[]>([]);
    const [groupReload, setGroupReload] = useState(0);
    const { user } = useUser();
    const columns = useReservationColumns(user);
    const query = useGroupReservationQuery();

    const handleGroupBookings = useCallback((bookings: GroupBooking[]) => {
        setGroupBookings(bookings);
    }, []);

    const [includeVoided, setIncludeVoided] = useState(false);

    const {
        filteredData: fetchedReservations,
        error,
        isLoading,
        searchQuery,
        setSearchQuery,
        refresh,
        handleDeleteSuccess,
        refetch,
    } = useListData({
        fetchFunction: () =>
            getAllReservations(includeVoided ? undefined : { isVoid: false }),
        searchFields: ['fullName', 'id'],
    });

    // A guest inside a group stays on the group card. They get their own
    // reservation card only after they are pulled out of the group.
    const filteredReservations = fetchedReservations.filter(
        (reservation) => !reservation?.groupReservationId,
    );
    const visibleGroups = useMemo(
        () =>
            groupBookings.filter(
                (booking) =>
                    shouldShowGroupOnReservationsList(booking) &&
                    matchesGroupSearch(booking, searchQuery),
            ),
        [groupBookings, searchQuery],
    );

    useEffect(() => {
        const handleGuestDataUpdate = () => {
            refetch();
        };
        window.addEventListener('guest-data-updated', handleGuestDataUpdate);

        return () => {
            window.removeEventListener(
                'guest-data-updated',
                handleGuestDataUpdate,
            );
        };
    }, [refetch]);

    useEffect(() => {
        if (!query.create) return;
        setReservationOpen(true);
        query.setParams({ create: null });
        // Open once when landing from the retired /group-reservation/new route.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query.create]);

    const handleOnClose = async () => {
        setIsCheckingIn(new Set());
        setReservationOpen(false);
        setGroupReload((n) => n + 1);
        await refetch();
    };

    const createDialog = (
        <StepperDialog
            open={reservationOpen}
            onOpenChange={setReservationOpen}
            content={
                <MultiStepForm
                    onClose={handleOnClose}
                    onGroupCreated={(groupCode) => {
                        setGroupReload((n) => n + 1);
                        query.setParams({
                            recordId: groupCode || null,
                            manage: groupCode ? '1' : null,
                            create: null,
                            kind: null,
                        });
                    }}
                />
            }
            title="Create New Reservation"
            description="Fill in the guest and booking details below."
        />
    );

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

                <Button
                    size="lg"
                    variant={includeVoided ? 'default' : 'outline'}
                    onClick={() => {
                        setIncludeVoided((prev) => !prev);
                        setTimeout(() => refetch(), 0);
                    }}
                    className={cn(
                        'h-8 px-3 border rounded-md cursor-pointer',
                        includeVoided
                            ? 'bg-orion-blue text-white'
                            : 'bg-white text-black',
                        'shadow-none hover:bg-orion-blue hover:text-white',
                    )}
                >
                    {includeVoided ? 'Hide Voided' : 'Show Voided'}
                </Button>

                <PermissionGate
                    blockType="modal"
                    permissions={[PERMISSIONS.CREATE_RESERVATION]}
                >
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShareModalOpen(true)}
                        className="h-8 gap-2 border-[#D0D5DD] text-[#344054] hover:bg-gray-50 shadow-none"
                    >
                        <Share2 className="w-3.5 h-3.5" />
                        Share Link
                    </Button>
                </PermissionGate>

                <PermissionGate
                    blockType="modal"
                    permissions={[PERMISSIONS.CREATE_RESERVATION]}
                >
                    <BrandButton
                        onClick={() => setReservationOpen(true)}
                        size="sm"
                    >
                        New Booking
                    </BrandButton>
                </PermissionGate>
                <ShareBookingModal
                    open={shareModalOpen}
                    onOpenChange={setShareModalOpen}
                    hotelName={user?.hotel?.name || ''}
                    hotelId={user?.hotel?.id || ''}
                />
                {createDialog}
            </div>
        );
    };

    const { roomNumbers, groupedReservations } = useMemo(() => {
        const grouped = filteredReservations.reduce(
            (acc, reservation: any) => {
                if (!reservation) return acc;
                const roomNumber =
                    reservation.roomNumber?.toString() || 'Unknown';
                if (!acc[roomNumber]) {
                    acc[roomNumber] = [];
                }
                acc[roomNumber].push(reservation);
                return acc;
            },
            {} as Record<string, typeof filteredReservations>,
        );

        const numbers = Object.keys(grouped).sort((a, b) => {
            if (a === 'Unknown') return 1;
            if (b === 'Unknown') return -1;
            return a.localeCompare(b, undefined, { numeric: true });
        });

        return {
            roomNumbers: numbers,
            groupedReservations: grouped,
        };
    }, [filteredReservations]);

    const currentReservations = useMemo(() => {
        if (activeTab === 'all') {
            return filteredReservations;
        }
        return groupedReservations[activeTab] || [];
    }, [activeTab, filteredReservations, groupedReservations]);

    const handleSubmit = async (id: number) => {
        if (isCheckingIn.has(id)) return;

        setIsCheckingIn((prev) => new Set(prev).add(id));

        try {
            const response = await checkInGuest(id);

            if (response?.message === 'Check In successfully!') {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                await refetch();
            } else {
                const errorMsg = response?.message || 'Check-in failed';
                toast.custom(() => (
                    <Toast title="Error!" description={errorMsg} type="error" />
                ));
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'An unexpected error occurred';
            toast.custom(() => (
                <Toast title="Error!" description={errorMessage} type="error" />
            ));
        } finally {
            setIsCheckingIn((prev) => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    };

    const renderReservationGrid = (
        reservations: typeof filteredReservations,
        groups: GroupBooking[] = [],
    ) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-4">
            {groups.map((booking) => (
                <GroupReservationCard
                    key={booking.id}
                    booking={booking}
                    onManage={(recordId) =>
                        query.setParams({ recordId, manage: '1' })
                    }
                />
            ))}
            {reservations.map((reservation) => (
                <ReservationCard
                    mode="add"
                    key={reservation.id}
                    reservation={reservation as any}
                    handleSubmit={handleSubmit}
                    onDeleteSuccess={handleDeleteSuccess}
                    user={user}
                />
            ))}
            {reservations.length === 0 && groups.length === 0 ? (
                <div className="col-span-full">
                    <EmptyState
                        type="no-search-results"
                        title={`No ${activeTab === 'all' ? '' : activeTab} reservations found`}
                        description={
                            searchQuery
                                ? 'No reservations match your search criteria.'
                                : 'No reservations found for this category.'
                        }
                        actionLabel={searchQuery ? 'Clear Search' : 'Refresh'}
                        onAction={
                            searchQuery ? () => setSearchQuery('') : refresh
                        }
                    />
                </div>
            ) : null}
        </div>
    );

    if (isLoading) {
        return <ReservationsSkeleton />;
    }

    const allCount = filteredReservations.length + visibleGroups.length;
    const hasAny = filteredReservations.length > 0 || visibleGroups.length > 0;

    return (
        <div className="flex flex-col h-full overflow-auto bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="Reservations"
                    subtitle={`${currentReservations.length + (activeTab === 'all' ? visibleGroups.length : 0)} of ${allCount} reservations${activeTab !== 'all' ? ` in Room ${activeTab}` : ''}`}
                />
                <HeaderActions />
            </PageHeader>
            <PageWrapper className="gap-2">
                {error && <ErrorBanner error={error} onRetry={refresh} />}

                <ColorLegend className="mb-4" />

                <SearchBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onRefresh={() => {
                        refresh();
                        setGroupReload((n) => n + 1);
                    }}
                    isLoading={isLoading}
                    rightContent={renderRightContent()}
                />

                {!hasAny ? (
                    <EmptyState
                        type="no-data"
                        title="No reservations found"
                        description={
                            error
                                ? 'There was an error loading reservations.'
                                : 'Try refreshing or adding a new booking.'
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
                        <TabsList className="w-full overflow-x-auto px-0 justify-start gap-4 bg-transparent">
                            <TabsTrigger
                                value="all"
                                className="text-base capitalize px-0 data-[state=active]:text-hexbrand data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-hexbrand"
                            >
                                All
                                <span className="text-xs bg-muted ml-2 px-1.5 py-0.5 rounded-full">
                                    {allCount}
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
                                        {groupedReservations[roomNumber]
                                            ?.length || 0}
                                    </span>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value="all" className="mt-4">
                            {viewMode === 'cards' ? (
                                renderReservationGrid(
                                    filteredReservations,
                                    visibleGroups,
                                )
                            ) : (
                                <CustomTable
                                    columns={columns}
                                    data={filteredReservations}
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
                                    renderReservationGrid(
                                        groupedReservations[roomNumber] || [],
                                    )
                                ) : (
                                    <CustomTable
                                        columns={columns}
                                        data={
                                            groupedReservations[roomNumber] ||
                                            []
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
                    onCreate={() => setReservationOpen(true)}
                />
            </PageWrapper>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<ReservationsSkeleton />}>
            <ReservationList />
        </Suspense>
    );
}
