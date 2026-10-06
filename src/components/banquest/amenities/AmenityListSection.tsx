'use client';

import {
    AmenityFilterDialog,
    AmenityFilterTrigger,
    AmenityFilterValues,
} from '@/components/banquest/amenities/AmenityFilterDialog';
import { AmenityTableColumns } from '@/components/banquest/amenities/tables/columns/amenities';
import { AmenityRow } from '@/components/banquest/amenities/types';
import CustomTable from '@/components/common/table/CustomTable';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const CATEGORY_OPTIONS = [
    { value: 'all', label: 'All Categories' },
    { value: 'audio', label: 'Audio' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'visuals', label: 'Visuals' },
    { value: 'light', label: 'Light' },
];

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'not-available', label: 'Not available' },
    { value: 'unavailable', label: 'Unavailable' },
];

const CONDITION_OPTIONS = [
    { value: 'all', label: 'All Conditions' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'poor', label: 'Poor' },
    { value: 'bad', label: 'Bad' },
];

export default function AmenityListSection({
    amenities,
}: {
    amenities: AmenityRow[];
}) {
    const searchParams = useSearchParams();
    const statusFromUrl = searchParams.get('status') || 'all';
    const [category, setCategory] = useState('all');
    const [status, setStatus] = useState(statusFromUrl);
    const [filterOpen, setFilterOpen] = useState(false);

    useEffect(() => {
        setStatus(statusFromUrl);
    }, [statusFromUrl]);
    const [draftFilters, setDraftFilters] = useState<AmenityFilterValues>({
        amenity: 'all',
        category: 'all',
        condition: 'all',
    });
    const [appliedFilters, setAppliedFilters] =
        useState<AmenityFilterValues>({
            amenity: 'all',
            category: 'all',
            condition: 'all',
        });

    const amenityOptions = useMemo(
        () => [
            { value: 'all', label: 'All amenities' },
            ...amenities.map((a) => ({ value: a.id, label: a.name })),
        ],
        [amenities],
    );

    const filtered = useMemo(() => {
        return amenities.filter((a) => {
            if (category !== 'all' && a.category !== category) return false;
            if (status !== 'all' && a.status !== status) return false;
            if (
                appliedFilters.amenity !== 'all' &&
                a.id !== appliedFilters.amenity
            ) {
                return false;
            }
            if (
                appliedFilters.category !== 'all' &&
                a.category !== appliedFilters.category
            ) {
                return false;
            }
            if (
                appliedFilters.condition !== 'all' &&
                a.condition !== appliedFilters.condition
            ) {
                return false;
            }
            return true;
        });
    }, [amenities, category, status, appliedFilters]);

    const handleApplyDialog = () => {
        setAppliedFilters(draftFilters);
        if (draftFilters.category !== 'all') {
            setCategory(draftFilters.category);
        }
    };

    return (
        <>
            <CustomTable
                columns={AmenityTableColumns}
                data={filtered}
                hasFilter={false}
                searchPlaceholder="Search Amenities by name..."
                extend={
                    <div className="flex flex-wrap items-center gap-2">
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="h-10 w-[150px] border-gray-200 bg-white">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORY_OPTIONS.map((opt) => (
                                    <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                    >
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="h-10 w-[130px] border-gray-200 bg-white">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((opt) => (
                                    <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                    >
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <AmenityFilterTrigger
                            onClick={() => setFilterOpen(true)}
                        />
                    </div>
                }
            />
            <AmenityFilterDialog
                open={filterOpen}
                onOpenChange={setFilterOpen}
                values={draftFilters}
                onChange={setDraftFilters}
                onApply={handleApplyDialog}
                amenityOptions={amenityOptions}
                categoryOptions={CATEGORY_OPTIONS}
                conditionOptions={CONDITION_OPTIONS}
            />
        </>
    );
}
