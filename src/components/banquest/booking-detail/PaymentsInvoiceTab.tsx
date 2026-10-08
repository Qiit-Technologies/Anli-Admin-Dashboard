'use client';

import {
    amenityLineItems,
    BookingDetailModel,
    menuLineItems,
    PaymentPlanOption,
} from '@/components/banquest/booking-detail/booking-detail-model';
import {
    CostFooter,
    DetailCard,
    LineItemsList,
} from '@/components/banquest/booking-detail/DetailCard';
import CostBreakdown from '@/components/banquest/shared/CostBreakdown';
import PaymentPlanSelector from '@/components/banquest/shared/PaymentPlanSelector';
import { formatMoney } from '@/components/banquest/utils/banquet-pricing';
const PAYMENT_PLANS: {
    id: PaymentPlanOption;
    label: string;
    detail: string;
}[] = [
    {
        id: 'full',
        label: 'Full Payment',
        detail: 'Pay the full amount now',
    },
    {
        id: 'partial',
        label: 'Part payment',
        detail: 'Pay Part Payment now',
    },
    { id: 'later', label: 'Pay later', detail: 'No Payment now' },
];

function PaymentInstructionCard() {
    const rows = [
        { label: 'Bank Name', value: 'First Bank' },
        { label: 'Account Name', value: 'Anli Group' },
        { label: 'Account Number', value: '0981876534' },
        { label: 'Payment Reference', value: 'Ref-inv-090' },
    ];

    return (
        <DetailCard title="Payment Instruction">
            <p className="mb-4 text-sm text-muted-foreground">
                Payment was made to the following account details
            </p>
            <div className="space-y-3 text-sm">
                {rows.map((row) => (
                    <div
                        key={row.label}
                        className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                    >
                        <span className="text-muted-foreground">
                            {row.label}
                        </span>
                        <span className="font-semibold text-gray-900 shrink-0">
                            {row.value}
                        </span>
                    </div>
                ))}
            </div>
        </DetailCard>
    );
}

function PaymentSummaryCard({ model }: { model: BookingDetailModel }) {
    return (
        <DetailCard title="Payment Summary">
            <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="font-semibold shrink-0">
                        {formatMoney(model.totalAmount)}
                    </span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-semibold text-emerald-600 shrink-0">
                        {formatMoney(model.amountPaid)}
                    </span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                        Outstanding Balance
                    </span>
                    <span className="font-semibold text-red-600 shrink-0">
                        {formatMoney(model.outstandingBalance)}
                    </span>
                </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                <span className="text-sm text-orange-700">Payment Status</span>
                <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                    {model.paymentStatus}
                </span>
            </div>
        </DetailCard>
    );
}

function CostSummaryCard({ model }: { model: BookingDetailModel }) {
    const { pricing } = model;
    return (
        <DetailCard title="Cost Summary">
            <div className="mb-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                        Food &amp; Beverages
                    </span>
                    <span className="font-medium shrink-0">
                        {formatMoney(pricing.foodSubtotal)}
                    </span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                        Amenities &amp; Rentals
                    </span>
                    <span className="font-medium shrink-0">
                        {formatMoney(pricing.amenitiesSubtotal)}
                    </span>
                </div>
            </div>
            <CostBreakdown
                subtotal={pricing.subtotal}
                serviceCharge={pricing.serviceCharge}
                vat={pricing.vat}
                total={model.totalAmount}
                discount={pricing.discount}
            />
        </DetailCard>
    );
}

