'use client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

const CertificationProgress = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <h1 className="mt-4 text-2xl font-bold text-gray-900">
                        Documents Received!
                    </h1>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-gray-600">
                        {` We've successfully received your CAC documents and
                        they're currently undergoing verification.`}
                    </p>
                    <p className="text-gray-600">
                        Our team will review your submission and reach out to
                        you within 2-3 business days if we need any additional
                        information.
                    </p>
                    <p className="text-sm text-gray-500">
                        {`You'll receive a notification once your verification is
                        complete.`}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default CertificationProgress;
