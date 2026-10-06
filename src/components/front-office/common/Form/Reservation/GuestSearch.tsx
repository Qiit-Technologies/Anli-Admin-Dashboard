'use client';

import { InputField } from '@/components/common/Form';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

function AnchoredMenu({
    anchor,
    children,
}: {
    anchor: HTMLElement | null;
    children: ReactNode;
}) {
    const [box, setBox] = useState<{
        top: number;
        left: number;
        width: number;
        maxHeight: number;
        openUp: boolean;
    } | null>(null);

    useLayoutEffect(() => {
        if (!anchor) return;
        const place = () => {
            const rect = anchor.getBoundingClientRect();
            const gap = 4;
            const margin = 8;
            const spaceBelow = window.innerHeight - rect.bottom - gap - margin;
            const spaceAbove = rect.top - gap - margin;
            const openUp = spaceBelow < 220 && spaceAbove > spaceBelow;
            const maxHeight = Math.max(120, openUp ? spaceAbove : spaceBelow);
            setBox({
                top: openUp ? rect.top - gap : rect.bottom + gap,
                left: Math.max(margin, rect.left),
                width: Math.min(rect.width, window.innerWidth - margin * 2),
                maxHeight,
                openUp,
            });
        };
        place();
        window.addEventListener('resize', place);
        window.addEventListener('scroll', place, true);
        return () => {
            window.removeEventListener('resize', place);
            window.removeEventListener('scroll', place, true);
        };
    }, [anchor]);

    if (!box || typeof document === 'undefined') return null;
    return createPortal(
        <div
            data-guest-search-menu=""
            style={{
                position: 'fixed',
                top: box.top,
                left: box.left,
                width: box.width,
                maxHeight: box.maxHeight,
                zIndex: 200,
                overflow: 'auto',
                pointerEvents: 'auto',
                transform: box.openUp ? 'translateY(-100%)' : undefined,
            }}
        >
            {children}
        </div>,
        document.body,
    );
}

interface GuestSearchProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    searchingGuest: boolean;
    showResults: boolean;
    guestHistory: any[];
    autoFillGuestData: (guest: any) => void;
    setShowResults: (show: boolean) => void;
    setGuestHistory: (history: any[]) => void;
    inputClass: string;
    value: string;
    onValueChange: (value: string) => void;
    id?: string;
    name?: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
}

