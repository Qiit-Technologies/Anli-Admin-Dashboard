'use client';

import DemoRequestForm from '@/components/common/Form/DemoRequestForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap } from 'lucide-react';
import Link from 'next/link';

export default function FreeTrialPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
            <div className="container mx-auto px-4 py-12 md:py-24">
                <Link href="/">
                    <Button variant={'ghost'}>
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </Link>
                <div className="flex justify-center">
                    <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg md:p-8">
                        <div className="mb-2 flex items-center gap-2">
                            <Zap className="h-6 w-6 text-hexbrand" />
                            <h2 className="text-2xl font-bold">
                                Start Your{' '}
                                <span className="text-hexbrand">Free Trial</span>
                            </h2>
                        </div>
                        <p className="mb-6 text-slate-600">
                            Enter your informations on the form below to claim
                            your 60 days free trial
                        </p>
                        <DemoRequestForm variant="free-trial" />
                    </div>
                </div>
            </div>
        </div>
    );
}
