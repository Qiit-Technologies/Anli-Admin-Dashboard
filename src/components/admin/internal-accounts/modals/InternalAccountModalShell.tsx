'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Dialog, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface InternalAccountModalShellProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    children: ReactNode;
    maxWidthClass?: string;
}

export default function InternalAccountModalShell({
    open,
    onOpenChange,
    title,
    children,
    maxWidthClass = 'max-w-[640px]',
}: Readonly<InternalAccountModalShellProps>) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogPortal>
                <DialogOverlay className="fixed inset-0 z-50 bg-[#4a4a4a]/75 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <DialogPrimitive.Content
                    className={cn(
                        'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[20px] border-0 bg-white shadow-xl duration-200',
                        maxWidthClass,
                        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                    )}
                >
                    <div className="relative border-b border-[#E8E4DE] bg-[#F5F3EF] px-6 py-5">
                        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
                            <X className="size-4 text-muted-foreground" />
                        </DialogPrimitive.Close>
                        <DialogPrimitive.Title className="pr-8 text-lg font-semibold text-[#304050]">
                            {title}
                        </DialogPrimitive.Title>
                    </div>
                    {children}
                </DialogPrimitive.Content>
            </DialogPortal>
        </Dialog>
    );
}
