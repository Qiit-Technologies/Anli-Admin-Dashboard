import {
    ControlSheetReportData,
    ControlSheetOrderRow,
    ControlSheetOrderPaymentRow,
} from '@/types/control-sheet';
import { format } from 'date-fns';

export function buildClientControlSheetReport(
    orders: any[],
    restaurantInfo?: {
        name?: string;
        address?: string;
        phone?: string;
        email?: string;
        logo?: string;
    },
): ControlSheetReportData {
    const sortedOrders = [...orders].sort(
        (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
    );

    const orderRows: ControlSheetOrderRow[] = [];

    let complimentaryOrdersCount = 0;
    let grandTotalSales = 0;
    let complimentaryTotal = 0;
    let cashTotal = 0;
    let transferTotal = 0;
    let cardTotal = 0;
    let posTotal = 0;
    let walletTotal = 0;
    let mobileMoneyTotal = 0;
    const otherPaymentTotals: Record<string, number> = {};
    const receivingAccountTotals: Record<string, number> = {};

    for (const order of sortedOrders) {
        const orderAmount = Number(order.totalPrice || order.amount || 0);
        const isComplimented = Boolean(
            order.isComplimented ||
                order.complimentaryStatus === 'FULL' ||
                order.complimentaryStatus === 'PARTIAL',
        );
        const complimentaryAmount = Number(
            order.complimentaryAmount || (isComplimented ? orderAmount : 0),
        );

        if (isComplimented) {
            complimentaryOrdersCount++;
            complimentaryTotal += complimentaryAmount;
        }
        grandTotalSales += orderAmount;

        let cash = 0;
        let transfer = 0;
        let card = 0;
        let pos = 0;
        let wallet = 0;
        let mobileMoney = 0;
        const otherPaymentMethods: Record<string, number> = {};
        const receivingAccounts: Record<string, number> = {};
        const paymentsList: ControlSheetOrderPaymentRow[] = [];

        const rawPayments =
            Array.isArray(order.payments) && order.payments.length > 0
                ? order.payments
                : order.paymentMethod
                  ? [
                        {
                            paymentMethod: order.paymentMethod,
                            amount: orderAmount,
                            receivingAccount: order.receivingAccount,
                        },
                    ]
                  : [];

        for (const p of rawPayments) {
            const method = (p.paymentMethod || '')
                .toString()
                .trim()
                .toUpperCase();
            const amt = Number(p.amount || 0);
            const acc = (
                p.receivingAccount ||
                order.receivingAccount ||
                ''
            )
                .toString()
                .trim();

            paymentsList.push({
                paymentMethod: method || 'UNKNOWN',
                amount: amt,
                receivingAccount: acc || undefined,
                transactionReference: p.transactionReference || undefined,
            });

            if (acc) {
                receivingAccounts[acc] = (receivingAccounts[acc] || 0) + amt;
                receivingAccountTotals[acc] =
                    (receivingAccountTotals[acc] || 0) + amt;
            }

            if (method === 'CASH') {
                cash += amt;
                cashTotal += amt;
            } else if (method === 'TRANSFER') {
                transfer += amt;
                transferTotal += amt;
            } else if (method === 'CARD') {
                card += amt;
                cardTotal += amt;
            } else if (method === 'POS') {
                pos += amt;
                posTotal += amt;
            } else if (method === 'WALLET') {
                wallet += amt;
                walletTotal += amt;
            } else if (method === 'MOBILE_MONEY' || method === 'MOMO') {
                mobileMoney += amt;
                mobileMoneyTotal += amt;
            } else if (method) {
                otherPaymentMethods[method] =
                    (otherPaymentMethods[method] || 0) + amt;
                otherPaymentTotals[method] =
                    (otherPaymentTotals[method] || 0) + amt;
            }
        }

        // Table / Room label
        let tableRoom = '—';
        if (order.table?.name) {
            tableRoom = order.table.name;
        } else if (order.room?.number || order.room?.name) {
            tableRoom = `Room ${order.room.number || order.room.name}`;
        } else if (order.dineInArea?.name) {
            tableRoom = order.dineInArea.name;
        }

        // Date time formatting
        let orderDateTime = '—';
        if (order.createdAt) {
            try {
                orderDateTime = format(
                    new Date(order.createdAt),
                    'yyyy-MM-dd HH:mm',
                );
            } catch {
                orderDateTime = String(order.createdAt);
            }
        }

        // Created by formatting
        let createdBy = '—';
        if (order.createdBy) {
            const name =
                `${order.createdBy.firstName || ''} ${order.createdBy.lastName || ''}`.trim();
            if (name) createdBy = name;
        } else if (order.waiter) {
            const name =
                `${order.waiter.firstName || ''} ${order.waiter.lastName || ''}`.trim();
            if (name) createdBy = name;
        }

        orderRows.push({
            orderId: order.id,
            orderRequestId: order.requestId || String(order.id),
            orderDateTime,
            tableRoom,
            orderType: order.orderType || '—',
            guestName: order.guestName || '—',
            createdBy,
            orderStatus: order.status || '—',
            orderAmount,
            complimentary: isComplimented,
            complimentaryAmount,
            paymentStatus: order.paymentStatus || '—',
            cash,
            transfer,
            card,
            pos,
            wallet,
            mobileMoney,
            otherPaymentMethods,
            receivingAccounts,
            payments: paymentsList,
        });
    }

    const otherTotalSum = Object.values(otherPaymentTotals).reduce(
        (a, b) => a + b,
        0,
    );
    const totalRevenue =
        cashTotal +
        transferTotal +
        cardTotal +
        posTotal +
        walletTotal +
        mobileMoneyTotal +
        otherTotalSum;

    return {
        businessName: restaurantInfo?.name || 'Restaurant',
        businessAddress: restaurantInfo?.address,
        businessPhone: restaurantInfo?.phone,
        businessEmail: restaurantInfo?.email,
        restaurantName: restaurantInfo?.name || 'Restaurant',
        restaurantLogo: restaurantInfo?.logo,
        reportTitle: 'Order History Control Sheet',
        businessDate: format(new Date(), 'MMM d, yyyy'),
        generatedAt: new Date().toISOString(),
        generatedBy: 'System',
        hotelId: 0,
        workPeriod: null,
        orders: orderRows,
        summary: {
            totalOrders: orderRows.length,
            complimentaryOrders: complimentaryOrdersCount,
            grandTotalSales,
            complimentaryTotal,
            cashTotal,
            transferTotal,
            cardTotal,
            posTotal,
            walletTotal,
            mobileMoneyTotal,
            otherPaymentTotals,
            receivingAccountTotals,
            totalRevenue,
        },
    };
}
