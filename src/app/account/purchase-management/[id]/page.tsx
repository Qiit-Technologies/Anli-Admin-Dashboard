'use client';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import PageWrapper from '@/components/common/PageWrapper';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import SearchInput from '@/components/house-keeping/common/SearchInput';
import { NotificationsPopover } from '@/components/house-keeping/common/Notification';
import { useUser } from '@/context/useUser';
import {
    CreditCard,
    Printer,
    FileText,
    CheckCircle2,
    AlertCircle,
    Package,
    CreditCard as PaymentIcon,
    ChevronLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Toast from '@/components/toast';
import InvoicePrintModal from '@/components/invoice/InvoicePrintModal';
import PaymentModal from '@/components/account/PaymentModal';
import {
    getGoodsReceiptNotesByPurchaseOrder,
    getPurchaseOrder,
} from '@/app/actions/stock';
import { getInvoices, getPurchaseOrderActivities } from '@/app/actions/invoice';
import ActivityTimeline from '@/components/account/ActivityTimeline';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'nextjs-toploader/app';

const PurchaseOrderDetailPage = () => {
    const { id } = useParams();
    const { user } = useUser();
    const router = useRouter();
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const {
        data: purchaseOrder,
        isLoading,
        error,
        mutate: mutatePurchaseOrder,
    } = useSWR(id ? ['/accounts/purchase-orders/account', id] : null, () =>
        getPurchaseOrder(id as string),
    );

    const { data: grns } = useSWR(
        id ? ['/accounts/goods-receipt/purchase-order', id] : null,
        () => getGoodsReceiptNotesByPurchaseOrder(id as any),
    );

    // Fetch invoice data if GRN exists
    const { data: invoiceData } = useSWR(
        grns?.data?.length > 0 ? ['/accounts/invoices', 'all'] : null,
        async () => {
            // Check for invoices from any GRN associated with this purchase order
            const allInvoices = await Promise.all(
                (grns?.data || []).map(async (grn: any) => {
                    try {
                        const response = await getInvoices(grn.id.toString());
                        return response.data || [];
                    } catch (error: any) {
                        console.error(
                            `Error fetching invoices for GRN ${grn.id}:`,
                            error,
                        );
                        return [];
                    }
                }),
            );
            // Flatten the results and return the first invoice found
            const flatInvoices = allInvoices.flat();
            return { data: flatInvoices };
        },
    );

    // Fetch purchase order activities
    const { data: activitiesData } = useSWR(
        id ? ['/accounts/purchase-orders/activities', id] : null,
        () => getPurchaseOrderActivities(Number(id)),
    );

    const invoice = invoiceData?.data?.[0];
    console.log('invoice', invoice);

    const handlePayment = () => {
        if (!invoice) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="No invoice found for this purchase order"
                    type="error"
                />
            ));
            return;
        }
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = () => {
        mutatePurchaseOrder();
    };

    const printInvoice = () => {
        if (invoice) {
            setShowInvoiceModal(true);
        } else {
            toast.custom(() => (
                <Toast
                    title="Info!"
                    description="No invoice available to print"
                    type="info"
                />
            ));
        }
    };

    if (isLoading)
        return (
            <PageWrapper>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
                        <p className="text-gray-600">
                            Loading purchase order details...
                        </p>
                    </div>
                </div>
            </PageWrapper>
        );

    if (error)
        return (
            <PageWrapper>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Failed to load purchase order
                        </h3>
                        <p className="text-gray-600">
                            Please try refreshing the page or contact support.
                        </p>
                    </div>
                </div>
            </PageWrapper>
        );

    if (!purchaseOrder)
        return (
            <PageWrapper>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No purchase order found
                        </h3>
                        <p className="text-gray-600">
                            The purchase order you&apos;re looking for
                            doesn&apos;t exist.
                        </p>
                    </div>
                </div>
            </PageWrapper>
        );

    // Transform items for invoice template - use GRN items instead of PO items
    const invoiceItems = (() => {
        // If GRN exists, use GRN items
        if (grns?.data && grns.data.length > 0) {
            return (
                grns.data[0].items?.map((grnItem: any) => {
                    const poItem = grnItem?.purchaseOrderItem;
                    const item = poItem?.item;
                    const unitPrice = item?.price; // Use actual item price
                    const totalPrice = unitPrice * grnItem.quantityReceived;

                    return {
                        item: item?.name || 'Unknown Item',
                        description: item?.description || 'Product or service',
                        quantity: grnItem.quantityReceived, // Use received quantity, not ordered
                        rate: unitPrice,
                        amount: totalPrice,
                        unitOfMeasurement: poItem.unitOfMeasurement || 'pcs',
                        remarks: grnItem.remarks || '',
                    };
                }) || []
            );
        }

        // Fallback to purchase order items if no GRN
        return (
            purchaseOrder.items?.map((item: any) => ({
                item: item.item?.name || item.item,
                description: item.item?.description || 'Product or service',
                quantity: item.quantity,
                rate: item.item?.price || item.amount / item.quantity, // Use item price if available, fallback to calculated
                amount: item.item?.price
                    ? item.item.price * item.quantity
                    : item.amount, // Use item price if available
                unitOfMeasurement: item.unitOfMeasurement || 'pcs',
            })) || []
        );
    })();

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'completed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <PageWrapper>
            <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => router.back()}
            >
                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-slate-100 border border-gray-400 ">
                    <ChevronLeft color="#000" />
                </div>
                <h1 className="text-2xl font-semibold text-gray-500">Back</h1>
            </div>
            <PageHeader>
                <PageHeadertitle
                    title={`Purchase Order ${purchaseOrder.poNumber}`}
                    subtitle={`Welcome back, ${user?.fullName}`}
                />
                <div className="ml-auto flex items-center">
                    <SearchInput />
                    <NotificationsPopover />
                </div>
            </PageHeader>

            <div className="space-y-8">
                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 text-gray-900">
                                Purchase Order
                            </h1>
                            <p className="text-blue-600 text-lg font-medium">
                                #{purchaseOrder.poNumber}
                            </p>
                        </div>
                        <div className="text-right">
                            <div
                                className={`inline-flex items-center px-4 py-2 rounded-full border-2 ${getStatusColor(purchaseOrder.status)}`}
                            >
                                <span className="capitalize font-semibold">
                                    {purchaseOrder.status?.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center space-x-3">
                            <div>
                                <p className="text-gray-600 text-sm">Vendor</p>
                                <p className="font-semibold text-gray-900">
                                    {purchaseOrder.vendor?.vendorName || 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div>
                                <p className="text-gray-600 text-sm">
                                    Sent to Account
                                </p>
                                <p className="font-semibold text-gray-900">
                                    {purchaseOrder.sentToAccountAt
                                        ? new Date(
                                              purchaseOrder.sentToAccountAt,
                                          ).toLocaleDateString()
                                        : 'Recently'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div>
                                <p className="text-gray-600 text-sm">
                                    Total Amount
                                </p>
                                <p className="font-semibold text-xl text-blue-600">
                                    {formatCurrency(purchaseOrder.total)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Timeline */}
                <div className="bg-white rounded-lg border p-6">
                    <ActivityTimeline activities={activitiesData?.data || []} />
                </div>

                {/* Invoice Information */}
                {invoice && (
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-brand" />
                                Invoice Information
                            </h2>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="flex items-center space-x-3">
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Invoice Number
                                        </p>
                                        <p className="font-semibold text-gray-900">
                                            {invoice.invoiceNumber}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Status
                                        </p>
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}
                                        >
                                            {invoice.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Total Amount
                                        </p>
                                        <p className="font-semibold text-lg text-brand">
                                            ₦
                                            {invoice.totalAmount?.toLocaleString?.() ??
                                                invoice.totalAmount}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Created
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {invoice.createdAt
                                                ? new Date(
                                                      invoice.createdAt,
                                                  ).toLocaleString()
                                                : '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Section */}
                            {invoice.status !== 'paid' &&
                            purchaseOrder.status !== 'completed' ? (
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <PaymentIcon className="w-5 h-5 mr-2 text-brand" />
                                        Payment Processing
                                    </h3>
                                    <div className="flex flex-wrap gap-4">
                                        <Button
                                            onClick={handlePayment}
                                            className="bg-orion-blue text-white shadow-md hover:bg-orion-blue transition-all duration-200 px-6 py-3"
                                        >
                                            <CreditCard className="w-4 h-4 mr-2" />
                                            Process Payment
                                        </Button>
                                        <Button
                                            onClick={printInvoice}
                                            variant="outline"
                                            className="border-gray-300 hover:bg-gray-50 transition-all duration-200 px-6 py-3"
                                        >
                                            <Printer className="w-4 h-4 mr-2" />
                                            Print Invoice
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                                        <h3 className="text-lg font-semibold text-green-800">
                                            Payment Completed
                                        </h3>
                                    </div>
                                    <Button
                                        onClick={printInvoice}
                                        variant="outline"
                                        className="border-gray-300 hover:bg-gray-50 transition-all duration-200"
                                    >
                                        <Printer className="w-4 h-4 mr-2" />
                                        Print Invoice
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* No Invoice Message */}
                {!invoice && grns?.data?.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <AlertCircle className="h-6 w-6 text-amber-600" />
                            <h3 className="text-lg font-semibold text-amber-800">
                                No Invoice Available
                            </h3>
                        </div>
                        <p className="text-amber-700">
                            An invoice has not been generated from the GRN yet.
                            Please contact the stock department to generate an
                            invoice.
                        </p>
                    </div>
                )}

                {/* No GRN Message */}
                {(!grns?.data || grns.data.length === 0) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <Package className="h-6 w-6 text-blue-600" />
                            <h3 className="text-lg font-semibold text-blue-800">
                                No GRN Available
                            </h3>
                        </div>
                        <p className="text-blue-700">
                            No Goods Receipt Note has been created for this
                            purchase order yet. Please contact the stock
                            department to create a GRN.
                        </p>
                    </div>
                )}

                {/* Items Section */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                            <Package className="w-5 h-5 mr-2 text-brand" />
                            {grns?.data && grns.data.length > 0
                                ? 'Received Items (GRN)'
                                : 'Order Items'}
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Item
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Ordered Qty
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Received Qty
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Unit Price
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Total Amount
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Unit
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {grns?.data?.[0]?.items?.map((grnItem: any) => {
                                    const poItem = grnItem?.purchaseOrderItem;
                                    const item = poItem?.item;
                                    const unitPrice = item?.price; // Use actual item price
                                    const totalPrice =
                                        unitPrice * grnItem.quantityReceived;

                                    return (
                                        <tr
                                            key={grnItem.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {item?.name ||
                                                            'Unknown Item'}
                                                    </p>
                                                    {item?.description && (
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                    {poItem.quantity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                    {grnItem.quantityReceived}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-gray-900">
                                                    ₦
                                                    {unitPrice?.toLocaleString?.() ??
                                                        unitPrice}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-gray-900">
                                                    ₦
                                                    {totalPrice?.toLocaleString?.() ??
                                                        totalPrice}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">
                                                    {poItem.unitOfMeasurement ||
                                                        'pcs'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {(!grns?.data || grns.data.length === 0) &&
                                    purchaseOrder.items?.map((item: any) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {item.item?.name ||
                                                            item.item}
                                                    </p>
                                                    {item.item?.description && (
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {
                                                                item.item
                                                                    .description
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                    {item.quantity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                                                    -
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-gray-900">
                                                    ₦
                                                    {(
                                                        item.item?.price ||
                                                        item.amount /
                                                            item.quantity
                                                    )?.toLocaleString?.() ??
                                                        (item.item?.price ||
                                                            item.amount /
                                                                item.quantity)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-gray-900">
                                                    ₦
                                                    {(item.item?.price
                                                        ? item.item.price *
                                                          item.quantity
                                                        : item.amount
                                                    )?.toLocaleString?.() ??
                                                        (item.item?.price
                                                            ? item.item.price *
                                                              item.quantity
                                                            : item.amount)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">
                                                    {item.unitOfMeasurement ||
                                                        'pcs'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                {(!grns?.data || grns.data.length === 0) &&
                                    (!purchaseOrder.items ||
                                        purchaseOrder.items.length === 0) && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-6 py-8 text-center"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <Package className="h-8 w-8 text-gray-400 mb-2" />
                                                    <p className="text-gray-500">
                                                        No items found
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showInvoiceModal && invoice && (
                <InvoicePrintModal
                    open={showInvoiceModal}
                    onClose={() => setShowInvoiceModal(false)}
                    invoice={invoice}
                    purchaseOrder={purchaseOrder}
                    items={invoiceItems}
                />
            )}

            {showPaymentModal && invoice && (
                <PaymentModal
                    open={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    invoice={invoice}
                    purchaseOrder={purchaseOrder}
                    vendor={purchaseOrder?.vendor}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            )}
        </PageWrapper>
    );
};

export default PurchaseOrderDetailPage;
