import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';

interface WorkPeriodForcedStartModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: () => void;
    areaName: string;
    isLoading?: boolean;
    isStarted?: boolean;
    onFinalSave?: () => void;
}

const WorkPeriodForcedStartModal = ({
    isOpen,
    onClose,
    onStart,
    areaName,
    isLoading = false,
    isStarted = false,
    onFinalSave,
}: WorkPeriodForcedStartModalProps) => {
    React.useEffect(() => {
        let timer: any;
        if (isOpen && isStarted && onFinalSave) {
            // Auto-save after 3 seconds if the user doesn't click
            timer = setTimeout(() => {
                onFinalSave();
            }, 3000);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isOpen, isStarted, onFinalSave]);

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(_open) => {
                // Disable closing the modal if it's already started to force "Proceed to Save Order"
                if (!isStarted) {
                    onClose();
                }
            }}
        >
            <DialogContent className="sm:max-w-[450px] p-10 rounded-[32px] border-none shadow-2xl flex flex-col items-center text-center [&>button]:hidden">
                <DialogTitle className="text-[20px] font-bold text-[#443322] mb-2">
                    {isStarted ? 'Success' : 'Attention'}
                </DialogTitle>

                <div className="relative mb-6 w-20 h-20 flex items-center justify-center">
                    <div
                        className={`absolute inset-0 ${isStarted ? 'bg-green-50' : 'bg-orange-50'} scale-125 transform rotate-12`}
                        style={{
                            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                        }}
                    />
                    <div
                        className={`${isStarted ? 'bg-[#4CAF50]' : 'bg-[#FF9800]'} rounded-full p-4 relative shadow-md`}
                    >
                        {isStarted ? (
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
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        ) : (
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
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        )}
                    </div>
                </div>

                {isStarted ? (
                    <>
                        <h2 className="text-[22px] font-bold text-[#443322] mb-4">
                            Work Period Started
                        </h2>
                        <p className="text-[#5E6470] text-[16px] mb-8 font-normal leading-relaxed">
                            You have successfully started the work period for{' '}
                            <span className="font-bold">{areaName}</span>. You
                            Your order would be saved now.
                        </p>
                        <Button
                            onClick={onFinalSave}
                            className="w-full bg-[#007BFF] hover:bg-[#0069D9] text-white py-7 rounded-[12px] font-bold text-[16px] shadow-sm transition-all"
                        >
                            Proceed to Save Order
                        </Button>
                    </>
                ) : (
                    <>
                        <h2 className="text-[22px] font-bold text-[#443322] mb-4">
                            Start Work Period
                        </h2>
                        <p className="text-[#5E6470] text-[16px] mb-8 font-normal leading-relaxed">
                            You have to start a work period before you can take
                            orders for{' '}
                            <span className="font-bold">{areaName}</span>.
                        </p>
                        <div className="w-full flex flex-col gap-3">
                            <Button
                                onClick={onStart}
                                disabled={isLoading}
                                className="w-full bg-[#007BFF] hover:bg-[#0069D9] text-white py-7 rounded-[12px] font-bold text-[16px] shadow-sm transition-all"
                            >
                                {isLoading ? (
                                    <LoaderCircle className="w-5 h-5 animate-spin mr-2" />
                                ) : null}
                                {isLoading
                                    ? 'Starting Period...'
                                    : 'Start Work Period'}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={onClose}
                                disabled={isLoading}
                                className="w-full py-2 rounded-[12px] font-bold text-[14px] text-[#9CA3AF] hover:text-[#443322] bg-transparent transition-all"
                            >
                                Go Back
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default WorkPeriodForcedStartModal;
