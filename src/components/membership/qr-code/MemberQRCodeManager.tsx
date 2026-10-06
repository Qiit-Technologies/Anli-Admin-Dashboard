'use client';

import {
    getPrintOptimizedMemberQrCode,
    sendMemberQrCodeByEmail,
} from '@/app/actions/membership';
import BrandButton from '@/components/common/Button';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useMemberQRCode } from '@/hooks/useMemberQRCode';
import {
    formatReferralCode,
    getMemberQrPrintLabel,
    isReferralMember,
} from '@/lib/membership/member-utils';
import { Member } from '@/types/membership/membership';
import {
    Download,
    Eye,
    Loader2,
    Mail,
    Printer,
    QrCode,
    RefreshCw,
} from 'lucide-react';
import Image from 'next/image';
import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface MemberQRCodeManagerProps {
    member: Member;
    onQrCodeGenerated?: (qrCode: string) => void;
}

type QRSize = 'id-card' | 'badge' | 'full-page';

const QR_SIZE_OPTIONS = {
    'id-card': {
        label: 'ID Card',
        size: 220,
        description: 'Compact size for ID cards',
    },
    badge: { label: 'Badge', size: 240, description: 'Medium size for badges' },
    'full-page': {
        label: 'Full Page',
        size: 400,
        description: 'Large size for full page printing',
    },
};

