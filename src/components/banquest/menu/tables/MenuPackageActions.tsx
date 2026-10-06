'use client';

import { duplicateBanquetMenuPackage } from '@/app/actions/banquet-menu-package';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MenuPackageRow } from '@/components/banquest/menu/types';
import { MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useSWRConfig } from 'swr';

export default function MenuPackageActions({
    pkg,
}: {
    pkg: MenuPackageRow;
}) {
    const { mutate } = useSWRConfig();
    const [duplicating, setDuplicating] = useState(false);

    const refresh = () => {
        mutate('/banquet/menu-packages');
        mutate('/banquet/menu-packages/stats');
    };

    const handleDuplicate = async () => {
        const id = Number(pkg.id);
        if (!Number.isFinite(id)) return;

        setDuplicating(true);
        const result = await duplicateBanquetMenuPackage(id);
        setDuplicating(false);

        if (result.error) {
            toast.custom(() => (
                <Toast title="Error" description={result.error} type="error" />
            ));
            return;
        }

        toast.custom(() => (
            <Toast
                title="Duplicated"
                description={`"${pkg.name}" was duplicated.`}
                type="success"
            />
        ));
        refresh();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Menu actions"
                >
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-52 rounded-xl border border-gray-200 p-2 shadow-lg"
            >
                <DropdownMenuItem
                    asChild
                    className="cursor-pointer rounded-lg px-3 py-3 text-sm font-medium focus:bg-slate-50"
                >
                    <Link
                        href={`/banquet/menu-details/${encodeURIComponent(pkg.id)}`}
                    >
                        View package
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    asChild
                    className="cursor-pointer rounded-lg px-3 py-3 text-sm font-medium focus:bg-slate-50"
                >
                    <Link
                        href={`/banquet/menu-details/${encodeURIComponent(pkg.id)}`}
                    >
                        Edit package
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="cursor-pointer rounded-lg px-3 py-3 text-sm font-medium focus:bg-slate-50"
                    disabled={duplicating}
                    onClick={handleDuplicate}
                >
                    {duplicating ? 'Duplicating…' : 'Duplicate'}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
