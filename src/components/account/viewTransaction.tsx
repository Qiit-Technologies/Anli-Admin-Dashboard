import { Modal, ModalContent } from '@heroui/react';
import React from 'react';
import useSWR from 'swr';
import CustomTable from '../front-of-house/tables/CustomTable';
import { PurchaseOrderColumns } from '../kitchen/tables/columns/PurchaseOrderColumns';
import { CircleX, UploadCloud } from 'lucide-react';
import { getTransactionDetails } from '@/app/actions/account';
import { formatCurrency } from '@/lib/utils';

interface CreateRoleModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    data?: any;
    transactionId?: string;
}

const ViewTransaction: React.FC<CreateRoleModalProps> = ({
    isOpen,
    onOpenChange,
    transactionId,
}) => {
    // Use SWR to fetch transaction details
    const { data, error, isLoading } = useSWR(
        isOpen && transactionId ? ['transaction-details', transactionId] : null,
        () => getTransactionDetails(transactionId as string),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        },
    );
    const transactionData = data?.data;

    const initials = transactionData?.orderId?.split('-')?.[0];
    const isOrder = initials === 'ORD';
    const isGuest = initials === 'GST';
    const isPettyCash = initials === 'PCT';
    const isStock = initials === 'STC';
    const isPurchaseOrder = initials === 'PCO';

    // Generate payment data from transaction
    const getPaymentData = () => {
        const waiter = transactionData?.originalData?.waiter;
        const paidBy = transactionData?.originalData?.paidBy;
        const vendor = transactionData?.originalData?.vendor;
        const dataToUse = isOrder
            ? waiter
            : isPettyCash
              ? paidBy
              : isPurchaseOrder
                ? vendor
                : null;
        if (!transactionData) return [];

        return [
            {
                key: 'Account Name',
                value: dataToUse?.accountName || 'N/A',
            },
            {
                key: 'Account Number',
                value:
                    dataToUse?.accountNumber ||
                    dataToUse?.bankAccountNumber ||
                    'N/A',
            },
            {
                key: 'Bank Name',
                value: dataToUse?.bankName || 'N/A',
            },
        ];
    };

    // Generate transaction data from transaction
    const getTransactionData = () => {
        console.log('transactionData', transactionData);
        const originalData = transactionData?.originalData;
        if (!transactionData) return [];

        if (isOrder) {
            return [
                {
                    key: 'Department',
                    value: transactionData.department || 'N/A',
                },
                {
                    key: 'Description',
                    value: transactionData.description || 'N/A',
                },
                ...(originalData?.deliveryAddress
                    ? [
                          {
                              key: 'Delivery Address',
                              value: originalData?.deliveryAddress || 'N/A',
                          },
                      ]
                    : []),
                {
                    key: 'Name',
                    value: originalData?.guestName || 'N/A',
                },

                {
                    key: 'Phone Number',
                    value: originalData?.guestPhoneNumber || 'N/A',
                },
                ...(originalData?.preparedBy?.fullName
                    ? [
                          {
                              key: 'Prepared By',
                              value:
                                  originalData?.preparedBy?.fullName || 'N/A',
                          },
                      ]
                    : []),

                {
                    key: 'Status',
                    value: originalData?.status || 'N/A',
                },
                {
                    key: 'Total Price',
                    value: originalData?.totalPrice
                        ? formatCurrency(originalData?.totalPrice)
                        : 'N/A',
                },
                ...(originalData.table?.number
                    ? [
                          {
                              key: 'Table / Room',
                              value: originalData.table?.number || 'N/A',
                          },
                      ]
                    : []),
            ];
        } else if (isStock) {
            return [
                {
                    key: 'Department',
                    value: transactionData.department || 'N/A',
                },
                {
                    key: 'Description',
                    value: originalData?.description || 'N/A',
                },
                {
                    key: 'Min Stock',
                    value: originalData?.minStock || 'N/A',
                },
                {
                    key: 'Price',
                    value: originalData?.price
                        ? formatCurrency(originalData?.price)
                        : 'N/A',
                },
                {
                    key: 'Stock Name',
                    value: originalData?.name || 'N/A',
                },
                {
                    key: 'Quantity',
                    value: originalData?.quantity || 'N/A',
                },

                {
                    key: 'Staff',
                    value: originalData?.staff?.fullName || 'N/A',
                },
            ];
        } else if (isPettyCash) {
            return [
                {
                    key: 'Department',
                    value: transactionData.department || 'N/A',
                },
                {
                    key: 'Description',
                    value: originalData?.description || 'N/A',
                },
                {
                    key: 'Amount',
                    value: originalData?.amount
                        ? formatCurrency(originalData?.amount)
                        : 'N/A',
                },
                {
                    key: 'Approved By',
                    value: originalData?.approvedBy?.fullName || 'N/A',
                },

                {
                    key: 'Created By',
                    value: originalData?.createdBy?.fullName || 'N/A',
                },

                {
                    key: 'Date',
                    value: originalData?.date || 'N/A',
                },
                {
                    key: 'Payment Method',
                    value:
                        originalData?.paymentMethod?.replace('_', ' ') || 'N/A',
                },
                {
                    key: 'Purpose',
                    value: originalData?.purpose || 'N/A',
                },
                {
                    key: 'Recipient Name',
                    value: originalData?.recipientName || 'N/A',
                },
            ];
        } else if (isGuest) {
            return [
                {
                    key: 'Department',
                    value: transactionData.department || 'N/A',
                },
                {
                    key: 'Amount Paid',
                    value: originalData?.amountPaid
                        ? formatCurrency(originalData?.amountPaid)
                        : 'N/A',
                },
                {
                    key: 'Amount',
                    value: originalData?.amount
                        ? formatCurrency(originalData?.amount)
                        : 'N/A',
                },
                {
                    key: 'Check Out Note',
                    value: originalData?.checkOutNote?.fullName || 'N/A',
                },

                {
                    key: 'Created By',
                    value: originalData?.createdBy?.fullName || 'N/A',
                },

                {
                    key: 'Discount Amount',
                    value: originalData?.discountAmount || 'N/A',
                },

                {
                    key: 'Discount Reason',
                    value: originalData?.discountReason || 'N/A',
                },

                {
                    key: 'Discount Type',
                    value: originalData?.discountType || 'N/A',
                },

                {
                    key: 'Email',
                    value: originalData?.email || 'N/A',
                },
                {
                    key: 'Check-in Date',
                    value: new Date(originalData?.startDate)
                        ?.toISOString()
                        .split('T')[0],
                },

                {
                    key: 'Check-in Time',
                    value: originalData?.startTime || 'N/A',
                },

                {
                    key: 'Check-out Date',
                    value: new Date(originalData?.endDate)
                        ?.toISOString()
                        .split('T')[0],
                },

                {
                    key: 'Check-out Time',
                    value: originalData?.endTime || 'N/A',
                },
                {
                    key: 'Final Price',
                    value: originalData?.finalPrice || 'N/A',
                },

                {
                    key: 'Full Name',
                    value: originalData?.fullName || 'N/A',
                },

                {
                    key: 'Checked In',
                    value: originalData?.isCheckedIn ? 'Yes' : 'No',
                },

                {
                    key: 'Checked Out',
                    value: originalData?.isCheckedOut ? 'Yes' : 'No',
                },

                {
                    key: 'Original Price',
                    value: originalData?.originalPrice || 'N/A',
                },
                {
                    key: 'Outstanding',
                    value: originalData?.outstanding || 'N/A',
                },
                {
                    key: 'Payment Method',
                    value: originalData?.paymentMethod || 'N/A',
                },
                {
                    key: 'Phone Number',
                    value: originalData?.phoneNumber || 'N/A',
                },

                {
                    key: 'Second Guest Full Name',
                    value: originalData?.secondGuestFullName || 'N/A',
                },
                {
                    key: 'Second Guest Phone Number',
                    value: originalData?.secondGuestPhoneNumber
                        ? originalData?.secondGuestPhoneNumber
                        : 'N/A',
                },
            ];
        } else if (isPurchaseOrder) {
            return [
                {
                    key: 'Department',
                    value: transactionData.department || 'N/A',
                },
                {
                    key: 'Description',
                    value: transactionData?.description || 'N/A',
                },
                {
                    key: 'Total Amount',
                    value: originalData?.total
                        ? formatCurrency(originalData?.total)
                        : 'N/A',
                },
                {
                    key: 'Vendor',
                    value: originalData?.vendor?.vendorName || 'N/A',
                },

                {
                    key: 'Date sent',
                    value: originalData?.dateSent
                        ? new Date(originalData?.dateSent)
                              ?.toISOString()
                              .split('T')[0]
                        : 'N/A',
                },
                {
                    key: 'Item grouping',
                    value: originalData?.itemGrouping || 'N/A',
                },
            ];
        }

        return [];
    };

    // Generate items data from transaction
    const getItemsData = () => {
        if (!transactionData?.originalData?.items) return [];

        return transactionData?.originalData.items.map(
            (item: any, index: number) => ({
                quantity: item.quantity || '1',
                item:
                    item.menuItem?.name ||
                    item.item?.name ||
                    `Item ${index + 1}`,
                amount: item.price
                    ? `₦${item.price?.toLocaleString()}`
                    : item.amount
                      ? `₦${item.amount?.toLocaleString()}`
                      : '₦0',
            }),
        );
    };

    // Download transaction details
    const handleDownload = () => {
        if (!transactionData) return;

        // Create CSV content
        const csvContent = [
            // Header row
            ['Transaction Details'],
            [''],
            ['Payment Information'],
            ['Account Name', transactionData.guestName || 'N/A'],
            ['Account Number', transactionData.orderId || 'N/A'],
            ['Bank Name', transactionData.paymentType || 'N/A'],
            [''],
            ['Transaction Information'],
            ['Department', transactionData.department || 'N/A'],
            ['Served By', transactionData.servedBy || 'N/A'],
            [
                'Order Type',
                transactionData.orderType ||
                    transactionData.description ||
                    'N/A',
            ],
            ['Guest Name', transactionData.guestName || 'N/A'],
            [
                'Location',
                transactionData.deliveryAddress ||
                    transactionData.tableRoom ||
                    'N/A',
            ],
            ['Payment Type', transactionData.paymentType || 'N/A'],
            ['Status', transactionData.status || 'N/A'],
            ['Amount', `₦${transactionData.amount?.toLocaleString() || '0'}`],
            [''],
            ['Items List'],
            ['Quantity', 'Item', 'Amount'],
            ...getItemsData().map((item: any) => [
                item.quantity,
                item.item,
                item.amount,
            ]),
        ]
            .map((row: any) => row.map((cell: any) => `"${cell}"`).join(','))
            .join('\n');

        // Create and download file
        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;',
        });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute(
            'download',
            `transaction-${transactionData.orderId || 'details'}.csv`,
        );
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Loading state
    if (isLoading) {
        return (
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
                <ModalContent className="rounded-none w-full max-w-[770px]">
                    <div className="pt-[34px] pr-[39px] pb-[18px] pl-[47px] bg-[#000] flex justify-between w-full">
                        <div className="text-[#EAECF0]">
                            <p className="text-[32px] leading-[27px]">
                                Transaction Details
                                <span className="text-[16px]">
                                    ({transactionId || 'N/A'})
                                </span>
                            </p>
                        </div>
                        <CircleX
                            size={35}
                            color="#fff"
                            onClick={() => onOpenChange(false)}
                        />
                    </div>
                    <div className="px-10 py-[27px]">
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#000]"></div>
                            <span className="ml-3 text-gray-600">
                                Loading transaction details...
                            </span>
                        </div>
                    </div>
                </ModalContent>
            </Modal>
        );
    }

    // Error state
    if (error) {
        return (
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
                <ModalContent className="rounded-none w-full max-w-[770px]">
                    <div className="pt-[34px] pr-[39px] pb-[18px] pl-[47px] bg-[#000] flex justify-between w-full">
                        <div className="text-[#EAECF0]">
                            <p className="text-[32px] leading-[27px]">
                                Transaction Details
                                <span className="text-[16px]">
                                    ({transactionId || 'N/A'})
                                </span>
                            </p>
                        </div>
                        <CircleX
                            size={35}
                            color="#fff"
                            onClick={() => onOpenChange(false)}
                        />
                    </div>
                    <div className="px-10 py-[27px]">
                        <div className="flex items-center justify-center h-32">
                            <div className="text-center">
                                <p className="text-red-500 mb-2">
                                    Error loading transaction details
                                </p>
                                <p className="text-gray-600 text-sm">
                                    Please try again later
                                </p>
                            </div>
                        </div>
                    </div>
                </ModalContent>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
            <ModalContent className="rounded-none w-full max-w-[770px]">
                {(onClose) => (
                    <div>
                        <div className="pt-[34px] pr-[39px] pb-[18px] pl-[47px] bg-[#000] flex justify-between w-full">
                            <div className="text-[#EAECF0] ">
                                <p className="text-[32px] leading-[27px]">
                                    Transaction Details
                                    <span className="text-[16px]">
                                        ({transactionData?.orderId || 'N/A'})
                                    </span>
                                </p>
                                <div className="flex items-center mt-[17px] gap-[15px]">
                                    <p className="text-sm font-bold">Status</p>
                                    <div className="px-3 py-1 rounded-full bg-[#F9F5FF]">
                                        <p className="text-[14px] font-medium leading-[20px] text-[#027A48]">
                                            {transactionData?.status ||
                                                'Pending'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col justify-between items-end gap-3">
                                <CircleX
                                    size={35}
                                    color="#fff"
                                    onClick={onClose}
                                />
                                <div
                                    className="flex gap-2 px-4 py-2 rounded-lg border border-[#D0D5DD] bg-[#F9F5FF] text-[#344054] cursor-pointer hover:bg-[#F4F0FF] transition-colors"
                                    onClick={handleDownload}
                                >
                                    <UploadCloud />
                                    <p className="text-[14px] font-medium leading-[20px]">
                                        Download
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="px-10 py-[27px]">
                            {transactionData?.originalData?.status?.toLowerCase() ===
                                'completed' &&
                                !isGuest && (
                                    <div className="mb-6 px-5 py-4 border border-[#E0E0E0] rounded-[18px] bg-[#FFF9F5]">
                                        <p className="text-[18px] font-bold leading-[150%] text-[#354052]">
                                            Payment was made to:
                                        </p>
                                        <div className="mt-5 flex flex-wrap gap-x-[50px] gap-y-[19px]">
                                            {getPaymentData().map((payment) => (
                                                <div key={payment.key}>
                                                    <p className="text-[12px] font-normal text-[#5F738C]">
                                                        {payment.key}
                                                    </p>
                                                    <p className="text-[16px] font-semibold leading-[134.5%] text-[#354052]">
                                                        {payment.value}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            <div className="mb-6 px-5 py-4 border border-[#E0E0E0] rounded-[18px] bg-[#FFF1E7]">
                                <p className="text-[18px] font-bold leading-[150%] text-[#354052]">
                                    Transaction Information
                                </p>
                                <div className="mt-5 flex flex-wrap gap-x-[50px] gap-y-[19px]">
                                    {getTransactionData().map((trx) => (
                                        <div
                                            key={trx.key}
                                            className="min-w-[108px]"
                                        >
                                            <p className="text-[12px] font-normal text-[#5F738C]">
                                                {trx.key}
                                            </p>
                                            <p className="text-[16px] font-semibold leading-[134.5%] text-[#354052]">
                                                {trx.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {(isOrder || isPurchaseOrder) && (
                                <CustomTable
                                    isSmall
                                    isPaginated={false}
                                    hasHeader
                                    rightHeader={<div />}
                                    title="Items List of + Quantities"
                                    columns={PurchaseOrderColumns}
                                    data={getItemsData()}
                                />
                            )}
                        </div>
                    </div>
                )}
            </ModalContent>
        </Modal>
    );
};

export default ViewTransaction;
