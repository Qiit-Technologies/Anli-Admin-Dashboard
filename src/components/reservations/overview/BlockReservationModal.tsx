'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar as CalendarIcon, X, CheckCircle2, Wind } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useIdleLogoutExemption } from '@/context/IdleLogoutContext';
import { blockReservationDates } from '@/app/actions/reservation';
import { mutate } from 'swr';

interface BlockReservationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    spaces: any[];
}

export default function BlockReservationModal({
    open,
    onOpenChange,
    spaces,
}: BlockReservationModalProps) {
    useIdleLogoutExemption(open);

    const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
    const [formData, setFormData] = useState({
        spaceName: '',
        startDate: undefined as Date | undefined,
        endDate: undefined as Date | undefined,
        reason: '',
        capacity: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirmBlock = () => {
        if (!formData.startDate || !formData.endDate) {
            alert('Please select a date range');
            return;
        }
        setStep('confirm');
    };

    const handleFinalBlock = async () => {
        setIsSubmitting(true);
        try {
            const res = await blockReservationDates({
                startDate: formData.startDate ? format(formData.startDate, 'yyyy-MM-dd') : undefined,
                endDate: formData.endDate ? format(formData.endDate, 'yyyy-MM-dd') : undefined,
                spaceName: formData.spaceName,
                reason: formData.reason,
                capacity: formData.capacity,
            });

            if (res.error) {
                alert(res.error);
            } else {
                mutate('/table-reservations/blocked-dates');
                setStep('success');
                setTimeout(() => {
                    onOpenChange(false);
                    setStep('form');
                    setFormData({
                        spaceName: '',
                        startDate: undefined,
                        endDate: undefined,
                        reason: '',
                        capacity: '',
                    });
                }, 2000);
            }
        } catch (error: any) {
            console.error('Block error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (step === 'confirm') {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-[473px] p-8 [&>button]:hidden rounded-2xl">
                    <div className="flex flex-col items-center text-center gap-6">
                        <div className="relative">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                                <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="text-white w-8 h-8" />
                                </div>
                            </div>
                            <div className="absolute -top-2 -left-2 w-24 h-24 bg-green-100/50 rounded-full -z-10 animate-pulse" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-[#432005]">
                                Block Reservation
                            </h2>
                            <p className="text-[#667085] text-sm px-4">
                                Are you sure you want to send block the date{' '}
                                <span className="font-semibold">
                                    {formData.startDate &&
                                        format(formData.startDate, 'do')}
                                    {'-'}
                                    {formData.endDate &&
                                        format(
                                            formData.endDate,
                                            'do LLLL yyyy',
                                        )}
                                </span>
                            </p>
                        </div>

                        <div className="flex gap-4 w-full pt-2">
                            <Button
                                onClick={handleFinalBlock}
                                disabled={isSubmitting}
                                className="flex-1 bg-[#007BFF] hover:bg-[#007BFF]/90 h-14 text-base font-medium rounded-xl"
                            >
                                {isSubmitting ? 'Blocking...' : 'Block date'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setStep('form')}
                                className="flex-1 border-[#007BFF] text-[#007BFF] h-14 text-base font-medium rounded-xl hover:bg-blue-50"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (step === 'success') {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-[400px] p-10 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <CheckCircle2 className="w-16 h-16 text-green-500" />
                        <h2 className="text-xl font-bold">
                            Successfully Blocked
                        </h2>
                        <p className="text-gray-500">
                            The dates have been blocked successfully.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[550px] p-0 overflow-hidden rounded-2xl border-none">
                <div className="p-6 bg-white space-y-6">
                    <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center p-2">
                                <Wind className="text-blue-500 w-6 h-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-[#101828]">
                                    Block Reservation Dates
                                </DialogTitle>
                                <p className="text-xs text-[#667085]">
                                    Enter every details to register a new
                                    customer order
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="text-[#667085] hover:text-gray-900 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </DialogHeader>

                    <div className="border-t border-[#EAECF0] -mx-6" />

                    <div className="space-y-5 px-1">
                        {/* Choose Scope */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[#344054]">
                                Choose Scope
                            </label>
                            <Select
                                value={formData.spaceName}
                                onValueChange={(val) =>
                                    setFormData({ ...formData, spaceName: val })
                                }
                            >
                                <SelectTrigger className="h-12 bg-[#F9FAFB] border-[#EAECF0] rounded-xl focus:ring-0 focus:ring-offset-0">
                                    <SelectValue placeholder="Enter space name" />
                                </SelectTrigger>
                                <SelectContent>
                                    {spaces.map((s) => (
                                        <SelectItem key={s.id} value={s.name}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                    <SelectItem value="All Spaces">
                                        All Spaces
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Select Date Range */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[#344054]">
                                Select Date/Time Range
                            </label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className="w-full h-12 flex items-center justify-between px-3 py-2 bg-[#F9FAFB] border border-[#EAECF0] rounded-xl text-sm transition-all text-left">
                                        <span
                                            className={cn(
                                                !formData.startDate &&
                                                    'text-gray-400',
                                            )}
                                        >
                                            {formData.startDate &&
                                            formData.endDate
                                                ? `${format(formData.startDate, 'LLL dd, y')} - ${format(formData.endDate, 'LLL dd, y')}`
                                                : 'Select Date/Time Range'}
                                        </span>
                                        <CalendarIcon
                                            size={18}
                                            className="text-[#667085]"
                                        />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        selected={{
                                            from: formData.startDate,
                                            to: formData.endDate,
                                        }}
                                        onSelect={(range) =>
                                            setFormData({
                                                ...formData,
                                                startDate: range?.from,
                                                endDate: range?.to,
                                            })
                                        }
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Choose Reason */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[#344054]">
                                Choose Reason
                            </label>
                            <Select
                                value={formData.reason}
                                onValueChange={(val) =>
                                    setFormData({ ...formData, reason: val })
                                }
                            >
                                <SelectTrigger className="h-12 bg-[#F9FAFB] border-[#EAECF0] rounded-xl focus:ring-0 focus:ring-offset-0">
                                    <SelectValue placeholder="Select Reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Maintenance">
                                        Maintenance
                                    </SelectItem>
                                    <SelectItem value="Private Event">
                                        Private Event
                                    </SelectItem>
                                    <SelectItem value="Holiday">
                                        Holiday
                                    </SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Assign Attributes */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[#344054]">
                                Assign attributes
                            </label>
                            <Select
                                value={formData.capacity}
                                onValueChange={(val) =>
                                    setFormData({ ...formData, capacity: val })
                                }
                            >
                                <SelectTrigger className="h-12 bg-[#F9FAFB] border-[#EAECF0] rounded-xl focus:ring-0 focus:ring-offset-0">
                                    <SelectValue placeholder="Select Capacity" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Full Capacity">
                                        Full Capacity
                                    </SelectItem>
                                    <SelectItem value="Partial Capacity">
                                        Partial Capacity
                                    </SelectItem>
                                    <SelectItem value="Single Table">
                                        Single Table
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={handleConfirmBlock}
                            className="w-full bg-[#007BFF] hover:bg-[#007BFF]/90 h-12 text-base font-semibold rounded-xl mt-4"
                        >
                            Confirm Block
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
