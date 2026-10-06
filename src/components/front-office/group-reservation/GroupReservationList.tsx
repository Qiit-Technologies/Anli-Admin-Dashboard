'use client';

import BrandButton from '@/components/common/Button';
import { ErrorBanner } from '@/components/front-office/common/ErrorBanner';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Share2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LIST_TABS } from './constants';
import { GroupReservationCard } from './GroupReservationCard';
import { GroupReservationEmptyState } from './GroupReservationEmptyState';
import type { GroupBooking, GroupListTab, GroupModal, GroupType } from './types';

export function GroupReservationList({
    bookings,
    loading,
    error,
    onRetry,
    search,
    tab,
    groupType,
    onSearch,
    onTab,
    onGroupType,
    onManage,
    onCreate,
    onShare,
    onAction,
}: {
    bookings: GroupBooking[];
    loading?: boolean;
    error?: string | null;
    onRetry: () => void;
    search: string;
    tab: GroupListTab;
    groupType: GroupType | null;
    onSearch: (q: string) => void;
    onTab: (tab: GroupListTab) => void;
    onGroupType: (type: GroupType | null) => void;
    onManage: (id: string) => void;
    onCreate: () => void;
    onShare: () => void;
    onAction: (id: string, modal: GroupModal) => void;
}) {
    const isFiltered = Boolean(search.trim() || groupType || tab !== 'all');

    // With nothing booked yet there is nothing to filter, so the page shows
    // only the empty state. A failed fetch keeps the toolbar so the error is
    // not read as "no groups yet".
    if (!loading && !error && bookings.length === 0 && !isFiltered) {
        return (
            <div className="flex flex-1 flex-col">
                <GroupReservationEmptyState onCreate={onCreate} />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 rounded-[10px] border border-gray-100 bg-card px-4 py-3 sm:flex-row sm:items-center">
                <div className="relative min-w-0 sm:w-[21rem]">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Search by event name, client....."
                        className="h-10 rounded-lg border-gray-200 pl-10 text-sm shadow-none placeholder:text-gray-400"
                    />
                </div>
                <div className="flex items-center gap-3 sm:ml-auto">
                    <PermissionGate
                        blockType="modal"
                        permissions={[PERMISSIONS.CREATE_RESERVATION]}
                    >
                        <Button
                            variant="outline"
                            onClick={onShare}
                            className="h-10 gap-2 rounded-lg border-gray-200 text-sm font-medium shadow-none"
                        >
                            <Share2 className="size-4" />
                            Share Link
                        </Button>
                    </PermissionGate>
                    <PermissionGate
                        blockType="modal"
                        permissions={[PERMISSIONS.CREATE_RESERVATION]}
                    >
                        <BrandButton
                            icon={<Plus className="size-4" />}
                            onClick={onCreate}
                            className="h-10 rounded-lg text-sm font-semibold shadow-none"
                        >
                            New Booking
                        </BrandButton>
                    </PermissionGate>
                </div>
            </div>

            <Tabs
                value={tab}
                onValueChange={(value) => onTab(value as GroupListTab)}
            >
                <TabsList className="h-auto w-full justify-start gap-8 overflow-x-auto rounded-none border-b border-gray-200 bg-transparent p-0">
                    {LIST_TABS.map((item) => (
                        <TabsTrigger
                            key={item.value}
                            value={item.value}
                            className="rounded-none border-b-2 border-transparent px-0 pb-3 text-sm text-muted-foreground shadow-none data-[state=active]:border-hexbrand data-[state=active]:bg-transparent data-[state=active]:text-hexbrand data-[state=active]:shadow-none"
                        >
                            {item.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {error ? (
                <ErrorBanner error={error} onRetry={onRetry} />
            ) : loading ? (
                <div className="rounded-[10px] border border-gray-100 bg-card p-6 text-sm text-muted-foreground">
                    Loading group reservations...
                </div>
            ) : bookings.length === 0 ? (
                <div className="rounded-[10px] border border-gray-100 bg-card p-6 text-sm text-muted-foreground">
                    No group reservations match these filters.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                    {bookings.map((booking) => (
                        <GroupReservationCard
                            key={booking.id}
                            booking={booking}
                            onManage={onManage}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
