'use client';

import {
    formatModalAmount,
    getCloseAccountVariant,
    type CloseAccountVariant,
} from '@/lib/internal-accounts/close-account';
import { cn } from '@/lib/utils';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogOverlay, DialogPortal } from '@/components/ui/dialog';

interface CloseAccountModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    balance: number;
    onCloseAccount?: () => void;
    onViewStatement?: () => void;
    onProceedToRefund?: () => void;
}

interface VariantConfig {
    headerBg: string;
    blobClass: string;
    iconBg: string;
    icon: typeof Check;
    title: string;
    description: string;
    primaryLabel: string;
}

function ModalStatusIcon({
    icon: Icon,
    iconBg,
    blobClass,
}: Readonly<{
    icon: typeof Check;
    iconBg: string;
    blobClass: string;
}>) {
    return (
        <div className="relative mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center">
            <div
                className={cn(
                    'absolute size-[68px] -rotate-6 rounded-[42%]',
                    blobClass,
                )}
            />
            <div
                className={cn(
                    'relative z-10 flex size-12 items-center justify-center rounded-full shadow-sm',
                    iconBg,
                )}
            >
                <Icon className="size-[22px] text-white" strokeWidth={2.5} />
            </div>
        </div>
    );
}

function getVariantConfig(
    variant: CloseAccountVariant,
    balance: number,
): VariantConfig {
    switch (variant) {
        case 'zero':
            return {
                headerBg: 'bg-[#F0FAF7]',
                blobClass: 'bg-emerald-200/80',
                iconBg: 'bg-emerald-500',
                icon: Check,
                title: 'Close Internal Account?',
                description:
                    'This account has a zero balance and can be closed safely. Once closed, it will no longer be available for new postings.',
                primaryLabel: 'Close Account',
            };
        case 'negative':
            return {
                headerBg: 'bg-[#FFF5F5]',
                blobClass: 'bg-red-200/70',
                iconBg: 'bg-red-500',
                icon: X,
                title: 'Cannot Close Account',
                description: `This account currently owes the business ${formatModalAmount(balance)}. Please settle the outstanding balance before closing the account.`,
                primaryLabel: 'View Statement',
            };
        case 'positive':
            return {
                headerBg: 'bg-[#FFF9F0]',
                blobClass: 'bg-amber-200/70',
                iconBg: 'bg-[#B08000]',
                icon: X,
                title: 'Refund Required',
                description: `This account still has a balance of ${formatModalAmount(balance)}. Please refund or clear this balance before closing the account.`,
                primaryLabel: 'Proceed to Refund',
            };
    }
}

export default function CloseAccountModal({
    open,
    onOpenChange,
    balance,
    onCloseAccount,
    onViewStatement,
    onProceedToRefund,
}: Readonly<CloseAccountModalProps>) {
    const variant = getCloseAccountVariant(balance);
    const config = getVariantConfig(variant, balance);

    const handlePrimary = () => {
        switch (variant) {
            case 'zero':
                onCloseAccount?.();
                break;
            case 'negative':
                onViewStatement?.();
                break;
            case 'positive':
                onProceedToRefund?.();
                break;
        }
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogPortal>
                <DialogOverlay className="fixed inset-0 z-50 bg-[#4a4a4a]/75 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <DialogPrimitive.Content
                    className={cn(
                        'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[20px] border-0 bg-white shadow-xl duration-200',
                        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                    )}
                >
                    <div
                        className={cn(
                            'px-6 pb-5 pt-9 text-center',
                            config.headerBg,
                        )}
                    >
                        <ModalStatusIcon
                            icon={config.icon}
                            iconBg={config.iconBg}
                            blobClass={config.blobClass}
                        />
                        <DialogPrimitive.Title className="text-lg font-bold leading-snug text-[#4A2B1D]">
                            {config.title}
                        </DialogPrimitive.Title>
                    </div>

                    <div className="px-8 pb-8 pt-6">
                        <DialogPrimitive.Description className="mx-auto max-w-[320px] text-center text-sm leading-relaxed text-[#6B7280]">
                            {config.description}
                        </DialogPrimitive.Description>

                        <div className="mt-7 space-y-3">
                            <Button
                                type="button"
                                className="h-12 w-full rounded-[10px] bg-orion-blue text-sm font-semibold text-white hover:bg-orion-blue/90"
                                onClick={handlePrimary}
                            >
                                {config.primaryLabel}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-12 w-full rounded-[10px] border-orion-blue bg-white text-sm font-semibold text-[#304050] hover:bg-slate-50"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogPrimitive.Content>
            </DialogPortal>
        </Dialog>
    );
}
