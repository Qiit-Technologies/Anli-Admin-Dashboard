'use client';

import { getAdrSnapshot } from '@/app/actions/guest';
import { toYYYYMMDD } from '@/components/front-office/complimentary-report/utils';
import Link from 'next/link';
import useSWR from 'swr';

function todayYmd(): string {
    return toYYYYMMDD(new Date());
}

function formatMoney(n: number): string {
    return n.toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export default function AdrTodayWidget() {
    const day = todayYmd();
    const { data, error, isLoading } = useSWR(
        ['adr-today-widget', day],
        async ([, d]: [string, string]) => {
            const r = await getAdrSnapshot({ date: d });
            if ('error' in r) {
                throw new Error(r.error);
            }
            return r.data;
        },
        { refreshInterval: 5000, revalidateOnFocus: true },
    );

    if (error) {
        return (
            <div className="bg-white rounded-md p-4 border gap-2 flex flex-col h-full text-sm text-red-600">
                Could not load ADR for today.
            </div>
        );
    }

    if (isLoading || !data) {
        return (
            <div className="bg-white rounded-md p-4 border animate-pulse h-full min-h-[7.5rem]" />
        );
    }

    const ctx = data.context;

    return (
        <div className="bg-white rounded-md p-4 border gap-2 flex flex-col h-full">
            <div className="flex items-center justify-between gap-2">
                <div className="text-sm text-muted-foreground font-medium">
                    ADR Today
                </div>
                <Link
                    href="/front-office/reports/adr"
                    className="text-xs text-orion-blue hover:underline shrink-0"
                >
                    Full report
                </Link>
            </div>
            <div className="text-2xl font-bold tracking-tight">
                ₦{formatMoney(data.adr)}
            </div>
            <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 mt-auto">
                <span>{data.roomsSoldNights} guest-nights</span>
                <span>₦{formatMoney(data.totalRoomRevenue)} revenue</span>
                {ctx?.occupancyPercent != null ? (
                    <span>≈{ctx.occupancyPercent}% occ.</span>
                ) : null}
                {ctx?.vsPriorDayPercent != null ? (
                    <span
                        className={
                            ctx.band === 'up'
                                ? 'text-green-600'
                                : ctx.band === 'down'
                                  ? 'text-red-600'
                                  : ''
                        }
                    >
                        {ctx.vsPriorDayPercent > 0 ? '+' : ''}
                        {ctx.vsPriorDayPercent}% vs prior
                    </span>
                ) : null}
            </div>
        </div>
    );
}
