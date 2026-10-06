'use client';

import { getMySubscription } from '@/app/actions/subscription';
import { AlertTriangle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

export const SubscriptionWarningBanner = () => {
    const { data: subscriptionResponse } = useSWR(
        'subscription-info',
        getMySubscription,
        {
            refreshInterval: 300000,
            revalidateOnFocus: false,
            dedupingInterval: 10000,
        },
    );

    const [countdownMs, setCountdownMs] = useState(0);

    const subscriptionInfo =
        subscriptionResponse && 'data' in subscriptionResponse
            ? subscriptionResponse.data
            : null;

    useEffect(() => {
        const warningExpiresAt =
            subscriptionInfo?.warningInfo?.warningExpiresAt;
        if (warningExpiresAt) {
            const updateCountdown = () => {
                const expiresAt = new Date(warningExpiresAt).getTime();
                const now = Date.now();
                const remaining = Math.max(0, expiresAt - now);
                setCountdownMs(remaining);
            };

            updateCountdown();
            const interval = setInterval(updateCountdown, 1000);

            return () => clearInterval(interval);
        }
    }, [subscriptionInfo?.warningInfo?.warningExpiresAt]);

    if (!subscriptionInfo?.warningInfo?.isActive) {
        return null;
    }

    const formatCountdown = (ms: number) => {
        if (!ms || ms <= 0) {
            return '00:00:00';
        }
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600)
            .toString()
            .padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60)
            .toString()
            .padStart(2, '0');
        const seconds = Math.floor(totalSeconds % 60)
            .toString()
            .padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    return (
        <div className="sticky top-0 z-40 w-full border-b border-amber-300 bg-amber-50 shadow-sm">
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                        <div className="rounded-full bg-amber-100 p-1.5 flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-amber-900 text-sm sm:text-base">
                                Warning: Account Deactivation
                            </p>
                            <p className="text-xs sm:text-sm text-amber-700 mt-0.5">
                                Your account will be deactivated automatically
                                when the countdown ends. Please contact support
                                or renew your subscription to prevent
                                deactivation.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-800 whitespace-nowrap">
                            <Clock className="h-4 w-4" />
                            <span className="font-mono">
                                {formatCountdown(countdownMs)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
