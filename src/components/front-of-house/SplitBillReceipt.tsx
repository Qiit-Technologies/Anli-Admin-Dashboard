'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Printer } from 'lucide-react';

interface SplitBillReceiptProps {
    splitBill: {
        id: number;
        customerName?: string;
        customerPhone?: string;
        status?: 'PENDING' | 'PAID' | 'CANCELLED';
        items: Array<{
            name?: string;
            quantity: number;
            price: number;
            totalPrice: number;
            orderItem?: {
                menuItem?: {
                    name: string;
                };
            };
        }>;
        totalAmount?: number;
        totalPrice?: number; // Backend returns totalPrice, frontend expects totalAmount
        paidAmount: number;
        remainingAmount: number;
        paymentMethod?: string;
        createdAt: Date;
        payments?: Array<{
            amount: number;
            paymentMethod?: string;
            createdAt: Date;
        }>;
    };
    hotelName?: string;
    onPrint?: () => void;
    onDownload?: () => void;
}

export default function SplitBillReceipt({
    splitBill,
    hotelName = 'Hotel',
    onPrint,
    onDownload,
}: SplitBillReceiptProps) {
    const formatCurrency = (amount?: number | null) => {
        const num = Number(amount ?? 0);
        return num.toLocaleString('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString('en-NG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

   const total = Number(splitBill.totalAmount ?? splitBill.totalPrice ?? 0);
    const paidFromPayments = (splitBill.payments || []).reduce(
        (s, p) => s + Number(p.amount || 0),
        0,
    );
    const effectivePaid =
        splitBill.payments && splitBill.payments.length > 0
            ? paidFromPayments
            : Number(splitBill.paidAmount || 0);
    const effectiveRemaining = Math.max(0, total - effectivePaid);
    const progressPct = Math.min(
        100,
        Math.round((effectivePaid / Math.max(1, total)) * 100),
    );

    const paymentMethods = Array.from(
        new Set(
            (splitBill.payments || [])
                .map((p) => (p.paymentMethod || '').trim())
                .filter(Boolean),
        ),
    );
    const unifiedPaymentMethod =
        paymentMethods.length > 1
            ? 'Multiple'
            : paymentMethods[0] || splitBill.paymentMethod || undefined;

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg font-bold tracking-wide">
                    {hotelName}
                </CardTitle>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Split Bill Receipt
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Bill Info */}
                <div className="border-b pb-3">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium">Bill #:</span>
                        <span>{splitBill.id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="font-medium">Date:</span>
                        <span>{formatDate(splitBill.createdAt)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="font-medium">Status:</span>
                        <span>
                            <Badge
                                className={
                                    splitBill.status === 'PAID'
                                        ? 'bg-green-100 text-green-800'
                                        : splitBill.status === 'CANCELLED'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                }
                            >
                                {splitBill.status || 'PENDING'}
                            </Badge>
                        </span>
                    </div>
                    {splitBill.customerName && (
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">Customer:</span>
                            <span>{splitBill.customerName}</span>
                        </div>
                    )}
                    {splitBill.customerPhone && (
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">Phone:</span>
                            <span>{splitBill.customerPhone}</span>
                        </div>
                    )}
                    {/* Progress */}
                    <div className="mt-2">
                        <div className="h-1.5 w-full bg-muted rounded">
                            <div
                                className="h-1.5 rounded bg-orion-blue"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                    <div className="font-medium text-sm border-b pb-1">
                        Items
                    </div>
                    <div className="divide-y rounded border">
                        {splitBill.items.map((item, index) => (
                            <div
                                key={index}
                                className={`flex justify-between text-sm px-2 py-2 ${
                                    index % 2 === 0 ? 'bg-muted/30' : 'bg-white'
                                }`}
                            >
                                <div className="flex-1">
                                    <div className="font-medium">
                                        {item.orderItem?.menuItem?.name ||
                                            item.name ||
                                            'Item'}
                                    </div>
                                    <div className="text-gray-600">
                                        {item.quantity} ×{' '}
                                        {formatCurrency(item.price)}
                                    </div>
                                </div>
                                <div className="font-medium">
                                    {formatCurrency(item.totalPrice)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totals */}
                <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between font-medium">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Paid:</span>
                        <span className="text-green-600">
                            {formatCurrency(effectivePaid)}
                        </span>
                    </div>
                    {effectiveRemaining > 0 && (
                        <div className="flex justify-between text-sm">
                            <span>Remaining:</span>
                            <span className="text-red-600">
                                {formatCurrency(effectiveRemaining)}
                            </span>
                        </div>
                    )}
                    {unifiedPaymentMethod && (
                        <div className="flex justify-between text-sm">
                            <span>Payment Method:</span>
                            <span className="capitalize">
                                {unifiedPaymentMethod}
                            </span>
                        </div>
                    )}
                    {splitBill.payments && splitBill.payments.length > 0 && (
                        <div className="pt-2">
                            <div className="text-xs font-medium mb-1">
                                Payments
                            </div>
                            <div className="space-y-1 text-xs">
                                {splitBill.payments.map((p, i) => (
                                    <div
                                        key={i}
                                        className="flex justify-between"
                                    >
                                        <span>
                                            {new Date(
                                                p.createdAt,
                                            ).toLocaleString('en-NG', {
                                                month: 'short',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                            {p.paymentMethod
                                                ? ` • ${p.paymentMethod}`
                                                : ''}
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrency(p.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                    <Button
                        onClick={onPrint}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                    </Button>
                    <Button
                        onClick={onDownload}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
