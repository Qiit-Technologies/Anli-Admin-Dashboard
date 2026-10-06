'use client';
import BrandButton from '@/components/common/Button';
import { InputField, SelectField } from '@/components/common/Form';
import {
    getMaximumBirthDateForMinAge,
    validateMemberDateOfBirth,
} from '@/lib/membership/member-utils';
import useMemberOnboardingStore from '@/store/useMemberOnboardingStore';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MFormColumn } from '../form';

interface ProfileInformationProps {
    editing?: boolean;
    onUpdate?: () => Promise<void>;
    loadingUpdate?: boolean;
    setLoadingUpdate?: (loading: boolean) => void;
}

const ProfileInformation: React.FC<ProfileInformationProps> = ({
    editing,
    onUpdate,
    loadingUpdate,
    setLoadingUpdate,
}) => {
    const {
        nextStep,
        principalMember,
        setPrincipalMemberField,
        setStepValidation,
        validateCurrentStep,
    } = useMemberOnboardingStore();

    const [customOccupation, setCustomOccupation] = useState('');
    const STANDARD_OCCUPATIONS = [
        'student',
        'teacher',
        'doctor',
        'lawyer',
        'engineer',
    ];

    useEffect(() => {
        if (principalMember.occupation) {
            const isStandard = STANDARD_OCCUPATIONS.includes(
                principalMember.occupation.toLowerCase(),
            );
            if (!isStandard && principalMember.occupation !== 'other') {
                setCustomOccupation(principalMember.occupation);
            }
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const dobValidation = validateMemberDateOfBirth(
            principalMember.dateOfBirth,
        );
        if (!dobValidation.valid) {
            toast.error(dobValidation.message || 'Invalid date of birth');
            setStepValidation(0, false);
            return;
        }

        const isValid = validateCurrentStep();
        setStepValidation(0, isValid);
        if (isValid) {
            nextStep();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrincipalMemberField(e.target.name as any, e.target.value);
    };

    const handleSelectChange = (value: string, name: string) => {
        if (name === 'occupation') {
            if (value === 'other') {
                setCustomOccupation('');
                setPrincipalMemberField('occupation' as any, 'other');
            } else {
                setCustomOccupation('');
                setPrincipalMemberField('occupation' as any, value);
            }
        } else {
            setPrincipalMemberField(name as any, value);
        }
    };

    const handleCustomOccupationChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const value = e.target.value;
        setCustomOccupation(value);
        setPrincipalMemberField('occupation', value);
    };

    const handleUpdate = async () => {
        if (onUpdate) {
            await onUpdate();
            setLoadingUpdate?.(false);
        }
    };

    const inputStyle =
        'w-full border bg-white h-12 shadow-none border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

    return (
        <form
            className="space-y-6 w-full max-w-[600px]"
            onSubmit={handleSubmit}
        >
            <MFormColumn>
                <InputField
                    id="firstName"
                    name="firstName"
                    label="First Name"
                    type="text"
                    placeholder="Enter first name"
                    value={principalMember.firstName}
                    onChange={handleInputChange}
                    className={inputStyle}
                    required
                />

                <InputField
                    id="lastName"
                    name="lastName"
                    label="Last Name"
                    type="text"
                    placeholder="Enter last name"
                    value={principalMember.lastName}
                    onChange={handleInputChange}
                    className={inputStyle}
                    required
                />
            </MFormColumn>

            <MFormColumn>
                <InputField
                    id="personalEmail"
                    name="email"
                    label="Personal Email Address"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="Enter personal Email Address"
                    value={principalMember.email}
                    onChange={handleInputChange}
                    className={inputStyle}
                />

                <InputField
                    id="workEmail"
                    name="workEmail"
                    label="Work Email address"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="Enter work email address"
                    value={principalMember.workEmail}
                    onChange={handleInputChange}
                    className={inputStyle}
                />
            </MFormColumn>

            <MFormColumn>
                <SelectField
                    id="gender"
                    name="gender"
                    label="Gender"
                    options={[
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                    ]}
                    value={principalMember.gender}
                    onValueChange={(value) =>
                        handleSelectChange(value, 'gender')
                    }
                    className={inputStyle}
                    required
                />

                <SelectField
                    id="nationality"
                    name="nationality"
                    label="Nationality"
                    options={[
                        { value: 'nigerian', label: 'Nigerian' },
                        { value: 'other', label: 'Other' },
                    ]}
                    value={principalMember.nationality}
                    onValueChange={(value) =>
                        handleSelectChange(value, 'nationality')
                    }
                    className={inputStyle}
                />
            </MFormColumn>

            <MFormColumn>
                <SelectField
                    id="occupation"
                    name="occupation"
                    label="Occupation"
                    options={[
                        { value: 'student', label: 'Student' },
                        { value: 'teacher', label: 'Teacher' },
                        { value: 'doctor', label: 'Doctor' },
                        { value: 'lawyer', label: 'Lawyer' },
                        { value: 'engineer', label: 'Engineer' },
                        { value: 'other', label: 'Other' },
                    ]}
                    value={
                        principalMember.occupation &&
                        !STANDARD_OCCUPATIONS.includes(
                            principalMember.occupation.toLowerCase(),
                        )
                            ? 'other'
                            : principalMember.occupation || ''
                    }
                    onValueChange={(value) =>
                        handleSelectChange(value, 'occupation')
                    }
                    className={inputStyle}
                />

                {/* Custom Occupation Field */}
                {(principalMember.occupation === 'other' ||
                    (principalMember.occupation &&
                        !STANDARD_OCCUPATIONS.includes(
                            principalMember.occupation.toLowerCase(),
                        ))) && (
                    <MFormColumn>
                        <InputField
                            id="customOccupation"
                            name="customOccupation"
                            label="Specify Occupation"
                            type="text"
                            placeholder="Enter occupation"
                            value={customOccupation}
                            onChange={handleCustomOccupationChange}
                            className={inputStyle}
                            required={
                                principalMember.occupation === 'other' ||
                                !STANDARD_OCCUPATIONS.includes(
                                    principalMember.occupation?.toLowerCase() ||
                                        '',
                                )
                            }
                        />
                        <div />
                    </MFormColumn>
                )}

                <SelectField
                    options={[
                        { value: 'muslim', label: 'Muslim' },
                        { value: 'christian', label: 'Christian' },
                        { value: 'hindu', label: 'Hindu' },
                        { value: 'buddhist', label: 'Buddhist' },
                        { value: 'other', label: 'Other' },
                    ]}
                    value={principalMember.religion || ''}
                    onValueChange={(value) =>
                        handleSelectChange(value, 'religion')
                    }
                    id="religion"
                    name="religion"
                    label="Religion"
                    className={inputStyle}
                />
            </MFormColumn>

            <MFormColumn>
                <InputField
                    id="placeOfWork"
                    name="placeOfWork"
                    label="Place of work"
                    type="text"
                    placeholder="Enter place of work"
                    value={principalMember.placeOfWork || ''}
                    onChange={handleInputChange}
                    className={inputStyle}
                />

                <InputField
                    id="workAddress"
                    name="workAddress"
                    label="Address of work"
                    type="text"
                    placeholder="Enter work address"
                    value={principalMember.workAddress}
                    onChange={handleInputChange}
                    className={inputStyle}
                />
            </MFormColumn>

            <InputField
                id="phoneNumber"
                name="phone"
                label="Phone Number"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="Enter phone number"
                value={principalMember.phone}
                onChange={handleInputChange}
                className={inputStyle}
                required
            />

            <InputField
                id="homeAddress"
                name="homeAddress"
                label="Home address"
                type="text"
                placeholder="Enter home address"
                value={principalMember.homeAddress || ''}
                onChange={handleInputChange}
                className={inputStyle}
            />

            <InputField
                id="dateOfBirth"
                name="dateOfBirth"
                label="Date of Birth"
                type="date"
                max={getMaximumBirthDateForMinAge()}
                placeholder="dd/mm/yy"
                value={principalMember.dateOfBirth}
                onChange={handleInputChange}
                className={inputStyle}
            />

            {editing ? (
                <div className="flex gap-4">
                    <BrandButton
                        type="submit"
                        className="flex-1 bg-[#007BFF] hover:bg-blue-600 text-white py-3 h-12 rounded-md font-medium"
                    >
                        Continue
                    </BrandButton>
                    <BrandButton
                        type="button"
                        onClick={handleUpdate}
                        loading={loadingUpdate}
                        className="flex-1 bg-[#28a745] hover:bg-green-600 text-white py-3 h-12 rounded-md font-medium"
                    >
                        {loadingUpdate ? 'Updating' : 'Update'}
                    </BrandButton>
                </div>
            ) : (
                <BrandButton
                    type="submit"
                    className="w-full bg-[#007BFF] hover:bg-blue-600 text-white py-3 h-12 rounded-md font-medium"
                >
                    Continue
                </BrandButton>
            )}
        </form>
    );
};

export default ProfileInformation;
