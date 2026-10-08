'use client';

import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import QRCode from 'qrcode';
import { useCallback, useEffect, useState } from 'react';
import { FaPrint } from 'react-icons/fa';
import useHotel from '@/hooks/useHotel';

export default function CustomMenuQRCodeDisplay() {
    const searchParams = useSearchParams();
    const hotelData = useHotel();
    const hotelId =
        searchParams.get('hotel') || hotelData?.organization?.id?.toString();

    const url = `${window.location.origin}/custom-menu/${hotelId}`;
    const [qrCode, setQrCode] = useState('');

    const generateQR = useCallback(async () => {
        try {
            const qrDataUrl = await QRCode.toDataURL(url, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff',
                },
            });
            setQrCode(qrDataUrl);
        } catch (err) {
            console.error(err);
        }
    }, [url]);

    const downloadQR = () => {
        const a = document.createElement('a');
        a.href = qrCode;
        a.download = 'custom-menu-qrcode.png';
        a.click();
    };

    useEffect(() => {
        generateQR();
    }, [generateQR]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 print:bg-white print:h-auto">
            {/* Main Card */}
            <div
                className={`bg-white rounded-lg shadow-none border p-6 w-full max-w-sm print:shadow-none`}
            >
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">
                        Scan QR Code
                    </h1>
                    <p className="text-gray-500">
                        Point your device camera at the code to access custom
                        menu
                    </p>
                </div>

                {/* QR Code Display */}
                <div className="flex justify-center mb-6 p-2 bg-white rounded border border-gray-200">
                    <div style={{ marginTop: '20px' }}>
                        <img
                            src={qrCode}
                            alt="QR Code"
                            style={{ width: 200, height: 200 }}
                        />
                    </div>
                </div>

                {/* URL Display */}
                <div className="mb-6 p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs text-gray-600 break-all text-center">
                        {url}
                    </p>
                </div>

                {/* Print Button */}
                <div className="flex justify-center print:hidden">
                    <Button
                        onClick={downloadQR}
                        className="flex items-center gap-2 px-4 py-2 bg-hexbrand text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <FaPrint className="text-white" />
                        Print Custom Menu QR Code
                    </Button>
                </div>
            </div>
        </div>
    );
}
