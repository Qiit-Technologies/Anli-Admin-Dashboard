'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, History, Lock, Mail } from 'lucide-react';
import { useState } from 'react';

interface ReportActionsProps {
    businessDate: Date | null;
    isFinalized: boolean;
    onFinalize: (notes?: string) => Promise<void>;
    onEmail: (recipients: string[]) => Promise<void>;
    onViewHistory: () => void;
    isLoading?: boolean;
    disabled?: boolean;
}

export default function ReportActions({
    businessDate,
    isFinalized,
    onFinalize,
    onEmail,
    onViewHistory,
    isLoading = false,
    disabled = false,
}: ReportActionsProps) {
    const [showFinalizeDialog, setShowFinalizeDialog] = useState(false);
    const [showEmailDialog, setShowEmailDialog] = useState(false);
    const [finalizeNotes, setFinalizeNotes] = useState('');
    const [emailRecipients, setEmailRecipients] = useState('');
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [isEmailing, setIsEmailing] = useState(false);

    const handleFinalize = async () => {
        setIsFinalizing(true);
        try {
            await onFinalize(finalizeNotes || undefined);
            setShowFinalizeDialog(false);
            setFinalizeNotes('');
        } finally {
            setIsFinalizing(false);
        }
    };

    const handleEmail = async () => {
        const recipients = emailRecipients
            .split(',')
            .map((e) => e.trim())
            .filter((e) => e.length > 0);

        if (recipients.length === 0) return;

        setIsEmailing(true);
        try {
            await onEmail(recipients);
            setShowEmailDialog(false);
            setEmailRecipients('');
        } finally {
            setIsEmailing(false);
        }
    };

    const formatDate = (date: Date | null) => {
        if (!date) return 'N/A';
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <>
            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap mt-6 p-4 bg-gray-50 rounded-lg border">
                <div className="flex-1 min-w-[200px]">
                    <div className="text-sm text-gray-500">Business Date</div>
                    <div className="font-medium">
                        {formatDate(businessDate)}
                    </div>
                    {isFinalized && (
                        <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                            <CheckCircle size={14} />
                            <span>Finalized</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={onViewHistory}
                        disabled={isLoading}
                        className="gap-2"
                    >
                        <History size={16} />
                        Audit Trail
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => setShowEmailDialog(true)}
                        disabled={disabled || isLoading}
                        className="gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                    >
                        <Mail size={16} />
                        Email Report
                    </Button>

                    <Button
                        onClick={() => setShowFinalizeDialog(true)}
                        disabled={disabled || isFinalized || isLoading}
                        className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                        <Lock size={16} />
                        {isFinalized
                            ? 'Already Finalized'
                            : 'Finalize Night Audit'}
                    </Button>
                </div>
            </div>

            {/* Finalize Dialog */}
            <Dialog
                open={showFinalizeDialog}
                onOpenChange={setShowFinalizeDialog}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Lock size={20} />
                            Finalize Night Audit
                        </DialogTitle>
                        <DialogDescription>
                            This will lock the business date (
                            {formatDate(businessDate)}) and prevent further
                            modifications. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                            <AlertCircle
                                size={20}
                                className="text-amber-600 mt-0.5"
                            />
                            <div className="text-sm text-amber-800">
                                Once finalized, no changes can be made to
                                reservations, charges, or payments for this
                                date.
                            </div>
                        </div>

                        <Label htmlFor="finalize-notes">Notes (optional)</Label>
                        <Textarea
                            id="finalize-notes"
                            placeholder="Add any notes about this audit..."
                            value={finalizeNotes}
                            onChange={(e) => setFinalizeNotes(e.target.value)}
                            className="mt-2"
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowFinalizeDialog(false)}
                            disabled={isFinalizing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleFinalize}
                            disabled={isFinalizing}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isFinalizing
                                ? 'Finalizing...'
                                : 'Confirm & Finalize'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Email Dialog */}
            <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Mail size={20} />
                            Email Night Audit Report
                        </DialogTitle>
                        <DialogDescription>
                            Send the report for {formatDate(businessDate)} to GM
                            and Accounts.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <Label htmlFor="email-recipients">Recipients</Label>
                        <Input
                            id="email-recipients"
                            placeholder="gm@hotel.com, accounts@hotel.com"
                            value={emailRecipients}
                            onChange={(e) => setEmailRecipients(e.target.value)}
                            className="mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Separate multiple email addresses with commas
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowEmailDialog(false)}
                            disabled={isEmailing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEmail}
                            disabled={isEmailing || !emailRecipients.trim()}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isEmailing ? 'Sending...' : 'Send Email'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
