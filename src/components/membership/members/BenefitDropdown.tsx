'use client';
import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

interface Facility {
    id: number;
    name: string;
    description?: string;
    category: string;
    fee?: number;
    isBookable: boolean;
}

interface ReferralTier {
    id: number;
    name: string;
    description?: string;
    accessLevel?: string;
    facilitiesAccessible?: Facility[];
}

interface BenefitDropdownProps {
    tiers: ReferralTier[];
    selectedTierId?: number;
    onSelect: (tierId: number) => void;
    placeholder?: string;
}

const BenefitDropdown: React.FC<BenefitDropdownProps> = ({
    tiers,
    selectedTierId,
    onSelect,
    placeholder = 'Select referral tier',
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectedTier = tiers.find((tier) => tier.id === selectedTierId);

    const handleSelect = (tierId: number) => {
        onSelect(tierId);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <div
                className={`w-full px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                    isOpen
                        ? 'border-blue-500 ring-1 ring-blue-500'
                        : 'border-gray-300 hover:border-gray-400'
                } bg-white`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center justify-between">
                    <span
                        className={
                            selectedTier ? 'text-gray-900' : 'text-gray-500'
                        }
                    >
                        {selectedTier ? selectedTier.name : placeholder}
                    </span>
                    <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                    {tiers.map((tier) => {
                        const facilities = tier.facilitiesAccessible || [];
                        const isSelected = tier.id === selectedTierId;

                        return (
                            <div
                                key={tier.id}
                                className={`px-3 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                                    isSelected
                                        ? 'bg-blue-50 text-blue-900'
                                        : 'hover:bg-gray-50'
                                }`}
                                onClick={() => handleSelect(tier.id)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">
                                                {tier.name}
                                            </span>
                                            {isSelected && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            )}
                                        </div>

                                        {tier.description && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                {tier.description}
                                            </p>
                                        )}

                                        {facilities.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-xs text-gray-500 font-medium mb-2">
                                                    Accessible Facilities:
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {facilities
                                                        .slice(0, 6)
                                                        .map((facility) => (
                                                            <div
                                                                key={
                                                                    facility.id
                                                                }
                                                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                                                            >
                                                                <span className="truncate max-w-24">
                                                                    {
                                                                        facility.name
                                                                    }
                                                                </span>
                                                                {facility.fee &&
                                                                    facility.fee >
                                                                        0 && (
                                                                        <span className="text-gray-500 text-xs">
                                                                            ₦
                                                                            {facility.fee.toLocaleString()}
                                                                        </span>
                                                                    )}
                                                                {facility.isBookable && (
                                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                                                )}
                                                            </div>
                                                        ))}
                                                    {facilities.length > 6 && (
                                                        <div className="inline-flex items-center px-2 py-1 bg-gray-50 text-gray-500 rounded-full text-xs border border-gray-200">
                                                            +
                                                            {facilities.length -
                                                                6}{' '}
                                                            more
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {facilities.length === 0 && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                No facilities available
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default BenefitDropdown;
