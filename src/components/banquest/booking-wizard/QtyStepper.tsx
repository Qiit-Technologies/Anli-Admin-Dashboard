'use client';

import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface QtyStepperProps {
    value: number;
    min?: number;
    max?: number;
    onChange: (value: number) => void;
}

export default function QtyStepper({
    value,
    min = 0,
    max,
    onChange,
}: QtyStepperProps) {
    const dec = () => onChange(Math.max(min, value - 1));
    const inc = () =>
        onChange(max !== undefined ? Math.min(max, value + 1) : value + 1);

    return (
        <div className="inline-flex items-center rounded-md border border-gray-200">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={dec}
                disabled={value <= min}
            >
                <Minus className="h-3 w-3" />
            </Button>
            <span className="min-w-[2rem] text-center text-sm font-medium">
                {value}
            </span>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={inc}
                disabled={max !== undefined && value >= max}
            >
                <Plus className="h-3 w-3" />
            </Button>
        </div>
    );
}
