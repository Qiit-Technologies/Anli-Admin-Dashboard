'use client';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useIdleLogoutExemption } from '@/context/IdleLogoutContext';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { useState, type ReactNode } from 'react';

interface CustomSheetProps {
    trigger: ReactNode;
    children: ReactNode;
    title: string;
    subTitle?: string;
    open?: boolean;
    setOpen?: (open: boolean) => void;
    defaultOpen?: boolean;
    noTitle?: boolean;
    onClose?: () => void;
    className?: string;
}
export function CustomSheet({
    trigger,
    children,
    title,
    subTitle,
    open,
    setOpen,
    defaultOpen = false,
    noTitle = false,
    onClose,
    className,
}: Readonly<CustomSheetProps>) {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);

    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;

    useIdleLogoutExemption(isOpen);

    const handleOpenChange = (newOpen: boolean) => {
        if (!isControlled) {
            setInternalOpen(newOpen);
        }
        setOpen?.(newOpen);
    };
    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>{trigger}</SheetTrigger>
            <SheetContent
                side="right"
                className={`w-full sm:max-w-md md:max-w-lg overflow-y-auto max-h-[calc(100vh-10rem)]h-full ${className}`}
                onInteractOutside={(event) => {
                    const target = event.target as HTMLElement | null;
                    if (target?.closest('[data-discount-modal]')) {
                        event.preventDefault();
                    }
                }}
            >
                <SheetHeader className="text-left pb-4">
                    <button
                        onClick={() => {
                            handleOpenChange(false);
                            onClose?.();
                        }}
                        className="flex items-center text-sm font-medium"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                    </button>
                </SheetHeader>
                <SheetTitle
                    className={cn(noTitle && 'sr-only', 'flex flex-col gap-1')}
                >
                    <span>{title}</span>
                    {subTitle && (
                        <span className="text-sm text-muted-foreground">
                            {subTitle}
                        </span>
                    )}
                </SheetTitle>
                <div className="mt-6">{isOpen ? children : null}</div>
            </SheetContent>
        </Sheet>
    );
}
