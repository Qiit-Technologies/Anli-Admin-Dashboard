'use client';

import React from 'react';

interface ReportSectionProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string;
}

export default function ReportSection({
    title,
    subtitle,
    children,
    className = '',
}: ReportSectionProps) {
    return (
        <div className={`mb-8 ${className}`}>
            <div className="mb-2">
                <h3 className="text-2xl font-medium text-[#09090B]">{title}</h3>
                {subtitle && (
                    <p className="text-sm text-[#8B9195] mt-1">{subtitle}</p>
                )}
            </div>
            {children}
        </div>
    );
}
