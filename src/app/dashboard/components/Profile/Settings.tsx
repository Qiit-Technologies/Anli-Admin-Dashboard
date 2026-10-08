'use client';

import {
    getMe,
    updateProfile,
    uploadProfilePicture,
} from '@/app/actions/users';
// import UpdatePin from '@/components/common/GlobalNavItems/UpdatePin';
import Toast from '@/components/toast';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { LuImageUp } from 'react-icons/lu';

export default function ProfileSettings() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [passwordVisibility, setPasswordVisibility] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [pinVisibility, setPinVisibility] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [, setError] = useState<string | null>(null);
    const [, setIsLoading] = useState(false);

    const handlePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setPasswordVisibility((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handlePinVisibility = (field: 'current' | 'new' | 'confirm') => {
        setPinVisibility((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    useEffect(() => {
        async function fetchProfileData() {
            try {
                const result = await getMe();
                if ('error' in result) {
                    console.error('Error fetching user details:', result.error);
                } else if ('data' in result && result.data) {
                    console.log(result.data);
                    setName(result.data.fullName);
                    setEmail(result.data.email);
                    setProfilePicture(result.data.profileImage);
                }
            } catch (error: any) {
                console.error('Error fetching profile data:', error);
            }
        }
        fetchProfileData();
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await uploadProfilePicture(formData);
                if (response && response.status) {
                    setProfilePicture(URL.createObjectURL(file));
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description="Profile picture updated successfully"
                            type="success"
                        />
                    ));
                } else {
                    toast.custom(() => (
                        <Toast
                            title="Error!"
                            description="Failed to upload profile picture"
                            type="error"
                        />
                    ));
                }
            } catch (err) {
                console.error('Error uploading profile picture:', err);
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description="An unexpected error occurred"
                        type="error"
                    />
                ));
            }
        }
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="New password and confirm password does not match"
                    type="error"
                />
            ));
            return;
        }

        if (newPin && newPin !== confirmPin) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="New PIN and confirm PIN do not match"
                    type="error"
                />
            ));
            return;
        }

        if (newPin && newPin.length !== 4) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="PIN must be exactly 4 digits"
                    type="error"
                />
            ));
            return;
        }

        const formData = new FormData();
        formData.append('email', email);
        formData.append('name', name);
        if (currentPassword)
            formData.append('currentPassword', currentPassword);
        if (newPassword) formData.append('newPassword', newPassword);

        // For PIN update, if currentPin is provided and is 4 digits, send as currentPin
        // Otherwise, if it's longer, send as currentPassword (for PIN update verification)
        if (currentPin) {
            if (currentPin.length === 4 && /^\d{4}$/.test(currentPin)) {
                formData.append('currentPin', currentPin);
            } else {
                // If it's not 4 digits, it's likely a password, send as currentPassword
                formData.append('currentPassword', currentPin);
            }
        }
        if (newPin) formData.append('newPin', newPin);

        try {
            const response = await updateProfile(formData);
            if (response) {
                if (response.message === 'Profile updated successfully') {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
                    setIsEditing(false);
                } else {
                    toast.custom(() => (
                        <Toast
                            title="Error!"
                            description={response.message}
                            type="error"
                        />
                    ));
                }
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
    };

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
            <div className="pb-8 pt-6 px-6">
                <div className="flex items-center space-x-6">
                    <div
                        className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer"
                        onClick={handleImageClick}
                    >
                        <img
                            src={
                                profilePicture ||
                                'https://res.cloudinary.com/dhkwjizxu/image/upload/v1736109984/assets/fwaq9bud8tyqsps9hwjy.png'
                            }
                            alt={name}
                            className="w-full h-full object-cover"
                        />
                        <div className="opacity-0 hover:opacity-100 transition-opacity ease-in-out absolute flex flex-col items-center justify-center top-0 left-0 w-full h-full bg-black/65">
                            <LuImageUp className="w-1/2 h-1/2 text-gray-400" />
                            <span className="text-gray-400 text-xs">
                                Upload
                            </span>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{name}</h1>
                        <p className="text-gray-500">{email}</p>
                    </div>
                </div>
            </div>
            <div className="px-6 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold">
                            Personal Information
                        </h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Full Name
                                </label>
                                <div className="relative">
                                    <FaUser
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                        size={18}
                                    />
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        disabled={!isEditing}
                                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 h-14"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Email
                                </label>
                                <div className="relative">
                                    <FaEnvelope
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                        size={18}
                                    />
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        disabled
                                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 h-14"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-t border-gray-200" />

                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold">
                            Change Password & PIN
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Password Section */}
                            <div className="space-y-4 border-r border-gray-200 pr-6">
                                <h3 className="text-lg font-semibold">
                                    Password
                                </h3>

                                <div className="space-y-4">
                                    {[
                                        'Current Password',
                                        'New Password',
                                        'Confirm New Password',
                                    ].map((label, index) => {
                                        const field = label
                                            .toLowerCase()
                                            .replace(/\s/g, '') as
                                            | 'current'
                                            | 'new'
                                            | 'confirm';
                                        return (
                                            <div
                                                key={label}
                                                className="space-y-2"
                                            >
                                                <label
                                                    htmlFor={field}
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    {label}{' '}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <div className="relative">
                                                    <FaLock
                                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                        size={18}
                                                    />
                                                    <input
                                                        id={field}
                                                        type={
                                                            passwordVisibility[
                                                                field
                                                            ]
                                                                ? 'text'
                                                                : 'password'
                                                        }
                                                        value={
                                                            [
                                                                currentPassword,
                                                                newPassword,
                                                                confirmPassword,
                                                            ][index]
                                                        }
                                                        onChange={(e) => {
                                                            [
                                                                setCurrentPassword,
                                                                setNewPassword,
                                                                setConfirmPassword,
                                                            ][index](
                                                                e.target.value,
                                                            );
                                                        }}
                                                        disabled={!isEditing}
                                                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 h-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handlePasswordVisibility(
                                                                field,
                                                            )
                                                        }
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                    >
                                                        {passwordVisibility[
                                                            field
                                                        ] ? (
                                                            <FaEyeSlash
                                                                size={18}
                                                            />
                                                        ) : (
                                                            <FaEye size={18} />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* PIN Section */}
                            <div className="space-y-4 pl-6">
                                <h3 className="text-lg font-semibold">PIN</h3>

                                <div className="space-y-4">
                                    {[
                                        'Current PIN or Password',
                                        'New PIN',
                                        'Confirm New PIN',
                                    ].map((label, index) => {
                                        const field = label
                                            .toLowerCase()
                                            .replace(/\s/g, '')
                                            .replace('orpassword', '') as
                                            | 'current'
                                            | 'new'
                                            | 'confirm';
                                        return (
                                            <div
                                                key={label}
                                                className="space-y-2"
                                            >
                                                <label
                                                    htmlFor={`pin-${field}`}
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    {label}
                                                </label>
                                                <div className="relative">
                                                    <FaLock
                                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                        size={18}
                                                    />
                                                    <input
                                                        id={`pin-${field}`}
                                                        type={
                                                            field === 'current'
                                                                ? 'text'
                                                                : pinVisibility[
                                                                        field
                                                                    ]
                                                                  ? 'text'
                                                                  : 'password'
                                                        }
                                                        autoComplete="off"
                                                        maxLength={
                                                            field === 'current'
                                                                ? undefined
                                                                : 4
                                                        }
                                                        value={
                                                            [
                                                                currentPin,
                                                                newPin,
                                                                confirmPin,
                                                            ][index]
                                                        }
                                                        onChange={(e) => {
                                                            // Allow both text and numbers for current PIN (can be PIN or password)
                                                            // Only allow numbers for new PIN and confirm PIN
                                                            const value =
                                                                field ===
                                                                'current'
                                                                    ? e.target
                                                                          .value
                                                                    : e.target.value.replace(
                                                                          /\D/g,
                                                                          '',
                                                                      );
                                                            [
                                                                setCurrentPin,
                                                                setNewPin,
                                                                setConfirmPin,
                                                            ][index](value);
                                                        }}
                                                        inputMode={
                                                            field === 'current'
                                                                ? pinVisibility[
                                                                      field
                                                                  ]
                                                                    ? 'text'
                                                                    : undefined
                                                                : 'numeric'
                                                        }
                                                        pattern={
                                                            field === 'current'
                                                                ? undefined
                                                                : '[0-9]*'
                                                        }
                                                        disabled={!isEditing}
                                                        placeholder={
                                                            field === 'current'
                                                                ? 'Enter current PIN or password'
                                                                : 'Enter 4-digit PIN'
                                                        }
                                                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 h-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handlePinVisibility(
                                                                field,
                                                            )
                                                        }
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                    >
                                                        {pinVisibility[
                                                            field
                                                        ] ? (
                                                            <FaEyeSlash
                                                                size={18}
                                                            />
                                                        ) : (
                                                            <FaEye size={18} />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={() => setIsEditing(!isEditing)}
                            className={`px-4 py-2 ${
                                isEditing
                                    ? 'bg-gray-400'
                                    : 'bg-orion-blue hover:bg-blue-700'
                            } text-white rounded-md focus:outline-none`}
                        >
                            {isEditing ? 'Cancel' : 'Edit'}
                        </button>
                        {isEditing && (
                            <button
                                type="submit"
                                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none"
                            >
                                Save Changes
                            </button>
                        )}
                    </div>
                    {/* <UpdatePin /> */}
                </form>
            </div>
        </div>
    );
}
