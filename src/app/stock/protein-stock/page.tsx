'use client';

import ProteinStockPage from '@/components/stock/protein-stock/ProteinStockPage';
import { Suspense } from 'react';

export default function Page() {
    return (
        <Suspense
            fallback={
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Loading protein stock…
                </div>
            }
        >
            <ProteinStockPage />
        </Suspense>
    );
}
