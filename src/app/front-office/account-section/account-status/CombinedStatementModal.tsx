'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import Image from 'next/image';
import React from 'react';
import { X, Download, Printer, Calendar, FileText, Bed } from 'lucide-react';
import { OrganizationDetail } from '@/hooks/useHotel';
import BrandButton from '@/components/common/Button';
import { downloadData } from '@/lib/downloadData';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Stay {
    guestId: number;
    bookingCode: string;
    roomNumber: string;
    dateDisplay: string;
    status: string;
    isInHouse: boolean;
    startDate: string;
    endDate: string;
    fullName: string;
}

interface Entry {
    dateTime: string;
    details: string;
    staff: string;
    deposited: number;
    consumption: number;
    balance: number;
    status?: string | null;
    type?: string;
}

interface StayAccountData {
    roomLabel: string;
    userName: string;
    expDate: string;
    checkinDate: string;
    time: string;
    totalBalance: number;
    startingCreditBalance?: number;
    entries: Entry[];
}

interface CombinedStatementModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    organization: OrganizationDetail | null;
    guestName: string;
    filterStartDate: string;
    filterEndDate: string;
    compiledResults: { stay: Stay; accountData: StayAccountData }[];
    formatCurrency: (n: number) => string;
    onPrint: () => void;
}

