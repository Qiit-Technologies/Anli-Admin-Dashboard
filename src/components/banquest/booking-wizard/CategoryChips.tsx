'use client';

import { cn } from '@/lib/utils';

interface CategoryChipsProps {
    options: readonly string[];
    value: string;
    onChange: (value: string) => void;
    otherValue?: string;
    onOtherChange?: (value: string) => void;
    onOtherCommit?: () => void;
}

export default function CategoryChips({
    options,
    value,
    onChange,
    otherValue = '',
    onOtherChange,
    onOtherCommit,
}: Readonly<CategoryChipsProps>) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => onChange(option)}
                        className={cn(
                            'rounded-full border px-4 py-1.5 text-sm font-medium transition',
                            value === option
                                ? 'border-hexbrand bg-hexbrand text-white'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-hexbrand/50',
                        )}
                    >
                        {option}
                    </button>
                ))}
            </div>
            {value === 'Others' && onOtherChange ? (
                <input
                    type="text"
                    placeholder="Specify category"
                    value={otherValue}
                    onChange={(e) => onOtherChange(e.target.value)}
                    onBlur={() => onOtherCommit?.()}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            onOtherCommit?.();
                        }
                    }}
                    className="h-9 max-w-xs rounded-md border border-gray-200 px-3 text-sm"
                />
            ) : null}
        </div>
    );
}
