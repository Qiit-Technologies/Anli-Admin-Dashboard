import React, { useEffect, useState } from 'react';

interface GuestPersonalInfoProps {
    data: {
        fullName?: string;
        phoneNumber?: string | number;
        numberOfGuests?: number;
        email?: string;
        secondGuestFullName?: string;
        secondGuestPhoneNumber?: string | number;
        secondGuestType?: string;
        gender?: string;
        dateOfBirth?: string;
        nationality?: string;
        address?: string;
        purposeOfVisit?: string;
        loyaltyTier?: string;
        loyaltyPoints?: number;
        eligibleForReward?: boolean;
        birthday?: string;
        feedbackNotes?: string;
        customerType?: string;
        emailConsent?: boolean;
        preferredContactMethod?: string;
    };
    onChange: (newData: any) => void;
}

const GuestPersonalInfo = ({ data, onChange }: GuestPersonalInfoProps) => {
    const [formData, setFormData] = useState(data);

    useEffect(() => {
        setFormData(data);
    }, [data]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        let parsedValue: any = value;

        if (name === 'numberOfGuests' || name === 'loyaltyPoints') {
            parsedValue = value === '' ? undefined : Number(value);
        }

        if (name === 'eligibleForReward' || name === 'emailConsent') {
            parsedValue = value === '' ? undefined : value === 'true';
        }

        const updatedData = { ...formData, [name]: parsedValue };
        setFormData(updatedData);
        onChange(updatedData);
    };

    return (
        <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">
                Guest Personal Information
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium">
                        Main Guest Full Name
                    </label>
                    <input
                        type="text"
                        name="fullName"
                        className="border p-2 rounded w-full"
                        placeholder="Michael Scott"
                        value={formData.fullName}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">
                        Main Guest Phone Number
                    </label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        className="border p-2 rounded w-full"
                        placeholder="(052) 1234-5678"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                    />
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium">
                    Number of Guests
                </label>
                <input
                    type="number"
                    name="numberOfGuests"
                    className="border p-2 rounded w-full"
                    min="1"
                    placeholder="2"
                    value={formData.numberOfGuests}
                    onChange={handleInputChange}
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium">Guest Email</label>
                <input
                    type="email"
                    name="email"
                    className="border p-2 rounded w-full"
                    placeholder="mscott@office.com"
                    value={formData.email}
                    onChange={handleInputChange}
                />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium">
                        Second Guest Full Name
                    </label>
                    <input
                        type="text"
                        name="secondGuestFullName"
                        className="border p-2 rounded w-full"
                        placeholder="Pam Beesly"
                        value={formData.secondGuestFullName}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">
                        Second Guest Phone Number
                    </label>
                    <input
                        type="text"
                        name="secondGuestPhoneNumber"
                        className="border p-2 rounded w-full"
                        placeholder="(052) 2345-6789"
                        value={formData.secondGuestPhoneNumber}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">
                        Second Guest Type
                    </label>
                    <select
                        name="secondGuestType"
                        value={formData.secondGuestType}
                        className="border p-2 rounded w-full"
                        onChange={handleInputChange}
                    >
                        <option value="adult">Adult</option>
                        <option value="child">Child</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium">Gender</label>
                    <select
                        name="gender"
                        value={formData.gender || ''}
                        className="border p-2 rounded w-full"
                        onChange={handleInputChange}
                    >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">
                            Prefer not to say
                        </option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">
                        Date of Birth
                    </label>
                    <input
                        type="date"
                        name="dateOfBirth"
                        className="border p-2 rounded w-full"
                        value={formData.dateOfBirth || ''}
                        onChange={handleInputChange}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium">
                        Birthday
                    </label>
                    <input
                        type="date"
                        name="birthday"
                        className="border p-2 rounded w-full"
                        value={formData.birthday || ''}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">
                        Nationality
                    </label>
                    <input
                        type="text"
                        name="nationality"
                        className="border p-2 rounded w-full"
                        placeholder="Enter nationality"
                        value={formData.nationality || ''}
                        onChange={handleInputChange}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium">Address</label>
                    <input
                        type="text"
                        name="address"
                        className="border p-2 rounded w-full"
                        placeholder="Enter address"
                        value={formData.address || ''}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">
                        Purpose of Visit
                    </label>
                    <input
                        type="text"
                        name="purposeOfVisit"
                        className="border p-2 rounded w-full"
                        placeholder="Enter purpose of visit"
                        value={formData.purposeOfVisit || ''}
                        onChange={handleInputChange}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium">
                        Loyalty Tier
                    </label>
                    <input
                        type="text"
                        name="loyaltyTier"
                        className="border p-2 rounded w-full"
                        placeholder="Enter loyalty tier"
                        value={formData.loyaltyTier || ''}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">
                        Loyalty Points
                    </label>
                    <input
                        type="number"
                        name="loyaltyPoints"
                        className="border p-2 rounded w-full"
                        placeholder="0"
                        value={
                            formData.loyaltyPoints !== undefined &&
                                formData.loyaltyPoints !== null
                                ? formData.loyaltyPoints
                                : ''
                        }
                        onChange={handleInputChange}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium">
                        Eligible for Reward
                    </label>
                    <select
                        name="eligibleForReward"
                        value={
                            formData.eligibleForReward === undefined
                                ? ''
                                : String(formData.eligibleForReward)
                        }
                        className="border p-2 rounded w-full"
                        onChange={handleInputChange}
                    >
                        <option value="">Select option</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">
                        Customer Type
                    </label>
                    <input
                        type="text"
                        name="customerType"
                        className="border p-2 rounded w-full"
                        placeholder="Enter customer type"
                        value={formData.customerType || ''}
                        onChange={handleInputChange}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium">
                        Email Consent
                    </label>
                    <select
                        name="emailConsent"
                        value={
                            formData.emailConsent === undefined
                                ? ''
                                : String(formData.emailConsent)
                        }
                        className="border p-2 rounded w-full"
                        onChange={handleInputChange}
                    >
                        <option value="">Select option</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">
                        Preferred Contact Method
                    </label>
                    <select
                        name="preferredContactMethod"
                        value={formData.preferredContactMethod || ''}
                        className="border p-2 rounded w-full"
                        onChange={handleInputChange}
                    >
                        <option value="">Select method</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="sms">SMS</option>
                        <option value="whatsapp">WhatsApp</option>
                    </select>
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium">
                    Feedback / Notes
                </label>
                <input
                    type="text"
                    name="feedbackNotes"
                    className="border p-2 rounded w-full"
                    placeholder="Enter feedback or notes"
                    value={formData.feedbackNotes || ''}
                    onChange={handleInputChange}
                />
            </div>
        </div>
    );
};

export default GuestPersonalInfo;
