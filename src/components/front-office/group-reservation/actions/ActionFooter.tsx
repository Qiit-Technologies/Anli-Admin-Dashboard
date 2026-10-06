'use client';

import BrandButton from '@/components/common/Button';
import type { ReactNode } from 'react';

export function ActionFooter({
    onCancel,
    cancelLabel = 'Cancel',
    confirm,
}: {
    onCancel: () => void;
    cancelLabel?: string;
    confirm?: {
        label: string;
        onClick: () => void;
        disabled?: boolean;
        loading?: boolean;
        icon?: ReactNode;
    };
}) {
    return (
        <div className="mt-6 flex items-center justify-end gap-4">
            <button
                type="button"
                onClick={onCancel}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
                {cancelLabel}
            </button>
            {confirm ? (
                <BrandButton
                    icon={confirm.icon}
                    className="h-10 rounded-lg text-sm font-semibold shadow-none"
                    disabled={confirm.disabled}
                    loading={confirm.loading}
                    onClick={confirm.onClick}
                >
                    {confirm.label}
                </BrandButton>
            ) : null}
        </div>
    );
}
