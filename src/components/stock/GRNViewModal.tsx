import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    FileText,
    Printer,
    Package,
    Calendar,
    User,
    Building2,
    CreditCard,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Toast from '@/components/toast';
import InvoicePrintModal from '@/components/invoice/InvoicePrintModal';
import { generateInvoiceFromGRN } from '@/app/actions/invoice';
import { getInvoices } from '@/app/actions/invoice';

interface GRNViewModalProps {
    open: boolean;
    onClose: () => void;
    grn: any;
    purchaseOrder: any;
    onSuccess: () => void;
}

const GRNViewModal: React.FC<GRNViewModalProps> = ({
    open,
    onClose,
    grn,
    purchaseOrder,
    onSuccess,
}) => {
    const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [invoice, setInvoice] = useState<any>(null);
    const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);

    // Check if invoice already exists for this GRN
    useEffect(() => {
        if (grn?.id) {
            setIsLoadingInvoice(true);
            getInvoices(grn.id.toString())
                .then((res) => {
                    if (res.data && res.data.length > 0) {
                        setInvoice(res.data[0]);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching invoice:', error);
                })
                .finally(() => {
                    setIsLoadingInvoice(false);
                });
        }
    }, [grn?.id]);

    const generateInvoice = async () => {
        if (!grn) return;

        setIsGeneratingInvoice(true);
        try {
            const res = await generateInvoiceFromGRN(grn.id);

            if (res.data) {
                setInvoice(res.data);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Invoice generated successfully"
                        type="success"
                    />
                ));
                onSuccess();
            } else {
                throw new Error(res.error || 'Failed to generate invoice');
            }
        } catch (error: any) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Failed to generate invoice"
                    type="error"
                />
            ));
        } finally {
            setIsGeneratingInvoice(false);
        }
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

    // Transform items for invoice template - use GRN items instead of PO items
    const invoiceItems =
        grn?.items?.map((grnItem: any, idx: number) => {
            const poItem = grnItem.purchaseOrderItem;
            const item = poItem?.item;
            const unitPrice = item?.price; // Use actual item price
            const totalPrice = unitPrice * grnItem.quantityReceived;

            return {
                item:
                    grn?.purchaseOrder?.items?.[idx].item?.name ||
                    item?.name ||
                    'Unknown Item',
                description: item?.description || 'Product or service',
                quantity: grnItem.quantityReceived, // Use received quantity, not ordered
                rate: unitPrice,
                amount: totalPrice,
                unitOfMeasurement: poItem.unitOfMeasurement || 'pcs',
                remarks: grnItem.remarks || '',
            };
        }) || [];

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Package className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Goods Receipt Note
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {grn?.grnNumber}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                {!invoice && !isLoadingInvoice ? (
                                    <Button
                                        onClick={generateInvoice}
                                        disabled={isGeneratingInvoice}
                                        className="bg-orion-blue text-white hover:bg-blue transition"
                                    >
                                        <FileText className="w-4 h-4 mr-2" />
                                        {isGeneratingInvoice
                                            ? 'Generating...'
                                            : 'Generate Invoice'}
                                    </Button>
                                ) : invoice ? (
                                    <Button
                                        onClick={printInvoice}
                                        variant="outline"
                                        className="border-gray-300 hover:bg-gray-50"
                                    >
                                        <Printer className="w-4 h-4 mr-2" />
                                        Print Invoice
                                    </Button>
                                ) : (
                                    <Button
                                        disabled
                                        className="bg-gray-300 text-gray-500"
                                    >
                                        <FileText className="w-4 h-4 mr-2" />
                                        Loading...
                                    </Button>
                                )}
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500 rounded-lg">
                                        <Calendar className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-600 font-medium">
                                            Received Date
                                        </p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {grn?.receivedAt
                                                ? new Date(
                                                      grn.receivedAt,
                                                  ).toLocaleDateString()
                                                : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500 rounded-lg">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-green-600 font-medium">
                                            Received By
                                        </p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {grn?.receivedBy?.fullName ||
                                                grn?.receivedBy?.username ||
                                                'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500 rounded-lg">
                                        <Building2 className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-purple-600 font-medium">
                                            Vendor
                                        </p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {purchaseOrder?.vendor
                                                ?.vendorName || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-500 rounded-lg">
                                        <CreditCard className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-orange-600 font-medium">
                                            Total Amount
                                        </p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            ₦
                                            {purchaseOrder?.total?.toLocaleString() ||
                                                'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* GRN Details */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-blue-600" />
                                    GRN Information
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">
                                            GRN Number
                                        </span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {grn?.grnNumber}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">
                                            Status
                                        </span>
                                        <span
                                            className={`text-sm font-medium px-2 py-1 rounded-full ${
                                                grn?.status === 'completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                        >
                                            {grn?.status || 'pending'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">
                                            Received Date
                                        </span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {grn?.receivedAt
                                                ? new Date(
                                                      grn.receivedAt,
                                                  ).toLocaleDateString()
                                                : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-sm text-gray-600">
                                            Received By
                                        </span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {grn?.receivedBy?.fullName ||
                                                grn?.receivedBy?.username ||
                                                'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Purchase Order Details */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-green-600" />
                                    Purchase Order Details
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">
                                            PO Number
                                        </span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {purchaseOrder?.poNumber}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">
                                            Vendor
                                        </span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {purchaseOrder?.vendor?.vendorName}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">
                                            Total Amount
                                        </span>
                                        <span className="text-sm font-medium text-gray-900">
                                            ₦
                                            {purchaseOrder?.total?.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-sm text-gray-600">
                                            Status
                                        </span>
                                        <span
                                            className={`text-sm font-medium px-2 py-1 rounded-full ${
                                                purchaseOrder?.status ===
                                                'completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                        >
                                            {purchaseOrder?.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Received Items */}
                        <div className="bg-white rounded-lg border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-purple-600" />
                                    Received Items
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Item
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Quantity Received
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Notes
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {console.log(
                                            'grns',
                                            grn?.purchaseOrder?.items?.[0],
                                        )}
                                        {grn?.items?.map(
                                            (item: any, idx: number) => (
                                                <tr
                                                    key={item.id}
                                                    className={
                                                        idx % 2 === 0
                                                            ? 'bg-white'
                                                            : 'bg-gray-50'
                                                    }
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {
                                                            grn?.purchaseOrder
                                                                ?.items?.[idx]
                                                                .item?.name
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {item.quantityReceived}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.notes || '-'}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Invoice Status */}
                        {invoice && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
                                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    Invoice Generated
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-xs text-blue-600 font-medium">
                                            Invoice Number
                                        </p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {invoice.invoiceNumber}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-600 font-medium">
                                            Total Amount
                                        </p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            ₦
                                            {invoice.totalAmount?.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-600 font-medium">
                                            Status
                                        </p>
                                        <p className="text-sm font-semibold text-gray-900 capitalize">
                                            {invoice.status}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-600 font-medium">
                                            Generated Date
                                        </p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {invoice.createdAt
                                                ? new Date(
                                                      invoice.createdAt,
                                                  ).toLocaleDateString()
                                                : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {grn?.notes && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-gray-600" />
                                    Notes
                                </h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-700">
                                        {grn.notes}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {showInvoiceModal && invoice && (
                <InvoicePrintModal
                    open={showInvoiceModal}
                    onClose={() => setShowInvoiceModal(false)}
                    invoice={invoice}
                    purchaseOrder={purchaseOrder}
                    items={invoiceItems}
                />
            )}
        </>
    );
};

export default GRNViewModal;
