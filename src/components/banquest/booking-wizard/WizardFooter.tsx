'use client';

import type { ReactNode } from 'react';
import BrandButton from '@/components/common/Button';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';

interface WizardFooterProps {
    onBack: () => void;
    onPrimary: () => void;
    primaryLabel: string;
    backDisabled?: boolean;
    isLoading?: boolean;
    centerSlot?: ReactNode;
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
}

export default function WizardFooter({
    onBack,
    onPrimary,
    primaryLabel,
    backDisabled,
    isLoading,
    centerSlot,
    secondaryAction,
}: WizardFooterProps) {
    return (
        <div className="flex flex-col gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                disabled={backDisabled || isLoading}
                onClick={onBack}
            >
                Back
            </Button>
            <div className="flex flex-1 flex-col items-center justify-center gap-2 sm:flex-row">
                {centerSlot}
                {secondaryAction ? (
                    <button
                        type="button"
                        className="text-sm font-medium text-orion-blue hover:underline"
                        onClick={secondaryAction.onClick}
                        disabled={isLoading}
                    >
                        {secondaryAction.label}
                    </button>
                ) : null}
            </div>
            <BrandButton
                type="button"
                className="w-full sm:w-auto min-w-[160px]"
                onClick={onPrimary}
                disabled={isLoading}
            >
                {isLoading ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                    primaryLabel
                )}
            </BrandButton>
        </div>
    );
}
