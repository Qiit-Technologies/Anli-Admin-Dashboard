'use client';

import Logo from '@/components/common/Logo';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Clock } from 'lucide-react';

const VerificationNotice = () => {
    return (
        <div className="w-full flex-col gap-4 min-h-screen flex items-center justify-center">
            <div>
                <Logo />
            </div>
            <Card className="p-6 max-w-md mx-auto mt-10 shadow-none">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>

                    <h2 className="text-xl font-semibold">Document Received</h2>

                    <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-5 h-5" />
                        <p>Your document will be verified within 2 days</p>
                    </div>

                    <p className="text-sm text-gray-500 mt-2">
                        Our team will get back to you once the verification is
                        complete.
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default VerificationNotice;
