'use client';

import { AddVendorModal } from '@/components/account/vendors-management/AddVendorModal';
import { VendorEmptyState } from '@/components/account/vendors-management/VendorEmptyState';
import { VendorMetric } from '@/components/account/vendors-management/VendorMetrics';
import { VendorTable } from '@/components/account/vendors-management/VendorTable';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/useUser';
import { useVendorManagement } from '@/hooks/useVendorManagement';
import { Bell, Loader2, Plus, Search } from 'lucide-react';

export default function VendorManagementPage() {
    const { user } = useUser();
    const {
        isLoading,
        searchValue,
        setSearchValue,
        isAddModalOpen,
        setIsAddModalOpen,
        vendors,
        metrics,
        hasVendors,
        handleAddVendor,
        handleViewVendor,
        handleSubmitVendor,
    } = useVendorManagement();
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-none px-4 sm:px-6 lg:px-8 py-8">
                <div className="">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5 md:mb-8">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Vendor Management
                            </h1>
                            <p className="text-sm text-gray-600">
                                Welcome back, {user?.fullName}!
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search"
                                    value={searchValue}
                                    onChange={(e) =>
                                        setSearchValue(e.target.value)
                                    }
                                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <Button variant="ghost" size="icon">
                                <Bell className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center fixed top-0 left-0 z-100 w-screen h-screen">
                            <Loader2 className="text-brand animate-spin w-10 h-10" />
                        </div>
                    ) : !hasVendors ? (
                        <VendorEmptyState onAddVendor={handleAddVendor} />
                    ) : (
                        <>
                            <VendorMetric metrics={metrics} />
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-semibold text-gray-900">
                                                Vendor&apos;s list
                                            </h2>
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                                {vendors.length} vendors
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Keep track of all vendors.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <PermissionGate
                                            permissions={[
                                                PERMISSIONS.VENDORS_MANAGEMENT,
                                            ]}
                                            blockType="modal"
                                        >
                                            <Button
                                                onClick={handleAddVendor}
                                                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 bg-[rgba(0,103,213,1)]"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Add New Vendor
                                            </Button>
                                        </PermissionGate>
                                    </div>
                                </div>
                                <VendorTable
                                    vendors={vendors}
                                    onViewVendor={handleViewVendor}
                                />
                            </div>
                        </>
                    )}

                    <AddVendorModal
                        isOpen={isAddModalOpen}
                        onClose={() => setIsAddModalOpen(false)}
                        mutateVendors={handleSubmitVendor}
                    />
                </div>
            </div>
        </div>
    );
}
