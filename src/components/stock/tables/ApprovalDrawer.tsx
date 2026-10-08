'use client';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';

interface ApprovalDrawerProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    open?: boolean;
    setOpen?: (open: boolean) => void;
    onClose?: () => void;
}

export function ApprovalDrawer({
    trigger,
    children,
    open: externalOpen,
    setOpen: setExternalOpen,
    onClose,
}: ApprovalDrawerProps) {
    const [internalOpen, setInternalOpen] = useState(false);

    const isControlled = externalOpen !== undefined;
    const open = isControlled ? externalOpen : internalOpen;

    const handleOpenChange = (newOpen: boolean) => {
        if (!isControlled) {
            setInternalOpen(newOpen);
        }

        setExternalOpen?.(newOpen);

        if (!newOpen && onClose) {
            onClose();
        }
    };

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>{trigger}</SheetTrigger>
            <SheetContent
                side="right"
                className="w-full sm:max-w-md md:max-w-lg"
            >
                <SheetHeader className="text-left pb-4">
                    <button
                        onClick={() => handleOpenChange(false)}
                        className="flex items-center text-sm font-medium"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                    </button>
                </SheetHeader>
                <SheetTitle className="sr-only">Approval Drawer</SheetTitle>
                <div className="mt-6">{children}</div>
            </SheetContent>
        </Sheet>
    );
}
