import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { ArrowLeft } from 'lucide-react';
import React from 'react';

interface BaseSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const BaseSheet = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
}: BaseSheetProps) => {
    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto max-h-[calc(100vh-10rem)]h-full">
                <SheetHeader>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={onClose}>
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                    </div>
                    <SheetTitle className="flex items-center justify-between">
                        {title}
                    </SheetTitle>
                </SheetHeader>
                <div className="py-4">{children}</div>
                {footer && <SheetFooter>{footer}</SheetFooter>}
            </SheetContent>
        </Sheet>
    );
};
