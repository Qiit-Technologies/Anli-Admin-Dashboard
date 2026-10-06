'use client';
import { getGuestListByHotelId } from '@/app/actions/guest';
import {
    HeaderActions,
    PageHeader,
    PageHeadertitle,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import { MultiStepForm } from '@/components/front-office/common/Form/MultiStepFrom';
import { StepperDialog } from '@/components/front-office/common/Form/StepperDialog';
import {
    useGuestManagementColumns,
    useGuestContactColumns,
    GuestManagementFilters,
} from '@/components/front-office/tables/columns/GuestManagment';
import GuestManagementSkeleton from '@/components/front-office/guest-management/GuestManagementSkeleton';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import { getAllReservations } from '@/app/actions/reservation';

const GuestManagement = () => {
    const [reservationOpen, setReservationOpen] = useState(false);
    const [guestList, setGuestList] = useState<any[]>([]);
    const [contactList, setContactList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [contactLoading, setContactLoading] = useState(true);
    const [contactError, setContactError] = useState<string | null>(null);
    const columns = useGuestManagementColumns();
    const contactColumns = useGuestContactColumns();
    const [activeTab, setActiveTab] = useState<'reservations' | 'contacts'>(
        'reservations',
    );

    useEffect(() => {
        const fetchGuestData = async () => {
            try {
                setLoading(true);
                setContactLoading(true);

                // Fetch active guests first for fast page load
                const currentResult = await getGuestListByHotelId();

                if (currentResult?.error) {
                    setError(currentResult.error);
                    setGuestList([]);
                } else {
                    setGuestList(currentResult?.data ?? []);
                    setError(null);
                }
                setLoading(false);

                // Fetch past reservations in parallel without blocking main UI
                let pastResult: { data?: any[]; error?: string } | null = null;
                try {
                    pastResult = await getAllReservations({ isCheckedOut: true });
                } catch (e: any) {
                    console.warn('Failed to load past reservations for contacts list:', e);
                }

                if (pastResult?.error) {
                    setContactError(pastResult.error);
                } else {
                    setContactError(null);
                }

                const currentGuests = currentResult?.data ?? [];
                const pastGuests = pastResult?.data ?? [];

                const mergedContacts = new Map<number, any>();
                [...currentGuests, ...pastGuests].forEach((guest: any) => {
                    if (!guest) return;
                    const status = guest.isCheckedOut
                        ? 'Past'
                        : guest.isCheckedIn
                          ? 'Checked In'
                          : 'Upcoming';
                    mergedContacts.set(guest.id, {
                        ...guest,
                        contactStatus: status as
                            | 'Checked In'
                            | 'Upcoming'
                            | 'Past',
                    });
                });

                setContactList(Array.from(mergedContacts.values()));
            } catch (err: any) {
                setError(err.message || 'Failed to fetch guests.');
                setContactError(err.message || 'Failed to fetch contacts.');
            } finally {
                setLoading(false);
                setContactLoading(false);
            }
        };


        fetchGuestData();

        // Listen for guest data updates (e.g., when a service is logged from single guest page)
        const handleGuestDataUpdate = () => {
            fetchGuestData();
        };
        window.addEventListener('guest-data-updated', handleGuestDataUpdate);

        return () => {
            window.removeEventListener(
                'guest-data-updated',
                handleGuestDataUpdate,
            );
        };
    }, []);

    const handleExportContacts = () => {
        if (!contactList.length) {
            return;
        }

        const headers = ['Name', 'Email', 'Phone Number', 'Status'];
        const rows = contactList.map((guest: any) => {
            const status =
                guest.contactStatus ??
                (guest.isCheckedOut
                    ? 'Past'
                    : guest.isCheckedIn
                      ? 'Checked In'
                      : 'Upcoming');
            return [
                guest.fullName ?? '',
                guest.email ?? '',
                guest.phoneNumber ?? '',
                status,
            ];
        });

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
        link.download = `guest-contacts-${
            new Date().toISOString().split('T')[0]
        }.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return <GuestManagementSkeleton />;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="flex flex-col h-full overflow-auto bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="Guest Management"
                    subtitle={`Mangement of guest details`}
                />
                <HeaderActions />
            </PageHeader>
            <PageWrapper>
                <div>
                    <Tabs
                        value={activeTab}
                        onValueChange={(value) =>
                            setActiveTab(value as 'reservations' | 'contacts')
                        }
                        className="w-full"
                    >
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <TabsList className="flex w-full md:w-auto bg-gray-100 rounded-lg p-1">
                                    <TabsTrigger value="reservations">
                                        Reservations
                                    </TabsTrigger>
                                    <TabsTrigger value="contacts">
                                        Guest Contacts
                                    </TabsTrigger>
                                </TabsList>

                                {activeTab === 'reservations' && (
                                    <PermissionGate
                                        permissions={[
                                            PERMISSIONS.CREATE_RESERVATION,
                                        ]}
                                        permissionType="any"
                                        blockType="modal"
                                    >
                                        <StepperDialog
                                            open={reservationOpen}
                                            onOpenChange={setReservationOpen}
                                            trigger={
                                                <Button className="px-4 py-2 bg-orion-blue text-white rounded-lg hover:bg-blue-600 transition-colors">
                                                    Book New Reservation
                                                </Button>
                                            }
                                            title="Reservation"
                                            content={
                                                <MultiStepForm
                                                    onClose={() =>
                                                        setReservationOpen(
                                                            false,
                                                        )
                                                    }
                                                />
                                            }
                                        />
                                    </PermissionGate>
                                )}
                            </div>

                            <TabsContent value="reservations">
                                <CustomTable
                                    filters={GuestManagementFilters}
                                    columns={columns}
                                    data={guestList}
                                    title="All Reservations"
                                />
                            </TabsContent>

                            <TabsContent value="contacts">
                                {contactLoading ? (
                                    <div className="py-10 text-center text-sm text-gray-500">
                                        Loading guest contacts...
                                    </div>
                                ) : contactError ? (
                                    <div className="py-10 text-center text-sm text-red-500">
                                        {contactError}
                                    </div>
                                ) : (
                                    <CustomTable
                                        columns={contactColumns}
                                        data={contactList}
                                        title="Guest Contact List"
                                        filters={[]}
                                        hasFilter={false}
                                        extend={
                                            <Button
                                                variant="outline"
                                                onClick={handleExportContacts}
                                                disabled={!contactList.length}
                                            >
                                                Export Contacts
                                            </Button>
                                        }
                                    />
                                )}
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </PageWrapper>
        </div>
    );
};

export default GuestManagement;
