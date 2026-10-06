'use client';

import { getDraftInvoice } from '@/app/actions/draft-invoices';
import {
    HeaderActions,
    PageHeader,
    PageHeadertitle,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { QuotationInvoiceForm } from '@/components/front-office/draft-invoices/QuotationInvoiceForm';
import { Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';

export default function EditDraftInvoicePage() {
    const router = useRouter();
    const params = useParams();
    const draftId = Number(params.id);

    const { data: draft, error, isLoading } = useSWR(
        Number.isFinite(draftId) ? `/draft-invoices/${draftId}` : null,
        async () => {
            const result = await getDraftInvoice(draftId);
            if (result.error) throw new Error(result.error);
            return result.data;
        },
    );

    return (
        <div className="flex flex-col h-full overflow-auto bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title={
                        draft
                            ? `Edit invoice ${draft.invoiceNumber}`
                            : 'Edit invoice'
                    }
                    subtitle="Update guest, room, and stay details on this draft."
                    hasBack
                    onBack={() => router.push('/front-office/dashboard')}
                />
                <HeaderActions />
            </PageHeader>

            <PageWrapper className="mx-auto w-full max-w-4xl">
                {error ? (
                    <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                        {error.message}
                    </div>
                ) : isLoading ? (
                    <div className="flex items-center justify-center py-16 text-muted-foreground">
                        <Loader2 className="size-5 animate-spin mr-2" />
                        Loading draft invoice…
                    </div>
                ) : (
                    <QuotationInvoiceForm draft={draft ?? null} />
                )}
            </PageWrapper>
        </div>
    );
}
