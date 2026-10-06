'use client';

import Toast from '@/components/toast';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';
import { updateStaffPin } from '@/app/actions/staff';
import { useUser } from '@/context/useUser';

const UpdatePin = () => {
    const { user } = useUser();
    const [passwordVisibility, setPasswordVisibility] = useState({
        newPin: false,
        confirmPin: false,
    });
    const [, setError] = useState<string | null>(null);
    const [, setIsLoading] = useState(false);

    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');

    const handlePasswordVisibility = (field: 'newPin' | 'confirmPin') => {
        setPasswordVisibility((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handlePinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPin !== confirmPin) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="New pin and confirm pin does not match"
                    type="error"
                />
            ));
            return;
        }

        const formData = {
            newPin: newPin,
        };

        if (!user?.id) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="User session not found. Please log in again."
                    type="error"
                />
            ));
            return;
        }

        try {
            const response: any = await updateStaffPin(user.id, formData);
            console.log('response', response);

            if (response?.data) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Pin updated successfully"
                        type="success"
                    />
                ));
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response.message}
                        type="error"
                    />
                ));
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
        setNewPin('');
        setConfirmPin('');
    };

    return (
        <div>
            <div className="space-y-4 mt-4">
                <h2 className="text-lg font-semibold">Update Pin</h2>
                <div className="space-y-3">
                    {['New Pin', 'Confirm New Pin'].map((label, index) => {
                        const field = label.toLowerCase().replace(/\s/g, '') as
                            | 'newPin'
                            | 'confirmPin';
                        return (
                            <div key={label} className="space-y-1">
                                <label
                                    htmlFor={field}
                                    className="text-sm font-medium text-gray-700"
                                >
                                    {label}{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                                    <input
                                        maxLength={4}
                                        placeholder="Enter 4 digit pin"
                                        id={field}
                                        type={
                                            passwordVisibility[field]
                                                ? 'text'
                                                : 'password'
                                        }
                                        value={[newPin, confirmPin][index]}
                                        onChange={(e) => {
                                            if (
                                                e.target.value &&
                                                isNaN(Number(e.target.value))
                                            )
                                                return;
                                            [setNewPin, setConfirmPin][index](
                                                e.target.value,
                                            );
                                        }}
                                        className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 h-10 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handlePasswordVisibility(field)
                                        }
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                    >
                                        {passwordVisibility[field] ? (
                                            <FaEyeSlash className="text-sm" />
                                        ) : (
                                            <FaEye className="text-sm" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <button
                    disabled={Boolean(!newPin || !confirmPin)}
                    onClick={handlePinSubmit}
                    className="px-4 py-2 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 focus:outline-none"
                >
                    Update Pin
                </button>
                {/* )} */}
            </div>
        </div>
    );
};

export default UpdatePin;
