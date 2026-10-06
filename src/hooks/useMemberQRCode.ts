'use client';

import {
    generateMemberQrCode,
    getMemberQrCode,
    getPrintOptimizedMemberQrCode,
} from '@/app/actions/membership';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export const useMemberQRCode = (memberId: string) => {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        const fetchExistingQR = async () => {
            setFetching(true);
            try {
                const result = await getMemberQrCode(memberId);
                if (result.success && result.qrCode) {
                    setQrCode(result.qrCode);
                }
            } catch (error: any) {
                console.error('Error fetching existing QR code:', error);
            } finally {
                setFetching(false);
            }
        };

        if (memberId) {
            fetchExistingQR();
        }
    }, [memberId]);

    const generateQR = async () => {
        setLoading(true);
        try {
            const result = await generateMemberQrCode(memberId);

            if (result.success && result.qrCode) {
                setQrCode(result.qrCode);
                toast.success('QR code generated successfully!');
                return result.qrCode;
            } else {
                toast.error(result.message || 'Failed to generate QR code');
                return null;
            }
        } catch (error: any) {
            console.error('Error generating QR code:', error);
            toast.error('An error occurred while generating QR code');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const downloadQR = async (
        memberName: string,
        printSize: 'small' | 'medium' | 'large' = 'large',
    ) => {
        try {
            const printResult = await getPrintOptimizedMemberQrCode(
                memberId,
                printSize,
            );
            const dataUrl =
                printResult.success && printResult.qrCode
                    ? printResult.qrCode
                    : qrCode;
            const usedFallback = !(printResult.success && printResult.qrCode);

            if (!dataUrl) {
                toast.error(
                    ('message' in printResult && printResult.message) ||
                        'No QR code available to download',
                );
                return false;
            }

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${memberName.replace(/\s+/g, '_')}_QR_Code.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            if (usedFallback) {
                toast.success(
                    'QR downloaded (standard resolution — print version unavailable)',
                );
            } else {
                toast.success('QR code downloaded (print-optimized)');
            }
            return true;
        } catch (error: any) {
            console.error('Error downloading QR code:', error);
            toast.error('Failed to download QR code');
            return false;
        }
    };

    return {
        qrCode,
        loading,
        fetching,
        generateQR,
        downloadQR,
        setQrCode,
    };
};
