'use client';

import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { FaPrint } from 'react-icons/fa';
import { generateDirectQrCode, generateQrCode } from '../actions/qr';

export default function QrCodeDisplay() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <p className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md animate-pulse">
                        Preparing...
                    </p>
                </div>
            }
        >
            <QrCodeContent />
        </Suspense>
    );
}

function QrCodeContent() {
    const [qrBase64, setQrBase64] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const searchParams = useSearchParams();
    const isDirect = searchParams.get('direct') === 'true';

    useEffect(() => {
        const loadQr = async () => {
            try {
                const result = isDirect
                    ? await generateDirectQrCode()
                    : await generateQrCode();
                if (result.error) {
                    setError(result.error);
                } else {
                    setQrBase64(result.data.image);
                }
            } catch (err) {
                setError('Failed to load QR code. Please try again.');
            }
        };
        loadQr();
    }, [isDirect]);

    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 200);
    };

    if (error)
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="px-4 py-2 bg-red-100 text-red-700 rounded-md max-w-md text-center">
                    {error}
                </p>
            </div>
        );

    if (!qrBase64)
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md animate-pulse">
                    Generating QR code...
                </p>
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 print:bg.white print:h-auto">
            <div className="bg-white rounded-lg shadow-none border p-6 w-full max-w-sm print:shadow-none">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">
                        {isDirect ? 'Scan Direct Menu QR Code' : 'Scan QR Code'}
                    </h1>
                    <p className="text-gray-500">
                        Point your device camera at the code
                    </p>
                </div>

                <div className="flex justify-center mb-6 p-2 bg-white rounded border border-gray-200">
                    <img
                        src={qrBase64}
                        alt="QR Code"
                        className="w-64 h-64 object-contain"
                    />
                </div>

                <div className="flex justify-center print:hidden">
                    <Button
                        onClick={handlePrint}
                        disabled={isPrinting}
                        className="flex items-center gap-2 px-4 py-2 bg-hexbrand text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <FaPrint className="text-white" />
                        {isDirect ? 'Print Direct QR Code' : 'Print QR Code'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
