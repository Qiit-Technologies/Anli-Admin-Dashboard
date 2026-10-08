'use client';

import {
    MenuPackageFilterDialog,
    MenuPackageFilterTrigger,
    MenuPackageFilterValues,
} from '@/components/banquest/menu/MenuPackageFilterDialog';
import { MenuPackageColumns } from '@/components/banquest/menu/tables/columns/menu-packages';
import { MenuPackageRow } from '@/components/banquest/menu/types';
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
    { value: 'wedding', label: 'Wedding' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'social', label: 'Social' },
    { value: 'local', label: 'Local' },
];

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'unavailable', label: 'Un-available' },
];

export default function MenuPackageListSection({
    packages,
}: {
    packages: MenuPackageRow[];
}) {
    const searchParams = useSearchParams();
    const statusFromUrl = searchParams.get('status') || 'all';
    const [category, setCategory] = useState('all');
    const [status, setStatus] = useState(statusFromUrl);
    const [filterOpen, setFilterOpen] = useState(false);

    useEffect(() => {
        setStatus(statusFromUrl);
    }, [statusFromUrl]);
    const [draftFilters, setDraftFilters] = useState<MenuPackageFilterValues>({
        menuOption: 'all',
        category: 'all',
    });
    const [appliedFilters, setAppliedFilters] =
        useState<MenuPackageFilterValues>({
            menuOption: 'all',
            category: 'all',
        });

    const menuOptions = useMemo(
        () => [
            { value: 'all', label: 'All menu options' },
            ...packages.map((p) => ({ value: p.id, label: p.name })),
        ],
        [packages],
    );

    const filtered = useMemo(() => {
        return packages.filter((p) => {
            if (category !== 'all' && p.category !== category) return false;
            if (status !== 'all' && p.status !== status) return false;
            if (
                appliedFilters.menuOption !== 'all' &&
                p.id !== appliedFilters.menuOption
            ) {
                return false;
            }
            if (
                appliedFilters.category !== 'all' &&
                p.category !== appliedFilters.category
            ) {
                return false;
            }
            return true;
        });
    }, [packages, category, status, appliedFilters]);

    const handleApplyDialog = () => {
        setAppliedFilters(draftFilters);
        if (draftFilters.category !== 'all') {
            setCategory(draftFilters.category);
        }
    };

    return (
        <>
            <CustomTable
                columns={MenuPackageColumns}
                data={filtered}
                hasFilter={false}
                searchPlaceholder="Search by package or item...."
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
                        <MenuPackageFilterTrigger
                            onClick={() => setFilterOpen(true)}
                        />
                    </div>
                }
            />
            <MenuPackageFilterDialog
                open={filterOpen}
                onOpenChange={setFilterOpen}
                values={draftFilters}
                onChange={setDraftFilters}
                onApply={handleApplyDialog}
                menuOptions={menuOptions}
                categoryOptions={CATEGORY_OPTIONS}
            />
        </>
    );
}
