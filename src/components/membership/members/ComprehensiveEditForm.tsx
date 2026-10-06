'use client';
import {
    addReferredMembers,
    editMember,
    getMemberById,
    getMembershipPlans,
} from '@/app/actions/membership';
import BrandButton from '@/components/common/Button';
import { InputField, SelectField } from '@/components/common/Form';
import { SearchSelect } from '@/components/common/SearchSelect';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import useImageUpload from '@/hooks/useImageUpload';
import {
    Member,
    MembershipPlan,
    ReferralTierDefinition,
    ReferredMember,
} from '@/types/membership/membership';
import { Plus, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import FileUploader from '../fileUploader';
import { MFormColumn } from '../form';
import BenefitDropdown from './BenefitDropdown';

interface ComprehensiveEditFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

interface NewReferral {
    firstName: string;
    lastName: string;
    phone: string;
    relationshipToPlanOwner: string;
    referralTierId: number | null;
    photoUrl: string | null;
}

interface ReferralRecord {
    id: number;
    fullName: string;
    relationshipToPlanOwner: string;
    referralTierId: number | null;
    photoIdUrl?: string | null;
}

const ComprehensiveEditForm: React.FC<ComprehensiveEditFormProps> = ({
    onSuccess,
    onCancel,
}) => {
    const { member_id } = useParams();
    const { uploadImage } = useImageUpload();
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    const [originalData, setOriginalData] = useState<Partial<Member>>({});
    const [originalReferrals, setOriginalReferrals] = useState<
        ReferredMember[]
    >([]);
    const [referralRecords, setReferralRecords] = useState<ReferralRecord[]>(
        [],
    );
    const [newReferrals, setNewReferrals] = useState<NewReferral[]>([]);
    const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>(
        [],
    );
    const [referralTiers, setReferralTiers] = useState<
        ReferralTierDefinition[]
    >([]);
    const [loadingAddReferrals, setLoadingAddReferrals] = useState(false);
    const [loadingImageUpload, setLaodingImageUpload] = useState(false);
    const [customOccupation, setCustomOccupation] = useState('');

    const STANDARD_OCCUPATIONS = [
        'student',
        'teacher',
        'doctor',
        'lawyer',
        'engineer',
    ];

    const [formData, setFormData] = useState<Partial<Member>>({
        firstName: '',
        lastName: '',
        email: '',
        workEmail: '',
        phone: '',
        gender: undefined,
        nationality: '',
        occupation: '',
        workAddress: '',
        dateOfBirth: '',
        startDate: '',
        endDate: '',
        photoUrl: '',
        identificationUrl: '',
        planId: undefined,
    });

    const {
        data: memberData,
        mutate: mutateMemberData,
        error: memberError,
    } = useSWR(member_id ? `/api/members/${member_id}` : null, () =>
        getMemberById(member_id as string),
    );

    const { data: plansData } = useSWR(
        '/api/membership/plans',
        getMembershipPlans,
    );

    useEffect(() => {
        if (plansData?.data?.membershipPlans) {
            setMembershipPlans(plansData.data.membershipPlans || []);
        }
    }, [plansData]);

    useEffect(() => {
        if (memberData?.data?.member?.plan && membershipPlans.length > 0) {
            const memberPlan = membershipPlans.find(
                (plan) => plan.id === memberData.data.member.plan.id,
            );
            if (memberPlan?.referralTiers) {
                setReferralTiers(memberPlan.referralTiers);
            }
        }
    }, [memberData, membershipPlans]);

    useEffect(() => {
        if (memberData?.data?.member) {
            const member = memberData.data.member;

            const formatDateForInput = (
                date: string | Date | null | undefined,
            ): string => {
                if (!date) return '';
                try {
                    const dateObj = new Date(date);
                    if (isNaN(dateObj.getTime())) return '';
                    return dateObj.toISOString().split('T')[0];
                } catch {
                    return '';
                }
            };

            const initialData = {
                firstName: member.firstName || '',
                lastName: member.lastName || '',
                email: member.email || '',
                workEmail: member.workEmail || '',
                phone: member.phone || '',
                gender: member.gender || undefined,
                nationality: member.nationality || '',
                occupation: member.occupation || '',
                workAddress: member.workAddress || '',
                dateOfBirth: formatDateForInput(member.dateOfBirth),
                startDate: formatDateForInput(member.startDate),
                endDate: formatDateForInput(member.endDate),
                photoUrl: member.photoUrl || '',
                identificationUrl: member.identificationUrl || '',
                planId:
                    (member.planId && Number(member.planId)) ||
                    (member.plan?.id && Number(member.plan.id)) ||
                    undefined,
            };

            setFormData(initialData);
            setOriginalData(initialData);

            // Handle custom occupation
            if (member.occupation) {
                const isStandard = STANDARD_OCCUPATIONS.includes(
                    member.occupation.toLowerCase(),
                );
                if (!isStandard) {
                    setCustomOccupation(member.occupation);
                }
            }

            if (member.referredMembers) {
                setOriginalReferrals(member.referredMembers);
            }
            if (member.referralRecords?.length) {
                setReferralRecords(member.referralRecords);
            }
        }
    }, [memberData]);

    const isPrincipal =
        memberData?.data?.member?.membershipTier === 'principal';

    const addNewReferral = () => {
        setNewReferrals([
            ...newReferrals,
            {
                firstName: '',
                lastName: '',
                phone: '',
                relationshipToPlanOwner: '',
                referralTierId: null,
                photoUrl: null,
            },
        ]);
    };

    const removeNewReferral = (index: number) => {
        setNewReferrals(newReferrals.filter((_, i) => i !== index));
    };

    const updateNewReferral = (
        index: number,
        field: keyof NewReferral,
        value: any,
    ) => {
        const updated = [...newReferrals];
        updated[index] = { ...updated[index], [field]: value };
        setNewReferrals(updated);
    };

    const [uploadingCount, setUploadingCount] = useState(0);

    const handleReferralPhotoUpload = async (
        index: number,
        file: File | null,
    ) => {
        if (!file) return;
        setLaodingImageUpload(true);
        setUploadingCount((c) => c + 1);
        try {
            const url = await uploadImage(file);
            if (url) {
                updateNewReferral(index, 'photoUrl', url);
                mutateMemberData();
                setLaodingImageUpload(false);
            } else {
                setLaodingImageUpload(false);
                toast.custom(
                    <Toast
                        type="error"
                        title="Upload failed"
                        description="Photo upload failed - no URL returned"
                    />,
                );
            }
        } catch (error: any) {
            setLaodingImageUpload(false);
            console.error('Photo upload error:', error);
            toast.custom(
                <Toast
                    type="error"
                    title="Upload failed"
                    description="An error occurred while uploading the photo"
                />,
            );
        } finally {
            setUploadingCount((c) => Math.max(0, c - 1));
        }
    };

    async function saveReferrals() {
        setLoadingAddReferrals(true);
        try {
            const principalId = memberData?.data?.member?.id;
            const payloads = newReferrals.map((r) => ({
                firstName: r.firstName,
                lastName: r.lastName,
                phone: r.phone,
                referralTierId: r.referralTierId,
                relationshipToPlanOwner: r.relationshipToPlanOwner,
                photoUrl: r.photoUrl || undefined,
            }));

            const res = await addReferredMembers(principalId, payloads);

            toast.success(
                `Added ${res?.data?.members?.length || payloads.length} referrals`,
            );
            mutateMemberData();
            setLoadingAddReferrals(false);

            setOriginalReferrals((prev) => [
                ...prev,
                ...(res?.data?.members || []),
            ]);

            setNewReferrals([]);
        } catch (e: any) {
            setLoadingAddReferrals(false);
            toast.error(e?.message || 'Failed to add referrals');
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        if (name === 'occupation') {
            if (value === 'other') {
                setCustomOccupation('');
                setFormData((prev) => ({ ...prev, occupation: 'other' }));
            } else {
                setCustomOccupation('');
                setFormData((prev) => ({ ...prev, occupation: value }));
            }
        } else if (name === 'planId') {
            setFormData((prev) => ({ ...prev, planId: parseInt(value) }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleCustomOccupationChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const value = e.target.value;
        setCustomOccupation(value);
        setFormData((prev) => ({ ...prev, occupation: value }));
    };

    const handlePhotoUpload = async (file: File | null) => {
        if (!file) return;
        setLaodingImageUpload(true);
        setUploadingCount((c) => c + 1);
        try {
            const url = await uploadImage(file);
            if (url) {
                setFormData((prev) => ({ ...prev, photoUrl: url }));
                setLaodingImageUpload(false);
            } else {
                setLaodingImageUpload(false);
                toast.custom(
                    <Toast
                        type="error"
                        title="Upload failed"
                        description="Photo upload failed - no URL returned"
                    />,
                );
            }
        } catch (error: any) {
            setLaodingImageUpload(false);
            console.error('Photo upload error:', error);
            toast.custom(
                <Toast
                    type="error"
                    title="Upload failed"
                    description="An error occurred while uploading the photo"
                />,
            );
        } finally {
            setUploadingCount((c) => Math.max(0, c - 1));
        }
    };

    const handleDocUpload = async (file: File | null) => {
        if (!file) return;
        setUploadingCount((c) => c + 1);
        try {
            const url = await uploadImage(file);
            if (url) {
                setFormData((prev) => ({
                    ...prev,
                    identificationUrl: url,
                }));
            } else {
                toast.custom(
                    <Toast
                        type="error"
                        title="Upload failed"
                        description="Document upload failed - no URL returned"
                    />,
                );
            }
        } catch (error: any) {
            console.error('Document upload error:', error);
            toast.custom(
                <Toast
                    type="error"
                    title="Upload failed"
                    description="An error occurred while uploading the document"
                />,
            );
        } finally {
            setUploadingCount((c) => Math.max(0, c - 1));
        }
    };

    const getChangedFields = () => {
        const changes: Partial<Member> = {};

        Object.keys(formData).forEach((key) => {
            const fieldKey = key as keyof Member;
            const currentValue = formData[fieldKey];
            const originalValue = originalData[fieldKey];

            if (currentValue !== originalValue) {
                if (fieldKey === 'gender') {
                    if (
                        currentValue &&
                        ['male', 'female', 'other'].includes(
                            currentValue as string,
                        )
                    ) {
                        changes[fieldKey] = currentValue as
                            | 'male'
                            | 'female'
                            | 'other';
                    }
                } else if (fieldKey === 'dateOfBirth') {
                    if (currentValue && currentValue.toString().trim() !== '') {
                        changes[fieldKey] = currentValue?.toString() || '';
                    }
                } else if (typeof currentValue === 'string') {
                    if (currentValue.trim() !== '') {
                        changes[fieldKey] = currentValue as any;
                    }
                } else {
                    changes[fieldKey] = currentValue as any;
                }
            }
        });

        // Explicitly handle occupation if it was 'other' but now has custom value
        if (formData.occupation !== originalData.occupation) {
            changes.occupation = formData.occupation;
        }

        return changes;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (uploadingCount > 0) {
            toast.custom(
                <Toast
                    type="info"
                    title="Uploads in progress"
                    description="Please wait for uploads to finish before submitting."
                />,
            );
            return;
        }

        if (!formData.firstName || !formData.lastName || !formData.email) {
            toast.custom(
                <Toast
                    type="error"
                    title="Validation Error"
                    description="Please fill in all required fields (First Name, Last Name, Email)"
                />,
            );
            return;
        }

        try {
            setLoadingSubmit(true);

            const changedFields = getChangedFields();

            const updateData: any = {
                ...changedFields,
            };

            if (Object.keys(updateData).length === 0) {
                toast.custom(
                    <Toast
                        type="info"
                        title="No Changes"
                        description="No changes detected to update."
                    />,
                );
                setLoadingSubmit(false);
                return;
            }

            const result = await editMember(member_id as string, updateData);

            if (result?.data) {
                toast.custom(
                    <Toast
                        type="success"
                        title="Member updated successfully!"
                        description="Member information has been updated."
                    />,
                );
                onSuccess?.();
            } else {
                toast.custom(
                    <Toast
                        type="error"
                        title="Update failed"
                        description="An error occurred while updating the member"
                    />,
                );
            }
        } catch (error: any) {
            console.error('Update error:', error);
            toast.custom(
                <Toast
                    type="error"
                    title="Update failed"
                    description="An error occurred. Please try again."
                />,
            );
        } finally {
            setLoadingSubmit(false);
        }
    };

    if (memberError) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-600">Error loading member data</p>
            </div>
        );
    }

    if (!memberData) {
        return (
            <div className="p-6 text-center">
                <p>Loading member data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl w-full mx-auto p-6 space-y-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Edit Member Information
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Update member profile and identity verification
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                            Profile Information
                        </h3>

                        <MFormColumn>
                            <InputField
                                id="firstName"
                                label="First Name"
                                name="firstName"
                                value={formData.firstName || ''}
                                onChange={handleInputChange}
                                required
                            />
                            <InputField
                                id="lastName"
                                label="Last Name"
                                name="lastName"
                                value={formData.lastName || ''}
                                onChange={handleInputChange}
                                required
                            />
                        </MFormColumn>

                        <MFormColumn>
                            <InputField
                                id="email"
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email || ''}
                                onChange={handleInputChange}
                                required
                            />
                            <InputField
                                id="workEmail"
                                label="Work Email"
                                name="workEmail"
                                type="email"
                                value={formData.workEmail || ''}
                                onChange={handleInputChange}
                            />
                        </MFormColumn>

                        <MFormColumn>
                            <InputField
                                id="phone"
                                label="Phone"
                                name="phone"
                                value={formData.phone || ''}
                                onChange={handleInputChange}
                            />
                            <SelectField
                                id="gender"
                                label="Gender"
                                name="gender"
                                value={formData.gender || ''}
                                placeholder="Select Gender"
                                onValueChange={(value) =>
                                    handleSelectChange('gender', value)
                                }
                                options={[
                                    { value: 'male', label: 'Male' },
                                    { value: 'female', label: 'Female' },
                                    { value: 'other', label: 'Other' },
                                ]}
                            />
                        </MFormColumn>

                        <MFormColumn>
                            <SelectField
                                id="nationality"
                                label="Nationality"
                                name="nationality"
                                value={formData.nationality || ''}
                                placeholder="Select Nationality"
                                onValueChange={(value) =>
                                    handleSelectChange('nationality', value)
                                }
                                options={[
                                    { value: 'nigerian', label: 'Nigerian' },
                                    { value: 'other', label: 'Other' },
                                ]}
                            />
                            <SelectField
                                id="occupation"
                                label="Occupation"
                                name="occupation"
                                placeholder="Select Occupation"
                                onValueChange={(value) =>
                                    handleSelectChange('occupation', value)
                                }
                                options={[
                                    { value: 'student', label: 'Student' },
                                    { value: 'teacher', label: 'Teacher' },
                                    { value: 'doctor', label: 'Doctor' },
                                    { value: 'lawyer', label: 'Lawyer' },
                                    { value: 'engineer', label: 'Engineer' },
                                    { value: 'other', label: 'Other' },
                                ]}
                                value={
                                    formData.occupation &&
                                    !STANDARD_OCCUPATIONS.includes(
                                        formData.occupation.toLowerCase(),
                                    )
                                        ? 'other'
                                        : formData.occupation || ''
                                }
                            />
                        </MFormColumn>

                        {/* Custom Occupation Field */}
                        {(formData.occupation === 'other' ||
                            (formData.occupation &&
                                !STANDARD_OCCUPATIONS.includes(
                                    formData.occupation.toLowerCase(),
                                ))) && (
                            <MFormColumn>
                                <InputField
                                    id="customOccupation"
                                    label="Specify Occupation"
                                    name="customOccupation"
                                    value={customOccupation}
                                    onChange={handleCustomOccupationChange}
                                    placeholder="Enter occupation"
                                    required={formData.occupation === 'other'}
                                />
                                <div /> {/* Spacer */}
                            </MFormColumn>
                        )}

                        <MFormColumn>
                            <InputField
                                id="workAddress"
                                label="Work Address"
                                name="workAddress"
                                value={formData.workAddress || ''}
                                onChange={handleInputChange}
                            />
                        </MFormColumn>

                        <MFormColumn>
                            <InputField
                                id="dateOfBirth"
                                label="Date of Birth"
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth || ''}
                                onChange={handleInputChange}
                            />
                        </MFormColumn>
                    </div>

                    {/* Membership Plan Section */}
                    {isPrincipal && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                                Membership Plan
                            </h3>
                            <div className="grid grid-cols-1 gap-6">
                                <MFormColumn>
                                    <div className="space-y-4 w-full">
                                        <SearchSelect
                                            id="planId"
                                            label="Select Plan"
                                            items={membershipPlans}
                                            value={
                                                membershipPlans.find(
                                                    (p) =>
                                                        p.id.toString() ===
                                                        formData.planId?.toString(),
                                                ) || null
                                            }
                                            onChange={(plan) =>
                                                handleSelectChange(
                                                    'planId',
                                                    plan.id.toString(),
                                                )
                                            }
                                            displayValue={(plan) => plan.name}
                                            placeholder="Select Membership Plan"
                                            disabled={false}
                                            className="bg-gray-100 h-10"
                                        />

                                        {/* Selected Plan Details Card */}
                                        {formData.planId && (
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4 mt-2 shadow-sm">
                                                {(() => {
                                                    const selectedPlan =
                                                        membershipPlans.find(
                                                            (p) =>
                                                                p.id.toString() ===
                                                                formData.planId?.toString(),
                                                        );
                                                    if (!selectedPlan)
                                                        return null;

                                                    return (
                                                        <>
                                                            <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                                                                <div>
                                                                    <h4 className="font-bold text-xl text-gray-900">
                                                                        {
                                                                            selectedPlan.name
                                                                        }
                                                                    </h4>
                                                                    {selectedPlan.description && (
                                                                        <p className="text-gray-600 mt-1">
                                                                            {
                                                                                selectedPlan.description
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-bold text-2xl text-blue-600">
                                                                        ₦
                                                                        {selectedPlan.price?.toLocaleString()}
                                                                    </p>
                                                                    <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">
                                                                        {
                                                                            selectedPlan.duration
                                                                        }{' '}
                                                                        {selectedPlan.durationType?.toUpperCase() ||
                                                                            ''}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {(() => {
                                                                const allFacilities =
                                                                    selectedPlan.referralTiers?.flatMap(
                                                                        (t) =>
                                                                            t.facilitiesAccessible,
                                                                    ) || [];
                                                                // Filter unique facilities by ID
                                                                const uniqueFacilities =
                                                                    Array.from(
                                                                        new Map(
                                                                            allFacilities.map(
                                                                                (
                                                                                    f,
                                                                                ) => [
                                                                                    f.id,
                                                                                    f,
                                                                                ],
                                                                            ),
                                                                        ).values(),
                                                                    );

                                                                if (
                                                                    uniqueFacilities.length ===
                                                                    0
                                                                )
                                                                    return null;

                                                                return (
                                                                    <div className="pt-2">
                                                                        <h5 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                                                                            Accessible
                                                                            Facilities
                                                                        </h5>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {uniqueFacilities.map(
                                                                                (
                                                                                    facility,
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            facility.id
                                                                                        }
                                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200"
                                                                                    >
                                                                                        <span className="truncate max-w-[150px]">
                                                                                            {
                                                                                                facility.name
                                                                                            }
                                                                                        </span>
                                                                                        {facility.isBookable && (
                                                                                            <div
                                                                                                className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                                                                                                title="Bookable"
                                                                                            />
                                                                                        )}
                                                                                    </div>
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}
                                                            {selectedPlan.benefits &&
                                                                selectedPlan
                                                                    .benefits
                                                                    .length >
                                                                    0 && (
                                                                    <div className="pt-2">
                                                                        <h5 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                                                                            Included
                                                                            Benefits
                                                                        </h5>
                                                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                            {selectedPlan.benefits.map(
                                                                                (
                                                                                    benefit: string,
                                                                                    index: number,
                                                                                ) => (
                                                                                    <li
                                                                                        key={
                                                                                            index
                                                                                        }
                                                                                        className="text-sm text-gray-700 flex items-start gap-2.5"
                                                                                    >
                                                                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                                                                                        <span className="leading-relaxed">
                                                                                            {
                                                                                                benefit
                                                                                            }
                                                                                        </span>
                                                                                    </li>
                                                                                ),
                                                                            )}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                    <div />
                                </MFormColumn>
                            </div>
                        </div>
                    )}

                    {/* Membership Dates Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                            Membership Dates
                        </h3>

                        <MFormColumn>
                            <InputField
                                id="startDate"
                                label="Membership Start Date"
                                name="startDate"
                                type="date"
                                value={formData.startDate || ''}
                                onChange={handleInputChange}
                            />
                            <InputField
                                id="endDate"
                                label="Membership End Date"
                                name="endDate"
                                type="date"
                                value={formData.endDate || ''}
                                onChange={handleInputChange}
                            />
                        </MFormColumn>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                            Identity Verification
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <FileUploader
                                    label="Profile Photo"
                                    onFileChange={handlePhotoUpload}
                                    value={formData.photoUrl || undefined}
                                />
                            </div>
                            <div>
                                <FileUploader
                                    label="Identification Document"
                                    onFileChange={handleDocUpload}
                                    value={
                                        formData.identificationUrl || undefined
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {isPrincipal && (
                        <div className="space-y-4">
                            <div className="border-b pb-2">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Referral Management
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Add and manage referrals for this principal
                                    member
                                </p>
                            </div>

                            {originalReferrals.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-700">
                                        Existing Referrals (Members)
                                    </h4>
                                </div>
                            )}

                            {referralRecords.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-700">
                                        Referral Records
                                    </h4>
                                    {referralRecords.map((record) => (
                                        <div
                                            key={record.id}
                                            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                                        >
                                            <h5 className="font-medium text-gray-900 mb-2">
                                                {record.fullName}
                                            </h5>
                                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                                <div>
                                                    Relationship:{' '}
                                                    {
                                                        record.relationshipToPlanOwner
                                                    }
                                                </div>
                                                <div>
                                                    Tier:{' '}
                                                    {referralTiers.find(
                                                        (t) =>
                                                            t.id ===
                                                            record.referralTierId,
                                                    )?.name ||
                                                        record.referralTierId}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* New referrals UI remains unchanged */}
                            {newReferrals.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-700">
                                        New Referrals
                                    </h4>
                                    {newReferrals.map((referral, index) => (
                                        <div
                                            key={index}
                                            className="border border-blue-200 rounded-lg p-4 bg-blue-50"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <h5 className="font-medium text-gray-900">
                                                    Referral #{index + 1}
                                                </h5>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        removeNewReferral(index)
                                                    }
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>

                                            <div className="space-y-4">
                                                <MFormColumn>
                                                    <InputField
                                                        name="firstName"
                                                        id={`referral-firstName-${index}`}
                                                        label="First Name"
                                                        value={
                                                            referral.firstName
                                                        }
                                                        onChange={(e) =>
                                                            updateNewReferral(
                                                                index,
                                                                'firstName',
                                                                e.target.value,
                                                            )
                                                        }
                                                        required
                                                    />
                                                    <InputField
                                                        name="lastName"
                                                        id={`referral-lastName-${index}`}
                                                        label="Last Name"
                                                        value={
                                                            referral.lastName
                                                        }
                                                        onChange={(e) =>
                                                            updateNewReferral(
                                                                index,
                                                                'lastName',
                                                                e.target.value,
                                                            )
                                                        }
                                                        required
                                                    />
                                                </MFormColumn>

                                                <MFormColumn>
                                                    <InputField
                                                        name="phone"
                                                        id={`referral-phone-${index}`}
                                                        label="Phone Number"
                                                        value={referral.phone}
                                                        onChange={(e) =>
                                                            updateNewReferral(
                                                                index,
                                                                'phone',
                                                                e.target.value,
                                                            )
                                                        }
                                                        required
                                                    />
                                                    <InputField
                                                        name="relationshipToPlanOwner"
                                                        id={`referral-relationship-${index}`}
                                                        label="Relationship to Plan Owner"
                                                        value={
                                                            referral.relationshipToPlanOwner
                                                        }
                                                        onChange={(e) =>
                                                            updateNewReferral(
                                                                index,
                                                                'relationshipToPlanOwner',
                                                                e.target.value,
                                                            )
                                                        }
                                                        required
                                                    />
                                                </MFormColumn>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Referral Tier *
                                                        </label>
                                                        {referralTiers.length >
                                                        0 ? (
                                                            <BenefitDropdown
                                                                tiers={
                                                                    referralTiers
                                                                }
                                                                selectedTierId={
                                                                    referral.referralTierId as number
                                                                }
                                                                onSelect={(
                                                                    tierId,
                                                                ) =>
                                                                    updateNewReferral(
                                                                        index,
                                                                        'referralTierId',
                                                                        tierId,
                                                                    )
                                                                }
                                                                placeholder="Choose a referral tier"
                                                            />
                                                        ) : (
                                                            <div className="text-gray-500 text-sm bg-gray-50 p-3 rounded border border-gray-200">
                                                                No referral
                                                                tiers available
                                                                for the selected
                                                                plan
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <FileUploader
                                                            label="Photo ID Upload"
                                                            onFileChange={(
                                                                file,
                                                            ) =>
                                                                handleReferralPhotoUpload(
                                                                    index,
                                                                    file,
                                                                )
                                                            }
                                                            value={
                                                                referral.photoUrl ||
                                                                undefined
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Referral Button */}
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addNewReferral}
                                    disabled={
                                        loadingAddReferrals ||
                                        loadingImageUpload
                                    }
                                    className="flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    Add New Referral
                                </Button>

                                {newReferrals.length > 0 && (
                                    <BrandButton
                                        type="button"
                                        disabled={
                                            loadingAddReferrals ||
                                            loadingImageUpload
                                        }
                                        loading={loadingAddReferrals}
                                        onClick={saveReferrals}
                                        className="flex items-center gap-2"
                                    >
                                        Save Referrals
                                    </BrandButton>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Non-principal members - show existing referrals as read-only */}
                    {!isPrincipal && originalReferrals.length > 0 && (
                        <div className="space-y-4">
                            <div className="border-b pb-2">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Referred Members (Read Only)
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Referral management is only available for
                                    principal members.
                                </p>
                            </div>

                            {originalReferrals.map((referral, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                                >
                                    <h4 className="font-medium text-gray-900 mb-2">
                                        {referral.firstName} {referral.lastName}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                        <div>Email: {referral.email}</div>
                                        <div>Phone: {referral.phone}</div>
                                        <div>
                                            Relationship:{' '}
                                            {referral.relationshipToPlanOwner}
                                        </div>
                                        <div>Gender: {referral.gender}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Existing Referrals */}
                    {isPrincipal && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Existing Referrals
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    These members were previously added as
                                    referrals to this principal.
                                </p>
                            </div>
                            <div className="p-6">
                                {originalReferrals &&
                                originalReferrals.length > 0 ? (
                                    <div className="divide-y divide-gray-100">
                                        {originalReferrals.map((ref, idx) => {
                                            const displayName =
                                                `${(ref as any).firstName ?? ''} ${(ref as any).lastName ?? ''}`.trim() ||
                                                (ref as any).fullName ||
                                                'Unnamed';
                                            const tierName =
                                                (ref as any).referralTier
                                                    ?.name ||
                                                (ref as any).membershipTier ||
                                                'referred';
                                            const relationship =
                                                (ref as any)
                                                    .relationshipToPlanOwner ||
                                                '—';
                                            const planName =
                                                (ref as any).plan?.name ||
                                                'No Plan';

                                            return (
                                                <div
                                                    key={(ref as any).id ?? idx}
                                                    className="py-4 flex items-start justify-between"
                                                >
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {displayName}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            Relationship:{' '}
                                                            {relationship} •
                                                            Tier: {tierName}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            Plan: {planName}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-600">
                                        No existing referrals.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={loadingSubmit}
                        >
                            Cancel
                        </Button>
                        <BrandButton
                            type="submit"
                            loading={loadingSubmit}
                            disabled={
                                loadingSubmit ||
                                loadingAddReferrals ||
                                loadingImageUpload
                            }
                        >
                            {loadingSubmit ? 'Updating...' : 'Update Member'}
                        </BrandButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ComprehensiveEditForm;
