import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { InputField } from '@/components/common/Form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CiBank } from 'react-icons/ci';
import toast from 'react-hot-toast';
import Toast from '@/components/toast';
import { getAllBankAccounts, BankAccount } from '@/app/actions/bank-accounts';
import { updatePurchaseOrder } from '@/app/actions/stock';
import { useIdleLogoutExemption } from '@/context/IdleLogoutContext';
import { formatBankAccountLabel, formatCurrency } from '@/lib/utils';
import useSWR from 'swr';

interface PaymentModalProps {
    open: boolean;
    onClose: () => void;
    invoice: any;
    purchaseOrder: any;
    vendor: any;
    onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    open,
    onClose,
    invoice,
    purchaseOrder,
    vendor,
    onPaymentSuccess,
}) => {
    useIdleLogoutExemption(open);

    const [selectedAccount, setSelectedAccount] = useState<string>('');
    const [amount, setAmount] = useState(invoice?.totalAmount || 0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Fetch bank accounts
    const { data: bankAccounts = [] } = useSWR(
        '/bank-accounts',
        getAllBankAccounts,
    );

    const remappedBankAccounts = (bankAccounts as Array<BankAccount>).map(
        (account) => ({
            label: formatBankAccountLabel(account),
            value: account.id?.toString() || '',
        }),
    );

    const handlePayment = async () => {
        if (!amount) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Please enter the payment amount"
                    type="error"
                />
            ));
            return;
        }

        setIsProcessing(true);
        try {
            console.log(purchaseOrder.id);
            // Update purchase order status to completed (this will also update invoice status)
            const poUpdateResponse = await updatePurchaseOrder(
                purchaseOrder.id,
                { status: 'completed' },
            );

            if (poUpdateResponse.message) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Payment processed successfully and purchase order marked as completed"
                        type="success"
                    />
                ));
                onPaymentSuccess();
                onClose();
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description="Failed to process payment"
                        type="error"
                    />
                ));
            }
        } catch (error: any) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Failed to process payment"
                    type="error"
                />
            ));
        } finally {
            setIsProcessing(false);
        }
    };

    const getVendorAccountDetails = () => {
        console.log(vendor);
        // Use vendor data if available, otherwise fallback to defaults
        return {
            bankName: vendor?.bankName || 'First Bank of Nigeria',
            accountNumber: vendor?.bankAccountNumber || '1234567890',
            accountName:
                vendor?.accountName ||
                purchaseOrder?.vendor?.vendorName ||
                'Vendor Account',
            swiftCode: vendor?.swiftCode || 'FBNINGL',
        };
    };

    const vendorAccount = getVendorAccountDetails();

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Complete Purchase Order
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Invoice Details */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                            Invoice Details
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-600">
                                    Invoice Number:
                                </span>
                                <p className="font-medium">
                                    {invoice?.invoiceNumber}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-600">Amount:</span>
                                <p className="font-medium">
                                    ₦{formatCurrency(invoice?.totalAmount)}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-600">Vendor:</span>
                                <p className="font-medium">
                                    {purchaseOrder?.vendor?.vendorName}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-600">
                                    PO Number:
                                </span>
                                <p className="font-medium">
                                    {purchaseOrder?.poNumber}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Vendor Account Details */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2 text-sm">
                            <CiBank className="w-4 h-4" />
                            Vendor Account Details
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-blue-600">
                                    Bank Name:
                                </span>
                                <p className="font-medium">
                                    {vendorAccount.bankName}
                                </p>
                            </div>
                            <div>
                                <span className="text-blue-600">
                                    Account Number:
                                </span>
                                <p className="font-medium">
                                    {vendorAccount.accountNumber}
                                </p>
                            </div>
                            <div>
                                <span className="text-blue-600">
                                    Account Name:
                                </span>
                                <p className="font-medium">
                                    {vendorAccount.accountName}
                                </p>
                            </div>
                            <div>
                                <span className="text-blue-600">
                                    Swift Code:
                                </span>
                                <p className="font-medium">
                                    {vendorAccount.swiftCode}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Form */}
                    <div className="space-y-3">
                        <InputField
                            id="amount"
                            name="amount"
                            label="Amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            required
                        />
                        <div>
                            <label
                                htmlFor="accountPaidTo"
                                className="text-sm font-medium text-gray-700"
                            >
                                Account Paid To (Optional)
                            </label>
                            <Select
                                value={selectedAccount}
                                onValueChange={setSelectedAccount}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select account to pay to (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {remappedBankAccounts.map((account) => (
                                        <SelectItem
                                            key={account.value}
                                            value={account.value}
                                        >
                                            {account.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={onClose} size="sm">
                            Cancel
                        </Button>
                        <Button
                            onClick={handlePayment}
                            disabled={isProcessing || !amount}
                            className="bg-orion-blue hover:bg-orion-blue"
                            size="sm"
                        >
                            {isProcessing ? 'Processing...' : 'Process Payment'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentModal;
