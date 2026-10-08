'use client';

import BanquetReportPage from '@/components/banquest/reports/shared/BanquetReportPage';
import { getBanquetReportBySlug } from '@/components/banquest/reports/config';
import PageWrapper from '@/components/common/PageWrapper';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function BanquetReportSubPage() {
    const params = useParams();
    const slug = String(params.slug ?? '');
    const config = getBanquetReportBySlug(slug);

    if (!config) {
        return (
            <PageWrapper>
                <p className="text-sm text-destructive">Report not found.</p>
                <Link
                    href="/banquet/reports"
                    className="mt-4 text-sm text-orion-blue hover:underline"
                >
                    ← Back to reports
                </Link>
            </PageWrapper>
        );
    }

    return <BanquetReportPage config={config} />;
}
