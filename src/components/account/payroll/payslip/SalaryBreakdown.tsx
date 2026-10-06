import { formatCurrency } from '@/lib/utils';
import type { SalaryItem } from '@/types/payslip';

interface SalaryBreakdownProps {
    title: string;
    items: SalaryItem[];
    className?: string;
}

export function SalaryBreakdown({
    title,
    items,
    className,
}: SalaryBreakdownProps) {
    return (
        <div
            className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
        >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {title}
            </h3>
            <div className="space-y-3">
                {items?.map((item, index) => (
                    <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                    >
                        <span className="text-sm text-gray-600">
                            {item.label}
                        </span>
                        <span
                            className={`text-sm font-medium ${item.isDeduction ? 'text-red-600' : 'text-gray-900'}`}
                        >
                            {item.isDeduction && Number(item.value) > 0
                                ? '-'
                                : ''}
                            {formatCurrency(Math.abs(Number(item.value)))}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
