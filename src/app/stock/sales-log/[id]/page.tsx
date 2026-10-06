'use client';

import {
    HeaderActions,
    PageHeader,
    PageHeadertitle,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/button';
import { Construction } from 'lucide-react';
import { useRouter } from 'next/navigation';

/** Sales Log disabled pending Recipe & Ingredient Management (ANLI-INV-012). */
const SalesLogDetailPage = () => {
    const router = useRouter();

    return (
        <div className="flex flex-col h-full overflow-hidden bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="Sales Log"
                    subtitle="Temporarily unavailable"
                />
                <HeaderActions />
            </PageHeader>

            <PageWrapper className="flex-1 overflow-auto pt-4">
                <div className="mx-auto max-w-lg rounded-lg border bg-white p-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border bg-muted">
                        <Construction className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h2 className="text-base font-semibold text-foreground">
                        Coming Soon
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        This Sales Log record is unavailable while the module is
                        disabled.
                    </p>
                    <Button
                        type="button"
                        className="mt-6"
                        variant="outline"
                        onClick={() => router.push('/stock/dashboard')}
                    >
                        Back to Dashboard
                    </Button>
                </div>
            </PageWrapper>
        </div>
    );
};

export default SalesLogDetailPage;
