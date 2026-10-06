'use client';

import PageWrapper from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/button';
import { Construction } from 'lucide-react';
import { useRouter } from 'next/navigation';

/** Sales Log print disabled pending Recipe & Ingredient Management (ANLI-INV-012). */
const SalesLogPrintPage = () => {
    const router = useRouter();

    return (
        <PageWrapper>
            <div className="mx-auto mt-16 max-w-lg rounded-lg border bg-white p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border bg-muted">
                    <Construction className="h-6 w-6 text-muted-foreground" />
                </div>
                <h2 className="text-base font-semibold">Coming Soon</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Sales Log printing is unavailable while the module is
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
    );
};

export default SalesLogPrintPage;
