import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface AreaOption {
    id: string;
    name: string;
    type: 'FAST_FOOD' | 'DINE_AREA';
}

interface EndWorkPeriodSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: string;
    areas: AreaOption[];
    onSelectArea: (area: AreaOption) => void;
    /** Override the modal heading */
    title?: string;
    /** Override the subtitle/instruction text */
    subtitle?: string;
    /** Override the action button label (default: 'Close') */
    actionLabel?: string;
}

const EndWorkPeriodSelectionModal = ({
    isOpen,
    onClose,
    date,
    areas,
    onSelectArea,
    title,
    subtitle,
    actionLabel = 'Close',
}: EndWorkPeriodSelectionModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[480px] p-6 rounded-[24px] border-none shadow-2xl [&>button]:hidden">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-[#E5E7EB]">
                    <DialogTitle className="text-[18px] font-bold text-[#443322]">
                        {title ?? 'End Work Period for'}{' '}
                        <span className="font-normal text-[#443322]">
                            ({date})
                        </span>
                    </DialogTitle>
                    <button
                        onClick={onClose}
                        className="text-black hover:bg-gray-100 rounded-full p-1 transition-colors"
                    >
                        <svg
                            width="28"
                            height="28"
                            viewBox="0 0 40 40"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle
                                cx="20"
                                cy="20"
                                r="18"
                                stroke="black"
                                strokeWidth="2.5"
                            />
                            <path
                                d="M14 14L26 26"
                                stroke="black"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                            />
                            <path
                                d="M26 14L14 26"
                                stroke="black"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </DialogHeader>

                <div className="space-y-5">
                    <p className="text-[#9CA3AF] text-[13px] font-normal lowercase">
                        {subtitle ??
                            'which of the following will you like to close'}
                    </p>

                    <div className="space-y-1">
                        {areas.map((area) => (
                            <div
                                key={area.id}
                                className="flex items-center justify-between px-4 py-3 rounded-[10px] transition-all bg-transparent hover:bg-[#F2F7FF] group"
                            >
                                <span className="text-[#1F2937] text-[15px] font-semibold">
                                    {area.name}{' '}
                                    {area.type === 'DINE_AREA'
                                        ? '(Dine Area)'
                                        : ''}
                                </span>
                                <button
                                    onClick={() => onSelectArea(area)}
                                    className="text-[#007BFF] font-bold text-[15px] hover:underline"
                                >
                                    {actionLabel}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EndWorkPeriodSelectionModal;
