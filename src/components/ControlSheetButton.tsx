'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ControlSheetPreviewModal from './ControlSheetPreviewModal';
import { FileText } from 'lucide-react';

interface ControlSheetButtonProps {
    workPeriodId?: number | string;
    orders?: any[];
}

export default function ControlSheetButton({
    workPeriodId,
    orders,
}: Readonly<ControlSheetButtonProps>) {
    const [previewOpen, setPreviewOpen] = useState(false);

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewOpen(true)}
            >
                <FileText className="mr-2 h-4 w-4" />
                Control Sheet
            </Button>
            <ControlSheetPreviewModal
                isOpen={previewOpen}
                onClose={() => setPreviewOpen(false)}
                workPeriodId={workPeriodId}
                orders={orders}
            />
        </>
    );
}
