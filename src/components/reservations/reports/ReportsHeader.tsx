import React from 'react';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import { Button } from '@/components/ui/button';

interface ReportHeaderProps {
    onExport?: () => void;
}

export default function ReportHeader({ onExport }: ReportHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <PageHeader>
                <PageHeadertitle
                    title="Report"
                    subtitle="All details about the table reservations"
                />
            </PageHeader>

            <Button
                onClick={onExport}
                className="bg-[#0A84FF] text-white rounded-lg py-5 px-9 h-11"
            >
                Export
            </Button>
        </div>
    );
}
