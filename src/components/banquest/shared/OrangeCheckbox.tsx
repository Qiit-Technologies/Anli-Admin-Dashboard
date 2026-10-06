'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { ComponentProps } from 'react';

export default function OrangeCheckbox({
    className,
    ...props
}: ComponentProps<typeof Checkbox>) {
    return (
        <Checkbox
            className={cn(
                'h-4 w-4 rounded border-gray-300 data-[state=checked]:border-hexbrand data-[state=checked]:bg-hexbrand data-[state=checked]:text-white',
                className,
            )}
            {...props}
        />
    );
}
