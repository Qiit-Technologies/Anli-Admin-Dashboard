'use client';
import {
    getFacilities,
    getMembershipPlans,
    updatePlanFacilityAccess,
} from '@/app/actions/membership';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import CustomTable from '@/components/common/table/CustomTable';
import Header from '@/components/membership/layout/header';
import {
    createFacilityAccessColumns,
    Facility,
    FacilityAccess,
    ReferralTier,
} from '@/components/membership/table/columns/facility-access-column';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

export interface MembershipPlan {
    id: number;
    name: string;
    price: number;
    numberOfReferrals: number;
    maxDurationMonths: number;
    createdAt: string;
    updatedAt: string;
    referralTiers?: ReferralTier[];
}

const PlanAccessiblePage = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(
        null,
    );
    const [facilityAccess, setFacilityAccess] = useState<
        Record<number, Record<string, Record<string, boolean>>>
    >({});
    const [facilityDurations, setFacilityDurations] = useState<
        Record<number, Record<string, Record<string, string>>>
    >({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { data: plansData, mutate: mutatePlans } = useSWR(
        '/api/membership-plans',
        () => getMembershipPlans(),
    );

    const { data: facilitiesData } = useSWR('/api/facilities', () =>
        getFacilities(),
    );

    const membershipPlans = plansData?.data?.membershipPlans || [];
    const facilities: Facility[] = facilitiesData?.data?.facilities || [];

    const referralTiers = useMemo(() => {
        if (!selectedPlan) return [];

        if (
            selectedPlan.referralTiers &&
            selectedPlan.referralTiers.length > 0
        ) {
            return selectedPlan.referralTiers;
        }

        const tiers: ReferralTier[] = [];
        const numberOfReferrals = selectedPlan.numberOfReferrals;

        for (let i = 1; i <= numberOfReferrals; i++) {
            const tierLevel = Math.ceil(i / 2);
            const tierSuffix = i % 2 === 1 ? 'A' : 'B';

            tiers.push({
                id: `tier-${tierLevel}${tierSuffix}`,
                name: `Tier ${tierLevel}${tierSuffix}`,
                description: `Access level for tier ${tierLevel}${tierSuffix}`,
                accessLevel: 'full access',
            });
        }

        return tiers;
    }, [selectedPlan]);

    useEffect(() => {
        if (selectedPlan && selectedPlan.referralTiers) {
            const planFacilityAccess: Record<
                string,
                Record<string, boolean>
            > = {};

            facilities.forEach((facility) => {
                planFacilityAccess[facility.id] = {
                    principal: true,
                };

                selectedPlan.referralTiers?.forEach((tier) => {
                    const hasAccess =
                        tier.facilitiesAccessible?.some(
                            (f: any) => f.id === facility.id,
                        ) || false;
                    planFacilityAccess[facility.id][tier.name] = hasAccess;
                });
            });

            setFacilityAccess((prev) => ({
                ...prev,
                [selectedPlan.id]: planFacilityAccess,
            }));
        }
    }, [selectedPlan, facilities]);

    const handleSaveFacilityAccess = async () => {
        if (!selectedPlan) return;

        setIsSaving(true);
        try {
            const result = await updatePlanFacilityAccess(
                selectedPlan.id,
                currentPlanFacilityAccess,
            );

            if (result.success) {
                toast.custom(() => (
                    <Toast
                        title="Facility Access Updated"
                        description="Facility access updated successfully"
                        type="success"
                    />
                ));
                mutatePlans();
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={
                            result.message || 'Failed to update facility access'
                        }
                        type="error"
                    />
                ));
            }
        } catch (error: any) {
            console.error('Error saving facility access:', error);
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="An error occurred while saving facility access"
                    type="error"
                />
            ));
        } finally {
            setIsSaving(false);
        }
    };

    const currentPlanFacilityAccess = selectedPlan
        ? facilityAccess[selectedPlan.id] || {}
        : {};

    const currentPlanFacilityDurations = selectedPlan
        ? facilityDurations[selectedPlan.id] || {}
        : {};

    const facilityAccessData: FacilityAccess[] = useMemo(() => {
        return facilities.map((facility) => ({
            facility,
            tierAccess: currentPlanFacilityAccess[facility.id] || {},
            maxDuration: currentPlanFacilityDurations[facility.id] || {
                default: 'Unlimited',
            },
        }));
    }, [facilities, currentPlanFacilityAccess, currentPlanFacilityDurations]);

    const handleAccessChange = useCallback(
        (facilityId: number, tierName: string, hasAccess: boolean) => {
            if (!selectedPlan) return;

            setFacilityAccess((prev) => ({
                ...prev,
                [selectedPlan.id]: {
                    ...prev[selectedPlan.id],
                    [facilityId]: {
                        ...prev[selectedPlan.id]?.[facilityId],
                        [tierName]: hasAccess,
                    },
                },
            }));
        },
        [selectedPlan],
    );

    const handleDurationChange = useCallback(
        (facilityId: number, tierName: string, duration: string) => {
            if (!selectedPlan) return;

            setFacilityDurations((prev) => ({
                ...prev,
                [selectedPlan.id]: {
                    ...prev[selectedPlan.id],
                    [facilityId]: {
                        ...prev[selectedPlan.id]?.[facilityId],
                        [tierName]: duration,
                    },
                },
            }));
        },
        [selectedPlan],
    );

    const columns = useMemo(() => {
        if (!selectedPlan) return [];

        return createFacilityAccessColumns({
            referralTiers,
            onAccessChange: handleAccessChange,
            onDurationChange: handleDurationChange,
        });
    }, [referralTiers, handleAccessChange, handleDurationChange]);

    const selectPlan = async (plan: MembershipPlan) => {
        setIsLoading(true);
        setSelectedPlan(plan);
        setIsLoading(false);
    };

    console.log('facilityAccess', facilityAccess);

    return (
        <PageWrapper className="p-0 md:px-0 gap-y-0" permissions={[PERMISSIONS.MANAGE_MEMBERSHIP_CONFIGURATION]}>
            <Header isOpen={isOpen} setIsOpen={setIsOpen} />

            <div className="p-6 flex flex-col gap-10">
                <PageHeader>
                    <PageHeadertitle
                        title="Plan Accessible"
                        subtitle={
                            'Monitor which plans are accessible to which services based on their referral tiers.'
                        }
                    />
                </PageHeader>
            </div>

            <div className="p-6 flex gap-4">
                <div className="bg-[#F4F4F4] h-fit flex flex-col w-full max-w-[15rem] gap-4 p-4 rounded-xl">
                    {membershipPlans.map((plan: MembershipPlan) => (
                        <button
                            key={plan.id}
                            onClick={() => selectPlan(plan)}
                            className={cn(
                                'text-gray-400 transition-all duration-300 bg-transparent rounded-lg p-3 cursor-pointer',
                                selectedPlan?.id === plan.id &&
                                    'bg-white text-[#7E460E]',
                                'hover:bg-white hover:text-[#7E460E]',
                            )}
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-medium">{plan.name}</span>
                            </div>
                        </button>
                    ))}
                </div>
                <div className="bg-white rounded-lg max-w-full overflow-x-auto flex-1 p-6">
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1">
                                <span className="text-lg font-medium">
                                    {selectedPlan?.name} Accessibility and
                                    permissions
                                </span>
                                <span className="text-sm text-gray-400">
                                    All facility allowed on the{' '}
                                    {selectedPlan?.name} plan
                                </span>
                            </div>
                            {selectedPlan && (
                                <Button
                                    onClick={handleSaveFacilityAccess}
                                    disabled={
                                        isSaving || !selectedPlan || isLoading
                                    }
                                    className="bg-orion-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            )}
                        </div>

                        {selectedPlan && facilityAccessData.length > 0 ? (
                            <CustomTable
                                data={facilityAccessData}
                                columns={columns}
                                hasHeader={false}
                                isPaginated={false}
                                fullWidth={true}
                                headerClassName="text-center"
                                cellClassName="text-center"
                                containerClassName="h-[calc(100vh-300px)] border-none rounded-none"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-32 text-gray-500">
                                {selectedPlan
                                    ? 'No facilities available'
                                    : 'Please select a membership plan to view facility access'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default PlanAccessiblePage;
