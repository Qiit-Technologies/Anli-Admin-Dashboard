'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AreaOption {
    id: string | number;
    name: string;
    type: 'FAST_FOOD' | 'DINE_AREA';
}

interface WorkPeriodAreaSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    areas: AreaOption[];
    mode: 'start' | 'end';
    date?: string;
    onConfirm: (selected: AreaOption[], settleAll?: boolean) => void;
    isLoading?: boolean;
}

const WorkPeriodAreaSelectionModal = ({
    isOpen,
    onClose,
    areas,
    mode,
    date,
    onConfirm,
    isLoading = false,
}: WorkPeriodAreaSelectionModalProps) => {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const isStartMode = mode === 'start';

    useEffect(() => {
        if (isOpen) setSelected(new Set());
    }, [isOpen, areas]);

    const allIds = areas.map((a) => a.id.toString());
    const allSelected =
        allIds.length > 0 && allIds.every((id) => selected.has(id));
    const someSelected = selected.size > 0;

    const toggle = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            //eslint-disable-next-line
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        setSelected(allSelected ? new Set() : new Set(allIds));
    };

    const getSelectedAreas = () =>
        areas.filter((a) => selected.has(a.id.toString()));

    const handleConfirm = (all: boolean, settle?: boolean) => {
        const targets = all ? areas : getSelectedAreas();
        if (targets.length === 0) return;
        onConfirm(targets, settle);
    };

    const primaryLabel = isStartMode ? 'Start' : 'End';
    const subtitle = isStartMode
        ? 'select the areas to start a work period for'
        : 'select the areas whose work period you want to end';

    const spinner = (
        <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
        </span>
    );

    return (
        <Dialog open={isOpen} onOpenChange={isLoading ? undefined : onClose}>
            <DialogContent className="sm:max-w-[480px] p-0 rounded-[24px] border-none shadow-2xl [&>button]:hidden overflow-hidden">
                {/* ── Header ── */}
                <DialogHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-[#E5E7EB] space-y-0">
                    <div>
                        <DialogTitle className="text-[18px] font-bold text-[#443322]">
                            {primaryLabel} Work Period{' '}
                            {date && (
                                <span className="font-normal text-[#443322] text-[14px]">
                                    ({date})
                                </span>
                            )}
                        </DialogTitle>
                        <p className="text-[#9CA3AF] text-[12px] mt-0.5 font-normal lowercase">
                            {subtitle}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-black hover:bg-gray-100 rounded-full p-1 transition-colors disabled:opacity-40"
                    >
                        <svg
                            width="26"
                            height="26"
                            viewBox="0 0 40 40"
                            fill="none"
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

                {/* ── Select-All row ── */}
                <div className="px-6 pt-4 pb-2">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={toggleAll}
                            disabled={isLoading || areas.length === 0}
                            className="w-4 h-4 accent-[#007BFF] cursor-pointer"
                        />
                        <span className="text-[13px] font-semibold text-[#374151]">
                            Select All ({areas.length})
                        </span>
                    </label>
                </div>

                {/* ── Area list ── */}
                <div className="px-6 pb-4 space-y-1 max-h-[280px] overflow-y-auto">
                    {areas.length === 0 ? (
                        <p className="text-[#9CA3AF] text-[13px] py-4 text-center">
                            No areas available
                        </p>
                    ) : (
                        areas.map((area) => {
                            const id = area.id.toString();
                            const isChecked = selected.has(id);
                            return (
                                <label
                                    key={id}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-[10px] cursor-pointer select-none transition-all ${
                                        isChecked
                                            ? 'bg-[#F2F7FF]'
                                            : 'hover:bg-[#F2F7FF]'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggle(id)}
                                        disabled={isLoading}
                                        className="w-4 h-4 accent-[#007BFF] cursor-pointer"
                                    />
                                    <div className="flex-1">
                                        <span className="text-[#1F2937] text-[15px] font-semibold">
                                            {area.name}
                                        </span>
                                        <span className="ml-2 text-[12px] text-[#9CA3AF]">
                                            {area.type === 'FAST_FOOD'
                                                ? 'Fast Food'
                                                : 'Dine-in Area'}
                                        </span>
                                    </div>
                                    {isChecked && (
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                        >
                                            <circle
                                                cx="8"
                                                cy="8"
                                                r="8"
                                                fill="#007BFF"
                                            />
                                            <path
                                                d="M4.5 8L7 10.5L11.5 6"
                                                stroke="white"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    )}
                                </label>
                            );
                        })
                    )}
                </div>

                {/* ── Footer actions ── */}
                <div className="px-6 pb-6 pt-3 border-t border-[#E5E7EB] flex flex-col gap-3">
                    {/* Primary: act on selected */}
                    <Button
                        onClick={() => handleConfirm(false)}
                        disabled={!someSelected || isLoading}
                        className="w-full bg-[#007BFF] hover:bg-[#0069D9] text-white py-6 rounded-[10px] font-bold text-[14px] shadow-sm disabled:opacity-40"
                    >
                        {isLoading
                            ? spinner
                            : `${primaryLabel} Selected (${selected.size})`}
                    </Button>

                    {/* Secondary: act on all — outlined style */}
                    <Button
                        variant="ghost"
                        onClick={() => handleConfirm(true)}
                        disabled={areas.length === 0 || isLoading}
                        className="w-full border-2 border-[#007BFF] text-[#007BFF] hover:bg-blue-50 py-6 rounded-[10px] font-bold text-[14px] bg-transparent"
                    >
                        {isLoading
                            ? 'Processing...'
                            : `${primaryLabel} All (${areas.length})`}
                    </Button>

                    {/* End-mode only: Settle Bills & End All */}
                    {!isStartMode && (
                        <button
                            onClick={() => handleConfirm(true, true)}
                            disabled={areas.length === 0 || isLoading}
                            className="text-[#007BFF] font-bold text-[14px] hover:underline bg-transparent disabled:opacity-40 py-1"
                        >
                            Settle Bills &amp; End All ({areas.length})
                        </button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default WorkPeriodAreaSelectionModal;