export function GuestSearch({
    searchQuery,
    setSearchQuery,
    searchingGuest,
    showResults,
    guestHistory,
    autoFillGuestData,
    setShowResults,
    setGuestHistory,
    inputClass,
    value,
    onValueChange,
    id = 'fullName',
    name = 'fullName',
    label = 'Full Name',
    placeholder = 'Enter guest name, email, or phone number...',
    required = false,
}: GuestSearchProps) {
    const anchorRef = useRef<HTMLDivElement>(null);

    return (
        <div className="relative" ref={anchorRef}>
            <InputField
                id={id}
                name={name}
                label={label}
                required={required}
                type="text"
                placeholder={placeholder}
                className={inputClass}
                value={value}
                onChange={(e) => {
                    const query = e.target.value;
                    onValueChange(query);
                    setSearchQuery(query);
                }}
            />

            {searchingGuest && (
                <AnchoredMenu anchor={anchorRef.current}>
                <div className="bg-white border border-gray-200 rounded-md shadow-lg p-2">
                    <div className="flex items-center justify-center py-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orion-blue"></div>
                        <span className="ml-2 text-sm text-gray-600">
                            Searching for returning guest...
                        </span>
                    </div>
                </div>
                </AnchoredMenu>
            )}

            {showResults && !searchingGuest && guestHistory.length === 0 && (
                <AnchoredMenu anchor={anchorRef.current}>
                    <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-3">
                        <p className="text-sm text-muted-foreground">
                            No returning guests found. Keep typing to use this
                            as a new guest name.
                        </p>
                    </div>
                </AnchoredMenu>
            )}

            {showResults && guestHistory.length > 0 && !searchingGuest && (
                <AnchoredMenu anchor={anchorRef.current}>
                <div className="bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                    <div className="p-2">
                        <div className="text-xs text-gray-500 mb-2 px-1 font-medium">
                            {guestHistory.length === 1
                                ? 'Returning guest found:'
                                : `${guestHistory.length} returning guests found:`}
                        </div>
                        <div className="space-y-1">
                            {guestHistory.map((guest, index) => (
                                <div
                                    key={index}
                                    onMouseDown={(event) => {
                                        event.preventDefault();
                                        autoFillGuestData(guest);
                                        setShowResults(false);
                                        setSearchQuery('');
                                        setGuestHistory([]);
                                    }}
                                    className="p-3 border border-gray-100 rounded-md cursor-pointer transition-all duration-150 hover:border-orion-blue hover:bg-blue-50 hover:shadow-sm bg-white"
                                >
                                    {/* Compact Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-orion-blue to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                                                <span className="text-white text-sm font-semibold">
                                                    {guest.fullName
                                                        ?.charAt(0)
                                                        ?.toUpperCase() || 'G'}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                                                        {guest.fullName}
                                                    </h3>
                                                    {guest.source && (
                                                        <span
                                                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                                guest.source ===
                                                                'Accounts Payable'
                                                                    ? 'bg-orange-200 text-orange-700'
                                                                    : 'bg-orion-blue text-white'
                                                            }`}
                                                        >
                                                            {guest.source}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-3 text-xs text-gray-500">
                                                    {guest.email && (
                                                        <span className="truncate">
                                                            📧 {guest.email}
                                                        </span>
                                                    )}
                                                    {guest.phoneNumber && (
                                                        <span className="truncate">
                                                            📞{' '}
                                                            {guest.phoneNumber}
                                                        </span>
                                                    )}
                                                    {guest.source ===
                                                        'Accounts Payable' &&
                                                        guest.creditBalance >
                                                            0 && (
                                                            <span className="truncate text-orange-600 font-medium">
                                                                💰 Credit: ₦
                                                                {guest.creditBalance.toLocaleString()}
                                                            </span>
                                                        )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Stats Badge */}
                                        <div className="flex items-center space-x-2">
                                            {guest.source === 'Guest History' &&
                                                guest.totalStays > 0 && (
                                                    <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                                                        <span className="text-green-600 text-xs">
                                                            📅
                                                        </span>
                                                        <span className="text-xs font-medium text-green-700">
                                                            {guest.totalStays}
                                                        </span>
                                                    </div>
                                                )}
                                            {guest.source ===
                                                'Accounts Payable' &&
                                                guest.creditBalance > 0 && (
                                                    <div className="flex items-center space-x-1 bg-orange-200 px-2 py-1 rounded-full">
                                                        <span className="text-orange-600 text-xs">
                                                            💰
                                                        </span>
                                                        <span className="text-xs font-medium text-orange-700">
                                                            ₦
                                                            {guest.creditBalance.toLocaleString()}
                                                        </span>
                                                    </div>
                                                )}
                                        </div>
                                    </div>

                                    {/* Compact Preferences */}
                                    {(guest.preferredRoomType ||
                                        guest.preferredPaymentMethod ||
                                        guest.averageStayLength > 0) && (
                                        <div className="mt-2 pt-2 border-t border-gray-100">
                                            <div className="flex items-center space-x-4 text-xs text-gray-600">
                                                {guest.preferredRoomType && (
                                                    <div className="flex items-center space-x-1">
                                                        <span>🏠</span>
                                                        <span className="truncate">
                                                            {
                                                                guest.preferredRoomType
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                                {guest.preferredPaymentMethod && (
                                                    <div className="flex items-center space-x-1">
                                                        <span>💳</span>
                                                        <span className="truncate">
                                                            {
                                                                guest.preferredPaymentMethod
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                                {guest.averageStayLength >
                                                    0 && (
                                                    <div className="flex items-center space-x-1">
                                                        <span>⏱️</span>
                                                        <span>
                                                            {
                                                                guest.averageStayLength
                                                            }{' '}
                                                            nights avg
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                </AnchoredMenu>
            )}
        </div>
    );
}
