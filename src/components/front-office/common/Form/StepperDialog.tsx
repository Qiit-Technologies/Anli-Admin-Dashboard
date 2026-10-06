'use client';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useIdleLogoutExemption } from '@/context/IdleLogoutContext';
import React, { useState } from 'react';

interface Props {
    trigger?: React.ReactNode;
    title?: string;
    description?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    content: React.ReactNode;
}
export function StepperDialog({
    trigger,
    title,
    description,
    open: openProp,
    onOpenChange,
    content,
}: Props) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = openProp !== undefined;
    const isOpen = isControlled ? openProp : internalOpen;

    useIdleLogoutExemption(!!isOpen);

    const handleOpenChange = (next: boolean) => {
        if (!isControlled) {
            setInternalOpen(next);
        }
        onOpenChange?.(next);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent
                onInteractOutside={(event) => {
                    event.preventDefault();
                }}
                className="!flex max-h-[90vh] w-full flex-col overflow-hidden sm:max-w-[1100px]"
            >
                <DialogHeader className="shrink-0">
                    <div className="flex flex-col">
                        <DialogTitle>{title ?? 'Multi Step Form'}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                        <hr className="mt-6" />
                    </div>
                </DialogHeader>
                <div className="min-h-0 flex-1 overflow-y-auto">
                    {isOpen ? content : null}
                </div>
            </DialogContent>
        </Dialog>
    );
}
