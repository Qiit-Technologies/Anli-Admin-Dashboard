/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { getVendorStats } from '@/app/actions/vendor';

export function useVendorManagement() {
    const [searchValue, setSearchValue] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const { data, error, isLoading, mutate } = useSWR(
        '/accounts/vendors/stats',
        getVendorStats,
    );
    const vendors = Array.isArray(data?.data?.vendors)
        ? data?.data?.vendors
        : [];
    // Start with empty state, only show vendor list after add
    const [hasVendorsOverride, setHasVendorsOverride] = useState<
        null | boolean
    >(null);

    const hasVendors =
        hasVendorsOverride !== null ? hasVendorsOverride : vendors.length > 0;
    const filteredVendors = vendors?.filter(
        (vendor: any) =>
            (vendor.vendorName || '')
                .toLowerCase()
                .includes(searchValue.toLowerCase()) ||
            (vendor.emailAddress || '')
                .toLowerCase()
                .includes(searchValue.toLowerCase()),
    );

    const handleAddVendor = () => {
        setIsAddModalOpen(true);
    };

    const handleViewVendor = (vendorId: string) => {
        // Navigate to vendor detail page
        window.location.href = `/account/vendors-management/${vendorId}`;
    };

    const handleSubmitVendor = () => {
        // Always switch to vendor list after add
        setHasVendorsOverride(true);
        mutate(); // revalidate vendor list
    };

    return {
        searchValue,
        setSearchValue,
        isAddModalOpen,
        setIsAddModalOpen,
        vendors: filteredVendors,
        metrics: data?.data?.metrics,
        hasVendors,
        handleAddVendor,
        handleViewVendor,
        handleSubmitVendor,
        setHasVendorsOverride, // Expose for toggling if needed
        hasVendorsOverride,
        isLoading,
        error,
        mutate,
    };
}
