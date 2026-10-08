'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

interface ReviewField {
    label: string;
    value: string;
}

interface ReviewSectionCardProps {
    title: string;
    fields: ReviewField[];
    onEdit?: () => void;
    children?: ReactNode;
}

export default function ReviewSectionCard({
    title,
    fields,
    onEdit,
    children,
}: ReviewSectionCardProps) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{title}</h3>
                {onEdit ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-orion-blue hover:text-orion-blue"
                        onClick={onEdit}
                    >
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Edit
                    </Button>
                ) : null}
            </div>
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {fields.map((f) => (
                    <div key={f.label}>
                        <dt className="text-xs text-muted-foreground">
                            {f.label}
                        </dt>
                        <dd className="text-sm font-medium text-gray-900">
                            {f.value || '—'}
                        </dd>
                    </div>
                ))}
            </dl>
            {children}
        </div>
    );
}
