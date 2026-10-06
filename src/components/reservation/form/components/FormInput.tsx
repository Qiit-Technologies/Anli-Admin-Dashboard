'use client';

import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface FormInputProps {
    label: string;
    type?: 'text' | 'email' | 'tel' | 'date' | 'time' | 'number';
    placeholder?: string;
    error?: string;
    registration: UseFormRegisterReturn;
    icon?: React.ReactNode;
    className?: string;
}

export default function FormInput({
    label,
    type = 'text',
    placeholder,
    error,
    registration,
    icon,
    className = '',
}: FormInputProps) {
    return (
        <div className="w-full">
            <label className="block text-sm text-[#919191] mb-2">{label}</label>
            <div className="relative">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    placeholder={placeholder}
                    {...registration}
                    className={`
                        w-full px-4 h-16 border rounded-[8px] text-sm transition-colors
                        focus:outline-none placeholder:text-[#8592AC] placeholder:font-semibold placeholder:text-[16px]
                        ${icon ? 'pl-12' : ''}
                        ${error ? 'border-red-400 bg-red-50' : 'border-[#D5D4D4]'}
                        ${className}
                    `}
                />
            </div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}
