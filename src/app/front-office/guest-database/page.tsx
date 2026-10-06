/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { getGuestListByHotelId } from '@/app/actions/guest';
import { getAllReservations } from '@/app/actions/reservation';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import { NotificationsPopover } from '@/components/house-keeping/common/Notification';
import SearchInput from '@/components/house-keeping/common/SearchInput';
import { useGuestDatabaseColumns } from '@/components/front-office/tables/columns/GuestDatabase';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { Download, Printer, Settings, Users } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

type GuestDatabaseData = {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    nationality: string | null;
    customerType: string | null;
    loyaltyTier: string | null;
    visits: number;
    lastVisit: string | null;
    outstanding: number;
    guestId?: string;
};

const SummaryCard = ({
    title,
    value,
    description,
    icon,
    valueColor,
}: {
    title: string;
    value: number | string;
    description: string;
    icon: React.ReactNode;
    valueColor?: string;
}) => {
    return (
        <div className="bg-white border rounded-lg px-4 py-6 relative">
            <div className="absolute top-5 right-5 w-5 h-5 text-gray-400">
                {icon}
            </div>
            <div className="relative w-full">
                <span className="text-sm text-gray-600">{title}</span>
            </div>
            <div className="flex flex-col gap-0 mt-2">
                <h1
                    className={`text-2xl font-bold ${valueColor || 'text-gray-900'}`}
                >
                    {value}
                </h1>
                <span className="text-xs text-gray-500 leading-none mt-1">
                    {description}
                </span>
            </div>
        </div>
    );
};

