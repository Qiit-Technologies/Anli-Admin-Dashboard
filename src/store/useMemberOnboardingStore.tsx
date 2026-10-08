import {
    validateMemberDateOfBirth,
} from '@/lib/membership/member-utils';
import {
    OnboardMemberType,
    ReferredMember,
} from '@/types/membership/membership';
import { create } from 'zustand';

interface PrincipalMemberData extends OnboardMemberType {
    password?: string;
    confirmPassword?: string;
    religion?: string;
    homeAddress?: string;
    placeOfWork?: string;
}

interface MembershipDetails {
    membershipPlan: string;
    planId: number | null;
    startDate: string;
    endDate: string;
    membershipId: string;
}

interface ReferralMemberData extends ReferredMember {
    referralSubTier?: string;
}

interface ValidationState {
    profileInformationValid: boolean;
    identityVerificationValid: boolean;
    membershipDetailsValid: boolean;
    referralsValid: boolean;
}

interface MemberOnboardingStore {
    activeStep: number;
    maxSteps: number;

    principalMember: PrincipalMemberData;
    membershipDetails: MembershipDetails;
    referralMembers: ReferralMemberData[];

    validation: ValidationState;

    isSubmitting: boolean;
    isLoading: boolean;

    setActiveStep: (step: number) => void;
    nextStep: () => void;
    previousStep: () => void;
    canProceedToNextStep: () => boolean;

    updatePrincipalMember: (data: Partial<PrincipalMemberData>) => void;
    setPrincipalMemberField: (
        field: keyof PrincipalMemberData,
        value: string | number,
    ) => void;

    updateMembershipDetails: (data: Partial<MembershipDetails>) => void;
    setMembershipDetailsField: (
        field: keyof MembershipDetails,
        value: string | number | null,
    ) => void;

    addReferralMember: (member: ReferralMemberData) => void;
    updateReferralMember: (
        index: number,
        data: Partial<ReferralMemberData>,
    ) => void;
    removeReferralMember: (index: number) => void;
    setReferralMemberField: (
        index: number,
        field: keyof ReferralMemberData,
        value: string | number,
    ) => void;

    setStepValidation: (step: number, isValid: boolean) => void;
    validateCurrentStep: () => boolean;

    resetForm: () => void;
    getFormDataForSubmission: () => OnboardMemberType;
    setIsSubmitting: (loading: boolean) => void;
    setIsLoading: (loading: boolean) => void;
}

const initialPrincipalMember: PrincipalMemberData = {
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
    photoUrl: '',
    identificationUrl: '',
    referredMembers: [],
    password: '',
    confirmPassword: '',
    religion: '',
    homeAddress: '',
    placeOfWork: '',
};

const initialMembershipDetails: MembershipDetails = {
    membershipPlan: '',
    planId: null,
    startDate: '',
    endDate: '',
    membershipId: '',
};

const initialValidation: ValidationState = {
    profileInformationValid: false,
    identityVerificationValid: false,
    membershipDetailsValid: false,
    referralsValid: true,
};

