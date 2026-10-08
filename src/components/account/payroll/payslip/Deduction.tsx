import { formatCurrency } from '@/lib/utils';
import type { Deduction } from '@/types/payslip';

interface DeductionsProps {
    deductions: Deduction[];
}

export function Deductions({ deductions }: DeductionsProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Deductions
            </h3>
            <div className="space-y-3">
                {deductions?.map((deduction, index) => (
                    <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                                {deduction.description}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                                {formatCurrency(deduction.value)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
