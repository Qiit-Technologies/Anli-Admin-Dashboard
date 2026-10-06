'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Usage and Register is replaced by Stock Movement. */
export default function UsageAndRegisterRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/stock/stock-movement');
    }, [router]);

    return (
        <div className="flex h-full items-center justify-center bg-gray-50/50 text-[14px] text-muted-foreground">
            Redirecting to Stock Movement…
        </div>
    );
}