const MemberQRCodeManager: React.FC<MemberQRCodeManagerProps> = ({
    member,
    onQrCodeGenerated,
}) => {
    const [showQrModal, setShowQrModal] = useState(false);
    const [showPrintPreview, setShowPrintPreview] = useState(false);
    const [selectedSize, setSelectedSize] = useState<QRSize>('badge');
    const [emailLoading, setEmailLoading] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const { qrCode, loading, fetching, generateQR, downloadQR } =
        useMemberQRCode(member.id);

    const isReferral = isReferralMember(member);
    const printRoleLabel = getMemberQrPrintLabel(member);
    const referralCode = isReferral ? formatReferralCode(member.id) : null;
    const principalName = member.planOwner
        ? `${member.planOwner.firstName} ${member.planOwner.lastName}`.trim()
        : null;

    const handleGenerateQrCode = async () => {
        const newQrCode = await generateQR();
        if (newQrCode) {
            onQrCodeGenerated?.(newQrCode);
        }
    };

    const handleDownloadQR = async () => {
        const memberName = `${member.firstName}_${member.lastName}`;
        const sizeInfo = QR_SIZE_OPTIONS[selectedSize];
        const printSizeByQrSize: Record<QRSize, 'small' | 'medium' | 'large'> =
            {
                'id-card': 'small',
                badge: 'medium',
                'full-page': 'large',
            };
        await downloadQR(
            `${memberName}_${sizeInfo.label.toLowerCase().replace(' ', '_')}`,
            printSizeByQrSize[selectedSize],
        );
    };

    const handleEmailQR = async () => {
        if (!member.email) {
            toast.error('Member email not available');
            return;
        }

        setEmailLoading(true);
        try {
            const result = await sendMemberQrCodeByEmail(member.id);

            if (result.success) {
                toast.success(
                    result.message ||
                        'QR code sent to member email successfully',
                );
            } else {
                toast.error(result.error || 'Failed to send QR code email');
            }
        } catch (error: any) {
            console.error('Error sending QR code email:', error);
            toast.error('Failed to send QR code email');
        } finally {
            setEmailLoading(false);
        }
    };

    const handlePrintPreview = () => {
        setShowPrintPreview(true);
    };

    const handlePrintQR = async () => {
        if (!printRef.current) return;

        try {
            const sizeMapping = {
                'id-card': 'small' as const,
                badge: 'medium' as const,
                'full-page': 'large' as const,
            };

            const printSize = sizeMapping[selectedSize];
            const result = await getPrintOptimizedMemberQrCode(
                member.id,
                printSize,
            );

            if (!result.success || !result.qrCode) {
                toast.error('Failed to get print-optimized QR code');
                return;
            }

            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                toast.error('Please allow popups to print QR code');
                return;
            }

            const sizeInfo = QR_SIZE_OPTIONS[selectedSize];
            const qrSize = sizeInfo.size;

            const expiryDate = member.endDate
                ? new Date(member.endDate).toLocaleDateString()
                : 'No expiry';
            const isExpired = member.endDate
                ? new Date(member.endDate) < new Date()
                : false;

            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Member QR Code - ${member.firstName} ${member.lastName}</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            min-height: 100vh;
                            margin: 0;
                            padding: 20px;
                            background: white;
                        }
                        .qr-container {
                            text-align: center;
                            border: 2px solid #e5e7eb;
                            border-radius: 12px;
                            padding: ${selectedSize === 'id-card' ? '15px' : selectedSize === 'badge' ? '25px' : '40px'};
                            background: #fafafa;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                            max-width: ${selectedSize === 'id-card' ? '280px' : selectedSize === 'badge' ? '350px' : '500px'};
                        }
                        .qr-image {
                            border: 1px solid #d1d5db;
                            border-radius: 8px;
                            margin: ${selectedSize === 'id-card' ? '10px 0' : '20px 0'};
                            image-rendering: -webkit-optimize-contrast;
                            image-rendering: crisp-edges;
                        }
                        .member-name {
                            font-size: ${selectedSize === 'id-card' ? '16px' : selectedSize === 'badge' ? '20px' : '28px'};
                            font-weight: bold;
                            color: #1f2937;
                            margin-bottom: ${selectedSize === 'id-card' ? '4px' : '8px'};
                        }
                        .member-id {
                            font-size: ${selectedSize === 'id-card' ? '10px' : selectedSize === 'badge' ? '12px' : '16px'};
                            color: #6b7280;
                            margin-bottom: ${selectedSize === 'id-card' ? '10px' : '15px'};
                        }
                        .member-plan {
                            font-size: ${selectedSize === 'id-card' ? '9px' : selectedSize === 'badge' ? '11px' : '14px'};
                            color: #4b5563;
                            margin-bottom: ${selectedSize === 'id-card' ? '8px' : '12px'};
                        }
                        .expiry-info {
                            font-size: ${selectedSize === 'id-card' ? '8px' : selectedSize === 'badge' ? '10px' : '12px'};
                            color: ${isExpired ? '#dc2626' : '#059669'};
                            font-weight: ${isExpired ? 'bold' : 'normal'};
                            margin-top: ${selectedSize === 'id-card' ? '8px' : '12px'};
                        }
                        .footer {
                            font-size: ${selectedSize === 'id-card' ? '7px' : selectedSize === 'badge' ? '9px' : '11px'};
                            color: #9ca3af;
                            margin-top: ${selectedSize === 'id-card' ? '8px' : '15px'};
                        }
                        .print-optimized {
                            font-size: ${selectedSize === 'id-card' ? '6px' : selectedSize === 'badge' ? '8px' : '10px'};
                            color: #10b981;
                            margin-top: 5px;
                        }
                        .role-banner {
                            font-size: ${selectedSize === 'id-card' ? '9px' : selectedSize === 'badge' ? '11px' : '14px'};
                            font-weight: 700;
                            text-transform: uppercase;
                            letter-spacing: 0.04em;
                            color: ${isReferral ? '#b45309' : '#1e40af'};
                            margin-bottom: ${selectedSize === 'id-card' ? '6px' : '10px'};
                        }
                        .role-detail {
                            font-size: ${selectedSize === 'id-card' ? '8px' : selectedSize === 'badge' ? '10px' : '12px'};
                            color: #6b7280;
                            margin-bottom: 6px;
                        }
                        @media print {
                            body { margin: 0; }
                            .qr-container { 
                                border: 2px solid #000; 
                                box-shadow: none;
                            }
                            .qr-image {
                                image-rendering: -webkit-optimize-contrast;
                                image-rendering: crisp-edges;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="qr-container">
                        <div class="role-banner">${printRoleLabel}</div>
                        ${isReferral && referralCode ? `<div class="role-detail">Code: ${referralCode}</div>` : ''}
                        ${isReferral && principalName ? `<div class="role-detail">Principal: ${principalName}</div>` : ''}
                        ${isReferral ? `<div class="role-detail">No discount on referral membership</div>` : ''}
                        <div class="member-name">${member.firstName} ${member.lastName}</div>
                        <div class="member-id">Member ID: ${member.id}</div>
                        ${member.plan?.name ? `<div class="member-plan">Plan: ${member.plan.name}</div>` : ''}
                        <img src="${result.qrCode}" alt="Member QR Code" class="qr-image" width="${qrSize}" height="${qrSize}" />
                        <div class="expiry-info">
                            ${isExpired ? 'Membership expired' : 'Valid until'}: ${expiryDate}
                        </div>
                        <div class="print-optimized">✓ Print Optimized (${printSize})</div>
                        <div class="footer">Generated on ${new Date().toLocaleDateString()}</div>
                    </div>
                </body>
                </html>
            `;

            printWindow.document.write(printContent);
            printWindow.document.close();

            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 500);
            };

            toast.success(
                `Print-optimized QR code (${sizeInfo.label}) sent to printer!`,
            );
            setShowPrintPreview(false);
        } catch (error: any) {
            console.error('Error printing QR code:', error);
            toast.error('Failed to print QR code');
        }
    };

    const currentSizeInfo = QR_SIZE_OPTIONS[selectedSize];

    return (
        <>
            <div className="border-t pt-4">
                <div className="flex flex-col md:flex-row gap-4 w-full md:gap-0 items-center justify-between">
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            QR Code
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-gray-600">
                                {fetching
                                    ? 'Loading...'
                                    : qrCode
                                      ? 'Generated'
                                      : 'Not generated'}
                            </p>
                            {fetching && (
                                <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:flex md:items-center gap-2">
                        {qrCode && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowQrModal(true)}
                                    className="text-xs w-full"
                                    disabled={fetching}
                                >
                                    <Eye className="w-3 h-3 mr-1" />
                                    View
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDownloadQR}
                                    className="text-xs w-full"
                                    disabled={fetching}
                                >
                                    <Download className="w-3 h-3 mr-1" />
                                    Download
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleEmailQR}
                                    className="text-xs w-full"
                                    disabled={
                                        fetching ||
                                        emailLoading ||
                                        !member.email
                                    }
                                >
                                    {emailLoading ? (
                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    ) : (
                                        <Mail className="w-3 h-3 mr-1" />
                                    )}
                                    Email
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrintPreview}
                                    className="text-xs w-full"
                                    disabled={fetching}
                                >
                                    <Printer className="w-3 h-3 mr-1" />
                                    Print
                                </Button>
                            </>
                        )}
                        <BrandButton
                            onClick={handleGenerateQrCode}
                            loading={loading}
                            icon={
                                loading ? (
                                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                ) : (
                                    <QrCode className="w-3 h-3 mr-1" />
                                )
                            }
                            disabled={loading || fetching}
                            size="sm"
                            className="w-full"
                        >
                            {qrCode ? 'Regenerate' : 'Generate'}
                        </BrandButton>
                    </div>
                </div>
            </div>

            {/* QR Code View Modal */}
            <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <QrCode className="w-5 h-5" />
                            Member QR Code
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col items-center space-y-4 py-4">
                        <div className="flex flex-col items-center space-y-4 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            {qrCode && (
                                <Image
                                    src={qrCode}
                                    alt="Member QR Code"
                                    width={currentSizeInfo.size}
                                    height={currentSizeInfo.size}
                                    className="rounded border shadow-sm"
                                />
                            )}
                            <div className="text-center">
                                <p
                                    className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
                                        isReferral
                                            ? 'text-amber-700'
                                            : 'text-blue-700'
                                    }`}
                                >
                                    {printRoleLabel}
                                </p>
                                <p className="font-semibold text-gray-900">
                                    {member.firstName} {member.lastName}
                                </p>
                                {isReferral && referralCode && (
                                    <p className="text-xs text-amber-700 mt-1 font-mono">
                                        {referralCode}
                                    </p>
                                )}
                                {isReferral && principalName && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Principal: {principalName}
                                    </p>
                                )}
                                <p className="text-sm text-gray-500">
                                    ID: {member.id}
                                </p>
                                {member.plan?.name && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        Plan: {member.plan.name}
                                    </p>
                                )}
                                {member.endDate && (
                                    <p
                                        className={`text-xs mt-1 ${
                                            new Date(member.endDate) <
                                            new Date()
                                                ? 'text-red-600 font-semibold'
                                                : 'text-green-600'
                                        }`}
                                    >
                                        {new Date(member.endDate) < new Date()
                                            ? 'Membership expired'
                                            : 'Valid until'}
                                        :{' '}
                                        {new Date(
                                            member.endDate,
                                        ).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2 w-full">
                            <Button
                                variant="outline"
                                onClick={handleDownloadQR}
                                className="flex-1"
                                disabled={fetching}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleEmailQR}
                                className="flex-1"
                                disabled={
                                    fetching || emailLoading || !member.email
                                }
                            >
                                {emailLoading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Mail className="w-4 h-4 mr-2" />
                                )}
                                Email
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handlePrintPreview}
                                className="flex-1"
                                disabled={fetching}
                            >
                                <Printer className="w-4 h-4 mr-2" />
                                Print
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Print Preview Modal */}
            <Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Printer className="w-5 h-5" />
                            Print Preview
                        </DialogTitle>
                    </DialogHeader>

                    <p
                        className={`text-sm font-semibold rounded-md px-3 py-2 ${
                            isReferral
                                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                                : 'bg-blue-50 text-blue-900 border border-blue-200'
                        }`}
                    >
                        Printing QR for: {printRoleLabel}
                        {isReferral && referralCode
                            ? ` · ${referralCode}`
                            : ''}
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Print Size
                            </label>
                            <Select
                                value={selectedSize}
                                onValueChange={(value: QRSize) =>
                                    setSelectedSize(value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(QR_SIZE_OPTIONS).map(
                                        ([key, option]) => (
                                            <SelectItem key={key} value={key}>
                                                <div className="flex flex-col">
                                                    <span>{option.label}</span>
                                                    <span className="text-xs text-gray-500">
                                                        {option.description}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="border rounded-lg p-4 bg-gray-50">
                            <div
                                ref={printRef}
                                className="flex flex-col items-center space-y-2 text-center"
                            >
                                <h3 className="font-semibold text-gray-900">
                                    {member.firstName} {member.lastName}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    ID: {member.id}
                                </p>
                                {member.plan?.name && (
                                    <p className="text-xs text-gray-500">
                                        Plan: {member.plan.name}
                                    </p>
                                )}
                                {qrCode && (
                                    <Image
                                        src={qrCode}
                                        alt="Member QR Code"
                                        width={Math.min(
                                            currentSizeInfo.size,
                                            200,
                                        )}
                                        height={Math.min(
                                            currentSizeInfo.size,
                                            200,
                                        )}
                                        className="rounded border shadow-sm"
                                    />
                                )}
                                {member.endDate && (
                                    <p
                                        className={`text-xs ${
                                            new Date(member.endDate) <
                                            new Date()
                                                ? 'text-red-600 font-semibold'
                                                : 'text-green-600'
                                        }`}
                                    >
                                        {new Date(member.endDate) < new Date()
                                            ? 'Membership expired'
                                            : 'Valid until'}
                                        :{' '}
                                        {new Date(
                                            member.endDate,
                                        ).toLocaleDateString()}
                                    </p>
                                )}
                                <p className="text-xs text-gray-400">
                                    Generated on{' '}
                                    {new Date().toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowPrintPreview(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handlePrintQR}
                                className="flex-1"
                                disabled={!qrCode}
                            >
                                <Printer className="w-4 h-4 mr-2" />
                                Print {currentSizeInfo.label}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default MemberQRCodeManager;
