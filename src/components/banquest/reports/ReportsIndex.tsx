'use client';

import { BANQUET_REPORTS } from './config';
import Link from 'next/link';
import {
    BarChart3,
    CalendarDays,
    ClipboardList,
    CreditCard,
    LayoutDashboard,
    Package,
    RotateCcw,
    Users,
    UtensilsCrossed,
    Warehouse,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const REPORT_ICONS: Record<string, typeof BarChart3> = {
    'booking-summary': ClipboardList,
    revenue: CreditCard,
    'outstanding-payments': CreditCard,
    'event-calendar': CalendarDays,
    'menu-package-performance': UtensilsCrossed,
    'amenities-inventory': Warehouse,
    'amenity-rental-revenue': Package,
    'overdue-returns': RotateCcw,
    'customer-booking-history': Users,
    'business-performance': LayoutDashboard,
};

export default function ReportsIndex() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {BANQUET_REPORTS.map((report) => {
                const Icon = REPORT_ICONS[report.slug] ?? BarChart3;
                return (
                    <Link
                        key={report.slug}
                        href={`/banquet/reports/${report.slug}`}
                        className={cn(
                            'group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition',
                            'hover:border-orion-blue/40 hover:shadow-md',
                        )}
                    >
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue/10 text-blue">
                            <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="text-base font-semibold text-gray-900 group-hover:text-orion-blue">
                                {report.title}
                            </h3>
                            <span
                                className={cn(
                                    'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                                    report.dataSource === 'preview'
                                        ? 'bg-amber-50 text-amber-700'
                                        : 'bg-emerald-50 text-emerald-700',
                                )}
                            >
                                {report.dataSource === 'preview'
                                    ? 'Preview'
                                    : 'Live'}
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                            {report.description}
                        </p>
                        <span className="mt-4 text-sm font-medium text-orion-blue">
                            Open report →
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}
