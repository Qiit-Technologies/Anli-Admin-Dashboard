'use client';

import { useEffect, useState } from 'react';
import { X, Zap } from 'lucide-react';
import DemoRequestForm from '@/components/common/Form/DemoRequestForm';

const SESSION_KEY = 'conference_banner_dismissed';

export default function ConferenceBanner() {
    const [mobileVisible, setMobileVisible] = useState(false);

    useEffect(() => {
        if (sessionStorage.getItem(SESSION_KEY)) return;
        const timer = setTimeout(() => setMobileVisible(true), 30_000);
        return () => clearTimeout(timer);
    }, []);

    function dismissMobile() {
        sessionStorage.setItem(SESSION_KEY, '1');
        setMobileVisible(false);
    }

    return (
        <>
            {/* Desktop: fixed right sidebar */}
            <aside className="hidden lg:flex fixed top-1/2 right-0 -translate-y-1/2 z-50 w-80 max-h-[90vh] flex-col bg-white border border-slate-200 shadow-2xl rounded-l-2xl overflow-hidden">
                <div className="bg-hexbrand/5 px-5 pt-5 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-hexbrand shrink-0" />
                        <p className="text-lg font-bold text-slate-900 leading-tight">
                            Claim your exclusive{' '}
                            <span className="text-hexbrand">120 days free</span>
                        </p>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                        Limited time Offer.
                    </p>
                </div>
                <div className="flex-1 overflow-y-auto p-5">
                    <DemoRequestForm variant="conference" />
                </div>
            </aside>

            {/* Mobile: popup after 30s */}
            {mobileVisible && (
                <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center">
                    <button
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-default"
                        onClick={dismissMobile}
                        aria-label="Close offer"
                    />
                    <div className="relative z-10 w-full max-h-[85vh] flex flex-col bg-white rounded-t-2xl shadow-2xl overflow-hidden animate-slide-up">
                        <div className="bg-hexbrand/5 px-5 pt-5 pb-3 border-b border-slate-100">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-hexbrand shrink-0" />
                                    <p className="text-lg font-bold text-slate-900 leading-tight">
                                        Claim your exclusive{' '}
                                        <span className="text-hexbrand">120 days free</span>
                                    </p>
                                </div>
                                <button
                                    onClick={dismissMobile}
                                    aria-label="Close offer"
                                    className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 font-medium mt-1">
                                Limited time Offer.
                            </p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5">
                            <DemoRequestForm variant="conference" />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
