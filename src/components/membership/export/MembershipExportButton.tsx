'use client';

import {
    exportMembershipExcel,
    exportMembershipPdf,
} from '@/lib/membership-export';
import {
    resolveMembershipBusinessAddress,
    resolveMembershipBusinessName,
} from '@/lib/membership-export-brand';
import useHotel from '@/hooks/useHotel';
import { useMemo, useState } from 'react';
import { CgExport } from 'react-icons/cg';

type MembershipExportButtonProps = {
    data: Record<string, unknown>[];
    filename: string;
    reportTitle: string;
    subtitle?: string;
    period?: string;
    sheetName?: string;
    orientation?: 'portrait' | 'landscape';
};

export default function MembershipExportButton({
    data,
    filename,
    reportTitle,
    subtitle,
    period,
    sheetName = 'Export',
    orientation = 'landscape',
}: MembershipExportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { organization } = useHotel();

    const meta = useMemo(
        () => ({
            businessName: resolveMembershipBusinessName(organization),
            businessAddress: resolveMembershipBusinessAddress(organization),
            reportTitle,
            subtitle,
            period,
            recordCount: data.length,
        }),
        [organization, reportTitle, subtitle, period, data.length],
    );

    const closeDropdown = () => setIsOpen(false);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                disabled={!data.length}
                className="flex items-center gap-2 rounded-md border border-orion-blue bg-orion-blue px-3 py-1 text-white transition-colors hover:bg-orion-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <CgExport className="mb-1 h-5 w-5 text-white" />
                <span className="text-sm font-medium">Export</span>
            </button>

            {isOpen && data.length > 0 && (
                <div className="absolute right-0 z-10 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg">
                    <button
                        type="button"
                        onClick={() => {
                            exportMembershipPdf(meta, data, filename, {
                                orientation,
                            });
                            closeDropdown();
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-slate-50"
                    >
                        Export as PDF
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            exportMembershipExcel(
                                meta,
                                data,
                                filename,
                                sheetName,
                            );
                            closeDropdown();
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-slate-50"
                    >
                        Export as Excel
                    </button>
                </div>
            )}
        </div>
    );
}
