import React, { Suspense } from 'react';

export default function CancelBookingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
                    Loading…
                </div>
            }
        >
            {children}
        </Suspense>
    );
}
