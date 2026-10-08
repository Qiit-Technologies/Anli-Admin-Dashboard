import { formatCurrency } from '@/lib/utils';

interface SummaryCardsProps {
    totalEarnings: number;
    totalDeductions: number;
    finalPayout: number;
}

export function SummaryCards({
    totalEarnings,
    totalDeductions,
    finalPayout,
}: SummaryCardsProps) {
    return (
        <div className="space-y-4">
            {/* Earnings and Deductions Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Total Earnings (Gross)
                    </h3>
                    <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(totalEarnings)}
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Total Deductions
                    </h3>
                    <p className="text-2xl font-bold text-red-600">
                        - {formatCurrency(totalDeductions)}
                    </p>
                </div>
            </div>

            {/* Final Payout */}
            <div className="bg-[#AA4A00] text-white rounded-3xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                        <h3 className="text-sm text-orange-100 mb-1">
                            Salary Payout =
                        </h3>
                        <p className="text-lg font-medium">
                            Total Earnings (Gross)-Total Deductions
                        </p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-sm text-orange-100 mb-1">
                            Salary Payout for May
                        </h3>
                        <p className="text-3xl font-bold">
                            {formatCurrency(finalPayout)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
