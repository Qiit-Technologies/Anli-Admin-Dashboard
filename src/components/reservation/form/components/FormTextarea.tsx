'use client';

import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface FormTextareaProps {
    label: string;
    placeholder?: string;
    rows?: number;
    error?: string;
    registration: UseFormRegisterReturn;
    className?: string;
}

export default function FormTextarea({
    label,
    placeholder,
    rows = 3,
    error,
    registration,
    className = '',
}: FormTextareaProps) {
    return (
        <div className="w-full">
            <label className="block text-sm text-gray-600 mb-2">{label}</label>
            <textarea
                placeholder={placeholder}
                rows={rows}
                {...registration}
                className={`
                    w-full px-4 py-3 border rounded-lg text-sm transition-colors
                    focus:outline-none focus:border-blue-400 resize-none
                    ${error ? 'border-red-400 bg-red-50' : 'border-gray-200'}
                    ${className}
                `}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}
