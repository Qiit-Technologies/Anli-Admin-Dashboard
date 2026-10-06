'use client';

import {
    HeaderActions,
    PageHeader,
    PageHeadertitle,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { QuotationInvoiceForm } from '@/components/front-office/draft-invoices/QuotationInvoiceForm';
import { useRouter } from 'next/navigation';

export default function NewDraftInvoicePage() {
    const router = useRouter();

    return (
        <div className="flex flex-col h-full overflow-auto bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="Generate Invoice"
                    subtitle="Create a draft invoice before confirming a reservation."
                    hasBack
                    onBack={() => router.push('/front-office/dashboard')}
                />
                <HeaderActions />
            </PageHeader>

            <PageWrapper className="mx-auto w-full max-w-4xl">
                <QuotationInvoiceForm />
            </PageWrapper>
        </div>
    );
}
