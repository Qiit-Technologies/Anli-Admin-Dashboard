'use client';

import { useState, useMemo } from 'react';
import CustomDialog from '@/components/common/CustomDialog';
import { InputField, SelectField } from '@/components/common/Form';
import { DatePicker } from '@/components/common/DatePicker';
import {
    createGuestProfile,
    type GuestProfile,
} from '@/app/actions/guest-profile';
import { allCountries } from 'country-region-data';
import toast from 'react-hot-toast';

interface CreateGuestProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (profile: GuestProfile) => void;
}

export function CreateGuestProfileDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreateGuestProfileDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        address: '',
        IDNumber: '',
        nationality: '',
        gender: '',
        dateOfBirth: '',
        notes: '',
        guestType: '',
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const isFormValid = () => {
        // At least one identifier should be provided
        return (
            formData.fullName.trim() !== '' ||
            formData.email.trim() !== '' ||
            formData.phoneNumber.trim() !== ''
        );
    };

    const handleConfirm = async () => {
        if (!isFormValid()) {
            toast.error(
                'Please provide at least a name, email, or phone number',
            );
            return;
        }

        setLoading(true);
        try {
            const payload: any = {};
            if (formData.title) payload.title = formData.title;
            if (formData.fullName) payload.fullName = formData.fullName;
            if (formData.email) payload.email = formData.email;
            if (formData.phoneNumber)
                payload.phoneNumber = formData.phoneNumber;
            if (formData.address) payload.address = formData.address;
            if (formData.IDNumber) payload.IDNumber = formData.IDNumber;
            if (formData.nationality)
                payload.nationality = formData.nationality;
            if (formData.gender) payload.gender = formData.gender;
            if (formData.dateOfBirth)
                payload.dateOfBirth = formData.dateOfBirth;
            if (formData.notes) payload.notes = formData.notes;
            if (formData.guestType) payload.guestType = formData.guestType;

            const result = await createGuestProfile(payload);

            if (result.error) {
                toast.error(result.error);
            } else if (result.data) {
                toast.success('Guest profile created successfully');
                setFormData({
                    title: '',
                    fullName: '',
                    email: '',
                    phoneNumber: '',
                    address: '',
                    IDNumber: '',
                    nationality: '',
                    gender: '',
                    dateOfBirth: '',
                    notes: '',
                    guestType: '',
                });
                onOpenChange(false);
                if (onSuccess) {
                    onSuccess(result.data);
                }
            }
        } catch (error: any) {
            console.error('Error creating guest profile:', error);
            toast.error('Failed to create guest profile');
        } finally {
            setLoading(false);
        }
    };

    const genderOptions = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' },
    ];

    const guestTypeOptions = [
        { value: 'individual', label: 'Individual' },
        { value: 'corporate', label: 'Corporate' },
        { value: 'group', label: 'Group' },
        { value: 'travel_agent', label: 'Travel Agent' },
        { value: 'walk_in', label: 'Walk-in' },
        { value: 'online', label: 'Online' },
    ];

    const countryOptions = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return allCountries.map((country: any) => ({
            value: country[0],
            label: country[0],
        }));
    }, []);

    const titleOptions = [
        { value: 'Mr', label: 'Mr' },
        { value: 'Mrs', label: 'Mrs' },
        { value: 'Ms', label: 'Ms' },
        { value: 'Dr', label: 'Dr' },
        { value: 'Prof', label: 'Prof' },
    ];

    return (
        <CustomDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Create Guest Profile"
            description="Create a new guest profile for credit management and billing"
            confirmText="Create Profile"
            cancelText="Cancel"
            onConfirm={handleConfirm}
            isLoading={loading}
            confirmDisabled={!isFormValid() || loading}
            maxWidth="2xl"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                    label="Title"
                    name="title"
                    id="title"
                    options={titleOptions}
                    value={formData.title}
                    onValueChange={(value) => handleInputChange('title', value)}
                    placeholder="Select Title"
                />
                <InputField
                    id="fullName"
                    name="fullName"
                    label="Full Name"
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={(e) =>
                        handleInputChange('fullName', e.target.value)
                    }
                />

                <InputField
                    id="email"
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                />

                <InputField
                    id="phoneNumber"
                    name="phoneNumber"
                    label="Phone Number"
                    placeholder="Enter phone number"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                        handleInputChange('phoneNumber', e.target.value)
                    }
                />

                <InputField
                    id="IDNumber"
                    name="IDNumber"
                    label="ID Number"
                    placeholder="Enter ID number"
                    value={formData.IDNumber}
                    onChange={(e) =>
                        handleInputChange('IDNumber', e.target.value)
                    }
                />

                <SelectField
                    id="nationality"
                    name="nationality"
                    label="Nationality"
                    placeholder="Select nationality"
                    options={countryOptions}
                    value={formData.nationality}
                    onValueChange={(value) =>
                        handleInputChange('nationality', value)
                    }
                />

                <SelectField
                    id="gender"
                    name="gender"
                    label="Gender"
                    placeholder="Select gender"
                    options={genderOptions}
                    value={formData.gender}
                    onValueChange={(value) =>
                        handleInputChange('gender', value)
                    }
                />

                <SelectField
                    id="guestType"
                    name="guestType"
                    label="Guest Type"
                    placeholder="Select guest type"
                    options={guestTypeOptions}
                    value={formData.guestType}
                    onValueChange={(value) =>
                        handleInputChange('guestType', value)
                    }
                />

                <DatePicker
                    id="dateOfBirth"
                    name="dateOfBirth"
                    label="Date of Birth"
                    placeholder="Select date of birth"
                    value={formData.dateOfBirth}
                    onChange={(date) => handleInputChange('dateOfBirth', date)}
                />

                <InputField
                    id="address"
                    name="address"
                    label="Address"
                    placeholder="Enter address"
                    value={formData.address}
                    onChange={(e) =>
                        handleInputChange('address', e.target.value)
                    }
                />

                <InputField
                    id="notes"
                    name="notes"
                    label="Notes"
                    placeholder="Additional notes (optional)"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                />
            </div>
        </CustomDialog>
    );
}
