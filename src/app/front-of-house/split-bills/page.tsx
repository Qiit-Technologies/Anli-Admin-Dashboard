'use client';

import {
    getAllBankAccounts,
    type BankAccount,
} from '@/app/actions/bank-accounts';
import {
    addPaymentToSplitBill,
    getSplitBillsByOrder,
} from '@/app/actions/split-bill';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import SplitBillReceipt from '@/components/front-of-house/SplitBillReceipt';
import { PrintButton } from '@/components/PrintButton';
import Toast from '@/components/toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useUser } from '@/context/useUser';
import useHotel from '@/hooks/useHotel';
import type { PrintOrderData } from '@/lib/print';
import { formatBankAccountLabel } from '@/lib/utils';
import { Eye, Receipt, Users } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';

interface SplitBill {
    id: number;
    customerName?: string;
    customerPhone?: string;
    totalAmount?: number;
    totalPrice?: number;
    paidAmount: number;
    remainingAmount: number;
    status: 'PENDING' | 'PAID' | 'CANCELLED';
    paymentMethod?: string;
    createdAt: Date;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
        totalPrice: number;
    }>;
    payments?: Array<{
        amount: number;
        paymentMethod?: string;
        createdAt: Date;
    }>;
}

// Helper to get total amount from split bill (handles both field names)
const getBillTotal = (b: SplitBill) =>
    Number(b.totalAmount ?? b.totalPrice ?? 0);

