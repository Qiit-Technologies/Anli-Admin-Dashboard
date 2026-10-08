import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SettleBillsConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onContinue: () => void;
    onManualSettle: () => void;
    areaName: string;
    isLoading?: boolean;
}

const SettleBillsConfirmationModal = ({
    isOpen,
    onClose,
    onContinue,
    onManualSettle,
    areaName,
    isLoading = false,
}: SettleBillsConfirmationModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-10 rounded-[32px] border-none shadow-2xl flex flex-col items-center text-center [&>button]:hidden">
                <DialogTitle className="hidden">Confirm Settlement</DialogTitle>

                <div className="relative mb-6 w-20 h-20 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-blue-50 scale-125 transform rotate-12"
                        style={{
                            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                        }}
                    />
                    <div className="bg-[#007BFF] rounded-full p-4 relative shadow-md">
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                </div>

                <h2 className="text-[22px] font-bold text-[#443322] mb-4">
                    Confirm Action
                </h2>
                <p className="text-[#5E6470] text-[16px] mb-8 font-normal leading-relaxed px-4">
                    Are you sure that you want to take this action? Clicking{' '}
                    <span className="font-bold">continue</span> means that you
                    have automatically settled all the unpaid bills for{' '}
                    {areaName} and this action can’t be undone.
                </p>

                <div className="w-full flex flex-col gap-3">
                    <Button
                        onClick={onContinue}
                        disabled={isLoading}
                        className="w-full bg-[#007BFF] hover:bg-[#0069D9] text-white py-7 rounded-[12px] font-bold text-[16px] shadow-sm transition-all"
                    >
                        {isLoading ? 'Processing...' : 'Continue'}
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={onManualSettle}
                        disabled={isLoading}
                        className="w-full border-2 border-[#007BFF] text-[#007BFF] hover:bg-blue-50 py-7 rounded-[12px] font-bold text-[16px] bg-transparent transition-all"
                    >
                        Manually Settle Bills
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full py-2 rounded-[12px] font-bold text-[14px] text-[#9CA3AF] hover:text-[#443322] bg-transparent transition-all"
                    >
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SettleBillsConfirmationModal;
