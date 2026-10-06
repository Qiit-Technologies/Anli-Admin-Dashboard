'use client';

import {
    createFacility,
    createMembershipPlan,
    createReferralTier,
    deleteFacility,
    getFacilities,
    getMembershipPlans,
    getReferralTiers,
} from '@/app/actions/membership';
import BrandButton from '@/components/common/Button';
import { InputField } from '@/components/common/Form';
import Header from '@/components/membership/layout/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Settings, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

interface MembershipPlan {
    id: string;
    name: string;
    description?: string;
    price?: number;
    duration?: number;
}

interface ReferralTier {
    id: string;
    name: string;
    description?: string;
    accessLevel?: string;
    facilitiesAccessible?: Facility[];
}

interface Facility {
    id: number;
    name: string;
    category?: string;
    isBookable?: boolean;
}

const AdminPage = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCreatingPlan, setIsCreatingPlan] = useState(false);
    const [isCreatingTier, setIsCreatingTier] = useState(false);
    const [isCreatingFacility, setIsCreatingFacility] = useState(false);

    const [planFormData, setPlanFormData] = useState({
        name: '',
        description: '',
        price: '',
        duration: '',
        features: '',
        numberOfReferrals: '',
    });

    const [tierFormData, setTierFormData] = useState({
        name: '',
        facilityIds: [] as number[],
    });

    const [facilityFormData, setFacilityFormData] = useState({
        name: '',
        category: '',
        isBookable: false,
    });

    const { data: data, mutate: mutatePlans } = useSWR(
        '/api/membership-plans',
        () => getMembershipPlans(),
    );

    const membershipPlans = data?.data?.membershipPlans;

    const { data: referralTiers, mutate: mutateTiers } = useSWR(
        '/api/referral-tiers',
        () => getReferralTiers(),
    );

    const referralTiersData = referralTiers?.data?.referralTiers;

    const {
        data: facilitiesData,
        error: facilitiesError,
        mutate: mutateFacilities,
    } = useSWR('/api/facilities', () => getFacilities());

    const facilities = facilitiesData?.data?.facilities || [];

    const handlePlanSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingPlan(true);

        try {
            const planData = {
                name: planFormData.name,
                price: parseFloat(planFormData.price) || 0,
                numberOfReferrals:
                    parseInt(planFormData.numberOfReferrals) || 0,
            };

            await createMembershipPlan(planData);
            toast.success('Membership plan created successfully!');

            setPlanFormData({
                name: '',
                description: '',
                price: '',
                duration: '',
                features: '',
                numberOfReferrals: '',
            });

            mutatePlans();
        } catch (error: any) {
            console.error('Error creating membership plan:', error);
            toast.error('Failed to create membership plan');
        } finally {
            setIsCreatingPlan(false);
        }
    };

    const handleTierSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingTier(true);

        try {
            const tierData = {
                name: tierFormData.name,
                facilityIds: tierFormData.facilityIds,
            };

            await createReferralTier(tierData);
            toast.success('Referral tier created successfully!');

            setTierFormData({
                name: '',
                facilityIds: [],
            });

            mutateTiers();
        } catch (error: any) {
            console.error('Error creating referral tier:', error);
            toast.error('Failed to create referral tier');
        } finally {
            setIsCreatingTier(false);
        }
    };

    const handleFacilitySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingFacility(true);

        try {
            const facilityData = {
                name: facilityFormData.name,
                category: facilityFormData.category || undefined,
                isBookable: facilityFormData.isBookable,
            };

            await createFacility(facilityData);
            toast.success('Facility created successfully!');

            setFacilityFormData({
                name: '',
                category: '',
                isBookable: false,
            });

            mutateFacilities();
        } catch (error: any) {
            console.error('Error creating facility:', error);
            toast.error('Failed to create facility');
        } finally {
            setIsCreatingFacility(false);
        }
    };

    const handleDeleteFacility = async (facilityId: number) => {
        if (!confirm('Are you sure you want to delete this facility?')) {
            return;
        }

        try {
            await deleteFacility(facilityId);
            toast.success('Facility deleted successfully!');
            mutateFacilities();
        } catch (error: any) {
            console.error('Error deleting facility:', error);
            toast.error('Failed to delete facility');
        }
    };

    const handlePlanInputChange = (field: string, value: string) => {
        setPlanFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleTierInputChange = (field: string, value: string) => {
        setTierFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleFacilityInputChange = (
        field: string,
        value: string | boolean,
    ) => {
        setFacilityFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleFacilitySelection = (
        facilityId: number,
        isSelected: boolean,
    ) => {
        setTierFormData((prev) => ({
            ...prev,
            facilityIds: isSelected
                ? [...prev.facilityIds, facilityId]
                : prev.facilityIds.filter((id) => id !== facilityId),
        }));
    };

    return (
        <main className="flex-1 bg-white min-h-screen">
            <Header isOpen={isOpen} setIsOpen={setIsOpen} />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Admin Panel
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage membership plans, referral tiers, and
                            facilities
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-gray-500" />
                        <span className="text-sm text-gray-500">
                            Configuration
                        </span>
                    </div>
                </div>

                <Tabs defaultValue="plans" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="plans">
                            Membership Plans
                        </TabsTrigger>
                        <TabsTrigger value="tiers">Referral Tiers</TabsTrigger>
                        <TabsTrigger value="facilities">Facilities</TabsTrigger>
                    </TabsList>

                    <TabsContent value="plans" className="mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Plus className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Create Membership Plan
                                        </h2>
                                    </div>
                                </div>

                                <form
                                    onSubmit={handlePlanSubmit}
                                    className="space-y-4"
                                >
                                    <InputField
                                        id="planName"
                                        name="planName"
                                        label="Plan Name"
                                        type="text"
                                        value={planFormData.name}
                                        onChange={(e) =>
                                            handlePlanInputChange(
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g., Gold Membership"
                                        required
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField
                                            id="planPrice"
                                            name="planPrice"
                                            label="Price (₦)"
                                            type="number"
                                            value={planFormData.price}
                                            onChange={(e) =>
                                                handlePlanInputChange(
                                                    'price',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                        />

                                        <InputField
                                            id="numberOfReferrals"
                                            name="numberOfReferrals"
                                            label="Number of Referrals"
                                            type="number"
                                            value={
                                                planFormData.numberOfReferrals
                                            }
                                            onChange={(e) =>
                                                handlePlanInputChange(
                                                    'numberOfReferrals',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="0"
                                            min="0"
                                            required
                                        />
                                    </div>

                                    <BrandButton
                                        type="submit"
                                        disabled={
                                            isCreatingPlan || !planFormData.name
                                        }
                                        className="w-full"
                                    >
                                        {isCreatingPlan
                                            ? 'Creating...'
                                            : 'Create Plan'}
                                    </BrandButton>
                                </form>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Existing Membership Plans
                                </h3>

                                {membershipPlans &&
                                Array.isArray(membershipPlans) &&
                                membershipPlans.length > 0 ? (
                                    <div className="space-y-3">
                                        {membershipPlans.map(
                                            (plan: MembershipPlan) => (
                                                <div
                                                    key={plan.id}
                                                    className="border border-gray-200 rounded-lg p-4"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">
                                                                {plan.name}
                                                            </h4>
                                                            {plan.description && (
                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    {
                                                                        plan.description
                                                                    }
                                                                </p>
                                                            )}
                                                            <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                                                {plan.price && (
                                                                    <span>
                                                                        ₦
                                                                        {plan.price.toLocaleString()}
                                                                    </span>
                                                                )}
                                                                {plan.duration && (
                                                                    <span>
                                                                        {
                                                                            plan.duration
                                                                        }{' '}
                                                                        months
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">
                                        No membership plans found. Create your
                                        first plan!
                                    </p>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="tiers" className="mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Plus className="w-5 h-5 text-green-600" />
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Create Referral Tier
                                    </h2>
                                </div>

                                <form
                                    onSubmit={handleTierSubmit}
                                    className="space-y-4"
                                >
                                    <InputField
                                        id="tierName"
                                        name="tierName"
                                        label="Tier Name"
                                        type="text"
                                        value={tierFormData.name}
                                        onChange={(e) =>
                                            handleTierInputChange(
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g., Tier 1A"
                                        required
                                    />

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Accessible Facilities
                                        </label>
                                        {facilitiesError ? (
                                            <p className="text-sm text-red-600">
                                                Error loading facilities
                                            </p>
                                        ) : facilities.length === 0 ? (
                                            <p className="text-sm text-gray-500">
                                                No facilities available. Create
                                                facilities first.
                                            </p>
                                        ) : (
                                            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-2">
                                                {facilities.map(
                                                    (facility: Facility) => (
                                                        <label
                                                            key={facility.id}
                                                            className="flex items-center space-x-2 cursor-pointer"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={tierFormData.facilityIds.includes(
                                                                    facility.id,
                                                                )}
                                                                onChange={(e) =>
                                                                    handleFacilitySelection(
                                                                        facility.id,
                                                                        e.target
                                                                            .checked,
                                                                    )
                                                                }
                                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <span className="text-sm text-gray-700">
                                                                {facility.name}
                                                                {facility.category && (
                                                                    <span className="text-gray-500 ml-1">
                                                                        (
                                                                        {
                                                                            facility.category
                                                                        }
                                                                        )
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </label>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            Select facilities that members of
                                            this tier can access. At least one
                                            facility must be selected.
                                        </p>
                                    </div>

                                    <BrandButton
                                        type="submit"
                                        disabled={
                                            isCreatingTier ||
                                            !tierFormData.name ||
                                            tierFormData.facilityIds.length ===
                                                0
                                        }
                                        className="w-full"
                                    >
                                        {isCreatingTier
                                            ? 'Creating...'
                                            : 'Create Tier'}
                                    </BrandButton>
                                </form>
                            </div>

                            {/* Existing Tiers */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Existing Referral Tiers
                                </h3>

                                {referralTiersData &&
                                Array.isArray(referralTiersData) &&
                                referralTiersData.length > 0 ? (
                                    <div className="space-y-3">
                                        {referralTiersData.map(
                                            (tier: ReferralTier) => (
                                                <div
                                                    key={tier.id}
                                                    className="border border-gray-200 rounded-lg p-4"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">
                                                                {tier.name}
                                                            </h4>
                                                            {tier.facilitiesAccessible &&
                                                                tier
                                                                    .facilitiesAccessible
                                                                    .length >
                                                                    0 && (
                                                                    <div className="mt-2">
                                                                        <p className="text-xs text-gray-500 mb-1">
                                                                            Accessible
                                                                            Facilities:
                                                                        </p>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {tier.facilitiesAccessible.map(
                                                                                (
                                                                                    facility,
                                                                                ) => (
                                                                                    <span
                                                                                        key={
                                                                                            facility.id
                                                                                        }
                                                                                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                                                                    >
                                                                                        {
                                                                                            facility.name
                                                                                        }
                                                                                    </span>
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">
                                        No referral tiers found. Create your
                                        first tier!
                                    </p>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="facilities" className="mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Plus className="w-5 h-5 text-purple-600" />
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Create Facility
                                    </h2>
                                </div>

                                <form
                                    onSubmit={handleFacilitySubmit}
                                    className="space-y-4"
                                >
                                    <InputField
                                        id="facilityName"
                                        name="facilityName"
                                        label="Facility Name"
                                        type="text"
                                        value={facilityFormData.name}
                                        onChange={(e) =>
                                            handleFacilityInputChange(
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g., Swimming Pool"
                                        required
                                    />

                                    <InputField
                                        id="facilityCategory"
                                        name="facilityCategory"
                                        label="Category (Optional)"
                                        type="text"
                                        value={facilityFormData.category}
                                        onChange={(e) =>
                                            handleFacilityInputChange(
                                                'category',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g., Recreation, Fitness"
                                    />

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="isBookable"
                                            checked={
                                                facilityFormData.isBookable
                                            }
                                            onChange={(e) =>
                                                handleFacilityInputChange(
                                                    'isBookable',
                                                    e.target.checked,
                                                )
                                            }
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label
                                            htmlFor="isBookable"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Requires Booking
                                        </label>
                                    </div>

                                    <BrandButton
                                        type="submit"
                                        disabled={
                                            isCreatingFacility ||
                                            !facilityFormData.name
                                        }
                                        className="w-full"
                                    >
                                        {isCreatingFacility
                                            ? 'Creating...'
                                            : 'Create Facility'}
                                    </BrandButton>
                                </form>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Existing Facilities
                                </h3>

                                {facilities &&
                                Array.isArray(facilities) &&
                                facilities.length > 0 ? (
                                    <div className="space-y-3">
                                        {facilities.map(
                                            (facility: Facility) => (
                                                <div
                                                    key={facility.id}
                                                    className="border border-gray-200 rounded-lg p-4"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-gray-900">
                                                                {facility.name}
                                                            </h4>
                                                            <div className="flex gap-2 mt-2">
                                                                {facility.category && (
                                                                    <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                                                                        {
                                                                            facility.category
                                                                        }
                                                                    </span>
                                                                )}
                                                                {facility.isBookable && (
                                                                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                                        Bookable
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteFacility(
                                                                    facility.id,
                                                                )
                                                            }
                                                            className="text-red-600 hover:text-red-800 p-1"
                                                            title="Delete facility"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">
                                        No facilities found. Create your first
                                        facility!
                                    </p>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
};

export default AdminPage;
