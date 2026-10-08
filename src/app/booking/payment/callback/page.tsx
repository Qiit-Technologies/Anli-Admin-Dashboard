'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { verifyPublicBookingPaystack } from '@/app/actions/booking';

function PaymentCallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
        'loading',
    );
    const [message, setMessage] = useState('Verifying your payment...');
    const [bookingCodes, setBookingCodes] = useState<string[]>([]);
    const handleDone = () => {
        const pathFromQuery = searchParams.get('returnPath');
        const pathFromStorage =
            typeof window !== 'undefined'
                ? sessionStorage.getItem('publicBookingReturnPath')
                : null;
        const candidate = pathFromQuery || pathFromStorage;
        const path =
            candidate &&
            candidate.startsWith('/') &&
            !candidate.startsWith('//')
                ? candidate
                : null;

        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('publicBookingReturnPath');
        }

        router.push(path ?? '/');
    };

    useEffect(() => {
        const reference =
            searchParams.get('reference') ||
            searchParams.get('trxref') ||
            '';
        const bookingGroupId = searchParams.get('bookingGroupId') || '';

        if (!reference || !bookingGroupId) {
            setStatus('error');
            setMessage('Invalid payment callback. Missing payment details.');
            return;
        }

        let cancelled = false;

        const verify = async () => {
            const result = await verifyPublicBookingPaystack(
                reference,
                bookingGroupId,
            );
            if (cancelled) return;

            if (result.success) {
                setStatus('success');
                setMessage(
                    result.data?.message ||
                        'Payment confirmed. Your reservation is complete.',
                );
                setBookingCodes(result.data?.bookingCodes ?? []);
            } else {
                setStatus('error');
                setMessage(result.message);
            }
        };

        verify();

        return () => {
            cancelled = true;
        };
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
                {status === 'loading' && (
                    <>
                        <Loader2 className="w-12 h-12 text-orion-blue animate-spin mx-auto mb-4" />
                        <h1 className="text-lg font-bold text-gray-900 mb-2">
                            Processing payment
                        </h1>
                        <p className="text-sm text-gray-500">{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                        <h1 className="text-lg font-bold text-gray-900 mb-2">
                            Payment successful
                        </h1>
                        <p className="text-sm text-gray-600 mb-4">{message}</p>
                        {bookingCodes.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                                <p className="text-[10px] uppercase text-gray-500 font-semibold mb-2">
                                    Confirmation number
                                    {bookingCodes.length > 1 ? 's' : ''}
                                </p>
                                <ul className="text-sm font-bold text-gray-900 space-y-1">
                                    {bookingCodes.map((code) => (
                                        <li key={code}>{code}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mb-6">
                            A confirmation email has been sent to your inbox.
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h1 className="text-lg font-bold text-gray-900 mb-2">
                            Payment verification failed
                        </h1>
                        <p className="text-sm text-gray-600 mb-6">{message}</p>
                    </>
                )}

                {status !== 'loading' && (
                    <button
                        type="button"
                        onClick={handleDone}
                        className="w-full h-11 bg-orion-blue text-white rounded-lg text-sm font-bold hover:bg-orion-blue/90 transition-colors"
                    >
                        Done
                    </button>
                )}
            </div>
        </div>
    );
}

export default function BookingPaymentCallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-orion-blue" />
                </div>
            }
        >
            <PaymentCallbackContent />
        </Suspense>
    );
}
