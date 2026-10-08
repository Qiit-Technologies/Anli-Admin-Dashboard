'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import useHotel from '@/hooks/useHotel';
import {
    downloadGuestRegistrationFormPdf,
    guestRegistrationPreviewHtml,
} from '@/lib/front-office/guest-registration-form-actions';
import { DocumentPreviewFrame } from '@/components/front-office/common/DocumentPreviewFrame';
import { Download, Loader2, Printer } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface GuestRegistrationPreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GuestRegistrationPreviewModal({
    open,
    onOpenChange,
}: GuestRegistrationPreviewModalProps) {
    const { organization } = useHotel();
    const [pdfLoading, setPdfLoading] = useState(false);
    const [printLoading, setPrintLoading] = useState(false);
    const previewFrameRef = useRef<HTMLIFrameElement>(null);

    const previewHtml = useMemo(
        () => guestRegistrationPreviewHtml(organization),
        [organization],
    );

    const handlePrint = () => {
        setPrintLoading(true);
        try {
            const frameWindow = previewFrameRef.current?.contentWindow;
            if (!frameWindow) {
                throw new Error('Print preview is not ready yet.');
            }
            frameWindow.focus();
            frameWindow.print();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : 'Could not print form.',
            );
        } finally {
            setPrintLoading(false);
        }
    };

    const handleDownload = async () => {
        setPdfLoading(true);
        try {
            await downloadGuestRegistrationFormPdf(organization);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : 'Could not download PDF.',
            );
        } finally {
            setPdfLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[95vh] p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="flex items-center justify-between gap-4 pr-8">
                        <span>Guest Registration Form</span>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handlePrint}
                                disabled={printLoading}
                            >
                                {printLoading ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Printer className="size-4" />
                                )}
                                <span className="ml-2">Print</span>
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleDownload}
                                disabled={pdfLoading}
                                className="bg-orion-blue hover:bg-orion-blue"
                            >
                                {pdfLoading ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Download className="size-4" />
                                )}
                                <span className="ml-2">Download PDF</span>
                            </Button>
                        </div>
                    </DialogTitle>
                    <DialogDescription className="text-left">
                        Review the form below, then print or download for the
                        guest to complete manually.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-muted/30 p-4 overflow-auto max-h-[calc(95vh-120px)]">
                    {open ? (
                        <DocumentPreviewFrame
                            ref={previewFrameRef}
                            html={previewHtml}
                            title="Guest registration form preview"
                        />
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
}
