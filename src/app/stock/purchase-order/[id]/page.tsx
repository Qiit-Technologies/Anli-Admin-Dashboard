'use client';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import {
    getGoodsReceiptNotesByPurchaseOrder,
    getPurchaseOrder,
} from '@/app/actions/stock';
import { getInvoices, sendPurchaseOrderToAccount } from '@/app/actions/invoice';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import CreateGRNModal from '@/components/stock/CreateGRNModal';
import GRNViewModal from '@/components/stock/GRNViewModal';
import PageWrapper from '@/components/common/PageWrapper';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import SearchInput from '@/components/house-keeping/common/SearchInput';
import { NotificationsPopover } from '@/components/house-keeping/common/Notification';
import { useUser } from '@/context/useUser';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import Toast from '@/components/toast';
import {
    Package,
    FileText,
    Send,
    CheckCircle2,
    AlertCircle,
    Printer,
    ChevronLeft,
} from 'lucide-react';
import POPrintModal from '@/components/POsummary/POPrintModal';
import { fetchHotelDetailsById } from '@/app/actions/hotel';
import { useRouter } from 'nextjs-toploader/app';

const PurchaseOrderDetailPage = () => {
    const { id } = useParams();
    const { user } = useUser();
    const router = useRouter();
    const [showGRNModal, setShowGRNModal] = useState(false);
    const [showGRNViewModal, setShowGRNViewModal] = useState(false);
    const [selectedGRN, setSelectedGRN] = useState<any>(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [isSendingToAccount, setIsSendingToAccount] = useState(false);

    const { data } = useSWR(['/hotels/me'], () => fetchHotelDetailsById());
    const company = data?.data;

    const {
        data: purchaseOrder,
        isLoading,
        error,
        mutate: mutatePurchaseOrder,
    } = useSWR(id ? ['/accounts/purchase-orders', id] : null, () =>
        getPurchaseOrder(id as any),
    );
    const { data: grns, mutate: mutateGRNs } = useSWR(
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

    const invoice = invoiceData?.data?.[0];

    const handleSendToAccount = async () => {
        if (!id) return;

        setIsSendingToAccount(true);
        try {
            const response = await sendPurchaseOrderToAccount(id as any);

            if (response.data) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Purchase order sent to account successfully!"
                        type="success"
                    />
                ));
                // Refresh the purchase order data
                mutatePurchaseOrder();
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={
                            response.error ||
                            'Failed to send purchase order to account.'
                        }
                        type="error"
                    />
                ));
            }
        } catch (error: any) {
            console.error('Error sending to account:', error);
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Failed to send purchase order to account. Please try again."
                    type="error"
                />
            ));
        } finally {
            setIsSendingToAccount(false);
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

    // Transform items for invoice template
    const invoiceItems =
        purchaseOrder.items?.map((item: any) => ({
            item: item.item?.name || item.item,
            description: item.item?.description || 'Product or service',
            quantity: item.quantity,
            rate: item.amount / item.quantity,
            amount: item.amount,
        })) || [];

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'awaiting_grn':
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
                                <p className="text-gray-600 text-sm">Created</p>
                                <p className="font-semibold text-gray-900">
                                    {purchaseOrder.createdAt
                                        ? new Date(
                                              purchaseOrder.createdAt,
                                          ).toLocaleDateString()
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div>
                                <p className="text-gray-600 text-sm">
                                    Total Amount
                                </p>
                                <p className="font-semibold text-xl text-blue-600">
                                    ₦
                                    {purchaseOrder.total?.toLocaleString?.() ||
                                        purchaseOrder.total}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Status Card */}
                {purchaseOrder.sentToAccount &&
                    grns?.data &&
                    grns.data.length > 0 &&
                    invoice && (
                        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Sent to Account
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-3">
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Sent At
                                        </p>
                                        <p className="font-medium">
                                            {purchaseOrder.sentToAccountAt
                                                ? new Date(
                                                      purchaseOrder.sentToAccountAt,
                                                  ).toLocaleString()
                                                : 'Recently'}
                                        </p>
                                    </div>
                                </div>
                                {invoice && (
                                    <div className="flex items-center space-x-3">
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Invoice Number
                                            </p>
                                            <p className="font-medium text-blue-600">
                                                {invoice.invoiceNumber}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                {/* Action Buttons */}
                {purchaseOrder.status !== 'completed' && (
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Actions
                        </h3>
                        <div className="flex flex-wrap gap-4">
                            <Button
                                onClick={() => setShowGRNModal(true)}
                                className="bg-brand text-white shadow-md hover:bg-brand-dark transition-all duration-200 px-6 py-3"
                            >
                                <Package className="w-4 h-4 mr-2" />
                                Create Goods Receipt Note
                            </Button>
                            {!purchaseOrder.sentToAccount && invoice && (
                                <Button
                                    onClick={handleSendToAccount}
                                    disabled={isSendingToAccount}
                                    className="bg-green-600 text-white shadow-md hover:bg-green-700 transition-all duration-200 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    {isSendingToAccount
                                        ? 'Sending...'
                                        : 'Send to Account'}
                                </Button>
                            )}
                            {!purchaseOrder.sentToAccount &&
                                !invoice &&
                                grns?.data?.length > 0 && (
                                    <div className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-md border border-amber-200">
                                        <CheckCircle2 className="w-4 h-4 inline mr-2" />
                                        Generate an invoice from GRN to send to
                                        account
                                    </div>
                                )}
                            {!purchaseOrder.sentToAccount &&
                                (!grns?.data || grns.data.length === 0) && (
                                    <div className="text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-md border border-blue-200">
                                        <Package className="w-4 h-4 inline mr-2" />
                                        Create a GRN first to generate an
                                        invoice
                                    </div>
                                )}
                            {purchaseOrder.sentToAccount && (
                                <div className="text-sm text-green-600 bg-green-50 px-4 py-2 rounded-md border border-green-200">
                                    <CheckCircle2 className="w-4 h-4 inline mr-2" />
                                    Purchase order sent to account on{' '}
                                    {purchaseOrder.sentToAccountAt
                                        ? new Date(
                                              purchaseOrder.sentToAccountAt,
                                          ).toLocaleDateString()
                                        : 'N/A'}
                                </div>
                            )}

                            <Button
                                onClick={() => setShowInvoiceModal(true)}
                                className="bg-brand text-white shadow-md hover:bg-brand-dark transition-all duration-200 px-6 py-3"
                            >
                                <Printer className="w-4 h-4 mr-2" />
                                Print Purchase Order
                            </Button>
                        </div>
                    </div>
                )}

                {/* Items Section */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                            <Package className="w-5 h-5 mr-2 text-brand" />
                            Order Items
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
                                        Quantity
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Unit
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {purchaseOrder.items?.map((item: any) => (
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
                                                        {item.item.description}
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
                                            <span className="font-semibold text-gray-900">
                                                ₦
                                                {item.amount?.toLocaleString?.() ??
                                                    item.amount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">
                                                {item.unitOfMeasurement}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Goods Receipt Notes Section */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-brand" />
                            Goods Receipt Notes
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        GRN Number
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Received By
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {grns &&
                                grns?.data &&
                                grns?.data?.length > 0 ? (
                                    grns?.data?.map((grn: any) => (
                                        <tr
                                            key={grn.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-gray-900">
                                                    {grn.grnNumber}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">
                                                    {grn.receivedAt
                                                        ? formatDate(
                                                              grn.receivedAt,
                                                          )
                                                        : '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">
                                                    {grn.receivedBy?.fullName ||
                                                        grn.receivedBy
                                                            ?.username ||
                                                        '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedGRN(grn);
                                                        setShowGRNViewModal(
                                                            true,
                                                        );
                                                    }}
                                                    className="border-brand text-brand hover:bg-brand hover:text-white"
                                                >
                                                    View Details
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-6 py-8 text-center"
                                        >
                                            <div className="flex flex-col items-center">
                                                <FileText className="h-8 w-8 text-gray-400 mb-2" />
                                                <p className="text-gray-500">
                                                    No GRNs found for this
                                                    purchase order.
                                                </p>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    Create a goods receipt note
                                                    to get started.
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
            <CreateGRNModal
                open={showGRNModal}
                purchaseOrder={purchaseOrder}
                onClose={() => setShowGRNModal(false)}
                onSuccess={() => mutateGRNs()}
            />

            {showGRNViewModal && selectedGRN && (
                <GRNViewModal
                    open={showGRNViewModal}
                    onClose={() => {
                        setShowGRNViewModal(false);
                        setSelectedGRN(null);
                    }}
                    grn={selectedGRN}
                    purchaseOrder={purchaseOrder}
                    onSuccess={() => {
                        mutateGRNs();
                        window.location.reload();
                    }}
                />
            )}

            {/* {invoice && (
                <InvoicePrintModal
                    open={showInvoiceModal}
                    onClose={() => setShowInvoiceModal(false)}
                    invoice={invoice}
                    purchaseOrder={purchaseOrder}
                    items={invoiceItems}
                />
            )} */}

            {showInvoiceModal && (
                <POPrintModal
                    open={showInvoiceModal}
                    onClose={() => setShowInvoiceModal(false)}
                    purchaseOrder={purchaseOrder}
                    items={invoiceItems}
                    company={company}
                />
            )}
        </PageWrapper>
    );
};

export default PurchaseOrderDetailPage;
