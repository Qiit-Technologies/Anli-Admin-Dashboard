'use client';

import { fetchActiveMaintenance } from '@/app/actions/system-announcements';
import { useUser } from '@/context/useUser';
import useSWR from 'swr';

export function MaintenanceBanner() {
    const { user } = useUser();
    const { data } = useSWR(
        user ? 'system-maintenance-banner' : null,
        async () => {
            const result = await fetchActiveMaintenance();
            return result.data;
        },
        { refreshInterval: 60_000, revalidateOnFocus: true },
    );

    if (!data) return null;

    const windowLabel = [data.startsAt, data.endsAt]
        .filter(Boolean)
        .map((value) =>
            new Date(value as string).toLocaleString('en-GB', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
            }),
        )
        .join(' – ');

    return (
        <div className="sticky top-0 z-50 border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950">
            <strong className="font-semibold">{data.title}.</strong>{' '}
            <span>{data.body}</span>
            {windowLabel ? (
                <span className="ml-2 text-amber-800">({windowLabel})</span>
            ) : null}
        </div>
    );
}
