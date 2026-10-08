'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import Image from 'next/image';
import React from 'react';
import { HelpCircle, X, Download } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { OrganizationDetail } from '@/hooks/useHotel';
import BrandButton from '@/components/common/Button';
import { downloadData } from '@/lib/downloadData';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

type Entry = {
    dateTime: string;
    details: string;
    staff: string;
    deposited: number;
    consumption: number;
    balance: number;
    status?: string | null;
    type?: string;
};

interface AccountStatusModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    organization: OrganizationDetail | null;
    result: {
        guestId?: number;
        roomLabel: string;
        userName: string;
        expDate: string;
        checkinDate: string;
        time: string;
        totalBalance: number;
        startingCreditBalance?: number;
        entries: Entry[];
        waiver?: {
            waivedAmount: number;
            waivedBy?: number;
            waivedAt?: string;
            waiverReason?: string;
            waivedCharges?: {
                vat?: boolean;
                serviceCharge?: boolean;
                tip?: boolean;
                customCharges?: boolean;
                originalVatAmount?: number;
                originalServiceChargeAmount?: number;
                originalTipAmount?: number;
                originalCustomChargesAmount?: number;
            };
        } | null;
    };
    formatCurrency: (n: number) => string;
    onPrint: () => void;
}

const AccountStatusModal: React.FC<AccountStatusModalProps> = ({
    open,
    onOpenChange,
    organization,
    result,
    formatCurrency,
    onPrint,
}) => {
    // Helper function to format balance with correct sign
    const formatBalance = (balance: number) => {
        const safeBalance = Number(balance) || 0;
        if (safeBalance < 0) {
            // Guest owes money (outstanding balance) - display as negative
            const absBalance = Math.abs(safeBalance);
            return `-${formatCurrency(absBalance)}`;
        } else {
            // Guest has paid or has surplus - display as positive
            return formatCurrency(safeBalance);
        }
    };
    console.log('result', result);

    // Positive means guest credit; negative means the guest owes.
    const totalDeposited = result.entries.reduce(
        (sum, entry) => sum + (Number(entry.deposited) || 0),
        0,
    );
    const totalConsumption = result.entries.reduce(
        (sum, entry) => sum + entry.consumption,
        0,
    );
    const finalBalance = totalDeposited - totalConsumption;

    const handleDownloadPDF = () => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPosition = 20;
        const marginLeft = 15;
        const marginRight = 15;

        // --- Helper to format currency for PDF ---
        const formatCurrencyForPDF = (amount: string | number) => {
            const numericAmount = Number(amount);
            if (isNaN(numericAmount)) return 'NGN 0';
            return `NGN ${Math.round(numericAmount).toLocaleString('en-NG')}`;
        };

        // --- Header ---
        if (organization?.coverImage) {
            try {
                doc.addImage(
                    organization.coverImage,
                    'JPEG',
                    marginLeft,
                    yPosition - 8,
                    25,
                    25,
                );
            } catch (e) {
                console.error('Error loading logo for PDF', e);
            }
        }

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(organization?.name || 'Hotel', pageWidth / 2, yPosition, {
            align: 'center',
        });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        if (organization?.address) {
            doc.text(organization.address, pageWidth / 2, yPosition + 7, {
                align: 'center',
            });
        }
        yPosition += 30;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Account Statement', pageWidth / 2, yPosition, {
            align: 'center',
        });
        yPosition += 10;

        doc.setFontSize(10);
        const guestInfo = [
            `Name: ${result.userName}`,
            `Room: ${result.roomLabel}`,
            `Check-in: ${result.checkinDate}`,
            `Check-out: ${result.expDate}`,
        ];
        guestInfo.forEach((text, index) => {
            doc.text(text, marginLeft, yPosition + index * 6);
        });
        yPosition += guestInfo.length * 6 + 10;

        // Add waiver info to PDF if present
        if (result.waiver && Number(result.waiver.waivedAmount) > 0) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Waiver Applied', marginLeft, yPosition);
            yPosition += 6;
            doc.setFont('helvetica', 'normal');
            doc.text(
                `Waived Amount: NGN ${Number(result.waiver.waivedAmount).toLocaleString()}`,
                marginLeft,
                yPosition,
            );
            yPosition += 6;
            doc.text(
                `Waived By: ${result.waiver.waivedCharges?.waivedByName || (result.waiver.waivedBy ? `User #${result.waiver.waivedBy}` : 'N/A')}`,
                marginLeft,
                yPosition,
            );
            yPosition += 6;
            doc.text(
                `Waived At: ${result.waiver.waivedAt ? new Date(result.waiver.waivedAt).toLocaleString() : 'N/A'}`,
                marginLeft,
                yPosition,
            );
            yPosition += 6;
            if (result.waiver.waiverReason) {
                doc.text(
                    `Reason: ${result.waiver.waiverReason}`,
                    marginLeft,
                    yPosition,
                );
                yPosition += 6;
            }
            yPosition += 4;
        }

        const tableData = result.entries.map((entry, idx) => {
            const previousBalance =
                idx === 0
                    ? 0
                    : result.entries
                          .slice(0, idx)
                          .reduce(
                              (acc, e) =>
                                  acc +
                                  (Number(e.deposited) || 0) -
                                  e.consumption,
                              0,
                          );
            const currentBalance =
                previousBalance +
                (Number(entry.deposited) || 0) -
                entry.consumption;
            return [
                entry.dateTime,
                entry.details,
                entry.staff,
                formatCurrencyForPDF(entry.deposited),
                formatCurrencyForPDF(entry.consumption),
                formatCurrencyForPDF(currentBalance),
            ];
        });

        tableData.push([
            'Total Balance',
            '',
            '',
            formatCurrencyForPDF(totalDeposited),
            formatCurrencyForPDF(totalConsumption),
            formatBalance(finalBalance).replace('₦', 'NGN '),
        ]);

        autoTable(doc, {
            head: [
                [
                    'Date & Time',
                    'Details',
                    'Staff',
                    'Amount Deposited',
                    'Consumptions',
                    'Balance',
                ],
            ],
            body: tableData,
            startY: yPosition,
            theme: 'grid',
            margin: { left: marginLeft, right: marginRight },
            styles: {
                fontSize: 9,
                cellPadding: 3,
                overflow: 'linebreak',
            },
            headStyles: {
                fillColor: [240, 240, 240],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                halign: 'center',
                lineWidth: 0.1,
                lineColor: [180, 180, 180],
            },
            bodyStyles: {
                textColor: [0, 0, 0],
                valign: 'middle',
                lineWidth: 0.1,
                lineColor: [220, 220, 220],
            },
            alternateRowStyles: {
                fillColor: [250, 250, 250],
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 25 },
                1: { halign: 'left', cellWidth: 'auto' },
                2: { halign: 'center', cellWidth: 25 },
                3: { halign: 'right', cellWidth: 30 },
                4: { halign: 'right', cellWidth: 30 },
                5: { halign: 'right', cellWidth: 30 },
            },
        });

        const safeGuestName = result.userName.replace(/\s+/g, '_');
        const today = new Date().toISOString().split('T')[0];
        doc.save(`Guest_Statement_${safeGuestName}_${today}.pdf`);
    };

    const handleDownload = () => {
        const dataToDownload = result.entries.map((entry, idx) => {
            const previousBalance =
                idx === 0
                    ? 0
                    : result.entries
                          .slice(0, idx)
                          .reduce(
                              (acc, e) =>
                                  acc +
                                  e.consumption -
                                  (Number(e.deposited) || 0),
                              0,
                          );
            const currentBalance =
                previousBalance +
                entry.consumption -
                (Number(entry.deposited) || 0);

            return {
                'Date & Time': entry.dateTime,
                Details: entry.details,
                Staff: entry.staff,
                'Amount Deposited': entry.deposited,
                Consumption: entry.consumption,
                Balance: currentBalance,
            };
        });

        // Add a row for totals
        dataToDownload.push({
            'Date & Time': 'TOTALS',
            Details: '',
            Staff: '',
            'Amount Deposited': totalDeposited,
            Consumption: totalConsumption,
            Balance: finalBalance,
        });

        downloadData(
            dataToDownload,
            'csv',
            `Account_Status_${result.roomLabel}_${result.userName.replace(
                /\s+/g,
                '_',
            )}`,
        );
    };

    if (!result) return null;
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-7xl w-full max-h-[90vh] overflow-y-auto p-0">
                {/* Hotel Header - Centered - Sticky */}
                <div className="sticky top-0 z-10 bg-white pt-8 pb-6 px-8 border-b border-gray-100">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="absolute right-6 top-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="h-6 w-6 text-gray-400" />
                    </button>
                    <div className="flex flex-col items-center">
                        <Image
                            src={organization?.coverImage ?? '/anli-logo.jpg'}
                            alt="logo"
                            width={100}
                            height={100}
                            className="mb-3"
                        />
                        <h1 className="text-2xl font-semibold text-gray-900">
                            {organization?.name ?? 'Hotel'}
                        </h1>
                        <p className="text-sm text-gray-600">
                            {organization?.address ?? ''}
                        </p>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="px-8 pt-6 pb-8">
                    {/* Account Status & Total Balance */}
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Account Status
                            </h2>
                            <p className="text-sm text-gray-600">
                                Room Number: {result.roomLabel}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">
                                Total Balance:
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatBalance(finalBalance)}
                            </p>
                        </div>
                    </div>

                    {/* Guest Information Card */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#F6FAFF] border border-[#E5EEF9] rounded-lg p-4 mb-4">
                        <div className="text-sm text-gray-700">
                            <span className="font-semibold">User Name:</span>{' '}
                            {result.userName}
                        </div>
                        <div className="text-sm text-gray-700">
                            <span className="font-semibold">Exp. Dpt:</span>{' '}
                            {result.expDate}
                        </div>
                        <div className="text-sm text-gray-700">
                            <span className="font-semibold">Checkin Date:</span>{' '}
                            {result.checkinDate}
                        </div>
                        <div className="text-sm text-gray-700">
                            <span className="font-semibold">Time:</span>{' '}
                            {result.time}
                        </div>
                    </div>

                    {/* Waiver Information */}
                    {result.waiver &&
                        Number(result.waiver.waivedAmount) > 0 && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                <h3 className="text-sm font-semibold text-green-800 mb-2">
                                    Waiver Applied
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">
                                            Waived Amount:
                                        </span>
                                        <span className="ml-2 text-green-700 font-medium">
                                            -
                                            {formatCurrency(
                                                result.waiver.waivedAmount,
                                            )}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">
                                            Waived By:
                                        </span>
                                        <span className="ml-2 text-gray-700">
                                            {result.waiver?.waivedCharges
                                                ?.waivedByName ||
                                                (result.waiver?.waivedBy
                                                    ? `User #${result.waiver.waivedBy}`
                                                    : 'N/A')}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">
                                            Waived At:
                                        </span>
                                        <span className="ml-2 text-gray-700">
                                            {result.waiver.waivedAt
                                                ? new Date(
                                                      result.waiver.waivedAt,
                                                  ).toLocaleString()
                                                : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="sm:col-span-2 lg:col-span-4">
                                        <span className="font-medium text-gray-700">
                                            Waiver Reason:
                                        </span>
                                        <span className="ml-2 text-gray-700">
                                            {result.waiver.waiverReason ||
                                                'N/A'}
                                        </span>
                                    </div>
                                </div>
                                {result.waiver.waivedCharges && (
                                    <div className="mt-2 pt-2 border-t border-green-200 text-xs text-green-700">
                                        <span className="font-medium">
                                            Waived Charges:{' '}
                                        </span>
                                        {result.waiver.waivedCharges.vat &&
                                            'VAT '}
                                        {result.waiver.waivedCharges
                                            .serviceCharge && 'Service Charge '}
                                        {result.waiver.waivedCharges.tip &&
                                            'Tip '}
                                        {result.waiver.waivedCharges
                                            .customCharges && 'Custom Charges'}
                                    </div>
                                )}
                            </div>
                        )}

                    {/* Transaction Table */}
                    <div className="overflow-x-auto">
                        <TooltipProvider>
                            <table className="w-full text-sm border border-[#E5EEF9] rounded-lg overflow-hidden">
                                <thead>
                                    <tr className="bg-[#F6FAFF]">
                                        <th className="border border-[#E5EEF9] p-3 text-left font-semibold text-gray-700">
                                            <div className="flex items-center gap-1">
                                                Date & Time
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>
                                                            Transaction date and
                                                            time
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </th>
                                        <th className="border border-[#E5EEF9] p-3 text-left font-semibold text-gray-700">
                                            Details
                                        </th>
                                        <th className="border border-[#E5EEF9] p-3 text-left font-semibold text-gray-700">
                                            <div className="flex items-center gap-1">
                                                Staff
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>
                                                            Staff member who
                                                            processed this
                                                            transaction
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </th>
                                        <th className="border border-[#E5EEF9] p-3 text-right font-semibold text-gray-700">
                                            <div className="flex items-center justify-end gap-1">
                                                Amount Deposited
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>
                                                            Amount paid by guest
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </th>
                                        <th className="border border-[#E5EEF9] p-3 text-right font-semibold text-gray-700">
                                            <div className="flex items-center justify-end gap-1">
                                                Consumptions
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>
                                                            Amount spent on
                                                            services
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </th>
                                        <th className="border border-[#E5EEF9] p-3 text-right font-semibold text-gray-700">
                                            <div className="flex items-center justify-end gap-1">
                                                Balance
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>
                                                            Running balance
                                                            after this
                                                            transaction
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.entries.map((row, idx) => {
                                        // Running balance starts from 0 and accumulates
                                        // consumption - deposited for each transaction.
                                        const previousBalance =
                                            idx === 0
                                                ? 0
                                                : result.entries
                                                      .slice(0, idx)
                                                      .reduce(
                                                          (acc, entry) =>
                                                              acc +
                                                              entry.consumption -
                                                              (Number(
                                                                  entry.deposited,
                                                              ) || 0),
                                                          0,
                                                      );
                                        const currentBalance =
                                            previousBalance +
                                            row.consumption -
                                            (Number(row.deposited) || 0);

                                        return (
                                            <tr
                                                key={idx}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="border border-[#E5EEF9] p-3 text-gray-700">
                                                    <div className="flex flex-col leading-tight">
                                                        <span className="font-medium">
                                                            {
                                                                row.dateTime.split(
                                                                    ' ',
                                                                )[0]
                                                            }
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {row.dateTime
                                                                .split(' ')
                                                                .slice(1)
                                                                .join(' ')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="border border-[#E5EEF9] p-3 text-gray-700">
                                                    <div className="flex items-center gap-2">
                                                        {row.type ===
                                                            'auto_billed' && (
                                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                                Auto-Billed
                                                            </span>
                                                        )}
                                                        <span>
                                                            {row.details}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="border border-[#E5EEF9] p-3 text-gray-700">
                                                    {row.staff}
                                                </td>
                                                <td className="border border-[#E5EEF9] p-3 text-right text-gray-700">
                                                    {formatCurrency(
                                                        row.deposited,
                                                    )}
                                                </td>
                                                <td className="border border-[#E5EEF9] p-3 text-right text-gray-700">
                                                    {formatCurrency(
                                                        row.consumption,
                                                    )}
                                                </td>
                                                <td className="border border-[#E5EEF9] p-3 text-right text-gray-700">
                                                    {formatCurrency(
                                                        currentBalance,
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {/* Total Balance Row */}
                                    <tr className="bg-gray-50 font-semibold">
                                        <td className="border border-[#E5EEF9] p-3 text-gray-900">
                                            Total Balance
                                        </td>
                                        <td className="border border-[#E5EEF9] p-3"></td>
                                        <td className="border border-[#E5EEF9] p-3"></td>
                                        <td className="border border-[#E5EEF9] p-3 text-right text-gray-900">
                                            {formatCurrency(totalDeposited)}
                                        </td>
                                        <td className="border border-[#E5EEF9] p-3 text-right text-gray-900">
                                            {formatCurrency(totalConsumption)}
                                        </td>
                                        <td className="border border-[#E5EEF9] p-3 text-right text-gray-900">
                                            {formatBalance(finalBalance)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </TooltipProvider>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-end gap-3">
                        <BrandButton
                            onClick={() => onOpenChange(false)}
                            className="px-6 bg-gray-200 border border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </BrandButton>
                        <BrandButton
                            onClick={handleDownload}
                            className="px-6 bg-white border border-orion-blue text-orion-blue hover:bg-blue-50"
                            icon={<Download className="h-4 w-4" />}
                        >
                            Download (CSV)
                        </BrandButton>
                        <BrandButton
                            onClick={handleDownloadPDF}
                            className="px-6 bg-orion-blue text-white hover:bg-blue-700"
                            icon={<Download className="h-4 w-4" />}
                        >
                            Download (PDF)
                        </BrandButton>
                        <BrandButton className="px-10" onClick={onPrint}>
                            Print
                        </BrandButton>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AccountStatusModal;