export default function SplitBillsPage() {
    const [splitBills, setSplitBills] = useState<SplitBill[]>([]);
    const [selectedBill, setSelectedBill] = useState<SplitBill | null>(null);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const params = useSearchParams();
    const orderIdParam = params?.get('orderId');
    const { organization: hotel } = useHotel();
    const { user } = useUser();
    const { data: bankAccounts = [] } = useSWR('/accounts', getAllBankAccounts);
    const remappedBankAccounts = (bankAccounts as Array<BankAccount>).map(
        (account) => ({
            label: formatBankAccountLabel(account),
            value: account.accountNumber?.toString() || '',
        }),
    );

    const formatNgn = (v: number | string | null | undefined) =>
        Number(v || 0).toLocaleString('en-NG', {
            style: 'currency',
            currency: 'NGN',
        });

    const computePaid = (b: SplitBill) => {
        if (b?.paidAmount != null) return Number(b.paidAmount);
        const sum = (b.payments || []).reduce(
            (s, p) => s + Number(p.amount || 0),
            0,
        );
        return sum;
    };

    const computeRemaining = (b: SplitBill) => getBillTotal(b) - computePaid(b);

    const totals = {
        count: splitBills.length,
        total: splitBills.reduce((s, b) => s + getBillTotal(b), 0),
        paid: splitBills.reduce((s, b) => s + computePaid(b), 0),
        remaining: splitBills.reduce((s, b) => s + computeRemaining(b), 0),
    };

    useEffect(() => {
        const fetchData = async () => {
            const orderId = Number(orderIdParam);
            if (!orderId) {
                setLoading(false);
                return;
            }
            try {
                const res = await getSplitBillsByOrder(orderId);
                if (res?.data) {
                    setSplitBills(res.data);
                    setSelectedBill(res.data[0] ?? null);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [orderIdParam]);

    const refreshBills = async () => {
        const orderId = Number(orderIdParam);
        if (!orderId) return;
        const res = await getSplitBillsByOrder(orderId);
        if (res?.data) {
            console.log('Refreshed split bills:', res.data);
            console.log('First bill status:', res.data[0]?.status);
            console.log('First bill paidAmount:', res.data[0]?.paidAmount);
            console.log('First bill totalAmount:', res.data[0]?.totalAmount);
            setSplitBills(res.data);
            if (selectedBill) {
                const updated =
                    res.data.find((b: any) => b.id === selectedBill.id) ||
                    res.data[0] ||
                    null;
                setSelectedBill(updated);
            }
        }
    };

    const buildPrintData = (bill: SplitBill): PrintOrderData => {
        const items = (bill.items || []).map((i: any) => ({
            name: i?.orderItem?.menuItem?.name || i?.name || 'Item',
            quantity: Number(i?.quantity ?? i?.orderItem?.quantity ?? 1),
            price: Number(i?.unitPrice ?? i?.price ?? i?.orderItem?.price ?? 0),
            specialInstructions: i?.orderItem?.notes || '',
        }));
        const total = getBillTotal(bill);
        return {
            hotel: hotel?.name,
            email: hotel?.owner?.email,
            phone: hotel?.owner?.phoneNumber,
            hotelId: hotel?.id?.toString(),
            orderId: `SB-${bill.id}`,
            orderDate: bill.createdAt,
            paymentMethod: bill.paymentMethod,
            items,
            billAmount: total,
            vat: 0,
            totalTax: 0,
            total,
            preparedBy: user?.fullName,
            takenBy: user?.fullName,
        };
    };

    const handleDownloadReceipt = (bill: SplitBill) => {
        // Implement download functionality
        console.log('Downloading receipt for bill:', bill.id);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID':
                return 'bg-green-100 text-green-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <PageWrapper>
                <div>Loading split bills...</div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <PageHeader>
                <div className="flex w-full items-center justify-between">
                    <PageHeadertitle title="Split Bills" />
                    <div className="flex gap-3 text-sm">
                        <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded">
                            <Users className="w-4 h-4" />
                            <span>{totals.count} bills</span>
                        </div>
                        {/* <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded">
                            <span>
                                {totals.total.toLocaleString('en-NG', {
                                    style: 'currency',
                                    currency: 'NGN',
                                })}
                            </span>
                        </div> */}
                    </div>
                </div>
            </PageHeader>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100/40">
                    <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground">
                            Total Paid
                        </div>
                        <div className="text-xl font-semibold">
                            {totals.paid.toLocaleString('en-NG', {
                                style: 'currency',
                                currency: 'NGN',
                            })}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-amber-100/40">
                    <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground">
                            Remaining
                        </div>
                        <div className="text-xl font-semibold">
                            {totals.remaining.toLocaleString('en-NG', {
                                style: 'currency',
                                currency: 'NGN',
                            })}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100/40">
                    <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground">
                            Total Amount
                        </div>
                        <div className="text-xl font-semibold">
                            {totals.total.toLocaleString('en-NG', {
                                style: 'currency',
                                currency: 'NGN',
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                {/* Split Bills List - Independently Scrollable */}
                <div className="lg:col-span-2 h-full">
                    <Card className="h-full flex flex-col">
                        <CardHeader className="flex-shrink-0">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Split Bills
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden">
                            {splitBills.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No split bills found
                                </div>
                            ) : (
                                <div className="h-full overflow-y-auto pr-2 space-y-4">
                                    {splitBills.map((bill) => {
                                        const paid = computePaid(bill);
                                        const total = getBillTotal(bill);
                                        const remaining = Math.max(
                                            0,
                                            total - paid,
                                        );
                                        const pct = Math.min(
                                            100,
                                            Math.round(
                                                (paid / Math.max(1, total)) *
                                                    100,
                                            ),
                                        );
                                        const methods = Array.from(
                                            new Set(
                                                (bill.payments || [])
                                                    .map((p) =>
                                                        (
                                                            p.paymentMethod ||
                                                            ''
                                                        ).trim(),
                                                    )
                                                    .filter(Boolean),
                                            ),
                                        );
                                        const unifiedMethod =
                                            methods.length > 1
                                                ? 'Multiple'
                                                : methods[0] ||
                                                  bill.paymentMethod ||
                                                  '—';
                                        const borderClass =
                                            bill.status === 'PAID'
                                                ? 'border-l-4 border-l-green-500'
                                                : bill.status === 'CANCELLED'
                                                  ? 'border-l-4 border-l-red-500'
                                                  : 'border-l-4 border-l-amber-500';
                                        return (
                                            <Card
                                                key={bill.id}
                                                className={`cursor-pointer hover:shadow-md transition-shadow ${
                                                    selectedBill?.id === bill.id
                                                        ? 'ring-1 ring-orion-blue'
                                                        : ''
                                                } ${borderClass}`}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="font-medium">
                                                                    Bill #
                                                                    {bill.id}
                                                                </span>
                                                                <Badge
                                                                    className={getStatusColor(
                                                                        bill.status,
                                                                    )}
                                                                >
                                                                    {
                                                                        bill.status
                                                                    }
                                                                </Badge>
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                {bill.customerName ||
                                                                    'No customer name'}
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                {new Date(
                                                                    bill.createdAt,
                                                                ).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                        <div className="text-right min-w-[220px]">
                                                            <div className="font-medium">
                                                                {formatNgn(
                                                                    total,
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                Paid:{' '}
                                                                {formatNgn(
                                                                    paid,
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-600">
                                                                Remaining:{' '}
                                                                {formatNgn(
                                                                    remaining,
                                                                )}
                                                            </div>
                                                            <div className="mt-1 text-[10px] uppercase tracking-wide">
                                                                Method:{' '}
                                                                {unifiedMethod}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3">
                                                        <div className="h-1.5 w-full bg-muted rounded">
                                                            <div
                                                                className="h-1.5 rounded bg-orion-blue"
                                                                style={{
                                                                    width: `${pct}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 mt-3">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                setSelectedBill(
                                                                    bill,
                                                                )
                                                            }
                                                        >
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            View
                                                        </Button>
                                                        <PrintButton
                                                            printType="receipt"
                                                            order={buildPrintData(
                                                                bill,
                                                            )}
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Receipt Preview - Independently Scrollable */}
                <div className="lg:col-span-1 h-full">
                    {selectedBill ? (
                        <div className="h-full flex flex-col">
                            <div className="flex items-center justify-between mb-2 flex-shrink-0">
                                <div className="text-sm text-muted-foreground">
                                    Preview: Bill #{selectedBill.id}
                                </div>
                                <PrintButton
                                    printType="receipt"
                                    order={buildPrintData(selectedBill)}
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <SplitBillReceipt
                                    splitBill={selectedBill}
                                    hotelName={hotel?.name || 'Hotel'}
                                    onPrint={() => window.print()}
                                    onDownload={() =>
                                        handleDownloadReceipt(selectedBill)
                                    }
                                />

                                {selectedBill.remainingAmount > 0 &&
                                    selectedBill.status !== 'PAID' && (
                                        <Card className="mt-4">
                                            <CardHeader>
                                                <CardTitle className="text-sm">
                                                    Pay Split Bill
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="text-xs text-muted-foreground">
                                                    Remaining:{' '}
                                                    {Number(
                                                        selectedBill.remainingAmount ||
                                                            0,
                                                    ).toLocaleString('en-NG', {
                                                        style: 'currency',
                                                        currency: 'NGN',
                                                    })}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-xs block mb-1">
                                                            Amount
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            max={Number(
                                                                selectedBill.remainingAmount ||
                                                                    0,
                                                            )}
                                                            className="w-full h-9 border rounded px-2 text-sm"
                                                            value={
                                                                (
                                                                    selectedBill as any
                                                                )._payAmount ??
                                                                ''
                                                            }
                                                            onChange={(e) =>
                                                                setSelectedBill(
                                                                    {
                                                                        ...selectedBill,
                                                                        // store transient UI state on object instance
                                                                        _payAmount:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    } as any,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs block mb-1">
                                                            Payment Method
                                                        </label>
                                                        <Select
                                                            value={
                                                                (
                                                                    selectedBill as any
                                                                )._payMethod ??
                                                                ''
                                                            }
                                                            onValueChange={(
                                                                v,
                                                            ) =>
                                                                setSelectedBill(
                                                                    {
                                                                        ...selectedBill,
                                                                        _payMethod:
                                                                            v,
                                                                    } as any,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger className="h-9">
                                                                <SelectValue placeholder="Select method" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="CASH">
                                                                    Cash
                                                                </SelectItem>
                                                                <SelectItem value="CARD">
                                                                    Card
                                                                </SelectItem>
                                                                <SelectItem value="TRANSFER">
                                                                    Transfer
                                                                </SelectItem>
                                                                <SelectItem value="POS">
                                                                    POS
                                                                </SelectItem>
                                                                <SelectItem value="MOBILE_MONEY">
                                                                    Mobile Money
                                                                </SelectItem>
                                                                <SelectItem value="ROOM_CHARGE">
                                                                    Room Charge
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs block mb-1">
                                                        Receiving Account
                                                    </label>
                                                    <Select
                                                        value={
                                                            (
                                                                selectedBill as any
                                                            )._payAccount ?? ''
                                                        }
                                                        onValueChange={(v) =>
                                                            setSelectedBill({
                                                                ...selectedBill,
                                                                _payAccount: v,
                                                            } as any)
                                                        }
                                                    >
                                                        <SelectTrigger className="h-9">
                                                            <SelectValue placeholder="Account to pay into" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {remappedBankAccounts.map(
                                                                (opt) => (
                                                                    <SelectItem
                                                                        key={
                                                                            opt.value
                                                                        }
                                                                        value={
                                                                            opt.value
                                                                        }
                                                                    >
                                                                        {
                                                                            opt.label
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex justify-end">
                                                    <Button
                                                        className="h-9 bg-orion-blue text-white"
                                                        onClick={async () => {
                                                            const rawAmount =
                                                                (
                                                                    selectedBill as any
                                                                )._payAmount ||
                                                                0;
                                                            const amt =
                                                                Number(
                                                                    rawAmount,
                                                                );
                                                            console.log(
                                                                'Payment amount debug:',
                                                                {
                                                                    rawAmount,
                                                                    amt,
                                                                    type: typeof amt,
                                                                },
                                                            );
                                                            const method =
                                                                (
                                                                    selectedBill as any
                                                                )._payMethod ||
                                                                '';
                                                            const account =
                                                                (
                                                                    selectedBill as any
                                                                )._payAccount ||
                                                                '';
                                                            const remaining =
                                                                Number(
                                                                    selectedBill.remainingAmount ||
                                                                        0,
                                                                );
                                                            if (
                                                                !amt ||
                                                                amt <= 0
                                                            ) {
                                                                toast.custom(
                                                                    () => (
                                                                        <Toast
                                                                            title="Error"
                                                                            description="Enter a valid amount"
                                                                            type="error"
                                                                        />
                                                                    ),
                                                                );
                                                                return;
                                                            }
                                                            if (
                                                                amt > remaining
                                                            ) {
                                                                toast.custom(
                                                                    () => (
                                                                        <Toast
                                                                            title="Error"
                                                                            description="Amount exceeds remaining balance"
                                                                            type="error"
                                                                        />
                                                                    ),
                                                                );
                                                                return;
                                                            }
                                                            if (!method) {
                                                                toast.custom(
                                                                    () => (
                                                                        <Toast
                                                                            title="Error"
                                                                            description="Select a payment method"
                                                                            type="error"
                                                                        />
                                                                    ),
                                                                );
                                                                return;
                                                            }
                                                            try {
                                                                setPaymentLoading(
                                                                    true,
                                                                );
                                                                const res =
                                                                    await addPaymentToSplitBill(
                                                                        selectedBill.id,
                                                                        {
                                                                            amount: amt,
                                                                            paymentMethod:
                                                                                method,
                                                                            receivingAccount:
                                                                                account,
                                                                        },
                                                                    );
                                                                if (res?.data) {
                                                                    console.log(
                                                                        'Payment response:',
                                                                        res.data,
                                                                    );
                                                                    console.log(
                                                                        'Payment response status:',
                                                                        res.data
                                                                            .status,
                                                                    );
                                                                    console.log(
                                                                        'Payment response paidAmount:',
                                                                        res.data
                                                                            .paidAmount,
                                                                    );
                                                                    console.log(
                                                                        'Payment response totalAmount:',
                                                                        res.data
                                                                            .totalAmount,
                                                                    );
                                                                    toast.custom(
                                                                        () => (
                                                                            <Toast
                                                                                title="Success"
                                                                                description="Payment recorded"
                                                                                type="success"
                                                                            />
                                                                        ),
                                                                    );
                                                                    // Update the selected bill immediately with the response data
                                                                    setSelectedBill(
                                                                        res.data,
                                                                    );
                                                                    // Clear payment form
                                                                    setSelectedBill(
                                                                        (
                                                                            prev,
                                                                        ) =>
                                                                            prev
                                                                                ? ({
                                                                                      ...prev,
                                                                                      _payAmount:
                                                                                          '',
                                                                                      _payMethod:
                                                                                          '',
                                                                                      _payAccount:
                                                                                          '',
                                                                                  } as any)
                                                                                : null,
                                                                    );
                                                                    // Wait a moment for backend to update, then refresh all bills
                                                                    setTimeout(
                                                                        async () => {
                                                                            await refreshBills();
                                                                            // Double-check after another moment to ensure data is fresh
                                                                            setTimeout(
                                                                                async () => {
                                                                                    await refreshBills();
                                                                                },
                                                                                1000,
                                                                            );
                                                                        },
                                                                        500,
                                                                    );
                                                                } else {
                                                                    toast.custom(
                                                                        () => (
                                                                            <Toast
                                                                                title="Error"
                                                                                description={
                                                                                    res?.error ||
                                                                                    'Failed to add payment'
                                                                                }
                                                                                type="error"
                                                                            />
                                                                        ),
                                                                    );
                                                                }
                                                            } catch (e) {
                                                                toast.custom(
                                                                    () => (
                                                                        <Toast
                                                                            title="Error"
                                                                            description="Unexpected error"
                                                                            type="error"
                                                                        />
                                                                    ),
                                                                );
                                                            } finally {
                                                                setPaymentLoading(
                                                                    false,
                                                                );
                                                            }
                                                        }}
                                                        disabled={
                                                            paymentLoading
                                                        }
                                                    >
                                                        {paymentLoading
                                                            ? 'Processing...'
                                                            : 'Make Payment'}
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                            </div>
                        </div>
                    ) : (
                        <Card className="h-full flex flex-col">
                            <CardHeader className="flex-shrink-0">
                                <CardTitle className="flex items-center gap-2">
                                    <Receipt className="w-5 h-5" />
                                    Receipt Preview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex items-center justify-center">
                                <div className="text-center py-8 text-gray-500">
                                    Select a split bill to view receipt
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
}