const CombinedStatementModal: React.FC<CombinedStatementModalProps> = ({
    open,
    onOpenChange,
    organization,
    guestName,
    filterStartDate,
    filterEndDate,
    compiledResults,
    formatCurrency,
    onPrint,
}) => {
    // Helper function to format balance with correct sign as in AccountStatusModal
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

    // Calculate total summary metrics
    const totalCharges = compiledResults.reduce((sum, item) => {
        const stayCharges = item.accountData.entries.reduce(
            (s, entry) => s + (Number(entry.consumption) || 0),
            0,
        );
        return sum + stayCharges;
    }, 0);

    const totalPaid = compiledResults.reduce((sum, item) => {
        const stayPaid = item.accountData.entries.reduce(
            (s, entry) => s + (Number(entry.deposited) || 0),
            0,
        );
        return sum + stayPaid;
    }, 0);

    // netBalance is his current balance in his guest credit account
    const grandBalance =
        compiledResults.length > 0
            ? Number(
                  compiledResults[compiledResults.length - 1].accountData
                      .totalBalance,
              ) || 0
            : 0;
    const grandOutstanding = grandBalance < 0 ? Math.abs(grandBalance) : 0;

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

        const formatCurrencyForPDF = (amount: string | number) => {
            const numericAmount = Number(amount);
            if (isNaN(numericAmount)) return 'NGN 0';
            return `NGN ${Math.round(numericAmount).toLocaleString('en-NG')}`;
        };

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
        doc.text('Combined Account Statement', pageWidth / 2, yPosition, {
            align: 'center',
        });
        yPosition += 10;

        doc.setFontSize(10);
        doc.text(`Guest: ${guestName}`, marginLeft, yPosition);
        yPosition += 6;
        if (filterStartDate && filterEndDate) {
            doc.text(
                `Period: ${formatDateString(filterStartDate)} - ${formatDateString(filterEndDate)}`,
                marginLeft,
                yPosition,
            );
            yPosition += 6;
        }
        yPosition += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('GRAND TOTALS:', marginLeft, yPosition);
        yPosition += 6;
        doc.setFont('helvetica', 'normal');
        doc.text(
            `Stays: ${compiledResults.length}`,
            marginLeft + 80,
            yPosition,
        );
        doc.text(
            `Total Charges: ${formatCurrencyForPDF(totalCharges)}`,
            marginLeft + 130,
            yPosition,
        );
        doc.text(
            `Total Paid: ${formatCurrencyForPDF(totalPaid)}`,
            marginLeft + 200,
            yPosition,
        );
        doc.text(
            `Net Balance: ${formatBalance(grandBalance).replace('₦', 'NGN ')}`,
            pageWidth - marginRight,
            yPosition,
            { align: 'right' },
        );
        yPosition += 15;

        compiledResults.forEach(({ stay, accountData }, stayIdx) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text(
                `STAY #${stayIdx + 1}: Room ${stay.roomNumber} - ${stay.dateDisplay}`,
                marginLeft,
                yPosition,
            );
            if (stay.bookingCode) {
                doc.text(
                    `Booking: ${stay.bookingCode}`,
                    pageWidth - marginRight,
                    yPosition,
                    { align: 'right' },
                );
            }
            yPosition += 8;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(
                `Check-in: ${formatDateString(stay.startDate)}`,
                marginLeft,
                yPosition,
            );
            doc.text(
                `Check-out: ${formatDateString(stay.endDate)}`,
                marginLeft + 80,
                yPosition,
            );
            yPosition += 10;

            const tableData = accountData.entries.map((entry) => {
                return [
                    entry.dateTime,
                    entry.details,
                    entry.staff,
                    entry.deposited > 0
                        ? formatCurrencyForPDF(entry.deposited)
                        : '',
                    entry.consumption > 0
                        ? formatCurrencyForPDF(entry.consumption)
                        : '',
                ];
            });

            autoTable(doc, {
                head: [
                    [
                        'Date & Time',
                        'Details',
                        'Staff',
                        'Deposited',
                        'Consumptions',
                    ],
                ],
                body: tableData,
                startY: yPosition,
                theme: 'grid',
                margin: { left: marginLeft, right: marginRight },
                styles: {
                    fontSize: 8,
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
                },
            });

            const stayCharges = accountData.entries.reduce(
                (s, entry) => s + (Number(entry.consumption) || 0),
                0,
            );
            const stayPaid = accountData.entries.reduce(
                (s, entry) => s + (Number(entry.deposited) || 0),
                0,
            );
            const finalY = (doc as any).lastAutoTable.finalY || yPosition + 20;
            yPosition = finalY + 8;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text('Stay Subtotal:', marginLeft, yPosition + 4);
            doc.text(
                `Charges: ${formatCurrencyForPDF(stayCharges)}`,
                marginLeft + 70,
                yPosition + 4,
            );
            doc.text(
                `Paid: ${formatCurrencyForPDF(stayPaid)}`,
                marginLeft + 130,
                yPosition + 4,
            );
            const stayOutstanding = Math.max(0, stayCharges - stayPaid);
            const stayBalance = Math.max(0, stayPaid - stayCharges);
            doc.text(
                `Outstanding: ${formatCurrencyForPDF(stayOutstanding)} | Balance: ${formatCurrencyForPDF(stayBalance)}`,
                pageWidth - marginRight,
                yPosition + 4,
                { align: 'right' },
            );
            yPosition += 20;

            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }
        });

        const safeGuestName = guestName.replace(/\s+/g, '_');
        const today = new Date().toISOString().split('T')[0];
        doc.save(`Combined_Guest_Statement_${safeGuestName}_${today}.pdf`);
    };

    const handleDownload = () => {
        const dataToDownload: any[] = [];

        const formatCsvBalance = (val: number) => {
            return Number(val) || 0;
        };

        compiledResults.forEach(({ stay, accountData }) => {
            // Add a header row for this stay
            dataToDownload.push({
                'Date & Time': `STAY: ${stay.dateDisplay} (Room ${stay.roomNumber})`,
                Details: `Booking Code: ${stay.bookingCode || 'N/A'}`,
                Staff: '',
                'Amount Deposited': '',
                Consumption: '',
                Balance: '',
            });

            let runningBalance = 0;

            accountData.entries.forEach((entry) => {
                runningBalance =
                    runningBalance +
                    (Number(entry.deposited) || 0) -
                    (Number(entry.consumption) || 0);
                dataToDownload.push({
                    'Date & Time': entry.dateTime,
                    Details: entry.details,
                    Staff: entry.staff,
                    'Amount Deposited': entry.deposited,
                    Consumption: entry.consumption,
                    Balance: runningBalance,
                });
            });

            // Add a subtotal row for this stay
            const stayTotalCharges = accountData.entries.reduce(
                (s, e) => s + (Number(e.consumption) || 0),
                0,
            );
            const stayTotalPaid = accountData.entries.reduce(
                (s, e) => s + (Number(e.deposited) || 0),
                0,
            );
            const stayCsvOutstanding = Math.max(
                0,
                stayTotalCharges - stayTotalPaid,
            );
            const stayCsvBalance = Math.max(
                0,
                stayTotalPaid - stayTotalCharges,
            );

            dataToDownload.push({
                'Date & Time': `Stay Subtotal`,
                Details: `Charges: ${stayTotalCharges} | Paid: ${stayTotalPaid} | Outstanding: ${stayCsvOutstanding} | Balance: ${stayCsvBalance}`,
                Staff: '',
                'Amount Deposited': stayTotalPaid,
                Consumption: stayTotalCharges,
                Balance: stayCsvBalance,
            });

            // Add a blank row between stays
            dataToDownload.push({
                'Date & Time': '',
                Details: '',
                Staff: '',
                'Amount Deposited': '',
                Consumption: '',
                Balance: '',
            });
        });

        // Add a final summary row
        dataToDownload.push({
            'Date & Time': 'GRAND TOTALS',
            Details: `Stays Compiled: ${compiledResults.length}`,
            Staff: '',
            'Amount Deposited': totalPaid,
            Consumption: totalCharges,
            Balance: grandBalance,
        });

        downloadData(
            dataToDownload,
            'csv',
            `Combined_Statement_${guestName.replace(/\s+/g, '_')}`,
        );
    };

    const formatDateString = (dStr: string) => {
        if (!dStr) return '';
        return new Date(dStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-7xl w-full max-h-[90vh] overflow-y-auto p-0 flex flex-col">
                {/* Sticky Header Section */}
                <div className="sticky top-0 z-10 bg-white pt-6 pb-4 px-8 border-b border-gray-200">
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
                            width={80}
                            height={80}
                            className="mb-2"
                        />
                        <h1 className="text-xl font-bold text-gray-900">
                            {organization?.name ?? 'Hotel'}
                        </h1>
                        <p className="text-xs text-gray-500">
                            {organization?.address ?? ''}
                        </p>
                    </div>
                </div>

                {/* Main Scrollable Content */}
                <div className="px-8 py-6 overflow-y-auto flex-1">
                    {/* Header Info */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-orange-500" />
                                Combined Account Statement
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Guest:{' '}
                                <span className="font-semibold text-gray-900">
                                    {guestName}
                                </span>
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {filterStartDate && filterEndDate ? (
                                    <span>
                                        Period:{' '}
                                        {formatDateString(filterStartDate)}{' '}
                                        &ndash;{' '}
                                        {formatDateString(filterEndDate)}
                                    </span>
                                ) : (
                                    <span>
                                        Complete Stay &amp; Transaction History
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* High-density Total Summary Cards */}
                        <div className="flex gap-4">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center min-w-[110px]">
                                <span className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                    Stays
                                </span>
                                <span className="text-lg font-bold text-gray-900">
                                    {compiledResults.length}
                                </span>
                            </div>
                            <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-center min-w-[120px]">
                                <span className="block text-[10px] font-semibold text-orange-600 uppercase tracking-wider">
                                    Total Charges
                                </span>
                                <span className="text-lg font-bold text-orange-700">
                                    {formatCurrency(totalCharges)}
                                </span>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-center min-w-[120px]">
                                <span className="block text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                                    Total Paid
                                </span>
                                <span className="text-lg font-bold text-emerald-700">
                                    {formatCurrency(totalPaid)}
                                </span>
                            </div>
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center min-w-[130px]">
                                <span className="block text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
                                    Outstanding
                                </span>
                                <span className="text-lg font-bold text-blue-700">
                                    {formatCurrency(grandOutstanding)}
                                </span>
                            </div>
                            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 text-center min-w-[130px]">
                                <span className="block text-[10px] font-semibold text-purple-600 uppercase tracking-wider">
                                    Net Balance
                                </span>
                                <span className="text-lg font-bold text-purple-700">
                                    {formatBalance(grandBalance)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stay-by-Stay Continuous Document */}
                    <div className="space-y-10">
                        {compiledResults.map(
                            ({ stay, accountData }, stayIdx) => {
                                const stayCharges = accountData.entries.reduce(
                                    (s, entry) =>
                                        s + (Number(entry.consumption) || 0),
                                    0,
                                );
                                const stayPaid = accountData.entries.reduce(
                                    (s, entry) =>
                                        s + (Number(entry.deposited) || 0),
                                    0,
                                );
                                const stayOutstanding = stayPaid - stayCharges; // positive for credit, negative for owing

                                return (
                                    <div
                                        key={stay.guestId}
                                        className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white"
                                    >
                                        {/* Stay Details Banner */}
                                        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                                                    <Bed className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500 font-medium">
                                                        STAY #{stayIdx + 1}
                                                    </span>
                                                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                        Room {stay.roomNumber}{' '}
                                                        &middot;{' '}
                                                        {stay.dateDisplay}
                                                        {stay.isInHouse && (
                                                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                                                                In House
                                                            </span>
                                                        )}
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                                                <div>
                                                    <span className="font-semibold text-gray-800">
                                                        Booking:
                                                    </span>{' '}
                                                    <span className="font-mono">
                                                        {stay.bookingCode ||
                                                            'N/A'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-gray-800">
                                                        Checkin:
                                                    </span>{' '}
                                                    {formatDateString(
                                                        stay.startDate,
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-gray-800">
                                                        Checkout:
                                                    </span>{' '}
                                                    {formatDateString(
                                                        stay.endDate,
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stay Transactions Table */}
                                        <div className="p-0 overflow-x-auto">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="bg-gray-50/50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-left">
                                                        <th className="p-3 w-[150px]">
                                                            Date & Time
                                                        </th>
                                                        <th className="p-3">
                                                            Details
                                                        </th>
                                                        <th className="p-3 w-[120px]">
                                                            Staff
                                                        </th>
                                                        <th className="p-3 w-[110px] text-right">
                                                            Deposited
                                                        </th>
                                                        <th className="p-3 w-[110px] text-right">
                                                            Consumptions
                                                        </th>
                                                        <th className="p-3 w-[110px] text-right">
                                                            Balance
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                                    {(() => {
                                                        let runningBalance = 0;
                                                        return accountData.entries.map(
                                                            (entry, idx) => {
                                                                runningBalance =
                                                                    runningBalance +
                                                                    (Number(
                                                                        entry.deposited,
                                                                    ) || 0) -
                                                                    (Number(
                                                                        entry.consumption,
                                                                    ) || 0);
                                                                return (
                                                                    <tr
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="hover:bg-gray-50/30"
                                                                    >
                                                                        <td className="p-3 font-medium text-gray-500">
                                                                            {
                                                                                entry.dateTime
                                                                            }
                                                                        </td>
                                                                        <td className="p-3">
                                                                            <div className="flex items-center gap-2 font-medium text-gray-900">
                                                                                {entry.type === 'auto_billed' && (
                                                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-800 shrink-0">
                                                                                        Auto-Billed
                                                                                    </span>
                                                                                )}
                                                                                <span>{entry.details}</span>
                                                                            </div>
                                                                            {entry.status && (
                                                                                <span
                                                                                    className={`inline-block mt-0.5 text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                                                                                        entry.status ===
                                                                                        'Paid'
                                                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                                                            : 'bg-orange-50 text-orange-700 border border-orange-100'
                                                                                    }`}
                                                                                >
                                                                                    {
                                                                                        entry.status
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                        </td>
                                                                        <td className="p-3 text-gray-500">
                                                                            {
                                                                                entry.staff
                                                                            }
                                                                        </td>
                                                                        <td className="p-3 text-right font-semibold text-emerald-600">
                                                                            {entry.deposited >
                                                                            0
                                                                                ? formatCurrency(
                                                                                      entry.deposited,
                                                                                  )
                                                                                : '—'}
                                                                        </td>
                                                                        <td className="p-3 text-right font-semibold text-orange-600">
                                                                            {entry.consumption >
                                                                            0
                                                                                ? formatCurrency(
                                                                                      entry.consumption,
                                                                                  )
                                                                                : '—'}
                                                                        </td>
                                                                        <td className="p-3 text-right font-mono font-medium">
                                                                            {formatBalance(
                                                                                runningBalance,
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            },
                                                        );
                                                    })()}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Stay Subtotals Footer Banner */}
                                        <div className="bg-gray-50/40 border-t border-gray-100 px-6 py-3.5 flex flex-wrap justify-end gap-x-6 gap-y-2 text-xs font-semibold">
                                            <div className="text-gray-500">
                                                Stay Subtotal:
                                            </div>
                                            <div className="text-orange-700">
                                                Charges:{' '}
                                                <span className="font-bold">
                                                    {formatCurrency(
                                                        stayCharges,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="text-emerald-700">
                                                Paid:{' '}
                                                <span className="font-bold">
                                                    {formatCurrency(stayPaid)}
                                                </span>
                                            </div>
                                            <div className="text-blue-700 border-l border-gray-200 pl-4">
                                                Outstanding:{' '}
                                                <span className="font-bold">
                                                    {formatCurrency(
                                                        Math.max(
                                                            0,
                                                            stayCharges -
                                                                stayPaid,
                                                        ),
                                                    )}
                                                </span>
                                            </div>
                                            <div className="text-purple-700 border-l border-gray-200 pl-4">
                                                Balance:{' '}
                                                <span className="font-bold">
                                                    {formatCurrency(
                                                        Math.max(
                                                            0,
                                                            stayPaid -
                                                                stayCharges,
                                                        ),
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            },
                        )}
                    </div>
                </div>

                {/* Sticky Action Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-4 flex justify-end gap-3 z-10">
                    <BrandButton
                        onClick={() => onOpenChange(false)}
                        className="px-6 bg-gray-200 border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                        Close
                    </BrandButton>
                    <BrandButton
                        onClick={handleDownload}
                        className="px-6 bg-white border border-orion-blue text-orion-blue hover:bg-blue-50"
                        icon={<Download className="h-4 w-4" />}
                    >
                        Export CSV
                    </BrandButton>
                    <BrandButton
                        onClick={handleDownloadPDF}
                        className="px-6 bg-orion-blue text-white hover:bg-blue-700"
                        icon={<Download className="h-4 w-4" />}
                    >
                        Download PDF
                    </BrandButton>
                    <BrandButton
                        className="px-8"
                        onClick={onPrint}
                        icon={<Printer className="h-4 w-4 mr-1.5" />}
                    >
                        Print Statement
                    </BrandButton>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CombinedStatementModal;
