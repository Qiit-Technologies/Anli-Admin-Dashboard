'use client';

import type { UploadItemsCsvSuccess } from '@/app/actions/items';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
    AlertCircle,
    CheckCircle2,
    FileSpreadsheet,
    LayoutList,
    PackagePlus,
    RefreshCw,
    SkipForward,
} from 'lucide-react';
import type { ReactNode } from 'react';

type BulkUploadSummaryDialogProps = {
    summary: UploadItemsCsvSuccess;
    onDismiss: () => void;
};

function StatChip({
    icon,
    label,
    value,
}: Readonly<{
    icon: ReactNode;
    label: string;
    value: number;
}>) {
    return (
        <div className="flex flex-col gap-1 bg-white px-4 py-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {icon}
                {label}
            </div>
            <p className="text-2xl font-semibold tabular-nums text-slate-900">
                {value}
            </p>
        </div>
    );
}

export function BulkUploadSummaryDialog({
    summary,
    onDismiss,
}: Readonly<BulkUploadSummaryDialogProps>) {
    const applied = summary.created + summary.updated;
    const lines = summary.linesDetected ?? 0;
    const emptyFile = summary.totalRows === 0 && lines <= 1;
    const parseMismatch = summary.totalRows === 0 && lines > 1;
    const isWarning = !emptyFile && !parseMismatch && applied === 0;

    let title: string;
    let description: string;
    if (parseMismatch) {
        title = 'Could not parse data rows';
        description = `The file has ${lines} non-empty line(s) but 0 data rows were parsed. Use a comma-separated UTF-8 .csv (not .xlsx), with a header row and data below it.`;
    } else if (emptyFile) {
        title = lines === 1 ? 'Only a header row' : 'File had no rows';
        description =
            lines === 1
                ? 'Add at least one data row under the header, then upload again.'
                : 'The CSV had no lines to import. Choose a non-empty file or fix the export.';
    } else if (isWarning) {
        title = 'Nothing was imported';
        description =
            'Every row was skipped or empty. Check item names and that column headers match the downloaded template.';
    } else {
        title = 'Bulk upload complete';
        description = summary.message;
    }

    return (
        <Dialog
            open
            onOpenChange={(next) => {
                if (!next) onDismiss();
            }}
        >
            <DialogContent
                className={cn(
                    'sm:max-w-lg gap-0 overflow-hidden border-0 p-0 shadow-2xl',
                )}
            >
                <div
                    className={cn(
                        'px-6 pb-6 pt-8 text-center',
                        emptyFile || isWarning || parseMismatch
                            ? 'bg-amber-50/90'
                            : 'bg-emerald-50/90',
                    )}
                >
                    <div
                        className={cn(
                            'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/5',
                            emptyFile || isWarning || parseMismatch
                                ? 'bg-white text-amber-700'
                                : 'bg-white text-emerald-600',
                        )}
                    >
                        {emptyFile || isWarning || parseMismatch ? (
                            <AlertCircle
                                className="h-9 w-9"
                                strokeWidth={1.75}
                            />
                        ) : (
                            <CheckCircle2
                                className="h-9 w-9"
                                strokeWidth={1.75}
                            />
                        )}
                    </div>
                    <DialogHeader className="space-y-2 sm:text-center">
                        <DialogTitle className="text-xl font-semibold text-slate-900">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-slate-600 sm:mx-auto sm:max-w-sm">
                            {description}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="grid grid-cols-2 gap-px bg-slate-200/90">
                    <StatChip
                        icon={
                            <FileSpreadsheet className="h-4 w-4 text-orion-blue" />
                        }
                        label="Data rows parsed"
                        value={summary.totalRows}
                    />
                    {summary.linesDetected !== undefined ? (
                        <StatChip
                            icon={
                                <LayoutList className="h-4 w-4 text-slate-600" />
                            }
                            label="Non-empty lines"
                            value={summary.linesDetected}
                        />
                    ) : null}
                    <StatChip
                        icon={
                            <PackagePlus className="h-4 w-4 text-emerald-600" />
                        }
                        label="New items"
                        value={summary.created}
                    />
                    <StatChip
                        icon={
                            <RefreshCw className="h-4 w-4 text-sky-600" />
                        }
                        label="Updated"
                        value={summary.updated}
                    />
                    <StatChip
                        icon={
                            <SkipForward className="h-4 w-4 text-amber-700" />
                        }
                        label="Skipped"
                        value={summary.skipped}
                    />
                </div>

                <DialogFooter className="border-t border-slate-200/80 bg-slate-50/90 px-6 py-4 sm:justify-center">
                    <Button
                        type="button"
                        className="min-w-[120px] w-full bg-orion-blue text-white hover:bg-orion-blue sm:w-auto"
                        onClick={onDismiss}
                    >
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