function PaymentHistoryCard({ model }: { model: BookingDetailModel }) {
    const rows =
        model.amountPaid > 0
            ? [
                  {
                      date: model.eventDateLabel,
                      method: 'Bank Transfer',
                      reference: String(model.booking.id).padStart(9, '0'),
                      amount: formatMoney(model.amountPaid),
                  },
              ]
            : [];

    return (
        <DetailCard title="Payment History">
            <div className="overflow-x-auto -mx-4 px-4">
                <table className="w-full min-w-[320px] text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 text-left text-muted-foreground">
                            <th className="pb-2 font-medium">Date</th>
                            <th className="pb-2 font-medium">
                                Payment Method
                            </th>
                            <th className="pb-2 font-medium">References</th>
                            <th className="pb-2 font-medium text-right">
                                Amount
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="py-6 text-center text-muted-foreground"
                                >
                                    No payments recorded yet.
                                </td>
                            </tr>
                        ) : (
                            rows.map((row) => (
                                <tr
                                    key={row.reference}
                                    className="border-b border-gray-50"
                                >
                                    <td className="py-3 capitalize">
                                        {row.date}
                                    </td>
                                    <td className="py-3">{row.method}</td>
                                    <td className="py-3">{row.reference}</td>
                                    <td className="py-3 text-right font-medium text-emerald-600">
                                        {row.amount}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {rows.length > 0 ? (
                <div className="mt-4 flex justify-between gap-4 rounded-lg bg-emerald-50 px-4 py-3">
                    <span className="text-sm font-semibold text-emerald-800">
                        Total Payment
                    </span>
                    <span className="text-sm font-bold text-emerald-800 shrink-0">
                        {formatMoney(model.amountPaid)}
                    </span>
                </div>
            ) : null}
        </DetailCard>
    );
}

function PaymentDiscountsCard({ model }: { model: BookingDetailModel }) {
    const { pricing } = model;
    const grandTotal = model.totalAmount;

    return (
        <DetailCard title="Payment Discounts">
            <CostBreakdown
                subtotal={pricing.subtotal}
                serviceCharge={pricing.serviceCharge}
                vat={pricing.vat}
                total={grandTotal}
                discount={pricing.discount}
            />
            <div className="mt-4 flex justify-between gap-4 rounded-lg bg-emerald-50 px-4 py-3">
                <span className="text-sm font-semibold text-emerald-800">
                    Grand Total Payment
                </span>
                <span className="text-sm font-bold text-emerald-800 shrink-0">
                    {formatMoney(grandTotal)}
                </span>
            </div>
            <div className="mt-3 flex justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-semibold text-emerald-600 shrink-0">
                    {formatMoney(model.amountPaid)}
                </span>
            </div>
            <div className="mt-3 flex justify-between gap-4 rounded-lg bg-red-50 px-4 py-3">
                <span className="text-sm font-semibold text-red-700">
                    Outstanding Balance
                </span>
                <span className="text-sm font-bold text-red-700 shrink-0">
                    {formatMoney(model.outstandingBalance)}
                </span>
            </div>
        </DetailCard>
    );
}

export default function PaymentsInvoiceTab({
    model,
    editBase,
}: {
    model: BookingDetailModel;
    editBase: string;
}) {
    const menuLines = menuLineItems(model.booking);
    const amenityLines = amenityLineItems(model.booking);
    const foodPricing = model.pricing.foodSubtotal;
    const amenityPricing = model.pricing.amenitiesSubtotal;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
                <div className="flex flex-col gap-4">
                    <DetailCard title="Selected Payment Plan">
                        <PaymentPlanSelector
                            plans={PAYMENT_PLANS}
                            selectedId={model.paymentPlan}
                            amount={model.totalAmount}
                            readOnly
                        />
                    </DetailCard>
                    <PaymentInstructionCard />
                    <PaymentSummaryCard model={model} />
                </div>
                <div className="flex flex-col gap-4">
                    <CostSummaryCard model={model} />
                    <PaymentHistoryCard model={model} />
                    <PaymentDiscountsCard model={model} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <DetailCard
                    title="Menu summary"
                    editHref={`${editBase}?step=3`}
                >
                    <LineItemsList items={menuLines} />
                    <CostFooter
                        subtotalLabel="SubTotal(Food)"
                        subtotal={formatMoney(foodPricing)}
                        serviceCharge={formatMoney((foodPricing * 5) / 100)}
                        vat={formatMoney(
                            ((foodPricing + (foodPricing * 5) / 100) * 7.5) /
                                100,
                        )}
                        total={formatMoney(
                            foodPricing +
                                (foodPricing * 5) / 100 +
                                ((foodPricing + (foodPricing * 5) / 100) *
                                    7.5) /
                                    100,
                        )}
                    />
                </DetailCard>
                <DetailCard
                    title="Amenities and Rentals"
                    editHref={`${editBase}?step=4`}
                >
                    <LineItemsList items={amenityLines} />
                    <CostFooter
                        subtotalLabel="SubTotal"
                        subtotal={formatMoney(amenityPricing)}
                        serviceCharge={formatMoney(
                            (amenityPricing * 5) / 100,
                        )}
                        vat={formatMoney(
                            ((amenityPricing + (amenityPricing * 5) / 100) *
                                7.5) /
                                100,
                        )}
                        total={formatMoney(
                            amenityPricing +
                                (amenityPricing * 5) / 100 +
                                ((amenityPricing + (amenityPricing * 5) / 100) *
                                    7.5) /
                                    100,
                        )}
                    />
                </DetailCard>
            </div>
        </div>
    );
}
