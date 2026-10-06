'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { SearchSelectAlternative } from '@/components/common/SearchSelectAlternative';
import {
    searchGuestProfiles,
    getAllGuestProfiles,
    getCreditAccount,
    type GuestProfile,
} from '@/app/actions/guest-profile';
import { X, Plus, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreateGuestProfileDialog } from './CreateGuestProfileDialog';
import { DepositCreditDialog } from './DepositCreditDialog';
import { formatCurrency } from '@/lib/utils';

interface GuestProfileSearchProps {
    selectedProfile: GuestProfile | null;
    onSelect: (profile: GuestProfile | null) => void;
    className?: string;
    hotelId?: number;
}

export function GuestProfileSearch({
    selectedProfile,
    onSelect,
    className = '',
}: GuestProfileSearchProps) {
    const [profiles, setProfiles] = useState<GuestProfile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [depositDialogOpen, setDepositDialogOpen] = useState(false);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchProfilesWithCredit = useCallback(
        async (profiles: GuestProfile[]) => {
            // Fetch credit balance for each profile
            const profilesWithCredit = await Promise.all(
                profiles.map(async (profile) => {
                    try {
                        const credit = await getCreditAccount(profile.id);
                        return {
                            ...profile,
                            creditBalance: credit.data?.creditBalance || 0,
                        };
                    } catch {
                        return {
                            ...profile,
                            creditBalance: 0,
                        };
                    }
                }),
            );
            setProfiles(profilesWithCredit);
        },
        [],
    );

    const handleSearch = useCallback(
        async (query: string) => {
            setIsLoading(true);
            try {
                let result;
                if (query && query.length >= 2) {
                    // Search with query
                    result = await searchGuestProfiles({ query });
                } else {
                    // Get all profiles when no query or query is too short
                    result = await getAllGuestProfiles();
                }

                if (result.data) {
                    await fetchProfilesWithCredit(result.data);
                } else {
                    setProfiles([]);
                }
            } catch (error: any) {
                console.error('Error fetching profiles:', error);
                setProfiles([]);
            } finally {
                setIsLoading(false);
            }
        },
        [fetchProfilesWithCredit],
    );

    const handleSearchChange = useCallback(
        (query: string) => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }

            // Debounce the search
            searchTimeoutRef.current = setTimeout(() => {
                handleSearch(query);
            }, 300);
        },
        [handleSearch],
    );

    // Fetch all profiles on mount
    useEffect(() => {
        handleSearch('');
    }, [handleSearch]);

    const displayValue = (profile: GuestProfile) => {
        const name = profile.fullName || 'Unknown';
        const credit =
            (profile as GuestProfile & { creditBalance?: number })
                .creditBalance || 0;
        return `${name} - Credit: ${formatCurrency(credit)}`;
    };

    const handleProfileCreated = (newProfile: GuestProfile) => {
        // Refresh credit balance and select the new profile
        getCreditAccount(newProfile.id).then((result) => {
            if (result.data) {
                const profileWithCredit = {
                    ...newProfile,
                    creditBalance: result.data.creditBalance || 0,
                };
                onSelect(profileWithCredit as GuestProfile);
            } else {
                onSelect(newProfile);
            }
        });
    };

    const handleCreditDeposited = () => {
        // Refresh credit balance for selected profile
        if (selectedProfile) {
            getCreditAccount(selectedProfile.id).then((result) => {
                if (result.data) {
                    const profileWithCredit = {
                        ...selectedProfile,
                        creditBalance: result.data.creditBalance || 0,
                    };
                    onSelect(profileWithCredit as GuestProfile);
                }
            });
        }
    };

    if (selectedProfile) {
        const creditBalance =
            (selectedProfile as GuestProfile & { creditBalance?: number })
                .creditBalance || 0;
        return (
            <div className={`space-y-2 ${className}`}>
                <label className="text-sm font-medium text-muted-foreground">
                    Bill to Guest Profile
                </label>
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex-1">
                        <p className="font-medium text-gray-900">
                            {selectedProfile.fullName || 'Unknown'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-700"
                            >
                                Credit: {formatCurrency(creditBalance)}
                            </Badge>
                            {selectedProfile.phoneNumber && (
                                <span className="text-xs text-gray-500">
                                    {selectedProfile.phoneNumber}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDepositDialogOpen(true)}
                            className="text-xs"
                        >
                            <Wallet className="w-3 h-3 mr-1" />
                            Deposit
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onSelect(null)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <DepositCreditDialog
                    open={depositDialogOpen}
                    onOpenChange={setDepositDialogOpen}
                    profile={selectedProfile}
                    onSuccess={handleCreditDeposited}
                />
            </div>
        );
    }

    return (
        <div className={`space-y-2 ${className}`}>
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">
                    Bill to Guest Profile (Optional)
                </label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCreateDialogOpen(true)}
                    className="text-xs"
                >
                    <Plus className="w-3 h-3 mr-1" />
                    Create New
                </Button>
            </div>
            <SearchSelectAlternative<GuestProfile>
                id="guestProfile"
                label=""
                placeholder="Search by name, phone, email, or ID number..."
                items={profiles}
                isLoading={isLoading}
                value={null}
                onChange={(profile) => {
                    onSelect(profile);
                }}
                onSearch={handleSearchChange}
                displayValue={displayValue}
                searchPlaceholder="Type to search profiles..."
                className="bg-white"
            />
            <p className="text-xs text-gray-500">
                Select a profile to link billing and use available credit, or
                create a new profile
            </p>
            <CreateGuestProfileDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={handleProfileCreated}
            />
        </div>
    );
}
