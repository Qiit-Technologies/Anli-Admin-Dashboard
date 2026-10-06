import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface EndWorkPeriodActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    areaName: string;
    onSettle: () => void;
    onLeave: () => void;
    errorMessage?: string | null;
    isEnding?: boolean;
}

const EndWorkPeriodActionModal = ({
    isOpen,
    onClose,
    areaName,
    onSettle,
    onLeave,
    errorMessage,
    isEnding = false,
}: EndWorkPeriodActionModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] p-14 rounded-[32px] border-none shadow-2xl flex flex-col items-center [&>button]:hidden">
                <DialogTitle className="text-[18px] font-bold text-[#443322]"></DialogTitle>
                <div className="relative mb-4 w-20 h-20 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-[#E8F5E9] scale-125 transform rotate-12"
                        style={{
                            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                        }}
                    />
                    <div className="bg-[#4CAF50] rounded-full p-4 relative shadow-md">
                        <svg
                            width="24"
                            height="16"
                            viewBox="0 0 60 42"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M5 21L23 37L55 5"
                                stroke="white"
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>

                <h2 className="text-[18px] font-bold text-[#443322]">
                    End Work Period
                </h2>
                <p className="text-[#9CA3AF] text-[14px] mb-4 font-normal">
                    {areaName} Work Period
                </p>
                <p className="text-[#6B7280] text-[12px] mb-4 text-center max-w-sm">
                    You cannot leave unpaid bills for the next shift: close all
                    unpaid orders first, or use Settle to clear them.
                </p>

                {errorMessage ? (
                    <div
                        role="alert"
                        className="mb-4 w-full max-w-sm rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-[12px] font-medium text-red-800"
                    >
                        {errorMessage}
                    </div>
                ) : null}

                <div className="w-full space-y-4 flex flex-col items-center">
                    <Button
                        onClick={onSettle}
                        disabled={isEnding}
                        className="bg-[#007BFF] px-6 hover:bg-[#0069D9] text-white py-6 rounded-[10px] font-bold text-[14px] shadow-sm"
                    >
                        {isEnding
                            ? 'Ending…'
                            : 'Settle Unpaid/Unsettled Bills'}
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={onLeave}
                        disabled={isEnding}
                        className="border-2 px-6 border-[#007BFF] text-[#007BFF] hover:bg-blue-50 py-6 rounded-[10px] font-bold text-[14px] bg-transparent"
                    >
                        Leave Unpaid/Unsettled Bills
                    </Button>
                </div>

                <div className="mt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isEnding}
                        className="text-[#007BFF] font-bold text-[14px] hover:underline bg-transparent disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EndWorkPeriodActionModal;
