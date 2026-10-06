'use client';

import React, { useState, useEffect } from 'react';
import { searchPayableGuests } from '@/app/actions/guest';
import { InputField } from '@/components/common/Form';
import { Search, Wallet, User, Mail, Phone, Loader2 } from 'lucide-react';

interface APGuest {
    fullName: string;
    email: string;
    phoneNumber: string;
    creditBalance: number;
    source: string;
    [key: string]: any;
}

interface UnifiedAPActivationProps {
    onSelect: (guest: APGuest) => void;
    inputClass?: string;
}

export function UnifiedAPActivation({
    onSelect,
    inputClass,
}: UnifiedAPActivationProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<APGuest[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAPGuests();
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const fetchAPGuests = async () => {
        setLoading(true);
        try {
            const response = await searchPayableGuests(query);
            if (response.data) {
                setResults(response.data);
            }
        } catch (error: any) {
            console.error('Error fetching AP guests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (guest: APGuest) => {
        onSelect(guest);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div className="relative w-full">
            <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-gray-700">
                    Apply Account Payable
                </span>
            </div>

            <div className="relative">
                <InputField
                    id="ap-search"
                    name="ap-search"
                    label=""
                    placeholder="Search AP customers by name, email or phone..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className={
                        inputClass ||
                        'bg-white border-orange-200 focus:border-orange-500 ring-orange-100'
                    }
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {loading && (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    )}
                    <Search className="w-4 h-4 text-gray-400" />
                </div>
            </div>

            {isOpen && (query.length > 0 || results.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2">
                        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2 px-2 font-bold">
                            {results.length === 0
                                ? 'No AP customers found'
                                : `${results.length} AP Customer${results.length > 1 ? 's' : ''} with balance`}
                        </div>

                        <div className="space-y-1">
                            {results.map((guest, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleSelect(guest)}
                                    className="p-3 rounded-md cursor-pointer transition-all duration-150 border border-transparent hover:border-orange-200 hover:bg-orange-50 bg-white group"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-9 h-9 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-orange-200 transition-colors">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 text-sm truncate group-hover:text-orange-700">
                                                    {guest.fullName}
                                                </h3>
                                                <div className="flex flex-col gap-0.5">
                                                    {guest.email && (
                                                        <div className="flex items-center gap-1 text-[11px] text-gray-500 truncate">
                                                            <Mail className="w-3 h-3 text-gray-400" />
                                                            {guest.email}
                                                        </div>
                                                    )}
                                                    {guest.phoneNumber && (
                                                        <div className="flex items-center gap-1 text-[11px] text-gray-500 truncate">
                                                            <Phone className="w-3 h-3 text-gray-400" />
                                                            {guest.phoneNumber}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right flex-shrink-0">
                                            <div className="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 border border-orange-200">
                                                <span className="text-[11px] font-bold text-orange-700 whitespace-nowrap">
                                                    ₦
                                                    {Number(
                                                        guest.creditBalance,
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="text-[9px] text-gray-400 mt-1 font-medium italic">
                                                Available Credit
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Click outside to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
