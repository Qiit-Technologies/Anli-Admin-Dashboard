import { Modal, ModalContent } from '@heroui/react';
import { Button } from '../ui/button';
import { CircleX } from 'lucide-react';
import React, { useState } from 'react';
import { updatePettyCash } from '@/app/actions/account';
import { usePathname } from 'next/navigation';
import { formatCurrency, getFileType } from '@/lib/utils';

interface ViewPettyCashDetailsProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    transaction?: any;
    mutateTransactions: any;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending':
            return 'bg-orange-100 text-orange-800';
        case 'approved':
            return 'bg-green-100 text-green-800';
        case 'rejected':
            return 'bg-red-100 text-red-800';
        case 'completed':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const ViewPettyCashDetails = ({
    isOpen,
    onOpenChange,
    transaction,
    mutateTransactions,
}: ViewPettyCashDetailsProps) => {
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(false);
    if (!transaction) return null;

    const handleUpdatePettyCash = async (status: string) => {
        console.log('transaction', transaction);

        setIsLoading(true);
        try {
            const result = await updatePettyCash(
                { status: status },
                transaction?.id,
            );
            console.log('result', result);
            if (result.data) {
                // Refresh data after successful import
                onOpenChange(false);
                mutateTransactions();
            }
        } catch (error: any) {
            console.error('Import failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
            <ModalContent className="rounded-none w-full max-w-[770px] max-h-[80vh] p-0">
                {(onClose) => (
                    <div className="relative h-[80vh] flex flex-col">
                        {/* Fixed Header */}
                        <div
                            className="pt-[34px] pr-[39px] pb-[18px] pl-[47px] bg-[#000] flex justify-between w-full sticky top-0 z-20"
                            style={{ minHeight: 90 }}
                        >
                            <div className="text-[#EAECF0]">
                                <p className="text-[32px] leading-[27px]">
                                    Cash Management
                                </p>
                                <div className="flex items-center mt-[17px] gap-[15px]">
                                    <p className="text-sm font-bold">Status</p>
                                    <div
                                        className={`px-3 py-1 rounded-full ${getStatusColor(
                                            transaction.status,
                                        )}`}
                                    >
                                        <p className="capitalize text-[14px] font-medium leading-[20px]">
                                            {transaction.status}
                                        </p>
                                    </div>
                                    {pathname === '/admin/petty-cash' && (
                                        <>
                                            {transaction.status ===
                                            'pending' ? (
                                                <>
                                                    <Button
                                                        onClick={() =>
                                                            handleUpdatePettyCash(
                                                                'approved',
                                                            )
                                                        }
                                                        className="bg-[#16A34A] text-white"
                                                    >
                                                        {isLoading
                                                            ? 'Loading...'
                                                            : 'Approve'}
                                                    </Button>

                                                    <Button
                                                        onClick={() =>
                                                            handleUpdatePettyCash(
                                                                'rejected',
                                                            )
                                                        }
                                                        className="bg-[#DC2626] text-white"
                                                    >
                                                        {isLoading
                                                            ? 'Loading...'
                                                            : 'Reject'}
                                                    </Button>
                                                </>
                                            ) : transaction.status ===
                                              'approved' ? (
                                                <Button
                                                    onClick={() =>
                                                        handleUpdatePettyCash(
                                                            'completed',
                                                        )
                                                    }
                                                    className="bg-[#16A34A] text-white"
                                                >
                                                    {isLoading
                                                        ? 'Loading...'
                                                        : 'Mark as Completed'}
                                                </Button>
                                            ) : null}
                                        </>
                                    )}
                                </div>
                            </div>

                            <CircleX size={35} color="#fff" onClick={onClose} />
                        </div>

                        {/* Scrollable Content */}
                        <div
                            className="px-10 py-[27px] flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent scrollbar-hide"
                            style={{
                                WebkitOverflowScrolling: 'touch',
                                scrollbarWidth: 'thin',
                            }}
                        >
                            {/* Money was taken from */}
                            <div className="mb-6 px-6 py-5  rounded-[20px] bg-[#FFF9F6]">
                                <p className="text-[20px] font-bold leading-[150%] text-[#354052]">
                                    Money was taken from:
                                </p>

                                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-16">
                                    <div>
                                        <p className="text-[14px] text-[#5F738C] mb-1">
                                            Account Name
                                        </p>
                                        <p className="text-[14px] font-semibold text-[#354052]">
                                            {transaction.paidFrom
                                                ?.accountName || 'N/A'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[14px] text-[#5F738C] mb-1">
                                            Account Number
                                        </p>
                                        <p className="text-[14px] font-semibold text-[#354052]">
                                            {transaction.paidFrom
                                                ?.accountNumber || 'N/A'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[14px] text-[#5F738C] mb-1">
                                            Bank Name
                                        </p>
                                        <p className="text-[14px] font-semibold text-[#354052]">
                                            {transaction.paidFrom?.bankName ||
                                                'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Transaction Information */}
                            <div className="mb-6 px-6 py-5 border border-[#E0E0E0] rounded-[20px] bg-[#FFF1E7]">
                                <p className="text-[20px] font-bold leading-[150%] text-[#354052]">
                                    Transaction Information
                                </p>

                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-16">
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[14px] text-[#5F738C] mb-1">
                                                Department
                                            </p>
                                            <p className="text-[14px] font-semibold text-[#354052]">
                                                {transaction.module ||
                                                    transaction.department
                                                        ?.name ||
                                                    'N/A'}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[14px] text-[#5F738C] mb-1">
                                                Recipient Name
                                            </p>
                                            <p className="text-[14px] font-semibold text-[#354052]">
                                                {transaction.recipientName}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[14px] text-[#5F738C] mb-1">
                                                Payment Type
                                            </p>
                                            <p className="text-[14px] font-semibold text-[#354052] capitalize">
                                                {transaction.paymentMethod?.replaceAll(
                                                    '_',
                                                    ' ',
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[14px] text-[#5F738C] mb-1">
                                                Transaction Status
                                            </p>
                                            <div className="px-3 py-1 rounded-full bg-[#F9F5FF] inline-block">
                                                <p className="text-[14px] font-medium leading-[20px] text-[#D55D00]">
                                                    {transaction.status ===
                                                    'completed'
                                                        ? 'Paid'
                                                        : transaction.status}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[14px] text-[#5F738C] mb-1">
                                                Transaction Date
                                            </p>
                                            <p className="text-[14px] font-semibold text-[#354052]">
                                                {new Date(
                                                    transaction.createdAt,
                                                ).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[14px] text-[#5F738C] mb-1">
                                                Attached Document
                                            </p>
                                            <div className="text-[14px] font-semibold text-[#354052]">
                                                {transaction.documentUrl ? (
                                                    <div>
                                                        {getFileType(
                                                            transaction.documentUrl,
                                                        ) === 'image' && (
                                                            <img
                                                                src={
                                                                    transaction.documentUrl
                                                                }
                                                                alt="Document"
                                                                className="w-12 h-12 object-cover rounded border"
                                                            />
                                                        )}
                                                        <p
                                                            onClick={() =>
                                                                window.open(
                                                                    transaction.documentUrl,
                                                                    '_blank',
                                                                )
                                                            }
                                                            className="cursor-pointer text-sm font-semibold text-gray-600"
                                                        >
                                                            Open Document
                                                        </p>
                                                    </div>
                                                ) : (
                                                    'N/A'
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[14px] text-[#5F738C] mb-1">
                                                Description
                                            </p>
                                            <p className="text-[14px] font-semibold text-[#354052] max-w-xs truncate">
                                                {transaction.description ||
                                                    'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Purpose or Category */}
                            <div className="mb-6 px-6 py-5 border border-[#E0E0E0] rounded-[20px] bg-white">
                                <p className="text-[20px] font-bold leading-[150%] text-[#354052]">
                                    Purpose or Category
                                </p>

                                <div className="mt-6">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-[#E0E0E0]">
                                                <th className="text-left py-3 text-[14px] font-medium text-[#5F738C]">
                                                    Purpose
                                                </th>
                                                <th className="text-left py-3 text-[14px] font-medium text-[#5F738C]">
                                                    Amount
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="py-3 text-[14px] text-[#354052]">
                                                    {transaction.purpose}
                                                </td>
                                                <td className="py-3 text-[14px] font-semibold text-[#354052]">
                                                    {formatCurrency(
                                                        transaction.amount,
                                                    )}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Total Amount */}
                            <div className="flex justify-between items-center pt-6 border-t border-[#E0E0E0]">
                                <span className="text-[18px] font-bold text-[#354052]">
                                    Total Amount:
                                </span>
                                <span className="text-[18px] font-bold text-[#354052]">
                                    ₦{transaction.amount?.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </ModalContent>
        </Modal>
    );
};

export default ViewPettyCashDetails;
