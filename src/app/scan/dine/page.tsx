'use client';

import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { FaPrint } from 'react-icons/fa';

export default function QrCodeDisplay() {
    const searchParams = useSearchParams();

    const hotelId = searchParams.get('hotel');
    const dineId = searchParams.get('dine');

    const url = `${window.location.origin}/menu/dine?hotel=${hotelId}&dine=${dineId}`;
    const [qrCode, setQrCode] = useState('');

    const generateQR = async () => {
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
    };

    const downloadQR = () => {
        const a = document.createElement('a');
        a.href = qrCode;
        a.download = 'qrcode.png';
        a.click();
    };

    useEffect(() => {
        generateQR();
    }, []);

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
                        Point your device camera at the code
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

                {/* Print Button */}
                <div className="flex justify-center print:hidden">
                    <Button
                        onClick={downloadQR}
                        className="flex items-center gap-2 px-4 py-2 bg-hexbrand text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <FaPrint className="text-white" />
                        Print QR Code
                    </Button>
                </div>
            </div>
        </div>
    );
}
