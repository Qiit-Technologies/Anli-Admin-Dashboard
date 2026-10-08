'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { FiCheck, FiChevronDown } from 'react-icons/fi';

export interface SelectOption {
    value: string;
    label: string;
    price?: number;
    disabled?: boolean;
}

interface FormSelectProps {
    label: string;
    placeholder?: string;
    options: SelectOption[];
    error?: string;
    registration: UseFormRegisterReturn;
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
}

export default function FormSelect({
    label,
    placeholder = 'Select an option',
    options,
    error,
    registration,
    value: controlledValue,
    onChange,
    className = '',
}: FormSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(controlledValue || '');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === selectedValue);

    useEffect(() => {
        if (controlledValue !== undefined) {
            setSelectedValue(controlledValue);
        }
    }, [controlledValue]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option: SelectOption) => {
        setSelectedValue(option.value);
        setIsOpen(false);

        const event = {
            target: {
                name: registration.name,
                value: option.value,
            },
        } as React.ChangeEvent<HTMLInputElement>;
        registration.onChange(event);

        onChange?.(option.value);
    };

    return (
        <div className="w-full relative" ref={dropdownRef}>
            <label className="block text-sm text-gray-600 mb-2">{label}</label>

            <input type="hidden" {...registration} value={selectedValue} />

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full px-4 py-3 border rounded-lg text-sm transition-colors
                    flex items-center justify-between bg-white text-left
                    focus:outline-none focus:border-blue-400
                    ${error ? 'border-red-400 bg-red-50' : 'border-gray-200'}
                    ${!selectedValue ? 'text-gray-400' : 'text-gray-900'}
                    ${className}
                `}
            >
                <span>{selectedOption?.label || placeholder}</span>
                <FiChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                                !option.disabled && handleSelect(option)
                            }
                            disabled={option.disabled}
                            className={`
                                w-full px-4 py-3 text-left text-sm flex items-center justify-between
                                transition-colors
                                ${option.disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:bg-gray-50'}
                                ${selectedValue === option.value ? 'bg-gray-50' : ''}
                            `}
                        >
                            <span
                                className={
                                    option.disabled
                                        ? 'text-gray-400'
                                        : 'text-gray-700'
                                }
                            >
                                {option.label}
                            </span>
                            {selectedValue === option.value && (
                                <FiCheck className="w-4 h-4 text-gray-700" />
                            )}
                        </button>
                    ))}
                </div>
            )}

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}
