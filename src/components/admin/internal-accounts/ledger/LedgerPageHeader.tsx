'use client';

import SearchInput from '@/components/common/SearchInput';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface LedgerPageHeaderProps {
    accountId: string;
    basePath?: string;
    title: string;
    subtitle: string;
    searchValue: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder: string;
    onExportPdf?: () => void;
    exportPermission?: PERMISSIONS;
}

export default function LedgerPageHeader({
    accountId,
    basePath = '/admin/internal-accounts',
    title,
    subtitle,
    searchValue,
    onSearchChange,
    searchPlaceholder,
    onExportPdf,
    exportPermission,
}: Readonly<LedgerPageHeaderProps>) {
    return (
        <div className="mb-6 space-y-4">
            <Link
                href={`${basePath}/${accountId}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
                <ChevronLeft className="size-4" />
                Back
            </Link>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        {title}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {subtitle}
                    </p>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <SearchInput
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="h-10 w-full sm:w-72"
                    />
                    {exportPermission ? (
                        <PermissionGate
                            permissions={[exportPermission]}
                            blockType="hide"
                        >
                            <Button
                                variant="outline"
                                className="h-10 shrink-0"
                                onClick={onExportPdf}
                            >
                                Export as PDF
                            </Button>
                        </PermissionGate>
                    ) : (
                        <Button
                            variant="outline"
                            className="h-10 shrink-0"
                            onClick={onExportPdf}
                        >
                            Export as PDF
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
