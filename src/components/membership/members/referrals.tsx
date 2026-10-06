'use client';
import { getMembershipPlans, onboardMember } from '@/app/actions/membership';
import BrandButton from '@/components/common/Button';
import { InputField } from '@/components/common/Form';
import Toast from '@/components/toast';
import useImageUpload from '@/hooks/useImageUpload';
import useMemberOnboardingStore from '@/store/useMemberOnboardingStore';
import { useRouter } from 'nextjs-toploader/app';
import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import FileUploader from '../fileUploader';
import { MFormColumn } from '../form';
import BenefitDropdown from './BenefitDropdown';

const Referrals: React.FC = () => {
    const router = useRouter();
    const { uploadImage, isLoading: isUploadingImage } = useImageUpload();
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    const {
        membershipDetails,
        referralMembers,
        addReferralMember,
        removeReferralMember,
        setReferralMemberField,
        validateCurrentStep,
        getFormDataForSubmission,
        resetForm,
    } = useMemberOnboardingStore();

    const {
        data: plansData,
        error,
        isLoading: loading,
    } = useSWR('/api/membership/plans', getMembershipPlans);

    const membershipPlans = useMemo(
        () => plansData?.data?.membershipPlans || [],
        [plansData],
    );

    const referralTiers = useMemo(() => {
        if (!membershipDetails.planId || !membershipPlans.length) {
            return [];
        }

        const selectedPlan = membershipPlans.find(
            (plan: any) =>
                plan.id.toString() === membershipDetails.planId?.toString(),
        );

        return selectedPlan?.referralTiers || [];
    }, [membershipDetails.planId, membershipPlans]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateCurrentStep()) {
            toast.custom(
                <Toast
                    type="error"
                    title="Validation Error"
                    description="Please fill in all required fields."
                />,
            );
            return;
        }

        if (!membershipDetails.planId) {
            toast.custom(
                <Toast
                    type="error"
                    title="Validation Error"
                    description="Please select a membership plan."
                />,
            );
            return;
        }

        try {
            setLoadingSubmit(true);

            const onboardingData = getFormDataForSubmission();

            console.log('[Referrals] Submitting onboarding data:', {
                principalMember: {
                    firstName: onboardingData.firstName,
                    lastName: onboardingData.lastName,
                    phone: onboardingData.phone,
                    email: onboardingData.email,
                    hasPhotoUrl: !!onboardingData.photoUrl,
                    hasIdentificationUrl: !!onboardingData.identificationUrl,
                },
                planId: onboardingData.planId,
                startDate: onboardingData.startDate,
                endDate: onboardingData.endDate,
                referredMembersCount:
                    onboardingData.referredMembers?.length || 0,
                userAgent: navigator.userAgent,
                connectionType:
                    (navigator as any).connection?.effectiveType || 'unknown',
            });

            const result = await onboardMember(onboardingData);

            if (result.data) {
                toast.custom(
                    <Toast
                        type="success"
                        title="Member onboarded successfully!"
                        description="You can now manage your member's profile and settings."
                    />,
                );
                resetForm();
                router.push('/membership/members');
            } else if (result.error) {
                toast.custom(
                    <Toast
                        type="error"
                        title="Onboarding failed"
                        description={result.error}
                    />,
                );
            }
        } catch (error: any) {
            console.error('Onboarding error:', error);
            toast.custom(
                <Toast
                    type="error"
                    title="Onboarding failed"
                    description="An error occurred. Please try again."
                />,
            );
        } finally {
            setLoadingSubmit(false);
        }
    };

    const handleInputChange = (
        index: number,
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setReferralMemberField(index, e.target.name as any, e.target.value);
    };

    const handleTierSelect = (index: number, tierId: number) => {
        setReferralMemberField(index, 'referralTierId', tierId);
    };

    const handlePhotoUpload = async (index: number, file: File | null) => {
        if (file) {
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                toast.custom(
                    <Toast
                        type="error"
                        title="File too large"
                        description="Please select an image smaller than 5MB"
                    />,
                );
                return;
            }

            try {
                const url = await uploadImage(file);
                if (url) {
                    setReferralMemberField(index, 'photoUrl', url);
                } else {
                    toast.custom(
                        <Toast
                            type="error"
                            title="Upload failed"
                            description="Failed to upload image. Please try again."
                        />,
                    );
                }
            } catch (error: any) {
                console.error('Upload error:', error);
                toast.custom(
                    <Toast
                        type="error"
                        title="Upload failed"
                        description="An error occurred while uploading. Please check your connection and try again."
                    />,
                );
            }
        }
    };

    const addNewReferral = () => {
        addReferralMember({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            workAddress: '',
            workEmail: '',
            dateOfBirth: '',
            gender: '',
            nationality: '',
            occupation: '',
            planId: 0,
            startDate: '',
            endDate: '',
            relationshipToPlanOwner: '',
            photoUrl: '',
            identificationUrl: '',
            membershipTier: '',
            referralTierId: undefined,
            referralSubTier: '',
        });
    };

    const removeReferral = (index: number) => {
        if (referralMembers.length > 1) {
            removeReferralMember(index);
        }
    };

    const inputStyle =
        'w-full border bg-white h-12 shadow-none border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

    return (
        <form
            className="space-y-6 w-full max-w-[600px]"
            onSubmit={handleSubmit}
        >
            {/* Add clear messaging that referrals are optional */}
            <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Add Referrals (Optional)
                </h2>
                <p className="text-sm text-gray-600">
                    You can add family members or friends to your membership
                    plan, or skip this step to continue.
                </p>
            </div>

            {referralMembers.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="space-y-4">
                        <div className="text-gray-500">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No referrals added
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Add family members or friends to share your
                                membership benefits
                            </p>
                            <button
                                type="button"
                                onClick={addNewReferral}
                                className="bg-[#007BFF] hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
                            >
                                Add First Referral
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {referralMembers.map((referral, index) => (
                        <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-6 space-y-4 relative"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Referral {index + 1}
                                </h3>
                                {referralMembers.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeReferral(index)}
                                        className="text-red-500 hover:text-red-700 font-medium text-sm"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>

                            <MFormColumn>
                                <InputField
                                    id={`referralFirstName-${index}`}
                                    name="firstName"
                                    label="First Name"
                                    type="text"
                                    placeholder="Enter first name"
                                    value={referral.firstName}
                                    onChange={(e) =>
                                        handleInputChange(index, e)
                                    }
                                    className={inputStyle}
                                    required
                                />
                                <InputField
                                    id={`referralLastName-${index}`}
                                    name="lastName"
                                    label="Last Name"
                                    type="text"
                                    placeholder="Enter last name"
                                    value={referral.lastName}
                                    onChange={(e) =>
                                        handleInputChange(index, e)
                                    }
                                    className={inputStyle}
                                    required
                                />
                            </MFormColumn>

                            <MFormColumn>
                                <InputField
                                    id={`referralEmail-${index}`}
                                    name="email"
                                    label="Email Address"
                                    type="email"
                                    inputMode="email"
                                    autoComplete="email"
                                    placeholder="Enter email address"
                                    value={referral.email}
                                    onChange={(e) =>
                                        handleInputChange(index, e)
                                    }
                                    className={inputStyle}
                                    required
                                />
                                <InputField
                                    id={`referralPhone-${index}`}
                                    name="phone"
                                    label="Phone Number"
                                    type="tel"
                                    inputMode="tel"
                                    autoComplete="tel"
                                    placeholder="Enter phone number"
                                    value={referral.phone}
                                    onChange={(e) =>
                                        handleInputChange(index, e)
                                    }
                                    className={inputStyle}
                                    required
                                />
                            </MFormColumn>

                            <InputField
                                id={`referralRelationship-${index}`}
                                name="relationshipToPlanOwner"
                                label="Relationship to Principal Member"
                                type="text"
                                placeholder="Eg. Spouse"
                                value={referral.relationshipToPlanOwner}
                                onChange={(e) => handleInputChange(index, e)}
                                className={inputStyle}
                            />

                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    Select Referral Tier & Benefits
                                </label>

                                {loading && (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-gray-500">
                                            Loading available tiers...
                                        </p>
                                    </div>
                                )}

                                {error && (
                                    <div className="text-red-500 text-sm">
                                        Failed to load membership plans
                                    </div>
                                )}

                                {!membershipDetails.planId && (
                                    <div className="text-amber-600 text-sm bg-amber-50 p-3 rounded border border-amber-200">
                                        Please select a membership plan in the
                                        previous step to see available referral
                                        tiers
                                    </div>
                                )}

                                {referralTiers.length === 0 &&
                                    membershipDetails.planId &&
                                    !loading && (
                                        <div className="text-gray-500 text-sm bg-gray-50 p-3 rounded border border-gray-200">
                                            No referral tiers available for the
                                            selected plan
                                        </div>
                                    )}

                                {referralTiers.length > 0 && (
                                    <BenefitDropdown
                                        tiers={referralTiers}
                                        selectedTierId={referral.referralTierId}
                                        onSelect={(tierId) =>
                                            handleTierSelect(index, tierId)
                                        }
                                        placeholder="Choose a referral tier"
                                    />
                                )}
                            </div>

                            <div className="mb-1 w-[160px]">
                                <FileUploader
                                    label="Photo ID Upload"
                                    onFileChange={(file) =>
                                        handlePhotoUpload(index, file)
                                    }
                                />
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addNewReferral}
                        className="text-sm font-semibold text-[#804407] cursor-pointer hover:text-[#a0550a] transition-colors"
                    >
                        + Add more referrals
                    </button>
                </>
            )}

            {isUploadingImage && (
                <div>
                    <p>Uploading...</p>
                </div>
            )}

            {/* Update the submit button text to be clearer */}
            <BrandButton
                type="submit"
                className="w-full bg-[#007BFF] hover:bg-blue-600 text-white py-3 h-12 rounded-md font-medium"
                loading={loadingSubmit}
                disabled={loading || !!error}
            >
                {referralMembers.length > 0
                    ? 'Continue with Referrals'
                    : 'Skip & Complete Registration'}
            </BrandButton>
        </form>
    );
};

export default Referrals;
