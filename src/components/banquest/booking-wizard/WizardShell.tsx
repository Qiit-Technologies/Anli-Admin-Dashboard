'use client';

import { cn } from '@/lib/utils';
import React from 'react';
import BanquetBookingStepper from './BanquetBookingStepper';
import WizardFooter from './WizardFooter';

interface WizardShellProps {
    currentStep: number;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    onBack: () => void;
    onPrimary: () => void;
    primaryLabel: string;
    backDisabled?: boolean;
    isLoading?: boolean;
    centerSlot?: React.ReactNode;
    secondaryAction?: { label: string; onClick: () => void };
    onStepClick?: (step: number) => void;
    className?: string;
    headerAction?: React.ReactNode;
}

export default function WizardShell({
    currentStep,
    title,
    subtitle,
    children,
    onBack,
    onPrimary,
    primaryLabel,
    backDisabled,
    isLoading,
    centerSlot,
    secondaryAction,
    onStepClick,
    className,
    headerAction,
}: Readonly<WizardShellProps>) {
    return (
        <div className={cn('flex flex-col gap-8', className)}>
            <BanquetBookingStepper
                currentStep={currentStep}
                onStepClick={onStepClick}
            />
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="flex flex-col w-full">
                        <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">
                            {title}
                        </h2>
                        {subtitle ? (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {subtitle}
                            </p>
                        ) : null}
                        <div className="h-px w-full bg-gray-200 mt-4" />
                    </div>
                    {headerAction}
                </div>
                {children}
                <WizardFooter
                    onBack={onBack}
                    onPrimary={onPrimary}
                    primaryLabel={primaryLabel}
                    backDisabled={backDisabled}
                    isLoading={isLoading}
                    centerSlot={centerSlot}
                    secondaryAction={secondaryAction}
                />
            </div>
        </div>
    );
}
