'use client';

import PageWrapper from '@/components/common/PageWrapper';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import { PrinterStatusCard } from '@/components/print/PrinterStatusCard';

const KitchenDashboard = () => {
    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Kitchen Dashboard"
                    subtitle="Kitchen operations overview"
                />
            </PageHeader>
            <PrinterStatusCard />
        </PageWrapper>
    );
};

export default KitchenDashboard;