const useMemberOnboardingStore = create<MemberOnboardingStore>()(
    (set, get) => ({
        activeStep: 0,
        maxSteps: 3,
        principalMember: initialPrincipalMember,
        membershipDetails: initialMembershipDetails,
        referralMembers: [],
        validation: initialValidation,
        isSubmitting: false,
        isLoading: false,

        setActiveStep: (step: number) => {
            const { maxSteps } = get();
            if (step >= 0 && step <= maxSteps) {
                set({ activeStep: step });
            }
        },

        nextStep: () => {
            const { activeStep, maxSteps } = get();
            if (activeStep < maxSteps) {
                set({ activeStep: activeStep + 1 });
            }
        },

        previousStep: () => {
            const { activeStep } = get();
            if (activeStep > 0) {
                set({ activeStep: activeStep - 1 });
            }
        },

        canProceedToNextStep: () => {
            const { activeStep, validation } = get();
            switch (activeStep) {
                case 0:
                    return validation.profileInformationValid;
                case 1:
                    return validation.identityVerificationValid;
                case 2:
                    return validation.membershipDetailsValid;
                case 3:
                    return validation.referralsValid;
                default:
                    return false;
            }
        },

        updatePrincipalMember: (data: Partial<PrincipalMemberData>) => {
            set((state) => ({
                principalMember: { ...state.principalMember, ...data },
            }));
        },

        setPrincipalMemberField: (
            field: keyof PrincipalMemberData,
            value: string | number,
        ) => {
            set((state) => ({
                principalMember: {
                    ...state.principalMember,
                    [field]: value,
                },
            }));
        },

        updateMembershipDetails: (data: Partial<MembershipDetails>) => {
            set((state) => ({
                membershipDetails: { ...state.membershipDetails, ...data },
            }));
        },

        setMembershipDetailsField: (
            field: keyof MembershipDetails,
            value: string | number | null,
        ) => {
            set((state) => ({
                membershipDetails: {
                    ...state.membershipDetails,
                    [field]: value,
                },
            }));
        },

        addReferralMember: (member: ReferralMemberData) => {
            set((state) => ({
                referralMembers: [...state.referralMembers, member],
            }));
        },

        updateReferralMember: (
            index: number,
            data: Partial<ReferralMemberData>,
        ) => {
            set((state) => {
                const updatedReferrals = [...state.referralMembers];
                if (index >= 0 && index < updatedReferrals.length) {
                    updatedReferrals[index] = {
                        ...updatedReferrals[index],
                        ...data,
                    };
                }
                return { referralMembers: updatedReferrals };
            });
        },

        removeReferralMember: (index: number) => {
            set((state) => ({
                referralMembers: state.referralMembers.filter(
                    (_, i) => i !== index,
                ),
            }));
        },

        setReferralMemberField: (
            index: number,
            field: keyof ReferralMemberData,
            value: string | number,
        ) => {
            set((state) => {
                const updatedReferrals = [...state.referralMembers];
                if (index >= 0 && index < updatedReferrals.length) {
                    updatedReferrals[index] = {
                        ...updatedReferrals[index],
                        [field]: value,
                    };
                }
                return { referralMembers: updatedReferrals };
            });
        },

        setStepValidation: (step: number, isValid: boolean) => {
            set((state) => {
                const newValidation = { ...state.validation };
                switch (step) {
                    case 0:
                        newValidation.profileInformationValid = isValid;
                        break;
                    case 1:
                        newValidation.identityVerificationValid = isValid;
                        break;
                    case 2:
                        newValidation.membershipDetailsValid = isValid;
                        break;
                    case 3:
                        newValidation.referralsValid = isValid;
                        break;
                }
                return { validation: newValidation };
            });
        },

        validateCurrentStep: () => {
            const { activeStep, principalMember, membershipDetails } = get();
            switch (activeStep) {
                case 0:
                    if (
                        !(
                            principalMember.firstName &&
                            principalMember.lastName &&
                            principalMember.phone &&
                            principalMember.gender
                        )
                    ) {
                        return false;
                    }

                    return validateMemberDateOfBirth(
                        principalMember.dateOfBirth,
                    ).valid;
                case 1:
                    return !!(
                        principalMember.photoUrl &&
                        principalMember.identificationUrl
                    );
                case 2:
                    return !!(
                        membershipDetails.planId &&
                        membershipDetails.startDate &&
                        membershipDetails.endDate
                    );
                case 3:
                    return true;
                default:
                    return false;
            }
        },

        resetForm: () => {
            set({
                activeStep: 0,
                principalMember: initialPrincipalMember,
                membershipDetails: initialMembershipDetails,
                referralMembers: [],
                validation: initialValidation,
                isSubmitting: false,
                isLoading: false,
            });
        },

        getFormDataForSubmission: (): OnboardMemberType => {
            const { principalMember, membershipDetails, referralMembers } =
                get();

            const validReferrals = referralMembers.filter(
                (referral) =>
                    referral.firstName?.trim() &&
                    referral.lastName?.trim() &&
                    referral.email?.trim() &&
                    referral.phone?.trim(),
            );

            const submissionData: any = {
                firstName: principalMember.firstName,
                lastName: principalMember.lastName,
                email: principalMember.email,
                phone: principalMember.phone,
                planId: membershipDetails.planId || principalMember.planId,
                startDate:
                    membershipDetails.startDate || principalMember.startDate,
                endDate: membershipDetails.endDate || principalMember.endDate,
                photoUrl: principalMember.photoUrl,
                identificationUrl: principalMember.identificationUrl,
                dateOfBirth: principalMember.dateOfBirth,
                gender: principalMember.gender,
                nationality: principalMember.nationality,
                occupation: principalMember.occupation,
                workAddress: principalMember.workAddress,
            };

            if (principalMember.workEmail?.trim()) {
                submissionData.workEmail = principalMember.workEmail;
            }

            if (validReferrals.length > 0) {
                submissionData.referredMembers = validReferrals.map(
                    (referral) => {
                        const referralData: any = {
                            firstName: referral.firstName,
                            lastName: referral.lastName,
                            email: referral.email,
                            phone: referral.phone,
                            relationshipToPlanOwner:
                                referral.relationshipToPlanOwner,
                            photoUrl: referral.photoUrl,
                            referralTierId: referral.referralTierId,
                            dateOfBirth: referral.dateOfBirth,
                            gender: referral.gender,
                            nationality: referral.nationality,
                            occupation: referral.occupation,
                            workAddress: referral.workAddress,
                            planId: referral.planId,
                            startDate: referral.startDate,
                            endDate: referral.endDate,
                            identificationUrl: referral.identificationUrl,
                            membershipTier: referral.membershipTier,
                        };

                        if (referral.workEmail?.trim()) {
                            referralData.workEmail = referral.workEmail;
                        }

                        return referralData;
                    },
                );
            }

            return submissionData;
        },

        setIsSubmitting: (loading: boolean) => set({ isSubmitting: loading }),
        setIsLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
);

export default useMemberOnboardingStore;

export type {
    MemberOnboardingStore,
    MembershipDetails,
    PrincipalMemberData,
    ReferralMemberData,
    ValidationState,
};
