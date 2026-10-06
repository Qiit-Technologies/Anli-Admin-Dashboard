'use client';

import {
    getBanquetMenuPackageStats,
    getBanquetMenuPackages,
} from '@/app/actions/banquet-menu-package';
import MenuPackageListSection from '@/components/banquest/menu/MenuPackageListSection';
import MenuStatsCards from '@/components/banquest/menu/MenuStatsCards';
import {
    mapApiMenuPackageStats,
    mapApiMenuPackageToRow,
} from '@/components/banquest/menu/utils/map-menu-package';
import BrandButton from '@/components/common/Button';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import useSWR from 'swr';

const MenuDetailPage = () => {
    const router = useRouter();

    const { data: packagesResponse, isLoading: packagesLoading } = useSWR(
        '/banquet/menu-packages',
        getBanquetMenuPackages,
    );

    const { data: statsResponse } = useSWR(
        '/banquet/menu-packages/stats',
        getBanquetMenuPackageStats,
    );

    const packages = useMemo(() => {
        if (!packagesResponse?.data || 'error' in packagesResponse) return [];
        return packagesResponse.data.map(mapApiMenuPackageToRow);
    }, [packagesResponse]);

    const stats = useMemo(() => {
        if (statsResponse?.data && !('error' in statsResponse)) {
            return mapApiMenuPackageStats(statsResponse.data);
        }
        return mapApiMenuPackageStats({
            totalPackages: packages.length,
            activePackages: packages.filter((p) => p.status === 'active')
                .length,
            totalMealItems: packages.reduce((s, p) => s + p.itemCount, 0),
            categories: new Set(packages.map((p) => p.category)).size,
        });
    }, [statsResponse, packages]);

    const loadError =
        packagesResponse &&
        typeof packagesResponse === 'object' &&
        'error' in packagesResponse &&
        packagesResponse.error;

    return (
        <PageWrapper className="lg:px-0 gap-0 bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle title="Menu Details" />
            </PageHeader>

            <div className="flex flex-col gap-6 bg-white px-4 py-8 lg:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            All Menu Details
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            View, Manage and Create menu packages for your
                            event.
                        </p>
                    </div>
                    <BrandButton
                        onClick={() =>
                            router.push('/banquet/menu-details/create')
                        }
                    >
                        + Add Menu Package
                    </BrandButton>
                </div>
                <MenuStatsCards stats={stats} loading={packagesLoading} />
            </div>

            <div className="px-4 pb-10 lg:px-8 mt-8">
                {loadError ? (
                    <p className="mb-4 text-sm text-destructive">
                        Failed to load menu packages. Please refresh.
                    </p>
                ) : packagesLoading ? (
                    <p className="text-sm text-muted-foreground">
                        Loading menu packages…
                    </p>
                ) : packages.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-10 text-center">
                        <p className="text-sm text-muted-foreground">
                            No menu packages yet. Create your first package to
                            get started.
                        </p>
                        <BrandButton
                            className="mt-4"
                            onClick={() =>
                                router.push('/banquet/menu-details/create')
                            }
                        >
                            + Add Menu Package
                        </BrandButton>
                    </div>
                ) : (
                    <MenuPackageListSection packages={packages} />
                )}
            </div>
        </PageWrapper>
    );
};

export default MenuDetailPage;
