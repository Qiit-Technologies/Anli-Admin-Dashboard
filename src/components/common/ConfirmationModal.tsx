import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
    variant?: 'primary' | 'danger';
}

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    isLoading = false,
    variant = 'primary',
}: ConfirmationModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] p-10 rounded-[32px] border-none shadow-2xl flex flex-col items-center text-center [&>button]:hidden">
                <DialogTitle className="hidden">{title}</DialogTitle>

                <div className="relative mb-6 w-16 h-16 flex items-center justify-center">
                    <div
                        className={cn(
                            'absolute inset-0 scale-125 transform rotate-12',
                            variant === 'primary' ? 'bg-blue-50' : 'bg-red-50',
                        )}
                        style={{
                            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                        }}
                    />
                    <div
                        className={cn(
                            'rounded-full p-4 relative shadow-sm',
                            variant === 'primary'
                                ? 'bg-[#007BFF]'
                                : 'bg-red-500',
                        )}
                    >
                        {variant === 'primary' ? (
                            <svg
                                width="24"
                                height="24"
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
                        ) : (
                            <svg
                                width="24"
                                height="24"
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

                <h2 className="text-[20px] font-bold text-[#443322] mb-2">
                    {title}
                </h2>
                <p className="text-[#9CA3AF] text-[15px] mb-8 font-normal leading-relaxed">
                    {description}
                </p>

                <div className="w-full flex flex-col gap-3">
                    <Button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={cn(
                            'w-full py-6 rounded-[12px] font-bold text-[15px] shadow-sm transition-all',
                            variant === 'primary'
                                ? 'bg-[#007BFF] hover:bg-[#0069D9] text-white'
                                : 'bg-red-500 hover:bg-red-600 text-white',
                        )}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <FaSpinner className="h-4 w-4 animate-spin" />
                                Processing...
                            </div>
                        ) : (
                            confirmLabel
                        )}
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full py-6 rounded-[12px] font-bold text-[15px] text-[#9CA3AF] hover:bg-gray-50 hover:text-[#443322] bg-transparent transition-all"
                    >
                        {cancelLabel}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmationModal;
export { ConfirmationModal };
