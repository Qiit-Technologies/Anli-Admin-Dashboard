import { formatCurrency } from '@/lib/utils';
import type { TaxContribution } from '@/types/payslip';

interface TaxesContributionsProps {
    contributions: TaxContribution[];
}

export function TaxesContributions({ contributions }: TaxesContributionsProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Taxes & Contributions
            </h3>
            <div className="space-y-4">
                {contributions?.map((contribution, index) => (
                    <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">
                                    {contribution.label}
                                </span>
                                <span className="text-xs text-gray-500">
                                    - {contribution.value}
                                </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                                {formatCurrency(contribution.value)}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500">
                            {contribution.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
