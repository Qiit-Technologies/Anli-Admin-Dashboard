/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import CustomDialog from '@/components/common/CustomDialog';
import { formatCurrency } from '@/lib/utils';
import type { ARAPRow } from '../common/ARAPColumns';

interface ViewPayableModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payable: ARAPRow | null;
}

export const ViewPayableModal = ({
    open,
    onOpenChange,
    payable,
}: ViewPayableModalProps) => {
    if (!payable) return null;

    const formatDate = (date: Date | string | undefined) => {
        if (!date) return '-';
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return '-';
        return dateObj.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatDateTime = (date: Date | string | undefined) => {
        if (!date) return '-';
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return '-';
        const dateStr = dateObj.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
        const timeStr = dateObj.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
        return `${dateStr} at ${timeStr}`;
    };

    const details = [
        {
            label: 'Account Number',
            value: payable.accountNumber || '-',
        },
        {
            label: 'Full Name',
            value: payable.fullName || `${payable.firstName} ${payable.lastName}`.trim() || '-',
        },
        {
            label: 'Title',
            value: payable.title || '-',
        },
        {
            label: 'Email',
            value: payable.email || '-',
        },
        {
            label: 'Phone Number',
            value: payable.phoneNumber || '-',
        },
        {
            label: 'ID Number',
            value: payable.IDNumber || '-',
        },
        {
            label: 'Nationality',
            value: payable.nationality || '-',
        },
        {
            label: 'Gender',
            value: payable.gender ? payable.gender.charAt(0).toUpperCase() + payable.gender.slice(1) : '-',
        },
        {
            label: 'Date of Birth',
            value: formatDate(payable.dateOfBirth),
        },
        {
            label: 'Address',
            value: payable.address || '-',
        },
        {
            label: 'Guest Type',
            value: payable.guestType ? payable.guestType.charAt(0).toUpperCase() + payable.guestType.slice(1).replace('_', ' ') : '-',
        },
        {
            label: 'Credit Balance',
            value: formatCurrency(payable.balance),
            highlight: true,
        },
        {
            label: 'Created By',
            value: payable.createdBy || '-',
        },
        {
            label: 'Created At',
            value: formatDateTime(payable.createdAt),
        },
        {
            label: 'Notes',
            value: payable.notes || '-',
        },
    ];

    return (
        <CustomDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Account Payable Details"
            description="View complete details of the guest profile and credit balance"
            confirmText="Close"
            onConfirm={() => onOpenChange(false)}
            maxWidth="2xl"
            footerType="full"
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {details.map((detail, index) => (
                        <div
                            key={index}
                            className={`${
                                detail.highlight
                                    ? 'bg-emerald-50 border border-emerald-200 rounded-lg p-4'
                                    : ''
                            }`}
                        >
                            <div className="text-sm font-medium text-gray-500 mb-1">
                                {detail.label}
                            </div>
                            <div
                                className={`text-sm ${
                                    detail.highlight
                                        ? 'text-emerald-700 font-semibold'
                                        : 'text-gray-900'
                                }`}
                            >
                                {detail.value}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </CustomDialog>
    );
};

