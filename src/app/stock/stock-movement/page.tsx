'use client';

import StockMovementPage from '@/components/stock/stock-movement/StockMovementPage';
import { Suspense } from 'react';

export default function Page() {
    return (
        <Suspense
            fallback={
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Loading stock movement…
                </div>
            }
        >
            <StockMovementPage />
        </Suspense>
    );
}
