'use client';

import {
    deleteDraftInvoice,
    getDraftInvoices,
} from '@/app/actions/draft-invoices';
import {
    HeaderActions,
    PageHeader,
    PageHeadertitle,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import { MultiStepForm } from '@/components/front-office/common/Form/MultiStepFrom';
import { StepperDialog } from '@/components/front-office/common/Form/StepperDialog';
import {
    DraftInvoiceRowActions,
    useDraftInvoiceColumns,
} from '@/components/front-office/draft-invoices/DraftInvoiceColumns';
import { DraftInvoiceAuditDialog } from '@/components/front-office/draft-invoices/DraftInvoiceAuditDialog';
import { QuotationInvoicePreviewModal } from '@/components/front-office/draft-invoices/QuotationInvoicePreviewModal';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import useHotel from '@/hooks/useHotel';
import { draftToReservationInitialValues } from '@/lib/front-office/draft-payload-mapper';
import {
    downloadQuotationInvoicePdf,
    printQuotationInvoice,
} from '@/lib/front-office/quotation-invoice-actions';
import type { DraftInvoice } from '@/types/draft-invoice';
import { Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

export default function DraftInvoicesPage() {
    const { organization } = useHotel();
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [previewDraft, setPreviewDraft] = useState<DraftInvoice | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [auditDraft, setAuditDraft] = useState<DraftInvoice | null>(null);
    const [auditOpen, setAuditOpen] = useState(false);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [convertDraft, setConvertDraft] = useState<DraftInvoice | null>(null);
    const [convertOpen, setConvertOpen] = useState(false);

    const swrKey = `/draft-invoices?status=${statusFilter}`;

    const { data, error, isLoading, mutate } = useSWR(swrKey, async () => {
        const result = await getDraftInvoices({
            status: statusFilter === 'all' ? undefined : statusFilter,
            limit: 50,
        });
        if (result.error) throw new Error(result.error);
        return result.data;
    });

    const rows = data?.data ?? [];

    const openPreview = useCallback((draft: DraftInvoice) => {
        setPreviewDraft(draft);
        setPreviewOpen(true);
    }, []);

    const handlePrint = useCallback(
        async (draft: DraftInvoice) => {
            try {
                await printQuotationInvoice(draft, organization);
            } catch (err) {
                toast.error(
                    err instanceof Error ? err.message : 'Could not print invoice.',
                );
            }
        },
        [organization],
    );

    const handleDownload = useCallback(
        async (draft: DraftInvoice) => {
            try {
                await downloadQuotationInvoicePdf(draft, organization);
            } catch (err) {
                toast.error(
                    err instanceof Error
                        ? err.message
                        : 'Could not download PDF.',
                );
            }
        },
        [organization],
    );

    const handleConvert = useCallback((draft: DraftInvoice) => {
        setConvertDraft(draft);
        setConvertOpen(true);
    }, []);

    const handleConvertClose = useCallback(() => {
        setConvertOpen(false);
        setConvertDraft(null);
    }, []);

    const convertInitialValues = useMemo(
        () =>
            convertDraft
                ? draftToReservationInitialValues(convertDraft)
                : undefined,
        [convertDraft],
    );

    const handleEdit = useCallback(
        (draft: DraftInvoice) => {
            router.push(
                `/front-office/account-section/draft-invoices/${draft.id}/edit`,
            );
        },
        [router],
    );

    const handleAudit = useCallback((draft: DraftInvoice) => {
        setAuditDraft(draft);
        setAuditOpen(true);
    }, []);

    const handleDelete = useCallback(
        async (draft: DraftInvoice) => {
            const confirmed = window.confirm(
                `Delete invoice ${draft.invoiceNumber}? This cannot be undone.`,
            );
            if (!confirmed) return;

            setBusyId(draft.id);
            const result = await deleteDraftInvoice(draft.id);
            setBusyId(null);

            if (result.error) {
                toast.error(result.error);
                return;
            }

            toast.success('Draft invoice deleted.');
            void mutate();
        },
        [mutate],
    );

    const rowActions: DraftInvoiceRowActions = useMemo(
        () => ({
            onView: openPreview,
            onPrint: handlePrint,
            onDownload: handleDownload,
            onAudit: handleAudit,
            onEdit: handleEdit,
            onConvert: handleConvert,
            onDelete: handleDelete,
        }),
        [
            openPreview,
            handlePrint,
            handleDownload,
            handleAudit,
            handleEdit,
            handleConvert,
            handleDelete,
        ],
    );

    const columns = useDraftInvoiceColumns(rowActions);

    return (
        <div className="flex flex-col h-full overflow-auto bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="Draft Invoices"
                    subtitle="Draft invoices generated before reservations are confirmed."
                />
                <HeaderActions />
            </PageHeader>

            <PageWrapper>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-3">
                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="converted">Converted</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" asChild>
                                <Link href="/front-office/account-section/draft-invoices/new">
                                    <Plus className="size-4 mr-2" />
                                    Generate Invoice
                                </Link>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => void mutate()}
                                disabled={isLoading}
                            >
                                {isLoading && (
                                    <Loader2 className="size-4 animate-spin mr-2" />
                                )}
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {error ? (
                        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                            {error.message}
                        </div>
                    ) : isLoading ? (
                        <div className="flex items-center justify-center py-16 text-muted-foreground">
                            <Loader2 className="size-5 animate-spin mr-2" />
                            Loading draft invoices…
                        </div>
                    ) : (
                        <CustomTable
                            data={rows}
                            columns={columns}
                            hasHeader={false}
                        />
                    )}

                    {busyId !== null && (
                        <p className="text-xs text-muted-foreground">
                            Processing draft #{busyId}…
                        </p>
                    )}
                </div>
            </PageWrapper>

            <QuotationInvoicePreviewModal
                open={previewOpen}
                onOpenChange={setPreviewOpen}
                draft={previewDraft}
            />

            <DraftInvoiceAuditDialog
                draft={auditDraft}
                open={auditOpen}
                onOpenChange={setAuditOpen}
            />

            <StepperDialog
                open={convertOpen}
                onOpenChange={(open) => {
                    if (open) {
                        setConvertOpen(true);
                        return;
                    }
                    handleConvertClose();
                }}
                title="Convert to reservation"
                description="Guest and quotation details are preloaded. Select an available room and complete the booking."
                content={
                    convertDraft && convertInitialValues ? (
                        <MultiStepForm
                            key={convertDraft.id}
                            initialValues={convertInitialValues}
                            initialStep={3}
                            skipTypeSelection
                            draftInvoiceId={convertDraft.id}
                            onClose={handleConvertClose}
                            onConversionComplete={() => {
                                toast.success('Draft converted to reservation.');
                                void mutate();
                            }}
                        />
                    ) : null
                }
            />
        </div>
    );
}
