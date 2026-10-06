'use client';

import { useState, useEffect } from 'react';
import {
    HeaderActions,
    PageHeader,
    PageHeadertitle,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import { Button } from '@/components/ui/button';
import {
    searchGuestProfiles,
    getCreditAccount,
    type GuestProfile,
} from '@/app/actions/guest-profile';
import { CreateGuestProfileDialog } from '@/components/front-office/CreateGuestProfileDialog';
import { DepositCreditDialog } from '@/components/front-office/DepositCreditDialog';
import { GuestTransactionsModal } from '@/components/front-office/GuestTransactionsModal';
import { ViewGuestProfileModal } from '@/components/front-office/ViewGuestProfileModal';
import { MergeGuestProfilesDialog } from '@/components/front-office/MergeGuestProfilesDialog';
import { LinkStayDialog } from '@/components/front-office/LinkStayDialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import {
    GitMerge,
    Link as LinkIcon,
    MoreVertical,
    Eye,
    Wallet,
    History,
    Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';

type GuestProfileWithCredit = GuestProfile & {
    creditBalance?: number;
    totalDeposited?: number;
    totalUsed?: number;
};

export default function GuestProfilesPage() {
    const [profiles, setProfiles] = useState<GuestProfileWithCredit[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [depositDialogOpen, setDepositDialogOpen] = useState(false);
    const [transactionsModalOpen, setTransactionsModalOpen] = useState(false);
    const [viewProfileModalOpen, setViewProfileModalOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<GuestProfile | null>(
        null,
    );
    const [selectedProfileForTransactions, setSelectedProfileForTransactions] =
        useState<GuestProfile | null>(null);
    const [selectedProfileForView, setSelectedProfileForView] =
        useState<GuestProfileWithCredit | null>(null);
    const [selectedProfileForMerge, setSelectedProfileForMerge] =
        useState<GuestProfile | null>(null);
    const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
    const [linkStayDialogOpen, setLinkStayDialogOpen] = useState(false);
    const [selectedProfileForStay, setSelectedProfileForStay] =
        useState<GuestProfile | null>(null);

    const fetchProfiles = async (query: string = '') => {
        setLoading(true);
        try {
            const result = await searchGuestProfiles(
                query ? { query } : { query: '' },
            );

            if (result.error) {
                toast.error(result.error);
                setProfiles([]);
            } else if (result.data) {
                // Fetch credit balance for each profile
                const profilesWithCredit = await Promise.all(
                    result.data.map(async (profile) => {
                        try {
                            const credit = await getCreditAccount(profile.id);
                            return {
                                ...profile,
                                creditBalance: credit.data?.creditBalance || 0,
                                totalDeposited:
                                    credit.data?.totalDeposited || 0,
                                totalUsed: credit.data?.totalUsed || 0,
                            };
                        } catch {
                            return {
                                ...profile,
                                creditBalance: 0,
                                totalDeposited: 0,
                                totalUsed: 0,
                            };
                        }
                    }),
                );
                setProfiles(profilesWithCredit);
            } else {
                setProfiles([]);
            }
        } catch (error: any) {
            console.error('Error fetching profiles:', error);
            toast.error('Failed to fetch guest profiles');
            setProfiles([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch all profiles on mount
        fetchProfiles();
    }, []);

    useEffect(() => {
        // Debounce search
        const timeoutId = setTimeout(() => {
            if (searchQuery.length >= 2 || searchQuery.length === 0) {
                fetchProfiles(searchQuery);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleProfileCreated = () => {
        fetchProfiles(searchQuery);
    };

    const handleCreditDeposited = () => {
        fetchProfiles(searchQuery);
    };

    const handleProfilesMerged = () => {
        fetchProfiles(searchQuery);
    };

    const columns: ColumnDef<GuestProfileWithCredit>[] = [
        {
            accessorKey: 'id',
            header: 'Profile ID',
            cell: ({ row }) => (
                <span className="font-medium">#{row.original.id}</span>
            ),
        },
        {
            accessorKey: 'fullName',
            header: 'Full Name',
            cell: ({ row }) => (
                <span className="font-medium text-gray-900">
                    {row.original.fullName || '—'}
                </span>
            ),
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) => (
                <span className="text-gray-700">
                    {row.original.email || '—'}
                </span>
            ),
        },
        {
            accessorKey: 'phoneNumber',
            header: 'Phone Number',
            cell: ({ row }) => (
                <span className="text-gray-700">
                    {row.original.phoneNumber || '—'}
                </span>
            ),
        },
        {
            accessorKey: 'guestBookings',
            header: 'Stays',
            cell: ({ row }) => {
                const count = row.original.guestBookings?.length || 0;
                return (
                    <Badge
                        variant="outline"
                        className={
                            count > 0
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-gray-50 text-gray-600 border-gray-200'
                        }
                    >
                        {count} {count === 1 ? 'Stay' : 'Stays'}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'creditBalance',
            header: 'Credit Balance',
            cell: ({ row }) => {
                const balance = row.original.creditBalance || 0;
                return (
                    <Badge
                        variant="secondary"
                        className={
                            balance > 0
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                        }
                    >
                        {formatCurrency(balance)}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'totalDeposited',
            header: 'Total Deposited',
            cell: ({ row }) => (
                <span className="text-gray-700">
                    {formatCurrency(row.original.totalDeposited || 0)}
                </span>
            ),
        },
        {
            accessorKey: 'totalUsed',
            header: 'Total Used',
            cell: ({ row }) => (
                <span className="text-gray-700">
                    {formatCurrency(row.original.totalUsed || 0)}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const profile = row.original;
                return (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                    onClick={() => {
                                        setSelectedProfileForView(profile);
                                        setViewProfileModalOpen(true);
                                    }}
                                >
                                    <Eye className="mr-2 h-4 w-4 text-blue-500" />
                                    <span>View Details</span>
                                </DropdownMenuItem>
                                {/* <DropdownMenuItem
                                    onClick={() => {
                                        setSelectedProfileForTransactions(
                                            profile,
                                        );
                                        setTransactionsModalOpen(true);
                                    }}
                                >
                                    <History className="mr-2 h-4 w-4 text-gray-500" />
                                    <span>Transaction History</span>
                                </DropdownMenuItem> */}
                                {/* <DropdownMenuItem
                                    onClick={() => {
                                        setSelectedProfileForStay(profile);
                                        setLinkStayDialogOpen(true);
                                    }}
                                >
                                    <LinkIcon className="mr-2 h-4 w-4 text-emerald-500" />
                                    <span>Link Existing Stay</span>
                                </DropdownMenuItem> */}
                                {/* <DropdownMenuItem
                                    onClick={() => {
                                        setSelectedProfile(profile);
                                        setDepositDialogOpen(true);
                                    }}
                                >
                                    <Wallet className="mr-2 h-4 w-4 text-orange-500" />
                                    <span>Deposit Funds</span>
                                </DropdownMenuItem> */}
                                <DropdownMenuItem
                                    onClick={() => {
                                        setSelectedProfileForMerge(profile);
                                        setMergeDialogOpen(true);
                                    }}
                                >
                                    <GitMerge className="mr-2 h-4 w-4 text-purple-500" />
                                    <span>Merge Profile</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="flex flex-col h-full overflow-auto bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="Guest Profiles"
                    subtitle="Manage guest profiles and credit balances"
                />
                {/* <Button
                    onClick={() => setCreateDialogOpen(true)}
                    className="flex items-center gap-2 bg-orion-blue text-white hover:bg-orion-blue/80"
                >
                    <Plus className="w-4 h-4" />
                    Create Profile
                </Button> */}
                <HeaderActions />{' '}
            </PageHeader>
            <PageWrapper>
                <div className="mt-6">
                    {loading ? (
                        <div className="w-full h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                            Loading profiles...
                        </div>
                    ) : (
                        <CustomTable data={profiles} columns={columns} />
                    )}
                </div>

                <CreateGuestProfileDialog
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                    onSuccess={handleProfileCreated}
                />

                <DepositCreditDialog
                    open={depositDialogOpen}
                    onOpenChange={setDepositDialogOpen}
                    profile={selectedProfile}
                    onSuccess={handleCreditDeposited}
                />

                <GuestTransactionsModal
                    open={transactionsModalOpen}
                    onOpenChange={setTransactionsModalOpen}
                    profileId={selectedProfileForTransactions?.id || 0}
                    profileName={selectedProfileForTransactions?.fullName}
                />

                <ViewGuestProfileModal
                    open={viewProfileModalOpen}
                    onOpenChange={setViewProfileModalOpen}
                    profile={selectedProfileForView}
                />

                <MergeGuestProfilesDialog
                    open={mergeDialogOpen}
                    onOpenChange={setMergeDialogOpen}
                    onSuccess={handleProfilesMerged}
                    initialSourceProfile={selectedProfileForMerge}
                />

                <LinkStayDialog
                    open={linkStayDialogOpen}
                    onOpenChange={setLinkStayDialogOpen}
                    onSuccess={() => fetchProfiles(searchQuery)}
                    profileId={selectedProfileForStay?.id || 0}
                    profileName={selectedProfileForStay?.fullName || ''}
                />
            </PageWrapper>
        </div>
    );
}
