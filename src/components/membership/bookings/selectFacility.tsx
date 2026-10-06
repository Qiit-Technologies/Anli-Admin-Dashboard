'use client';

import { getFacilities } from '@/app/actions/membership';
import useBookingStore from '@/store/useBookingStore';
import { Facility } from '@/types/membership/membership';
import { cn } from '@/lib/utils';
import {
    Building2,
    Check,
    Dumbbell,
    Sparkles,
    UtensilsCrossed,
    Waves,
    Wine,
} from 'lucide-react';
import React, { useMemo } from 'react';
import useSWR from 'swr';

interface SelectFacilityProps {
    onFacilitySelect?: (facility: Facility | null) => void;
    accessibleFacilities?: Facility[];
    disabled?: boolean;
    /** Controlled selection — use on QR check-in instead of booking store */
    selectedFacility?: Facility | null;
}

function facilityIcon(category?: string) {
    const key = (category ?? '').toLowerCase();
    if (key.includes('gym') || key.includes('fitness')) {
        return Dumbbell;
    }
    if (key.includes('pool') || key.includes('aqua')) {
        return Waves;
    }
    if (key.includes('spa') || key.includes('wellness')) {
        return Sparkles;
    }
    if (key.includes('dining') || key.includes('restaurant')) {
        return UtensilsCrossed;
    }
    if (key.includes('bar') || key.includes('lounge')) {
        return Wine;
    }
    return Building2;
}

const SelectFacility: React.FC<SelectFacilityProps> = ({
    onFacilitySelect,
    accessibleFacilities,
    disabled,
    selectedFacility: controlledFacility,
}) => {
    const { facility: storeFacility, setFacility } = useBookingStore();
    const isControlled = controlledFacility !== undefined;
    const activeFacility = isControlled ? controlledFacility : storeFacility;

    const { data: facilitiesData, isLoading } = useSWR(
        accessibleFacilities?.length ? null : '/api/facilities',
        getFacilities,
        { revalidateOnFocus: !accessibleFacilities },
    );

    const facilities = useMemo(() => {
        if (accessibleFacilities && accessibleFacilities.length > 0) {
            return accessibleFacilities;
        }
        const list = facilitiesData?.data?.facilities;
        return (Array.isArray(list) ? list : []) as Facility[];
    }, [facilitiesData?.data?.facilities, accessibleFacilities]);

    const handleFacilitySelect = (selected: Facility) => {
        if (disabled) return;
        if (!isControlled) {
            setFacility(selected);
        }
        onFacilitySelect?.(selected);
    };

    if (isLoading && !accessibleFacilities?.length) {
        return (
            <div className="space-y-2">
                <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
                <div className="grid gap-2 sm:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-[72px] animate-pulse rounded-xl bg-gray-100"
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-semibold text-gray-900">
                    Select facility
                </label>
                {accessibleFacilities?.length ? (
                    <span className="text-[11px] font-medium text-emerald-700">
                        {accessibleFacilities.length} included on plan
                    </span>
                ) : null}
            </div>

            {facilities.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                    <p className="font-medium text-gray-700">
                        No facilities available
                    </p>
                    <p className="mt-1 text-xs">
                        {accessibleFacilities
                            ? 'This member has no facility access on their plan.'
                            : 'Ask an admin to configure facilities.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2">
                    {facilities.map((facilityItem) => {
                        const selected = activeFacility?.id === facilityItem.id;
                        const Icon = facilityIcon(facilityItem.category);
                        const inactive = facilityItem.status === 'inactive';

                        return (
                            <button
                                key={facilityItem.id}
                                type="button"
                                disabled={disabled || inactive}
                                onClick={() => handleFacilitySelect(facilityItem)}
                                className={cn(
                                    'group relative flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all',
                                    disabled || inactive
                                        ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60'
                                        : selected
                                          ? 'border-orion-blue bg-blue-50/60 ring-2 ring-orion-blue/20'
                                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
                                )}
                            >
                                <div
                                    className={cn(
                                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                                        selected
                                            ? 'bg-orion-blue text-white'
                                            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200/80',
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-gray-900">
                                        {facilityItem.name}
                                    </p>
                                    {facilityItem.description ? (
                                        <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                                            {facilityItem.description}
                                        </p>
                                    ) : (
                                        <p className="mt-0.5 text-xs capitalize text-gray-400">
                                            {facilityItem.category || 'General'}
                                        </p>
                                    )}
                                    {facilityItem.fee > 0 ? (
                                        <p className="mt-1 text-[11px] font-medium text-gray-600">
                                            Fee: ₦
                                            {facilityItem.fee.toLocaleString(
                                                'en-NG',
                                            )}
                                        </p>
                                    ) : null}
                                </div>
                                {selected ? (
                                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orion-blue text-white">
                                        <Check className="h-3 w-3" />
                                    </div>
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SelectFacility;
