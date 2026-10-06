/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import CustomDialog from '@/components/common/CustomDialog';
import { formatCurrency } from '@/lib/utils';
import type { ARAPRow } from '../common/ARAPColumns';

interface ViewReceivableModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    receivable: ARAPRow | null;
}

export const ViewReceivableModal = ({
    open,
    onOpenChange,
    receivable,
}: ViewReceivableModalProps) => {
    if (!receivable) return null;

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
            value: receivable.accountNumber || '-',
        },
        {
            label: 'Full Name',
            value: receivable.fullName || `${receivable.firstName} ${receivable.lastName}`.trim() || '-',
        },
        {
            label: 'Email',
            value: receivable.email || '-',
        },
        {
            label: 'Phone Number',
            value: receivable.phoneNumber || '-',
        },
        {
            label: 'ID Number',
            value: receivable.IDNumber || '-',
        },
        {
            label: 'Nationality',
            value: receivable.nationality || '-',
        },
        {
            label: 'Gender',
            value: receivable.gender ? receivable.gender.charAt(0).toUpperCase() + receivable.gender.slice(1) : '-',
        },
        {
            label: 'Date of Birth',
            value: formatDate(receivable.dateOfBirth),
        },
        {
            label: 'Address',
            value: receivable.address || '-',
        },
        {
            label: 'Guest Type',
            value: receivable.guestType ? receivable.guestType.charAt(0).toUpperCase() + receivable.guestType.slice(1).replace('_', ' ') : '-',
        },
        {
            label: 'Outstanding Balance',
            value: formatCurrency(receivable.balance),
            highlight: true,
        },
        {
            label: 'Created By',
            value: receivable.createdBy || '-',
        },
        {
            label: 'Created At',
            value: formatDateTime(receivable.createdAt),
        },
        {
            label: 'Notes',
            value: receivable.notes || '-',
        },
    ];

    return (
        <CustomDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Account Receivable Details"
            description="View complete details of the receivable"
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