const GuestDatabase = () => {
    const [guestList, setGuestList] = useState<any[]>([]);
    const [allReservations, setAllReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [customerTypeFilter, setCustomerTypeFilter] = useState<string>('all');
    const [loyaltyTierFilter, setLoyaltyTierFilter] = useState<string>('all');
    const columns = useGuestDatabaseColumns();

    useEffect(() => {
        const fetchGuestData = async () => {
            try {
                setLoading(true);

                const [currentResult, pastResult] = await Promise.all([
                    getGuestListByHotelId(),
                    getAllReservations({ isCheckedOut: true }),
                ]);

                if (currentResult?.error) {
                    setError(currentResult.error);
                    setGuestList([]);
                } else {
                    setGuestList(currentResult?.data ?? []);
                    setError(null);
                }

                if (pastResult?.data) {
                    setAllReservations(pastResult.data);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to fetch guests.');
            } finally {
                setLoading(false);
            }
        };

        fetchGuestData();
    }, []);

    // Process guest data to create database records
    // Group by phone number to get unique guest profiles
    const processedGuests = useMemo(() => {
        const guestMap = new Map<string, GuestDatabaseData>();
        let guestCounter = 1;

        // Process current guests
        guestList.forEach((guest: any) => {
            if (!guest || !guest.phoneNumber) return;

            const phoneKey = guest.phoneNumber.trim();
            const existing = guestMap.get(phoneKey);

            if (existing) {
                // Update visits count
                existing.visits += 1;
                // Update last visit if this is more recent
                if (
                    guest.startDate &&
                    (!existing.lastVisit ||
                        guest.startDate > existing.lastVisit)
                ) {
                    existing.lastVisit = guest.startDate;
                }
                // Add to outstanding balance
                existing.outstanding += guest.outstanding || 0;
                // Update customer type if it's "Both" or if we need to merge types
                if (guest.customerType) {
                    const existingType = existing.customerType?.toLowerCase();
                    const newType = guest.customerType.toLowerCase();
                    if (
                        newType === 'both' ||
                        (existingType !== 'both' && existingType !== newType)
                    ) {
                        existing.customerType = 'Both';
                    }
                }
                // Update loyalty tier to the highest one
                if (guest.loyaltyTier && !existing.loyaltyTier) {
                    existing.loyaltyTier = guest.loyaltyTier;
                }
            } else {
                guestMap.set(phoneKey, {
                    id: guestCounter++,
                    fullName: guest.fullName || '',
                    email: guest.email || '',
                    phoneNumber: guest.phoneNumber || '',
                    nationality: guest.nationality || null,
                    customerType: guest.customerType || 'Hotel',
                    loyaltyTier: guest.loyaltyTier || null,
                    visits: 1,
                    lastVisit: guest.startDate || null,
                    outstanding: guest.outstanding || 0,
                    guestId: `Goo${guestCounter - 1}`,
                });
            }
        });

        // Process past reservations
        allReservations.forEach((guest: any) => {
            if (!guest || !guest.phoneNumber) return;

            const phoneKey = guest.phoneNumber.trim();
            const existing = guestMap.get(phoneKey);

            if (existing) {
                existing.visits += 1;
                if (
                    guest.startDate &&
                    (!existing.lastVisit ||
                        guest.startDate > existing.lastVisit)
                ) {
                    existing.lastVisit = guest.startDate;
                }
                existing.outstanding += guest.outstanding || 0;
                // Update customer type if needed
                if (guest.customerType) {
                    const existingType = existing.customerType?.toLowerCase();
                    const newType = guest.customerType.toLowerCase();
                    if (
                        newType === 'both' ||
                        (existingType !== 'both' && existingType !== newType)
                    ) {
                        existing.customerType = 'Both';
                    }
                }
                // Update loyalty tier
                if (guest.loyaltyTier && !existing.loyaltyTier) {
                    existing.loyaltyTier = guest.loyaltyTier;
                }
            } else {
                guestMap.set(phoneKey, {
                    id: guestCounter++,
                    fullName: guest.fullName || '',
                    email: guest.email || '',
                    phoneNumber: guest.phoneNumber || '',
                    nationality: guest.nationality || null,
                    customerType: guest.customerType || 'Hotel',
                    loyaltyTier: guest.loyaltyTier || null,
                    visits: 1,
                    lastVisit: guest.startDate || null,
                    outstanding: guest.outstanding || 0,
                    guestId: `Goo${guestCounter - 1}`,
                });
            }
        });

        return Array.from(guestMap.values());
    }, [guestList, allReservations]);

    // Calculate statistics
    const statistics = useMemo(() => {
        const totalGuests = processedGuests.length;
        const hotelGuests = processedGuests.filter(
            (g) =>
                g.customerType?.toLowerCase() === 'hotel' ||
                g.customerType?.toLowerCase() === 'both',
        ).length;
        const restaurantDiners = processedGuests.filter(
            (g) =>
                g.customerType?.toLowerCase() === 'restaurant' ||
                g.customerType?.toLowerCase() === 'both',
        ).length;
        const outstandingBalances = processedGuests.filter(
            (g) => g.outstanding > 0,
        ).length;

        return {
            totalGuests,
            hotelGuests,
            restaurantDiners,
            outstandingBalances,
        };
    }, [processedGuests]);

    // Filter guests
    const filteredGuests = useMemo(() => {
        let filtered = processedGuests;

        if (customerTypeFilter !== 'all') {
            filtered = filtered.filter((g) => {
                const type = g.customerType?.toLowerCase() || '';
                if (customerTypeFilter === 'hotel') {
                    return type === 'hotel' || type === 'both';
                } else if (customerTypeFilter === 'restaurant') {
                    return type === 'restaurant' || type === 'both';
                } else if (customerTypeFilter === 'both') {
                    return type === 'both';
                }
                return true;
            });
        }

        if (loyaltyTierFilter !== 'all') {
            filtered = filtered.filter(
                (g) =>
                    g.loyaltyTier?.toLowerCase() ===
                    loyaltyTierFilter.toLowerCase(),
            );
        }

        return filtered;
    }, [processedGuests, customerTypeFilter, loyaltyTierFilter]);

    const handleDownload = () => {
        if (!filteredGuests.length) return;

        const headers = [
            'Guest ID',
            'Full Name',
            'Customer Type',
            'Phone Number',
            'Email',
            'Nationality',
            'Loyalty Tier',
            'Visits',
            'Last Visit',
            'Outstanding Balance',
        ];

        const rows = filteredGuests.map((guest) => [
            guest.guestId || `Goo${guest.id}`,
            guest.fullName || '',
            guest.customerType || '',
            guest.phoneNumber || '',
            guest.email || '',
            guest.nationality || '',
            guest.loyaltyTier || '',
            guest.visits.toString(),
            guest.lastVisit || '',
            formatCurrency(guest.outstanding),
        ]);

        const escapeCell = (cell: string) =>
            `"${String(cell ?? '').replace(/"/g, '""')}"`;

        const csvContent = [
            headers.map(escapeCell).join(','),
            ...rows.map((row) => row.map(escapeCell).join(',')),
        ].join('\r\n');

        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `guest-database-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <PageWrapper>
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading...</div>
                </div>
            </PageWrapper>
        );
    }

    if (error) {
        return (
            <PageWrapper>
                <div className="flex items-center justify-center h-64">
                    <div className="text-red-500">Error: {error}</div>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <PageHeader>
                <div className="flex items-center justify-between pb-4 -mx-4 px-4 lg:-mx-8 lg:px-8 border-b border-gray-200 w-[calc(100%+2rem)] lg:w-[calc(100%+4rem)]">
                    <SearchInput />
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="gap-2">
                            Upgrade now
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                        >
                            <Settings size={20} />
                        </Button>
                        <NotificationsPopover />
                    </div>
                </div>
                <div className="flex items-center justify-between gap-4 w-full">
                    <PageHeadertitle
                        title="Guest Database"
                        subtitle="Manage and track all guest information."
                    />

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
                            className="flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrint}
                            className="flex items-center gap-2"
                        >
                            <Printer className="w-4 h-4" />
                            Print
                        </Button>
                    </div>
                </div>
            </PageHeader>

            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SummaryCard
                        title="Total Guests"
                        value={statistics.totalGuests}
                        description="All customers"
                        icon={<Users className="w-5 h-5" />}
                    />
                    <SummaryCard
                        title="Hotel Guests"
                        value={statistics.hotelGuests}
                        description="Room stays & services"
                        icon={<Users className="w-5 h-5" />}
                    />
                    <SummaryCard
                        title="Restaurant Diners"
                        value={statistics.restaurantDiners}
                        description="Dining customers"
                        icon={<Users className="w-5 h-5" />}
                    />
                    <SummaryCard
                        title="Outstanding Balances"
                        value={statistics.outstandingBalances}
                        description="Requires attention"
                        icon={<Users className="w-5 h-5" />}
                        valueColor="text-red-500"
                    />
                </div>

                {/* Guest Records Table */}
                <div className="bg-white rounded-lg border">
                    <div className="p-6 border-b">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Guest Records
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Showing {filteredGuests.length} of{' '}
                                    {processedGuests.length} guests
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Select
                                    value={customerTypeFilter}
                                    onValueChange={setCustomerTypeFilter}
                                >
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="All Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Type
                                        </SelectItem>
                                        <SelectItem value="hotel">
                                            Hotel
                                        </SelectItem>
                                        <SelectItem value="restaurant">
                                            Restaurant
                                        </SelectItem>
                                        <SelectItem value="both">
                                            Both
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={loyaltyTierFilter}
                                    onValueChange={setLoyaltyTierFilter}
                                >
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="All Tier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Tier
                                        </SelectItem>
                                        <SelectItem value="platinum">
                                            Platinum
                                        </SelectItem>
                                        <SelectItem value="gold">
                                            Gold
                                        </SelectItem>
                                        <SelectItem value="silver">
                                            Silver
                                        </SelectItem>
                                        <SelectItem value="bronze">
                                            Bronze
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <CustomTable
                            columns={columns}
                            data={filteredGuests}
                            title=""
                            filters={[]}
                            hasFilter={false}
                        />
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default GuestDatabase;
