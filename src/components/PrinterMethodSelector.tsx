'use client';

import Toast from '@/components/toast';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type PrintingMethod = 'auto' | 'qz' | 'ip';

const PRINTING_METHOD_OPTIONS: Array<{
    value: PrintingMethod;
    title: string;
    description: string;
}> = [
    {
        value: 'auto',
        title: 'Auto detect',
        description:
            'Use QZ Tray when available on desktop. Fallback to IP printing automatically on mobile/tablet.',
    },
    {
        value: 'qz',
        title: 'Always use QZ Tray',
        description:
            'Always attempt QZ Tray first on this device for the fastest desktop printing.',
    },
    {
        value: 'ip',
        title: 'Always use Network (IP)',
        description:
            'Bypass QZ Tray and send jobs directly to the configured network printer.',
    },
];

export function PrinterMethodSelector() {
    const [selected, setSelected] = useState<PrintingMethod>('auto');

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const savedMethod = localStorage.getItem(
            'printerMethod',
        ) as PrintingMethod | null;

        if (
            savedMethod === 'auto' ||
            savedMethod === 'qz' ||
            savedMethod === 'ip'
        ) {
            setSelected(savedMethod);
        }
    }, []);

    const handleChange = (value: PrintingMethod) => {
        setSelected(value);

        if (typeof window === 'undefined') return;

        localStorage.setItem('printerMethod', value);

        toast.custom(() => (
            <Toast
                title="Printer preference updated"
                description={`Default printing method set to "${value.toUpperCase()}".`}
                type="success"
            />
        ));
    };

    return (
        <RadioGroup
            value={selected}
            onValueChange={(value) => handleChange(value as PrintingMethod)}
            className="space-y-3"
        >
            {PRINTING_METHOD_OPTIONS.map((option) => (
                <div
                    key={option.value}
                    className="flex items-start gap-3 rounded-md border p-3"
                >
                    <RadioGroupItem
                        value={option.value}
                        id={`printing-method-${option.value}`}
                        className="mt-1"
                    />
                    <div>
                        <Label
                            htmlFor={`printing-method-${option.value}`}
                            className="text-sm font-medium"
                        >
                            {option.title}
                        </Label>
                        <p className="text-xs text-gray-600">
                            {option.description}
                        </p>
                    </div>
                </div>
            ))}
        </RadioGroup>
    );
}
