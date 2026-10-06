'use client';

import ReportsIndex from '@/components/banquest/reports/ReportsIndex';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';

const ReportsPage = () => {
    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Banquet Reports"
                    subtitle="Generate and export banquet operational reports."
                />
            </PageHeader>
            <ReportsIndex />
        </PageWrapper>
    );
};

export default ReportsPage;
