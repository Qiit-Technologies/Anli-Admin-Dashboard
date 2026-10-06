'use client';

import {
    RentedItemFilterDialog,
    RentedItemFilterTrigger,
    RentedItemFilterValues,
} from '@/components/banquest/rented-items/RentedItemFilterDialog';
import { RentedItemTableColumns } from '@/components/banquest/rented-items/tables/columns/rented-items';
import { RentedItemRow } from '@/components/banquest/rented-items/types';
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
    { value: 'returned', label: 'Returned' },
    { value: 'rented', label: 'Rented' },
    { value: 'over-due', label: 'Over-due' },
];

export default function RentedItemListSection({
    items,
}: {
    items: RentedItemRow[];
}) {
    const searchParams = useSearchParams();
    const statusFromUrl = searchParams.get('status') || 'all';
    const [category, setCategory] = useState('all');
    const [status, setStatus] = useState(statusFromUrl);
    const [filterOpen, setFilterOpen] = useState(false);

    useEffect(() => {
        setStatus(statusFromUrl);
    }, [statusFromUrl]);
    const [draftFilters, setDraftFilters] = useState<RentedItemFilterValues>({
        amenity: 'all',
        eventType: 'all',
        status: 'all',
    });
    const [appliedFilters, setAppliedFilters] =
        useState<RentedItemFilterValues>({
            amenity: 'all',
            eventType: 'all',
            status: 'all',
        });

    const amenityOptions = useMemo(
        () => [
            { value: 'all', label: 'All amenities' },
            ...items.map((i) => ({
                value: i.amenityId,
                label: i.amenityName,
            })),
        ],
        [items],
    );

    const eventTypeOptions = useMemo(
        () => [
            { value: 'all', label: 'All event types' },
            ...Array.from(new Set(items.map((i) => i.eventType))).map(
                (t) => ({ value: t, label: t }),
            ),
        ],
        [items],
    );

    const filtered = useMemo(() => {
        return items.filter((item) => {
            if (status !== 'all' && item.status !== status) return false;
            if (
                category !== 'all' &&
                item.category.toLowerCase() !== category
            ) {
                return false;
            }
            if (
                appliedFilters.amenity !== 'all' &&
                item.amenityId !== appliedFilters.amenity
            ) {
                return false;
            }
            if (
                appliedFilters.eventType !== 'all' &&
                item.eventType !== appliedFilters.eventType
            ) {
                return false;
            }
            if (
                appliedFilters.status !== 'all' &&
                item.status !== appliedFilters.status
            ) {
                return false;
            }
            return true;
        });
    }, [items, category, status, appliedFilters]);

    const handleApplyDialog = () => {
        setAppliedFilters(draftFilters);
        if (draftFilters.status !== 'all') {
            setStatus(draftFilters.status);
        }
    };

    return (
        <>
            <CustomTable
                columns={RentedItemTableColumns}
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
                        <RentedItemFilterTrigger
                            onClick={() => setFilterOpen(true)}
                        />
                    </div>
                }
            />
            <RentedItemFilterDialog
                open={filterOpen}
                onOpenChange={setFilterOpen}
                values={draftFilters}
                onChange={setDraftFilters}
                onApply={handleApplyDialog}
                amenityOptions={amenityOptions}
                eventTypeOptions={eventTypeOptions}
                statusOptions={STATUS_OPTIONS}
            />
        </>
    );
}
