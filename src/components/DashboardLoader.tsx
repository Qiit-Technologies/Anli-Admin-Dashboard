'use client';
import React from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardLoader() {
    return (
        <div className="text-center flex flex-col h-screen items-center justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-brand" />
            Loading. Please wait...
        </div>
    );
}
