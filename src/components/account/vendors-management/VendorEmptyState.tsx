'use client';

import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface VendorEmptyStateProps {
    onAddVendor: () => void;
}

export function VendorEmptyState({ onAddVendor }: VendorEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <div className="max-w-[622px] w-full py-4 md:py-6 mx-auto text-center bg-[#F7F7F7] rounded-[38.26px]">
                <div className="mb-8">
                    <Image
                        src="/market.png"
                        alt="Empty vendor state illustration"
                        width={400}
                        height={300}
                        className="mx-auto"
                    />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Vendors
                </h2>
                <p className="text-gray-600 mb-8">
                    You currently don&apos;t have any vendor please add vendors
                </p>
                <PermissionGate
                    permissions={[PERMISSIONS.VENDORS_MANAGEMENT]}
                    blockType="hide"
                >
                    <Button
                        onClick={onAddVendor}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg bg-[rgba(0,123,255,1)]"
                    >
                        Add & Manage Vendor Profiles
                    </Button>
                </PermissionGate>
            </div>
        </div>
    );
}
