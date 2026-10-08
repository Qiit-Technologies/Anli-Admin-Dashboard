'use client';

import { getBanquetMenuPackage } from '@/app/actions/banquet-menu-package';
import MenuPackageDetailView from '@/components/banquest/menu/MenuPackageDetailView';
import { mapApiMenuPackageToRow } from '@/components/banquest/menu/utils/map-menu-package';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import useSWR from 'swr';

export default function MenuPackageDetailPage() {
    const params = useParams();
    const id = Number(params.id);

    const { data, error, isLoading } = useSWR(
        Number.isFinite(id) ? `/banquet/menu-packages/${id}` : null,
        () => getBanquetMenuPackage(id),
    );

    const pkg = useMemo(() => {
        if (!data?.data || 'error' in data) return undefined;
        return mapApiMenuPackageToRow(data.data);
    }, [data]);

    const stillLoading = isLoading && !pkg && !error;

    return (
        <PageWrapper className="lg:px-0 gap-0">
            <PageHeader>
                <div className="flex w-full flex-col gap-3 px-4 lg:px-8">
                    <Button
                        variant="ghost"
                        className="w-fit text-orion-blue hover:text-orion-blue"
                        asChild
                    >
                        <Link href="/banquet/menu-details">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                    <PageHeadertitle
                        title={pkg?.name ?? 'Menu Package'}
                        subtitle=""
                    />
                </div>
            </PageHeader>

            {stillLoading ? (
                <div className="flex justify-center py-16">
                    <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : !pkg ? (
                <p className="px-8 text-sm text-destructive">
                    Package not found.
                </p>
            ) : (
                <MenuPackageDetailView pkg={pkg} />
            )}
        </PageWrapper>
    );
}
