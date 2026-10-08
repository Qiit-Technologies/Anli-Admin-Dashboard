'use client';

import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface Option {
    value: string;
    label: string;
}

interface FormRadioGroupProps {
    label?: string;
    options: Option[];
    error?: string;
    registration: UseFormRegisterReturn;
}

export default function FormRadioGroup({
    label,
    options,
    error,
    registration,
}: FormRadioGroupProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm text-gray-600 mb-2">
                    {label}
                </label>
            )}
            <div className="flex flex-wrap gap-4">
                {options.map((option) => (
                    <label
                        key={option.value}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <input
                            type="radio"
                            value={option.value}
                            {...registration}
                            className="w-7 h-7 text-[#D1D5DB]"
                        />
                        <span className="text-sm text-[#55656B]">
                            {option.label}
                        </span>
                    </label>
                ))}
            </div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}
