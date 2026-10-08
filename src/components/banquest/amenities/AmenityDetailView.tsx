'use client';

import AmenityAvailabilityCalendar from '@/components/banquest/amenities/AmenityAvailabilityCalendar';
import AmenitySpecificationCard from '@/components/banquest/amenities/AmenitySpecificationCard';
import AmenityThumbnail from '@/components/banquest/amenities/AmenityThumbnail';
import { AmenityRow } from '@/components/banquest/amenities/types';
import {
    AMENITY_CATEGORY_STYLES,
    AMENITY_CONDITION_STYLES,
} from '@/components/banquest/amenities/utils/amenity-category';
import { formatMoney } from '@/components/banquest/utils/banquet-pricing';
import BrandButton from '@/components/common/Button';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Download,
    ExternalLink,
    Network,
    Shapes,
    ShoppingCart,
    Tag,
    Wrench,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

const METRICS = [
    { key: 'totalQuantity', label: 'Total Quantity', icon: ShoppingCart },
    { key: 'availability', label: 'Total Available Unit', icon: Network },
    { key: 'category', label: 'Category', icon: Shapes },
    { key: 'rented', label: 'Currently Rented', icon: ExternalLink },
    { key: 'dailyRate', label: 'Daily Rate', icon: Tag },
    { key: 'condition', label: 'Current Condition', icon: Wrench },
] as const;

export default function AmenityDetailView({ amenity }: { amenity: AmenityRow }) {
    const isAvailable = amenity.availability > 0 && amenity.status === 'active';
    const catStyles = AMENITY_CATEGORY_STYLES[amenity.category];
    const condStyles = AMENITY_CONDITION_STYLES[amenity.condition];

    const metricValues: Record<string, ReactNode> = {
        totalQuantity: amenity.totalQuantity,
        availability: `${amenity.availability} Unit`,
        category: (
            <span
                className={cn(
                    'inline-flex rounded-full px-3 py-1 text-xs font-medium',
                    catStyles.bg,
                    catStyles.text,
                )}
            >
                {amenity.categoryLabel}
            </span>
        ),
        rented: amenity.rented,
        dailyRate: formatMoney(amenity.dailyRate),
        condition: (
            <span
                className={cn(
                    'inline-flex rounded-full px-3 py-1 text-xs font-medium',
                    condStyles.bg,
                    condStyles.text,
                )}
            >
                {condStyles.label}
            </span>
        ),
    };

    const descriptionText = Array(4)
        .fill(amenity.description)
        .join(' ');

    return (
        <div className="flex flex-col gap-6 px-4 pb-12 lg:px-8">
            <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex gap-5">
                            {amenity.images[0] ? (
                                <AmenityThumbnail
                                    src={amenity.images[0]}
                                    alt={amenity.name}
                                    size="lg"
                                />
                            ) : null}
                            <div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {amenity.name}
                                    </h2>
                                    <span
                                        className={cn(
                                            'inline-flex rounded-full px-3 py-1 text-xs font-medium',
                                            isAvailable
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-red-50 text-red-700',
                                        )}
                                    >
                                        {isAvailable
                                            ? 'Available'
                                            : 'Not available'}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground capitalize">
                                    {amenity.categoryLabel}
                                    {amenity.environment
                                        ? ` · Electronic · ${amenity.environment}`
                                        : ''}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {amenity.description}
                                </p>
                            </div>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2 self-start">
                            <Link
                                href={`/banquet/amenities/create?edit=${encodeURIComponent(amenity.id)}`}
                            >
                                <BrandButton type="button">
                                    Edit Amenities
                                </BrandButton>
                            </Link>
                            <Button
                                type="button"
                                variant="outline"
                                className="border-gray-200"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-8 border-t border-gray-100 pt-6">
                        {METRICS.map(({ key, label, icon: Icon }) => (
                            <div
                                key={key}
                                className="flex min-w-[120px] items-center gap-3"
                            >
                                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {label}
                                    </p>
                                    <div className="mt-0.5 text-sm font-semibold text-gray-900">
                                        {metricValues[key]}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-6">
                    <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <h3 className="text-base font-semibold text-gray-900">
                            Item Description
                        </h3>
                        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                            {descriptionText}
                        </p>
                        <p className="mt-4 text-sm text-muted-foreground">
                            SubTotal {formatMoney(amenity.dailyRate * 20)} .
                        </p>

                        <div className="mt-6 border-t border-gray-100 pt-6">
                            <h3 className="text-base font-semibold text-gray-900">
                                Image
                            </h3>
                            <div className="mt-4 flex flex-wrap gap-3">
                                {amenity.images.map((src, i) => (
                                    <div
                                        key={`${src}-${i}`}
                                        className="relative h-16 w-16 overflow-hidden rounded-lg bg-gray-100"
                                    >
                                        <Image
                                            src={src}
                                            alt={`${amenity.name} ${i + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 border-t border-gray-100 pt-6">
                            <AmenityAvailabilityCalendar
                                inventoryItemId={Number(amenity.id)}
                            />
                        </div>
                    </div>
                </div>

                <AmenitySpecificationCard items={amenity.specifications} />
            </div>
        </div>
    );
}
