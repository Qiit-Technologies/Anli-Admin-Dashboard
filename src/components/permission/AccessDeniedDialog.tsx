'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Lock } from 'lucide-react';
import { useState } from 'react';

interface AccessDeniedDialogProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    contactInfo?: string;
}

export function AccessDeniedDialog({
    children,
    title = 'Access Denied',
    description = 'You do not have the required permissions to perform this action. Please contact an administrator if you believe this is an error.',
    contactInfo,
}: AccessDeniedDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="relative cursor-not-allowed group">
                    {children}
                    <div className="absolute inset-0 bg-secondary/40 backdrop-blur-[0.5px] rounded-md transition-all duration-200 group-hover:bg-secondary/50" />
                </div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center sm:text-left">
                    <DialogTitle className="flex items-center justify-center sm:justify-start gap-2 text-destructive">
                        <div className="p-2 rounded-full bg-destructive/10">
                            <Lock className="h-5 w-5" />
                        </div>
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-center sm:text-left pt-2">
                        {description}
                        {contactInfo && (
                            <span className="block mt-2 text-sm font-medium text-hexbrand">
                                Contact: {contactInfo}
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto order-2 sm:order-1 bg-transparent"
                        onClick={() => setOpen(false)}
                    >
                        Close
                    </Button>
                    <Button
                        type="button"
                        className="w-full sm:w-auto bg-hexbrand hover:bg-hexbrand/90 order-1 sm:order-2"
                        onClick={() => {
                            window.location.href =
                                'mailto:admin@company.com?subject=Access Request';
                        }}
                    >
                        Request Access
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
