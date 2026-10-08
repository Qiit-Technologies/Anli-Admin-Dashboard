'use client';

import BarStockPage from '@/components/stock/bar-stock/BarStockPage';
import { Suspense } from 'react';

export default function Page() {
    return (
        <Suspense
            fallback={
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Loading bar stock…
                </div>
            }
        >
            <BarStockPage />
        </Suspense>
    );
}
