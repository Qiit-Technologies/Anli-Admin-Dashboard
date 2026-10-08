'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import CustomDialog from '@/components/common/CustomDialog';
import { formatCurrency, cn } from '@/lib/utils';
import {
    getGuestProfile,
    type GuestProfile,
} from '@/app/actions/guest-profile';
import {
    Wallet,
    User,
    Calendar,
    MapPin,
    Hash,
    Globe,
    Mail,
    Phone,
    Clock,
    FileText,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface ViewGuestProfileModalProps {
    open: boolean;
    onOpenChange: (_open: boolean) => void;
    profile: GuestProfile | null;
}

export const ViewGuestProfileModal = ({
    open,
    onOpenChange,
    profile: initialProfile,
}: ViewGuestProfileModalProps) => {
    const [profile, setProfile] = useState<GuestProfile | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchFullProfile = useCallback(
        async (id: number) => {
            setLoading(true);
            try {
                const result = await getGuestProfile(id);
                if (result.data) {
                    setProfile(result.data);
                } else {
                    setProfile(initialProfile); // Fallback to initial
                }
            } catch (error: any) {
                console.error('Error fetching full profile:', error);
                setProfile(initialProfile);
            } finally {
                setLoading(false);
            }
        },
        [initialProfile],
    );

    useEffect(() => {
        if (open && initialProfile) {
            void fetchFullProfile(initialProfile.id);
        } else if (!open) {
            setProfile(null);
        }
    }, [open, initialProfile, fetchFullProfile]);

    if (!initialProfile) return null;

    // Use fetched profile if available, otherwise use initial
    const displayProfile = profile || initialProfile;

    const formatDate = (date: Date | string | undefined) => {
        if (!date) return '-';
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return '-';
        return dateObj.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatDateTime = (date: Date | string | undefined) => {
        if (!date) return '-';
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return '-';
        const dateStr = dateObj.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
        const timeStr = dateObj.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
        return `${dateStr} at ${timeStr}`;
    };

    const creditBalance =
        displayProfile.creditAccounts?.[0]?.creditBalance ??
        displayProfile.creditBalance ??
        0;
    const totalDeposited =
        displayProfile.creditAccounts?.[0]?.totalDeposited ??
        displayProfile.totalDeposited ??
        0;
    const totalUsed =
        displayProfile.creditAccounts?.[0]?.totalUsed ??
        displayProfile.totalUsed ??
        0;

    return (
        <CustomDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Guest Profile"
            description="View complete details and stay history"
            confirmText="Close"
            onConfirm={() => onOpenChange(false)}
            maxWidth="2xl"
            footerType="full"
        >
            <div className="py-2">
                {loading && !profile ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="w-8 h-8 border-4 border-orion-blue border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-gray-500 font-medium">
                            Fetching profile details...
                        </p>
                    </div>
                ) : (
                    <Tabs defaultValue="details" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100/80 p-1 rounded-xl">
                            <TabsTrigger
                                value="details"
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                            >
                                <User className="w-4 h-4 mr-2" />
                                Personal Details
                            </TabsTrigger>
                            <TabsTrigger
                                value="stays"
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                            >
                                <Calendar className="w-4 h-4 mr-2" />
                                Stay History
                                {displayProfile.guestBookings &&
                                    displayProfile.guestBookings.length > 0 && (
                                        <Badge
                                            variant="secondary"
                                            className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-100 border-none h-5 px-1.5 min-w-[20px] justify-center"
                                        >
                                            {
                                                displayProfile.guestBookings
                                                    .length
                                            }
                                        </Badge>
                                    )}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="details"
                            className="mt-0 focus-visible:ring-0"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                <section className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                            <User className="w-3 h-3" />
                                            Identity Information
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <DetailItem
                                                label="Full Name"
                                                value={displayProfile.fullName}
                                                icon={
                                                    <User className="w-3.5 h-3.5" />
                                                }
                                            />
                                            <DetailItem
                                                label="Profile ID"
                                                value={`#${displayProfile.id}`}
                                                icon={
                                                    <Hash className="w-3.5 h-3.5" />
                                                }
                                            />
                                            <DetailItem
                                                label="ID Number"
                                                value={displayProfile.IDNumber}
                                                icon={
                                                    <FileText className="w-3.5 h-3.5" />
                                                }
                                            />
                                            <DetailItem
                                                label="Gender"
                                                value={displayProfile.gender}
                                                capitalize
                                            />
                                            <DetailItem
                                                label="Nationality"
                                                value={
                                                    displayProfile.nationality
                                                }
                                                icon={
                                                    <Globe className="w-3.5 h-3.5" />
                                                }
                                            />
                                            <DetailItem
                                                label="Date of Birth"
                                                value={formatDate(
                                                    displayProfile.dateOfBirth,
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                            <MapPin className="w-3 h-3" />
                                            Contact & Location
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <DetailItem
                                                label="Email Address"
                                                value={displayProfile.email}
                                                icon={
                                                    <Mail className="w-3.5 h-3.5" />
                                                }
                                            />
                                            <DetailItem
                                                label="Phone Number"
                                                value={
                                                    displayProfile.phoneNumber
                                                }
                                                icon={
                                                    <Phone className="w-3.5 h-3.5" />
                                                }
                                            />
                                            <DetailItem
                                                label="Physical Address"
                                                value={displayProfile.address}
                                                fullWidth
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                            <Wallet className="w-3 h-3" />
                                            Financial Standing
                                        </h3>
                                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5 space-y-4">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-xs font-medium text-emerald-600 mb-1">
                                                        Current Credit Balance
                                                    </p>
                                                    <p className="text-2xl font-bold text-emerald-700 leading-none">
                                                        {formatCurrency(
                                                            creditBalance,
                                                        )}
                                                    </p>
                                                </div>
                                                {creditBalance > 0 && (
                                                    <Badge className="bg-emerald-100 text-emerald-700 border-none px-2 py-1">
                                                        Active Funds
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-100">
                                                <div>
                                                    <p className="text-[10px] font-bold text-emerald-600/60 uppercase">
                                                        Total Deposited
                                                    </p>
                                                    <p className="text-sm font-semibold text-emerald-700">
                                                        {formatCurrency(
                                                            totalDeposited,
                                                        )}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-emerald-600/60 uppercase">
                                                        Total Used
                                                    </p>
                                                    <p className="text-sm font-semibold text-emerald-700">
                                                        {formatCurrency(
                                                            totalUsed,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            System Audit
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <DetailItem
                                                label="Account Type"
                                                value={displayProfile.guestType}
                                                capitalize
                                            />
                                            <DetailItem
                                                label="Member Since"
                                                value={formatDateTime(
                                                    displayProfile.createdAt,
                                                )}
                                            />
                                            <DetailItem
                                                label="Last Updated"
                                                value={formatDateTime(
                                                    displayProfile.updatedAt,
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {displayProfile.notes && (
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                <FileText className="w-3 h-3" />
                                                Notes
                                            </h3>
                                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed italic">
                                                &quot;{displayProfile.notes}
                                                &quot;
                                            </p>
                                        </div>
                                    )}
                                </section>
                            </div>
                        </TabsContent>

                        <TabsContent
                            value="stays"
                            className="mt-0 focus-visible:ring-0"
                        >
                            {displayProfile.guestBookings &&
                            displayProfile.guestBookings.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="rounded-xl border border-gray-100 overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-100">
                                                    <th className="px-4 py-3 text-left font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                                                        Booking Code
                                                    </th>
                                                    <th className="px-4 py-3 text-left font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                                                        Room
                                                    </th>
                                                    <th className="px-4 py-3 text-left font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                                                        Period
                                                    </th>
                                                    <th className="px-4 py-3 text-left font-bold text-gray-500 uppercase text-[10px] tracking-wider text-right">
                                                        Amount
                                                    </th>
                                                    <th className="px-4 py-3 text-left font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                                                        Source
                                                    </th>
                                                    <th className="px-4 py-3 text-left font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {displayProfile.guestBookings.map(
                                                    (stay) => (
                                                        <tr
                                                            key={stay.id}
                                                            className="hover:bg-gray-50/50 transition-colors"
                                                        >
                                                            <td className="px-4 py-4">
                                                                <span className="font-mono font-bold text-orion-blue">
                                                                    {stay.bookingCode ||
                                                                        stay.fullName ||
                                                                        'N/A'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium text-gray-900">
                                                                        Room{' '}
                                                                        {stay
                                                                            .room
                                                                            ?.roomNumber ||
                                                                            stay.roomNumber ||
                                                                            'N/A'}
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">
                                                                        {stay
                                                                            .roomType
                                                                            ?.name ||
                                                                            'Standard'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <div className="flex flex-col">
                                                                    <span className="text-gray-900 font-medium">
                                                                        {formatDate(
                                                                            stay.startDate,
                                                                        )}
                                                                    </span>
                                                                    <span className="text-xs text-gray-400">
                                                                        to{' '}
                                                                        {formatDate(
                                                                            stay.endDate,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 text-right">
                                                                <div className="flex flex-col items-end">
                                                                    <span className="font-bold text-gray-900">
                                                                        {formatCurrency(
                                                                            (Number(
                                                                                stay.amountPaid,
                                                                            ) ||
                                                                                0) +
                                                                                (Number(
                                                                                    stay.outstanding,
                                                                                ) ||
                                                                                    0),
                                                                        )}
                                                                    </span>
                                                                    {Number(
                                                                        stay.outstanding,
                                                                    ) > 0 && (
                                                                        <span className="text-[10px] text-red-500 font-bold">
                                                                            {formatCurrency(
                                                                                Number(
                                                                                    stay.outstanding,
                                                                                ) ||
                                                                                    0,
                                                                            )}{' '}
                                                                            DUE
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <span className="text-xs text-gray-600 font-medium bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                                                                    {stay.bookingSource ||
                                                                        'Direct'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <StayStatusBadge
                                                                    stay={stay}
                                                                />
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="text-[10px] text-gray-400 text-center italic">
                                        Stays are linked manually or during the
                                        check-in process.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <Calendar className="w-12 h-12 text-gray-200 mb-4" />
                                    <p className="text-gray-500 font-medium">
                                        No linked stays found
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Stays can be linked from the profile
                                        actions menu.
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </CustomDialog>
    );
};

type GuestBookingRow = NonNullable<GuestProfile['guestBookings']>[number];

const DetailItem = ({
    label,
    value,
    icon,
    capitalize,
    fullWidth,
}: {
    label: string;
    value?: string;
    icon?: ReactNode;
    capitalize?: boolean;
    fullWidth?: boolean;
}) => (
    <div
        className={cn('flex flex-col space-y-1', fullWidth && 'col-span-full')}
    >
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
            {label}
        </span>
        <div className="flex items-center gap-2">
            {icon && <span className="text-gray-400">{icon}</span>}
            <span
                className={cn(
                    'text-sm text-gray-900 font-medium',
                    capitalize && 'capitalize',
                )}
            >
                {value || '-'}
            </span>
        </div>
    </div>
);

const StayStatusBadge = ({ stay }: { stay: GuestBookingRow }) => {
    const today = new Date();
    const start = new Date(stay.startDate ?? Date.now());
    const end = new Date(stay.endDate ?? Date.now());

    let status = 'Upcoming';
    let color = 'bg-blue-100 text-blue-700';

    if (today >= start && today <= end) {
        status = 'In House';
        color = 'bg-emerald-100 text-emerald-700';
    } else if (today > end) {
        status = 'Completed';
        color = 'bg-green-100 text-green-700';
    }

    return (
        <Badge
            className={cn(
                'border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                color,
            )}
        >
            {status}
        </Badge>
    );
};
