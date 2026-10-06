'use client';

import React, { useEffect, useState } from 'react';
import HomeClientLoader from './HomeClientLoader';

export default function ClientWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    if (loading) return <HomeClientLoader />;

    return <>{children}</>;
}
