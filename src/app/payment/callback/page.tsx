'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { verifyGuestOrderPayment } from '@/app/actions/menu-item';
import {
    FaSpinner,
    FaCheckCircle,
    FaTimesCircle,
    FaEnvelope,
    FaPhoneAlt,
} from 'react-icons/fa';

type Status = 'pending' | 'success' | 'failure';

const Page = () => {
    const searchParams = useSearchParams();
    const reference = searchParams.get('reference');
    const orderId = searchParams.get('orderId');
    console.log(orderId, reference);
    const [status, setStatus] = useState<Status>('pending');

    useEffect(() => {
        const verify = async () => {
            if (!reference || !orderId) return;

            try {
                const data = await verifyGuestOrderPayment(reference, orderId);
                console.log(data);
                if (data?.data?.data?.status === 'success') {
                    setStatus('success');
                } else {
                    setStatus('failure');
                }
            } catch (err) {
                setStatus('failure');
            }
        };

        verify();
    }, [reference, orderId]);
    console.log(status);

    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-blue-50 to-white">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
                {status === 'pending' && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-75"></div>
                                <FaSpinner className="h-16 w-16 text-blue-600 animate-spin relative" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-blue-800">
                            Processing Payment
                        </h2>
                        <p className="text-blue-600 text-lg">
                            Please wait while we verify your transaction...
                        </p>
                        <div className="pt-4">
                            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full animate-pulse w-3/4"></div>
                            </div>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg">
                            <FaCheckCircle className="h-12 w-12 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                            Payment Successful!
                        </h2>
                        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                            <p className="text-gray-700 text-lg">
                                Order #
                                <span className="font-bold text-orange-500">
                                    {orderId}
                                </span>
                            </p>
                            <p className="text-gray-600 mt-2">
                                Your payment has been confirmed
                            </p>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-blue-600">
                            <FaEnvelope className="h-5 w-5" />
                            <span className="text-sm">
                                Confirmation sent to your email
                            </span>
                        </div>
                        <div className="pt-4">
                            <button className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md">
                                View Order Details
                            </button>
                        </div>
                    </div>
                )}

                {status === 'failure' && (
                    <div className="space-y-6">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-200 shadow-lg">
                            <FaTimesCircle className="h-12 w-12 text-red-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600">
                            Payment Failed
                        </h2>
                        <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                            <p className="text-gray-700">
                                Order #
                                <span className="font-bold">{orderId}</span>
                            </p>
                            <p className="text-gray-600 mt-2">
                                We couldn&apos;t process your payment
                            </p>
                        </div>
                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex items-center justify-center space-x-2">
                                <FaPhoneAlt className="h-4 w-4 text-blue-600" />
                                <span>Contact support: +1 (555) 123-4567</span>
                            </div>
                            <div className="flex items-center justify-center space-x-2">
                                <FaEnvelope className="h-4 w-4 text-blue-600" />
                                <span>help@example.com</span>
                            </div>
                        </div>
                        <div className="pt-4 space-y-3">
                            <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md">
                                Try Payment Again
                            </button>
                            <button className="w-full bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition-all duration-300">
                                Back to Checkout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const PaymentCallbackPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Page />
        </Suspense>
    );
};

export default PaymentCallbackPage;
